/* ============================================================================
   Edge Function « ia-synthese » — Fonctionnalité B : synthèse de la position
   d'un député sur un sujet donné, STRICTEMENT sourcée sur ses votes,
   amendements et questions publics (données du pipeline, servies par le
   dépôt GitHub — aucun appel vers l'AN ici).

   Garde-fous :
   • 0 élément qui matche le sujet → « données insuffisantes » SANS appel au
     modèle (économie, pas de réponse creuse).
   • Niveau de confiance CALCULÉ (pas laissé au modèle) : ≥ 5 éléments =
     élevé, 2-4 = moyen, 1 = faible.
   • Anti-hallucination programmatique : le modèle cite ses sources par
     identifiant [E1]…[En] ; toute affirmation citant un identifiant
     inconnu est supprimée de la synthèse avant renvoi, et la liste
     elements_sources est reconstruite depuis NOS données, jamais depuis
     la sortie du modèle.
   • Notes internes CRM volontairement EXCLUES tant que le fournisseur IA
     est un palier gratuit (données potentiellement utilisées pour
     l'entraînement) — seules les données publiques partent au modèle.

   Secrets : MISTRAL_API_KEY. Optionnels : IA_LIMITE_QUOTIDIENNE, IA_MODELE.
   ============================================================================ */

import { MODELE, genererJson, ErreurFournisseur } from '../_shared/ia-fournisseur.ts';
import {
  CORS, reponseJson, reponseErreur, clientAdmin,
  utilisateurAuthentifie, quotaAtteint, journaliserAppel,
} from '../_shared/ia-commun.ts';

/* Données publiques du pipeline, telles que publiées par le dépôt. */
const DONNEES_BASE = 'https://raw.githubusercontent.com/sashaprs/France-Monitor/main/public/data/deputes/';

const TIMEOUT_GENERATION_MS = 60_000;

/* Bornes d'envoi : seuls les éléments qui matchent partent au modèle,
   plafonnés pour ne jamais envoyer plus que nécessaire. */
const MAX_PAR_TYPE = 12;
const MAX_TOTAL = 25;

const PROMPT_SYSTEME = `Tu es analyste en affaires publiques. Voici les votes, amendements et questions publics d'un parlementaire français. À partir UNIQUEMENT de ces éléments (aucune connaissance externe sur ce parlementaire ou ce sujet), synthétise sa position probable sur le sujet demandé. Si les éléments disponibles sont insuffisants, contradictoires, ou trop anciens pour être significatifs, dis-le explicitement plutôt que de spéculer. Chaque affirmation de ta synthèse doit citer entre crochets l'identifiant de l'élément source qui la fonde (ex. « [E2] »), tel que fourni dans la liste — n'invente jamais d'identifiant ni d'élément.`;

const SCHEMA_SYNTHESE = {
  type: 'object',
  properties: {
    synthese: {
      type: 'string',
      description: "Synthèse de la position du parlementaire, chaque affirmation citant son élément source par identifiant entre crochets, ex. [E1].",
    },
    elements_utilises: {
      type: 'array', items: { type: 'string' },
      description: "Identifiants des éléments réellement utilisés (ex. [\"E1\",\"E3\"]).",
    },
  },
  required: ['synthese', 'elements_utilises'],
  additionalProperties: false,
};

/* ── Matching par mots-clés (accents ignorés, préfixes de mots) ─────────── */

const STOPWORDS = new Set([
  'les', 'des', 'une', 'aux', 'sur', 'pour', 'dans', 'par', 'avec', 'sans',
  'sous', 'vers', 'chez', 'entre', 'contre', 'son', 'ses', 'leur', 'leurs',
  'est', 'sont', 'ete', 'etre', 'que', 'qui', 'quoi', 'dont', 'mais', 'donc',
  'position', 'sujet', 'question', 'propos', 'quant', 'ainsi', 'tout', 'tous', 'toute', 'toutes',
]);

