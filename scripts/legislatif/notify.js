/* ============================================================================
   notify.js — Envoi des alertes e-mail / Slack (moteur d'alertes, étape 3/3).

   Pour chaque profil de config/veille-profils.json :
   - récupère les événements des lots des 48 dernières heures qui le matchent
     (champ `profils` posé par match-alerts.js), moins ceux déjà notifiés
     (data/alertes/sent.json) — fenêtre glissante et non « dernier lot
     uniquement », pour qu'un envoi raté ou sauté soit retenté au run suivant ;
   - envoie AU PLUS UN e-mail par exécution regroupant tous les événements
     (jamais un e-mail par événement), objet « ⚡ NomosLab — N nouveaux
     événements sur vos sujets », via l'API Resend (clé dans l'env
     RESEND_API_KEY, jamais en dur ; expéditeur surchargeable via RESEND_FROM) ;
   - poste sur le webhook Slack du profil s'il en a un (URL fournie PAR LE
     CLIENT dans son profil — aucun secret global Slack) ;
   - journalise les ids notifiés dans sent.json (jamais deux fois le même
     événement au même profil), purgé au-delà de 45 jours.

   Le résultat de chaque exécution (envois, échecs et leurs messages) est
   journalisé dans data/alertes/notify-log.json, commité par le workflow :
   diagnostiquable à distance sans accès aux logs GitHub Actions.

   Usage : node scripts/legislatif/notify.js [--events <chemin>] [--dry-run]
           --events  : limite au fichier de lot indiqué (défaut : lots < 48 h)
           --dry-run : écrit le HTML des e-mails dans tmp/ sans rien envoyer
                       ni toucher sent.json (prévisualisation).
   ============================================================================ */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const EVENTS_DIR = path.join(ROOT, 'data', 'alertes', 'events');
const SENT_FILE = path.join(ROOT, 'data', 'alertes', 'sent.json');
const CONFIG = path.join(ROOT, 'config', 'veille-profils.json');
const DRY_RUN = process.argv.includes('--dry-run');
const RETENTION_JOURS = 45;

const TYPE_LIBELLES = {
  nouveau_dossier: 'Nouveaux dossiers législatifs',
  changement_etape: 'Changements d\'étape',
  nouvel_amendement: 'Nouveaux amendements',
  sort_amendement: 'Sorts d\'amendements',
  inscription_ordre_du_jour: 'Inscriptions à l\'ordre du jour',
  resultat_scrutin: 'Résultats de scrutins',
};

/* Lots de moins de 48 h (le nom des fichiers est l'horodatage UTC). */
function fichiersEventsRecents() {
  if (!fs.existsSync(EVENTS_DIR)) return [];
  const limite = new Date(Date.now() - 48 * 3600e3).toISOString().slice(0, 16).replace('T', '-').replace(':', '');
  return fs.readdirSync(EVENTS_DIR)
    .filter(f => /^\d{4}-\d{2}-\d{2}-\d{4}\.json$/.test(f) && f.slice(0, 15) >= limite)
    .sort()
    .map(f => path.join(EVENTS_DIR, f));
}

function echapperHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Gabarit e-mail : HTML simple compatible clients mail (tables, styles
   inline), charte NomosLab (Bleu France #000091). ───────────────────────── */
function rendreEmail(profil, evenements) {
  const parType = {};
  for (const e of evenements) (parType[e.type] = parType[e.type] || []).push(e);

  const sections = Object.entries(parType).map(([type, liste]) => `
    <tr><td style="padding:18px 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:bold;
        letter-spacing:0.08em;text-transform:uppercase;color:#000091;">
      ${echapperHtml(TYPE_LIBELLES[type] || type)} (${liste.length})
    </td></tr>
    ${liste.map(e => `
    <tr><td style="padding:10px 14px;border:1px solid #E5E7EB;border-radius:6px;background:#FFFFFF;">
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:bold;color:#111827;line-height:1.4;">
        ${e.url ? `<a href="${e.url}" style="color:#000091;text-decoration:none;">${echapperHtml(e.titre)}</a>` : echapperHtml(e.titre)}
      </div>
      ${e.detail ? `<div style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#4B5563;line-height:1.45;padding-top:4px;">${echapperHtml(e.detail)}</div>` : ''}
    </td></tr>
    <tr><td style="height:8px;line-height:8px;">&nbsp;</td></tr>`).join('')}
  `).join('');

  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#F3F4F6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;padding:24px 0;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr><td style="background:#000091;border-radius:8px 8px 0 0;padding:18px 24px;">
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;color:#FFFFFF;">Nomos<span style="font-weight:normal;color:#BCD0FB;">Lab</span></span>
          <span style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#BCD0FB;padding-left:10px;">Suivi législatif</span>
        </td></tr>
        <tr><td style="background:#FFFFFF;padding:22px 24px 8px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#111827;">
            Bonjour, <strong>${evenements.length} nouvel${evenements.length > 1 ? 's' : ''} événement${evenements.length > 1 ? 's' : ''}</strong>
            détecté${evenements.length > 1 ? 's' : ''} sur les sujets du profil « ${echapperHtml(profil.nom || profil.id)} ».
          </div>
        </td></tr>
        <tr><td style="background:#FFFFFF;padding:0 24px 20px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${sections}</table>
        </td></tr>
        <tr><td style="background:#F9FAFB;border:1px solid #E5E7EB;border-top:none;border-radius:0 0 8px 8px;padding:14px 24px;">
          <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#9CA3AF;line-height:1.5;">
            Alerte automatique NomosLab · sources : open data Assemblée nationale.<br>
            Configuration du profil : config/veille-profils.json.
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

/* ── Message Slack : Block Kit basique (titre + liste d'événements). ────── */
function rendreSlack(profil, evenements) {
  const blocks = [
    { type: 'header', text: { type: 'plain_text', text: `⚡ NomosLab — ${evenements.length} nouveaux événements`, emoji: true } },
    { type: 'context', elements: [{ type: 'mrkdwn', text: `Profil *${profil.nom || profil.id}* · suivi législatif Assemblée nationale` }] },
    { type: 'divider' },
  ];
  /* Slack limite à 50 blocs par message : on regroupe par type, chaque type
     en une section listant ses événements. */
  const parType = {};
  for (const e of evenements) (parType[e.type] = parType[e.type] || []).push(e);
  for (const [type, liste] of Object.entries(parType)) {
    const lignes = liste.slice(0, 15).map(e =>
      `• ${e.url ? `<${e.url}|${e.titre.replace(/[<>|]/g, ' ')}>` : e.titre}`).join('\n')
      + (liste.length > 15 ? `\n… et ${liste.length - 15} autre(s)` : '');
    blocks.push({ type: 'section', text: { type: 'mrkdwn', text: `*${TYPE_LIBELLES[type] || type}*\n${lignes}` } });
  }
  return { blocks };
}

async function envoyerEmail(profil, evenements) {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) throw new Error('RESEND_API_KEY absent de l\'environnement');
  const reponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cle}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'NomosLab <onboarding@resend.dev>',
      to: profil.email_destinataires,
      subject: `⚡ NomosLab — ${evenements.length} nouveaux événements sur vos sujets`,
      html: rendreEmail(profil, evenements),
    }),
  });
  if (!reponse.ok) throw new Error(`Resend HTTP ${reponse.status} : ${(await reponse.text()).slice(0, 200)}`);
}

async function envoyerSlack(profil, evenements) {
  const reponse = await fetch(profil.alertes.slack_webhook_url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rendreSlack(profil, evenements)),
  });
  if (!reponse.ok) throw new Error(`Slack HTTP ${reponse.status}`);
}

