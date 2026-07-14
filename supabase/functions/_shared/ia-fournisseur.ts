/* ============================================================================
   Fournisseur IA — couche d'isolation unique pour tous les appels de modèle.

   Fournisseur actuel : Mistral La Plateforme, palier gratuit « Experiment »
   (0 €, sans carte bancaire, ~1 Md tokens/mois, contexte 128 k — nos
   documents de 40 k tokens passent entiers). Clé requise : MISTRAL_API_KEY
   (supabase secrets set), créée gratuitement sur https://console.mistral.ai.

   Historique : Anthropic (crédits épuisés) puis Gemini (Google a supprimé le
   palier gratuit pour les nouveaux comptes en mars 2026). Pour changer de
   fournisseur, seule la fonction genererJson() est à réécrire — le reste
   des Edge Functions n'y touche pas. Les versions précédentes sont dans
   l'historique git.

   ⚠ Palier gratuit : Mistral peut utiliser les données envoyées pour
   améliorer ses modèles. Acceptable pour des documents parlementaires
   PUBLICS (fonctionnalité A). NE PAS y envoyer de notes internes privées
   (fonctionnalité B, voie authentifiée) tant qu'on est sur ce palier.
   ============================================================================ */

export const MODELE = Deno.env.get('IA_MODELE') || 'mistral-medium-latest';

const API_URL = 'https://api.mistral.ai/v1/chat/completions';

export class ErreurFournisseur extends Error {
  constructor(message: string, public statut: number, public quotaEpuise = false) {
    super(message);
  }
}

/* Appelle le modèle avec un prompt système, un message utilisateur et un
   schéma JSON de sortie (JSON Schema strict : additionalProperties false,
   toutes les propriétés requises — pas de anyOf/nullable, préférer une
   chaîne vide à null). Retourne l'objet parsé + la consommation en tokens. */
export async function genererJson(options: {
  systeme: string;
  utilisateur: string;
  schema: Record<string, unknown>;
  timeoutMs: number;
}): Promise<{ json: unknown; tokensEntree: number | null; tokensSortie: number | null }> {
  const cle = Deno.env.get('MISTRAL_API_KEY');
  if (!cle) throw new ErreurFournisseur('MISTRAL_API_KEY absente des secrets.', 500);

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), options.timeoutMs);
  let res: Response;
  try {
    res = await fetch(API_URL, {
      method: 'POST',
      signal: ctrl.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cle}` },
      body: JSON.stringify({
        model: MODELE,
        temperature: 0.2, // factuel : peu de créativité souhaitée
        messages: [
          { role: 'system', content: options.systeme },
          { role: 'user', content: options.utilisateur },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'reponse', strict: true, schema: options.schema },
        },
      }),
    });
  } catch (e) {
    if (e instanceof DOMException && e.name === 'AbortError') {
      throw new ErreurFournisseur('Délai de génération dépassé.', 504);
    }
    throw new ErreurFournisseur('Fournisseur IA injoignable.', 502);
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 429) {
    // Palier gratuit : ~1 requête/seconde. Le cache serveur rend ce cas rare.
    throw new ErreurFournisseur('Quota du fournisseur IA atteint, réessayez dans une minute.', 503, true);
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    console.error(`Mistral HTTP ${res.status} :`, detail.slice(0, 500));
    throw new ErreurFournisseur('Le fournisseur IA a refusé la requête.', 502);
  }

  const corps = await res.json();
  const texte = corps.choices && corps.choices[0] && corps.choices[0].message
    && corps.choices[0].message.content;
  if (!texte) {
    console.error('Réponse Mistral sans contenu, finish_reason =',
      corps.choices && corps.choices[0] && corps.choices[0].finish_reason);
    throw new ErreurFournisseur('Réponse du modèle vide.', 502);
  }

  let json: unknown;
  try { json = JSON.parse(texte); }
  catch { throw new ErreurFournisseur('Réponse du modèle illisible.', 502); }

  return {
    json,
    tokensEntree: corps.usage?.prompt_tokens ?? null,
    tokensSortie: corps.usage?.completion_tokens ?? null,
  };
}
