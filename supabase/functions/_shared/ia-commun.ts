/* ============================================================================
   Socle commun des Edge Functions IA (résumé de texte, synthèse de position) :
   CORS, authentification Supabase, rate limiting quotidien et journal des
   appels. La clé Anthropic ne vit QUE dans les secrets Supabase — jamais
   côté client, jamais dans ce code.
   ============================================================================ */

import { createClient, SupabaseClient } from 'npm:@supabase/supabase-js@2';

/* Le front est servi depuis GitHub Pages (origine variable en local) ; la
   protection vient du JWT obligatoire, pas du CORS. */
export const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function reponseJson(corps: unknown, statut = 200): Response {
  return new Response(JSON.stringify(corps), {
    status: statut,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export function reponseErreur(message: string, statut: number): Response {
  return reponseJson({ erreur: message }, statut);
}

/* Client service_role : contourne la RLS, réservé au serveur. */
export function clientAdmin(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );
}

/* Vérifie le JWT de session transmis par le front. Retourne l'utilisateur
   ou null si la requête n'est pas authentifiée. */
export async function utilisateurAuthentifie(req: Request) {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return null;
  const client = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/* L'utilisateur est-il admin d'au moins une organisation ? (bouton
   « Régénérer » réservé aux admins). */
export async function estAdmin(admin: SupabaseClient, utilisateurId: string): Promise<boolean> {
  const { data } = await admin
    .from('utilisateurs_organisations')
    .select('organisation_id')
    .eq('utilisateur_id', utilisateurId)
    .eq('role', 'admin')
    .limit(1);
  return !!(data && data.length);
}

/* Rate limiting quotidien, appliqué CÔTÉ SERVEUR uniquement. Compte les
   appels réels à l'API (les hits de cache ne consomment pas de quota). */
export const LIMITE_QUOTIDIENNE = parseInt(Deno.env.get('IA_LIMITE_QUOTIDIENNE') || '20', 10);

export async function quotaAtteint(admin: SupabaseClient, utilisateurId: string): Promise<boolean> {
  const debutJour = new Date();
  debutJour.setUTCHours(0, 0, 0, 0);
  const { count } = await admin
    .from('ia_appels_log')
    .select('id', { count: 'exact', head: true })
    .eq('utilisateur_id', utilisateurId)
    .gte('cree_le', debutJour.toISOString());
  return (count ?? 0) >= LIMITE_QUOTIDIENNE;
}

/* Journalise un appel réel à l'API Anthropic (suivi de coût + rate limit). */
export async function journaliserAppel(admin: SupabaseClient, entree: {
  utilisateur_id: string;
  fonctionnalite: 'resume_texte' | 'synthese_position';
  reference: string;
  modele: string;
  tokens_entree: number | null;
  tokens_sortie: number | null;
}) {
  const { error } = await admin.from('ia_appels_log').insert(entree);
  if (error) console.error('journalisation impossible :', error.message);
}