function normaliser(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

function motsCles(sujet: string): string[] {
  return [...new Set(
    normaliser(sujet).split(/[^a-z0-9]+/)
      .filter(m => m.length >= 3 && !STOPWORDS.has(m)),
  )];
}

/* Un texte matche si l'un des mots-clés est un mot entier du texte, ou le
   préfixe d'un mot (« nucleaire » attrape « nucleaires ») pour les
   mots-clés d'au moins 4 caractères. */
function matche(texte: string, cles: string[]): boolean {
  const mots = normaliser(texte).split(/[^a-z0-9]+/);
  return cles.some(c =>
    mots.some(m => m === c || (c.length >= 4 && m.startsWith(c))));
}

/* ── Types d'éléments sourcés ───────────────────────────────────────────── */

type Element = {
  id: string;
  type: 'vote' | 'amendement' | 'question';
  date: string | null;
  titre: string;
  detail: string;       // position de vote, sort de l'amendement, statut…
  url: string | null;
};

const POSITIONS_VOTE: Record<string, string> = {
  pour: 'a voté POUR', contre: 'a voté CONTRE',
  abs: "s'est abstenu·e", nv: "n'a pas pris part au vote",
};

function rassemblerElements(fiche: Record<string, unknown>, cles: string[]): Element[] {
  const elements: Element[] = [];
  const votes = (fiche.derniers_votes as Array<Record<string, string>> || [])
    .filter(v => v.t && matche(v.t, cles)).slice(0, MAX_PAR_TYPE);
  const amendements = (fiche.amendements as Array<Record<string, string>> || [])
    .filter(a => matche(`${a.t || ''} ${a.div || ''}`, cles)).slice(0, MAX_PAR_TYPE);
  const questions = (fiche.questions as Array<Record<string, string>> || [])
    .filter(q => matche(`${q.t || ''} ${q.r || ''}`, cles)).slice(0, MAX_PAR_TYPE);

  for (const v of votes) {
    elements.push({
      id: '', type: 'vote', date: v.d || null,
      titre: `Scrutin n° ${v.n} : ${v.t}`,
      detail: POSITIONS_VOTE[v.p] || `position : ${v.p}`,
      url: v.n ? `https://www.assemblee-nationale.fr/dyn/17/scrutins/${v.n}` : null,
    });
  }
  for (const a of amendements) {
    elements.push({
      id: '', type: 'amendement', date: a.d || null,
      titre: `Amendement ${a.num || ''} — ${a.t || ''}${a.div ? ` (${a.div})` : ''}`,
      detail: a.s ? `sort : ${a.s}` : '',
      url: null, // pas d'URL stable dans les données du pipeline
    });
  }
  for (const q of questions) {
    elements.push({
      id: '', type: 'question', date: q.d || null,
      titre: `Question ${q.ty || ''} n° ${q.num || ''} : ${q.t || ''}${q.r ? ` (rubrique : ${q.r})` : ''}`,
      detail: q.s || '',
      url: q.num && q.ty === 'QE'
        ? `https://questions.assemblee-nationale.fr/q17/17-${q.num}QE.htm` : null,
    });
  }

  return elements
    .sort((a, b) => (a.date || '') < (b.date || '') ? 1 : -1)
    .slice(0, MAX_TOTAL)
    .map((e, i) => ({ ...e, id: `E${i + 1}` }));
}

/* ── Anti-hallucination ─────────────────────────────────────────────────── */

/* Supprime de la synthèse toute phrase citant un identifiant [En] qui
   n'existe pas dans les éléments fournis au modèle. Retourne la synthèse
   nettoyée et le nombre d'affirmations écartées. */
function purgerAffirmationsNonSourcees(synthese: string, idsConnus: Set<string>): { texte: string; ecartees: number } {
  const phrases = synthese.split(/(?<=[.!?])\s+/);
  let ecartees = 0;
  const gardees = phrases.filter(p => {
    // Citations isolées « [E3] » comme groupées « [E1, E2, E7] ».
    const refs = [...p.matchAll(/\[([^\]]+)\]/g)]
      .flatMap(g => [...g[1].matchAll(/\bE\d+\b/g)].map(m => m[0]));
    if (refs.length && refs.some(r => !idsConnus.has(r))) { ecartees++; return false; }
    return true;
  });
  return { texte: gardees.join(' ').trim(), ecartees };
}

