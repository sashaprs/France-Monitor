/* ============================================================================
   Edge Function « ia-resume » — Fonctionnalité A : résumé automatique d'un
   document parlementaire (texte de loi, rapport de commission…).

   Flux :
     1. Authentification obligatoire (JWT de session Supabase).
     2. Cache : un résumé déjà généré pour ce document est renvoyé tel quel,
        sans nouvel appel à l'API (économie pour tous les utilisateurs).
     3. Rate limiting quotidien par utilisateur (côté serveur uniquement).
     4. Téléchargement du document sur assemblee-nationale.fr (uid validé,
        URL construite côté serveur — jamais d'URL cliente, anti-SSRF).
     5. Appel Claude avec sortie structurée, résumé stocké en cache, appel
        journalisé (tokens) pour le suivi de coût.

   Secrets requis : MISTRAL_API_KEY (supabase secrets set) — voir le module
   _shared/ia-fournisseur.ts pour le choix du fournisseur.
   Optionnels : IA_LIMITE_QUOTIDIENNE (défaut 20), IA_MODELE.
   ============================================================================ */

import { MODELE, genererJson, ErreurFournisseur } from '../_shared/ia-fournisseur.ts';
import {
  CORS, reponseJson, reponseErreur, clientAdmin,
  utilisateurAuthentifie, estAdmin, quotaAtteint, journaliserAppel,
} from '../_shared/ia-commun.ts';
import {
  validerUid, urlDocument, telechargerDocument, extraireTexte, tronquer,
} from '../_shared/documents-an.ts';

/* ~150 000 caractères ≈ 40-50 k tokens d'entrée : couvre l'intégralité des
   textes de loi et la quasi-totalité des rapports, tout en restant dans le
   quota par minute du palier gratuit. Au-delà, troncature par articles. */
const MAX_CHARS_DOCUMENT = 150_000;

/* Un long document peut dépasser 30 s de génération : on laisse 90 s avant
   de renvoyer une erreur claire plutôt qu'un chargement infini. */
const TIMEOUT_GENERATION_MS = 90_000;

const PROMPT_SYSTEME = `Tu résumes un document parlementaire pour un professionnel des affaires publiques (lobbyiste ou consultant en affaires publiques). Structure ta réponse ainsi : (1) l'objet du texte en une phrase, (2) 3 à 5 points clés de son contenu, (3) les articles ou dispositions les plus sensibles à surveiller pour un représentant d'intérêts. Reste strictement factuel, aucune opinion, aucune invention. Si le document fourni est tronqué ou incomplet, précise-le explicitement dans ta réponse plutôt que de compléter par supposition.
Contrainte de droit d'auteur, impérative : reformule entièrement avec tes propres mots, ne cite jamais plus d'une courte phrase du texte original, et jamais plus d'une citation.`;

/* Schéma de sortie (JSON Schema strict — voir _shared/ia-fournisseur.ts).
   Le front affiche objet / points clés / vigilance sans parser du texte libre. */