async function main() {
  console.log(`▶ notify${DRY_RUN ? ' (dry-run)' : ''}`);

  const argIdx = process.argv.indexOf('--events');
  const fichiers = argIdx > -1 ? [path.resolve(process.argv[argIdx + 1])] : fichiersEventsRecents();
  if (!fichiers.length || !fichiers.every(f => fs.existsSync(f))) { console.log('   aucun fichier d\'événements — rien à notifier'); return; }

  /* Fusion des lots récents, dédupliquée par id d'événement (les ids sont
     déterministes : un même événement re-détecté ne compte qu'une fois). */
  const evenements = [];
  const vus = new Set();
  for (const f of fichiers) {
    const lot = JSON.parse(fs.readFileSync(f, 'utf8'));
    for (const e of lot.evenements) {
      if (vus.has(e.id)) continue;
      vus.add(e.id);
      evenements.push(e);
    }
  }
  console.log(`   ${evenements.length} événement(s) sur ${fichiers.length} lot(s) récents`);

  const profils = JSON.parse(fs.readFileSync(CONFIG, 'utf8')).profils || [];
  let sent = {};
  try { sent = JSON.parse(fs.readFileSync(SENT_FILE, 'utf8')); } catch { /* premier envoi */ }

  const maintenant = new Date().toISOString();
  const journal = { execute_le: maintenant, dry_run: DRY_RUN, profils: {} };
  let misAJour = false;

  for (const profil of profils) {
    const dejaNotifies = sent[profil.id] || {};
    const aNotifier = evenements.filter(e => (e.profils || []).includes(profil.id) && !(e.id in dejaNotifies));
    if (!aNotifier.length) {
      console.log(`   ${profil.id} : rien de nouveau`);
      journal.profils[profil.id] = { evenements: 0, statut: 'rien à notifier' };
      continue;
    }

    const canaux = [];
    if (profil.alertes && profil.alertes.email && (profil.email_destinataires || []).length) canaux.push('email');
    if (profil.alertes && profil.alertes.slack_webhook_url) canaux.push('slack');
    if (!canaux.length) {
      console.log(`   ${profil.id} : ${aNotifier.length} événement(s) mais aucun canal configuré`);
      journal.profils[profil.id] = { evenements: aNotifier.length, statut: 'aucun canal configuré' };
      continue;
    }

    if (DRY_RUN) {
      const apercu = path.join(ROOT, 'tmp', `alerte-preview-${profil.id}.html`);
      fs.mkdirSync(path.dirname(apercu), { recursive: true });
      fs.writeFileSync(apercu, rendreEmail(profil, aNotifier));
      console.log(`   ${profil.id} : ${aNotifier.length} événement(s) → aperçu tmp/${path.basename(apercu)} (canaux : ${canaux.join(', ')})`);
      continue;
    }

    /* Un échec de canal n'empêche pas l'autre ; l'anti-spam n'est mis à jour
       que si au moins un canal a réellement abouti. */
    let succes = false;
    journal.profils[profil.id] = { evenements: aNotifier.length, canaux: {} };
    for (const canal of canaux) {
      try {
        if (canal === 'email') await envoyerEmail(profil, aNotifier);
        else await envoyerSlack(profil, aNotifier);
        console.log(`   ${profil.id} : ${canal} envoyé (${aNotifier.length} événement(s))`);
        journal.profils[profil.id].canaux[canal] = 'envoyé';
        succes = true;
      } catch (e) {
        console.error(`   ⚠ ${profil.id} : échec ${canal} — ${e.message}`);
        journal.profils[profil.id].canaux[canal] = `échec : ${e.message}`;
      }
    }
    if (succes) {
      sent[profil.id] = dejaNotifies;
      for (const e of aNotifier) dejaNotifies[e.id] = maintenant;
      misAJour = true;
    }
  }

  if (misAJour) {
    /* Purge des entrées trop anciennes pour contenir la taille du journal. */
    const limite = new Date(Date.now() - RETENTION_JOURS * 86400e3).toISOString();
    for (const idsProfil of Object.values(sent)) {
      for (const [id, date] of Object.entries(idsProfil)) if (date < limite) delete idsProfil[id];
    }
    fs.writeFileSync(SENT_FILE, JSON.stringify(sent, null, 1));
    console.log('   ↳ sent.json mis à jour');
  }

  if (!DRY_RUN) {
    fs.writeFileSync(path.join(ROOT, 'data', 'alertes', 'notify-log.json'), JSON.stringify(journal, null, 1));
  }
}

main().catch(e => { console.error('ÉCHEC notify :', e.message); process.exit(1); });