/* ── Handler ────────────────────────────────────────────────────────────── */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
  if (req.method !== 'POST') return reponseErreur('Méthode non autorisée.', 405);

  const utilisateur = await utilisateurAuthentifie(req);
  if (!utilisateur) return reponseErreur('Connexion requise.', 401);

  let corps: { depute_id?: unknown; sujet?: unknown };
  try { corps = await req.json(); } catch { return reponseErreur('Corps JSON invalide.', 400); }

  const deputeId = typeof corps.depute_id === 'string' && /^PA\d{2,8}$/.test(corps.depute_id)
    ? corps.depute_id : null;
  const sujet = typeof corps.sujet === 'string' ? corps.sujet.trim().slice(0, 120) : '';
  if (!deputeId) return reponseErreur('Identifiant de député invalide.', 400);
  if (sujet.length < 3) return reponseErreur('Sujet trop court.', 400);
  const cles = motsCles(sujet);
  if (!cles.length) return reponseErreur('Sujet trop vague pour une recherche.', 400);

  /* Données publiques du député (pipeline). */
  let fiche: Record<string, unknown>;
  try {
    const res = await fetch(`${DONNEES_BASE}${deputeId}.json`);
    if (!res.ok) return reponseErreur('Député introuvable.', 404);
    fiche = await res.json();
  } catch {
    return reponseErreur('Données du député momentanément indisponibles.', 502);
  }

  /* Matching AVANT tout appel au modèle. Avec 0 ou 1 élément (niveau
     « faible » du brief), le front affiche « données insuffisantes » :
     on court-circuite donc ici sans consommer d'appel API. */
  const elements = rassemblerElements(fiche, cles);
  if (elements.length < 2) {
    return reponseJson({
      statut: 'donnees_insuffisantes',
      message: 'Données insuffisantes pour synthétiser une position sur ce sujet.',
      nb_elements_trouves: elements.length,
    });
  }

  const admin = clientAdmin();
  if (await quotaAtteint(admin, utilisateur.id)) {
    return reponseErreur('Limite quotidienne atteinte, réessayez demain.', 429);
  }

  /* Niveau de confiance calculé — jamais laissé à l'appréciation du modèle.
     (« faible » = 1 élément, court-circuité plus haut sans appel API.) */
  const niveauConfiance = elements.length >= 5 ? 'élevé' : 'moyen';

  const identite = fiche.identite as Record<string, string> | undefined;
  const listeElements = elements.map(e =>
    `[${e.id}] ${e.type.toUpperCase()}${e.date ? ` du ${e.date}` : ''} — ${e.titre}${e.detail ? ` — ${e.detail}` : ''}`,
  ).join('\n');

  let brut: { synthese?: unknown; elements_utilises?: unknown };
  let tokensEntree: number | null, tokensSortie: number | null;
  try {
    const reponse = await genererJson({
      systeme: PROMPT_SYSTEME,
      utilisateur:
        `Parlementaire : ${identite?.nomComplet || deputeId}\n` +
        `Sujet demandé : ${sujet}\n\n` +
        `Éléments publics disponibles (les seuls utilisables) :\n${listeElements}`,
      schema: SCHEMA_SYNTHESE,
      timeoutMs: TIMEOUT_GENERATION_MS,
    });
    brut = reponse.json as typeof brut;
    tokensEntree = reponse.tokensEntree;
    tokensSortie = reponse.tokensSortie;
  } catch (e) {
    if (e instanceof ErreurFournisseur) {
      const message = e.statut === 504
        ? 'La génération a pris trop de temps. Réessayez dans quelques instants.'
        : e.quotaEpuise ? e.message : 'Le service de synthèse est momentanément indisponible.';
      return reponseErreur(message, e.statut);
    }
    console.error('génération :', e);
    return reponseErreur('Le service de synthèse est momentanément indisponible.', 502);
  }

  /* Vérification anti-hallucination : identifiants inconnus écartés, sources
     reconstruites depuis NOS éléments (jamais depuis la sortie du modèle). */
  const idsConnus = new Set(elements.map(e => e.id));
  const idsUtilises = (Array.isArray(brut.elements_utilises) ? brut.elements_utilises : [])
    .filter((id): id is string => typeof id === 'string')
    .map(id => id.replace(/[[\]]/g, ''));
  const idsVerifies = [...new Set(idsUtilises.filter(id => idsConnus.has(id)))];
  const idsRejetes = [...new Set(idsUtilises.filter(id => !idsConnus.has(id)))];
  const { texte: synthese, ecartees } = purgerAffirmationsNonSourcees(
    String(brut.synthese || ''), idsConnus,
  );
  if (!synthese) {
    return reponseErreur("La synthèse générée n'a pas pu être vérifiée. Réessayez.", 502);
  }

  const parId = new Map(elements.map(e => [e.id, e]));
  const elementsSources = idsVerifies
    .map(id => parId.get(id)!)
    .map(({ id, type, date, titre, url, detail }) => ({ id, type, date, titre, url, detail }));

  await journaliserAppel(admin, {
    utilisateur_id: utilisateur.id,
    fonctionnalite: 'synthese_position',
    reference: `${deputeId} | ${sujet}`,
    modele: MODELE,
    tokens_entree: tokensEntree,
    tokens_sortie: tokensSortie,
  });

  return reponseJson({
    statut: 'ok',
    synthese,
    niveau_confiance: niveauConfiance,
    elements_sources: elementsSources,
    nb_elements_trouves: elements.length,
    verification: {
      affirmations_ecartees: ecartees,
      sources_rejetees: idsRejetes,
    },
    modele: MODELE,
    genere_le: new Date().toISOString(),
  });
});