const SCHEMA_RESUME = {
  type: 'object',
  properties: {
    objet: { type: 'string', description: "L'objet du texte en une seule phrase." },
    points_cles: {
      type: 'array', items: { type: 'string' },
      description: '3 à 5 points clés du contenu, reformulés.',
    },
    points_vigilance: {
      type: 'array', items: { type: 'string' },
      description: "Articles ou dispositions les plus sensibles à surveiller pour un représentant d'intérêts.",
    },
    avertissement: {
      type: 'string',
      description: 'Mention explicite si le document analysé est tronqué ou incomplet, sinon chaîne vide.',
    },
  },
  required: ['objet', 'points_cles', 'points_vigilance', 'avertissement'],
  additionalProperties: false,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return reponseErreur('Méthode non autorisée.', 405);

  /* 1. Authentification. */
  const utilisateur = await utilisateurAuthentifie(req);
  if (!utilisateur) return reponseErreur('Connexion requise.', 401);

  /* 2. Entrée : uniquement un uid AN validé — jamais d'URL cliente. */
  let corps: { document_uid?: unknown; titre?: unknown; regenerer?: unknown };
  try { corps = await req.json(); } catch { return reponseErreur('Corps JSON invalide.', 400); }
  const uid = validerUid(corps.document_uid);
  if (!uid) return reponseErreur('Identifiant de document invalide.', 400);
  const titre = typeof corps.titre === 'string' ? corps.titre.slice(0, 250) : null;

  const admin = clientAdmin();

  /* 3. Régénération : réservée aux admins d'organisation. */
  const regenerer = corps.regenerer === true;
  if (regenerer && !(await estAdmin(admin, utilisateur.id))) {
    return reponseErreur('La régénération est réservée aux administrateurs.', 403);
  }

  /* 4. Cache : jamais deux générations pour le même document. */
  if (!regenerer) {
    const { data: cache } = await admin
      .from('ia_resumes')
      .select('resume, titre, url_source, modele, document_tronque, genere_le')
      .eq('document_uid', uid)
      .maybeSingle();
    if (cache) return reponseJson({ ...cache, en_cache: true });
  }

  /* 5. Rate limiting quotidien (seuls les appels réels comptent). */
  if (await quotaAtteint(admin, utilisateur.id)) {
    return reponseErreur('Limite quotidienne atteinte, réessayez demain.', 429);
  }

  /* 6. Récupération et extraction du document. */
  let texte: string, tronque: boolean;
  try {
    const html = await telechargerDocument(uid);
    const extrait = extraireTexte(html);
    if (extrait.length < 200) {
      return reponseErreur("Document introuvable ou vide sur le site de l'Assemblée nationale.", 502);
    }
    ({ texte, tronque } = tronquer(extrait, MAX_CHARS_DOCUMENT));
  } catch (_e) {
    return reponseErreur("Impossible de récupérer le document sur le site de l'Assemblée nationale. Réessayez plus tard.", 502);
  }

  /* 7. Appel du modèle via la couche fournisseur (la clé API ne vit que
     dans les secrets Supabase). */
  let resume: unknown, tokensEntree: number | null, tokensSortie: number | null;
  try {
    const reponse = await genererJson({
      systeme: PROMPT_SYSTEME,
      utilisateur:
        `Document parlementaire à résumer${tronque
          ? " (ATTENTION : le document a été tronqué, la fin manque — signale-le dans le champ « avertissement »)"
          : ''} :\n\n${texte}`,
      schema: SCHEMA_RESUME,
      timeoutMs: TIMEOUT_GENERATION_MS,
    });
    resume = reponse.json;
    tokensEntree = reponse.tokensEntree;
    tokensSortie = reponse.tokensSortie;
  } catch (e) {
    if (e instanceof ErreurFournisseur) {
      const message = e.statut === 504
        ? 'La génération a pris trop de temps. Réessayez dans quelques instants.'
        : e.quotaEpuise ? e.message : 'Le service de résumé est momentanément indisponible.';
      return reponseErreur(message, e.statut);
    }
    console.error('génération :', e);
    return reponseErreur('Le service de résumé est momentanément indisponible.', 502);
  }

  /* 8. Journalisation (coût) puis mise en cache. */
  await journaliserAppel(admin, {
    utilisateur_id: utilisateur.id,
    fonctionnalite: 'resume_texte',
    reference: uid,
    modele: MODELE,
    tokens_entree: tokensEntree,
    tokens_sortie: tokensSortie,
  });

  const enregistrement = {
    document_uid: uid,
    titre,
    url_source: urlDocument(uid),
    resume,
    modele: MODELE,
    document_tronque: tronque,
    tokens_entree: tokensEntree,
    tokens_sortie: tokensSortie,
    genere_par: utilisateur.id,
  };
  const { error: errCache } = await admin
    .from('ia_resumes')
    .upsert(enregistrement, { onConflict: 'document_uid' });
  if (errCache) console.error('mise en cache impossible :', errCache.message);

  return reponseJson({
    resume,
    titre,
    url_source: urlDocument(uid),
    modele: MODELE,
    document_tronque: tronque,
    genere_le: new Date().toISOString(),
    en_cache: false,
  });
});
