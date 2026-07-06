/* ============================================================================
   detect-events.js — Détection de changements entre deux exécutions du
   pipeline Suivi législatif (moteur d'alertes, étape 1/3).

   Compare les données publiées (public/data/…) à l'instantané de référence
   commité dans data/alertes/state/ (fichiers légers : ids/statuts, jamais les
   données complètes) et produit des événements normalisés :

     nouveau_dossier            dossier absent de l'état précédent
     changement_etape           statut d'un dossier modifié
     nouvel_amendement          amendement absent de l'état précédent
     sort_amendement            le sort d'un amendement a changé
     inscription_ordre_du_jour  nouvel événement de calendrier rattaché à un dossier
     resultat_scrutin           nouveau scrutin publié

   Sortie : data/alertes/events/AAAA-MM-JJ-HHMM.json (uniquement si des
   événements existent), chaque événement portant un id DÉTERMINISTE (base de
   l'anti-spam de notify.js) et un champ texte_matchable pour le matching.

   Garde-fous :
   - Première exécution (state/ vide) ou nouvelle source : on construit l'état
     SANS émettre d'événements (--init implicite, par source).
   - Données partielles : si une source est illisible ou anormalement plus
     petite que l'état de référence (échec de refresh en amont), on saute sa
     détection ET la mise à jour de son état pour cette exécution — le moteur
     ne notifie jamais sur la base de données incomplètes.

   Usage : node scripts/legislatif/detect-events.js [--init]
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..', '..');
const DATA = path.join(ROOT, 'public', 'data');
const STATE_DIR = path.join(ROOT, 'data', 'alertes', 'state');
const EVENTS_DIR = path.join(ROOT, 'data', 'alertes', 'events');
const FORCE_INIT = process.argv.includes('--init');
const LEGISLATURE = '17';

const STATUT_LIBELLES = {
  en_commission: 'en commission', en_seance: 'en séance', en_navette: 'en navette',
  adopte: 'adopté', promulgue: 'promulgué', rejete: 'rejeté', retire: 'retiré',
};

function sha1(s) { return crypto.createHash('sha1').update(s).digest('hex').slice(0, 16); }

function lireJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}
function lireEtat(nom) {
  return lireJson(path.join(STATE_DIR, `${nom}.json`));
}
function ecrireEtat(nom, data) {
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(path.join(STATE_DIR, `${nom}.json`), JSON.stringify(data));
}

function main() {
  console.log('▶ detect-events');
  const evenements = [];
  const maintenant = new Date().toISOString();

  /* Titres des dossiers (contexte des événements amendements/scrutins). */
  const index = lireJson(path.join(DATA, 'legislatif', 'dossiers-index.json'));
  const titresDossiers = {};
  if (index) for (const d of index.dossiers) titresDossiers[d.id] = d.titre_court || d.titre;

  /* Rattachement scrutin → dossier par inclusion de titre normalisé (les
     scrutins de l'export léger n'ont pas de référence de dossier). */
  const normalize = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim();
  const titresNorm = [];
  if (index) for (const d of index.dossiers) {
    for (const t of [d.titre, d.titre_court]) {
      const n = normalize(t);
      if (n.length >= 25) titresNorm.push([n, d.id]);
    }
  }
  titresNorm.sort((a, b) => b[0].length - a[0].length);
  const matchDossier = (texte) => {
    const n = normalize(texte);
    const hit = titresNorm.find(([t]) => n.includes(t));
    return hit ? hit[1] : null;
  };

  /* Chaque source déclare : son état courant, un seuil de vraisemblance et un
     générateur d'événements par diff. `detecter` n'est appelé que si l'état
     précédent existe (sinon : initialisation silencieuse de la source).
     `ctx` transporte les listes détaillées entre courant() et detecter(). */
  const ctx = {};
  const sources = [
    {
      nom: 'dossiers',
      courant: () => {
        if (!index) return null;
        const etat = {};
        for (const d of index.dossiers) etat[d.id] = d.statut;
        return etat;
      },
      detecter: (prev, cur) => {
        for (const [id, statut] of Object.entries(cur)) {
          const fiche = () => lireJson(path.join(DATA, 'legislatif', 'dossiers', `${id}.json`)) || {};
          if (!(id in prev)) {
            const f = fiche();
            evenements.push({
              id: `dossier-nouveau:${id}`,
              type: 'nouveau_dossier',
              date: maintenant,
              titre: `Nouveau dossier : ${titresDossiers[id] || id}`,
              detail: [f.procedure, f.commission && `commission : ${f.commission}`].filter(Boolean).join(' · ') || null,
              url: f.url || null,
              dossier_id: id,
              texte_matchable: [f.titre, f.titre_court, f.procedure, f.commission, f.rapporteur].filter(Boolean).join(' '),
            });
          } else if (prev[id] !== statut) {
            const f = fiche();
            evenements.push({
              id: `dossier-statut:${id}:${statut}`,
              type: 'changement_etape',
              date: maintenant,
              titre: `${titresDossiers[id] || id} — ${STATUT_LIBELLES[statut] || statut}`,
              detail: `Statut : « ${STATUT_LIBELLES[prev[id]] || prev[id]} » → « ${STATUT_LIBELLES[statut] || statut} »`,
              url: f.url || null,
              dossier_id: id,
              texte_matchable: [f.titre, f.titre_court, f.commission, f.rapporteur].filter(Boolean).join(' '),
            });
          }
        }
      },
    },
    {
      nom: 'amendements',
      courant: () => {
        const j = lireJson(path.join(DATA, 'legislatif', 'amendements-recents.json'));
        if (!j || !Array.isArray(j.amendements)) return null;
        const etat = {};
        for (const a of j.amendements) etat[a.id] = a.sort;
        ctx.amendements = j.amendements;
        return etat;
      },
      detecter: (prev, cur) => {
        const parId = {};
        for (const a of ctx.amendements) parId[a.id] = a;
        for (const [id, sort] of Object.entries(cur)) {
          const a = parId[id];
          if (!a) continue;
          const contexte = [a.resume, a.article_vise, a.auteur && a.auteur.nom, a.auteur && a.auteur.groupe,
            a.dossier_id && titresDossiers[a.dossier_id]].filter(Boolean).join(' ');
          let auteur = a.auteur && a.auteur.nom ? `de ${a.auteur.nom}${a.auteur.groupe ? ` (${a.auteur.groupe})` : ''}` : 'd\'auteur inconnu';
          if (a.auteur && a.auteur.nom === 'Gouvernement') auteur = 'du Gouvernement';
          if (!(id in prev)) {
            evenements.push({
              id: `amdt-nouveau:${id}`,
              type: 'nouvel_amendement',
              date: maintenant,
              titre: `Amendement n° ${a.numero || '?'} ${auteur}${a.article_vise ? ` — ${a.article_vise}` : ''}`,
              detail: a.resume || (a.dossier_id && titresDossiers[a.dossier_id]) || null,
              url: a.url || null,
              dossier_id: a.dossier_id || null,
              texte_matchable: contexte,
            });
          } else if (prev[id] !== sort) {
            evenements.push({
              id: `amdt-sort:${id}:${sort}`,
              type: 'sort_amendement',
              date: maintenant,
              titre: `Amendement n° ${a.numero || '?'} ${auteur} : ${sort}`,
              detail: a.resume || null,
              url: a.url || null,
              dossier_id: a.dossier_id || null,
              texte_matchable: contexte,
            });
          }
        }
      },
    },
    {
      nom: 'calendrier',
      courant: () => {
        const j = lireJson(path.join(DATA, 'legislatif', 'calendrier.json'));
        if (!j || !Array.isArray(j.evenements)) return null;
        const etat = {};
        ctx.calendrier = [];
        for (const e of j.evenements) {
          if (!e.dossier_id) continue; // seuls les événements rattachés déclenchent une alerte
          const h = sha1(`${e.date}|${e.heure}|${e.dossier_id}|${e.objet || ''}`);
          etat[h] = 1;
          ctx.calendrier.push({ ...e, __h: h });
        }
        return etat;
      },
      detecter: (prev, cur) => {
        for (const e of ctx.calendrier) {
          if (e.__h in prev) continue;
          const jour = new Date(e.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
          evenements.push({
            id: `odj:${e.__h}`,
            type: 'inscription_ordre_du_jour',
            date: maintenant,
            titre: `À l'ordre du jour ${e.type === 'seance' ? 'de la séance publique' : `— ${e.organe || 'commission'}`} : ${titresDossiers[e.dossier_id] || e.dossier_id}`,
            detail: `${jour} à ${e.heure}${e.objet ? ` · ${e.objet}` : ''}${e.eventuel ? ' (sous réserve)' : ''}`,
            url: null,
            dossier_id: e.dossier_id,
            texte_matchable: [e.objet, e.organe, titresDossiers[e.dossier_id]].filter(Boolean).join(' '),
          });
        }
      },
    },
    {
      nom: 'scrutins',
      courant: () => {
        const j = lireJson(path.join(DATA, 'scrutins.json'));
        if (!j || !Array.isArray(j.scrutins)) return null;
        const etat = {};
        ctx.scrutins = j.scrutins;
        for (const s of j.scrutins) if (s.numero) etat[s.numero] = 1;
        return etat;
      },
      detecter: (prev, cur) => {
        for (const s of ctx.scrutins) {
          if (!s.numero || s.numero in prev) continue;
          const dossierId = s.titre ? matchDossier(s.titre) : null;
          evenements.push({
            id: `scrutin:${s.numero}`,
            type: 'resultat_scrutin',
            date: maintenant,
            titre: `Scrutin n° ${s.numero} : ${s.titre || 'objet non précisé'}`,
            detail: `${s.pour ?? '?'} pour · ${s.contre ?? '?'} contre · ${s.abstentions ?? '?'} abstentions (${s.date || ''})`,
            url: `https://www.assemblee-nationale.fr/dyn/${LEGISLATURE}/scrutins/${s.numero}`,
            dossier_id: dossierId,
            texte_matchable: [s.titre, dossierId && titresDossiers[dossierId]].filter(Boolean).join(' '),
          });
        }
      },
    },
  ];

  for (const source of sources) {
    const courant = source.courant();
    if (courant === null) {
      console.log(`   ⚠ ${source.nom} : données illisibles — détection ET mise à jour d'état sautées`);
      continue;
    }
    const precedent = FORCE_INIT ? null : lireEtat(source.nom);
    const nbCur = Object.keys(courant).length;
    if (precedent === null) {
      console.log(`   ${source.nom} : initialisation (${nbCur} entrées, aucun événement émis)`);
      ecrireEtat(source.nom, courant);
      continue;
    }
    const nbPrev = Object.keys(precedent).length;
    /* Repli brutal (< 30 % de l'état de référence) = refresh amont raté :
       on ne diffe pas et on PRÉSERVE l'état, sinon la prochaine exécution
       saine générerait un déluge de faux « nouveaux » événements. */
    if (nbPrev >= 20 && nbCur < nbPrev * 0.3) {
      console.log(`   ⚠ ${source.nom} : ${nbCur} entrées contre ${nbPrev} en référence — données partielles, détection sautée`);
      continue;
    }
    const avant = evenements.length;
    source.detecter(precedent, courant);
    console.log(`   ${source.nom} : ${evenements.length - avant} événement(s)`);
    ecrireEtat(source.nom, courant);
  }

  if (!evenements.length) {
    console.log('   aucun événement — pas de fichier écrit');
    return;
  }

  fs.mkdirSync(EVENTS_DIR, { recursive: true });
  const horodatage = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  const fichier = path.join(EVENTS_DIR, `${horodatage}.json`);
  fs.writeFileSync(fichier, JSON.stringify({ genere_le: maintenant, evenements }, null, 1));
  console.log(`   ↳ ${evenements.length} événements → data/alertes/events/${path.basename(fichier)}`);
}

main();
