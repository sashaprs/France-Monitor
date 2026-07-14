/* ============================================================================
   Récupération et extraction de texte des documents parlementaires de l'AN.

   Les documents (propositions/projets de loi, rapports, avis…) sont servis
   en HTML autonome sur https://www.assemblee-nationale.fr/dyn/docs/<uid>.raw
   (format vérifié : HTML propre, texte intégral, pas de PDF à parser).

   Anti-SSRF : on n'accepte jamais d'URL fournie par le client — uniquement
   un uid AN validé par regex, l'URL est construite ici.
   ============================================================================ */

const AN_DOCS_BASE = 'https://www.assemblee-nationale.fr/dyn/docs/';

/* uid AN : lettres majuscules + chiffres (+ tiret pour quelques variantes),
   ex. PIONANR5L17B0277, RAPPANR5L17B2754. Borné pour éviter tout abus. */
const UID_REGEX = /^[A-Z0-9-]{10,32}$/;

export function validerUid(uid: unknown): string | null {
  if (typeof uid !== 'string' || !UID_REGEX.test(uid)) return null;
  return uid;
}

export function urlDocument(uid: string): string {
  return `${AN_DOCS_BASE}${uid}.raw`;
}

/* Télécharge le document HTML avec un timeout court (l'AN répond vite). */
export async function telechargerDocument(uid: string, timeoutMs = 20_000): Promise<string> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(urlDocument(uid), {
      signal: ctrl.signal,
      headers: { 'User-Agent': 'NomosLab/1.0 (+https://github.com/sashaprs/France-Monitor)' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} depuis assemblee-nationale.fr`);
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

/* Extrait le texte brut d'un document .raw : styles/scripts supprimés,
   fins de blocs converties en sauts de ligne (pour préserver la structure
   par articles), entités HTML décodées, espaces normalisés. */
export function extraireTexte(html: string): string {
  let t = html
    .replace(/<(style|script)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|div|tr|li|h[1-6]|table)>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  t = t
    .replace(/&#x?([0-9a-fA-F]+);/g, (m, code) => {
      try { return String.fromCodePoint(parseInt(code, /x/i.test(m) ? 16 : 10)); }
      catch { return ' '; }
    })
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'");
  return t
    .replace(/[ \t ]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/* Tronque intelligemment un texte trop long : on coupe de préférence à la
   dernière frontière d'article (« Article N »), sinon au dernier paragraphe,
   plutôt qu'en plein milieu d'une phrase. Retourne aussi un indicateur pour
   que le modèle soit prévenu que le document est incomplet. */
export function tronquer(texte: string, maxChars: number): { texte: string; tronque: boolean } {
  if (texte.length <= maxChars) return { texte, tronque: false };
  const fenetre = texte.slice(0, maxChars);
  // Frontière d'article la plus tardive dans la fenêtre (si assez profonde
  // pour ne pas jeter l'essentiel du budget).
  const matchArticle = [...fenetre.matchAll(/\n\s*Article\s+(?:1er|[0-9]+)/g)].pop();
  if (matchArticle && matchArticle.index! > maxChars * 0.5) {
    return { texte: fenetre.slice(0, matchArticle.index).trimEnd(), tronque: true };
  }
  const dernierParagraphe = fenetre.lastIndexOf('\n\n');
  if (dernierParagraphe > maxChars * 0.5) {
    return { texte: fenetre.slice(0, dernierParagraphe).trimEnd(), tronque: true };
  }
  return { texte: fenetre.trimEnd(), tronque: true };
}
