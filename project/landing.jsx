// landing.jsx — marketing landing page with hero variants
const { Button, Badge } = window.FranceMonitorDesignSystem_5343d8;
const VALUES_LAND = { '11':92,'84':74,'93':68,'76':61,'75':55,'44':58,'32':47,'52':42,'28':39,'53':35,'24':33,'27':29,'94':22 };
const SOURCES_LAND = ['INSEE','Banque de France','data.gouv.fr','DGFiP','Assemblée nationale','Sénat','Ministère de l\'Intérieur','Ministère de l\'Économie'];
const FEATURES_LAND = [
  { icon:'map', t:'Carte interactive', d:"Explorez la France région par région. Couches activables, points d'intérêt, choroplèthes dynamiques." },
  { icon:'shield-check', t:'Sources officielles uniquement', d:"INSEE, Banque de France, ministères, data.gouv.fr. Aucune donnée non vérifiée." },
  { icon:'git-branch', t:'Traçabilité totale', d:"Chaque indicateur affiche son origine et sa date de référence, vérifiable jusqu'au producteur." },
];
const USERS_LAND = [
  { icon:'line-chart', n:'Analystes & investisseurs', d:'Suivre les indicateurs macro et territoriaux en temps réel.' },
  { icon:'newspaper', n:'Journalistes', d:'Sourcer des chiffres fiables et tracés en quelques secondes.' },
  { icon:'briefcase', n:'Cabinets de conseil', d:'Cartographier un territoire pour une mission stratégique.' },
  { icon:'landmark', n:'Collectivités & administrations', d:'Comparer sa région aux moyennes nationales.' },
];

function LandingNav({ go }) {
  return (
    <div className="ln-nav">
      <div className="ln-nav-in">
        <BrandLogo size={26} />
        <div className="ln-links">
          <a href="#features">Modules</a><a href="#sources">Sources</a><a href="#pos">Positionnement</a><a href="#users">Pour qui</a>
        </div>
        <div className="ln-nav-cta">
          <Button variant="ghost" size="sm" onClick={() => go('login')}>Se connecter</Button>
          <Button variant="primary" size="sm" onClick={() => go('signup')}>Créer un compte</Button>
        </div>
      </div>
    </div>
  );
}

function HeroVisual({ height = 360 }) {
  const { FranceMap, Badge } = window.FranceMonitorDesignSystem_5343d8;
  return (
    <div className="ln-herovis">
      <div className="ln-hv-top">
        <span className="ln-hv-lbl">Indicateur · Densité de PME</span>
        <Badge tone="blue" dot>Officiel</Badge>
      </div>
      <FranceMap values={VALUES_LAND} selected="11" height={height} />
    </div>
  );
}

function Hero({ variant, go }) {
  const eyebrow = <span className="ln-pill"><Icon n="circle-check-big" s={14} /> Données publiques · 100 % officielles</span>;
  const title = <h1 className="ln-h1">Le terminal des données <span className="accent">publiques françaises</span>.</h1>;
  const lead = <p className="ln-lead">France Monitor centralise, structure et visualise en temps réel les données officielles de la France — pour comprendre l'état du pays en un coup d'œil.</p>;
  const ctas = (
    <div className="ln-hero-cta">
      <Button variant="primary" size="lg" icon={<Icon n="arrow-right" />} onClick={() => go('signup')}>Créer un compte</Button>
      <Button variant="secondary" size="lg" icon={<Icon n="play" />} onClick={() => go('login')}>Voir une démo</Button>
    </div>
  );
  const nots = (
    <div className="ln-nots">
      <span className="ln-not"><Icon n="check" s={15} /> Sources tracées</span>
      <span className="ln-not"><Icon n="check" s={15} /> Temps réel</span>
      <span className="ln-not"><Icon n="check" s={15} /> France entière</span>
    </div>
  );

  if (variant === 'centered') {
    return (
      <div className="ln-hero-centered">
        {eyebrow}{title}{lead}{ctas}{nots}
        <div className="ln-hero-centered-vis"><HeroVisual height={420} /></div>
      </div>
    );
  }
  if (variant === 'dark') {
    return (
      <div className="ln-hero-dark">
        <div className="ln-hero-dark-grid">
          <div>
            <span className="ln-pill dark"><Icon n="circle-check-big" s={14} /> Données publiques · 100 % officielles</span>
            <h1 className="ln-h1 ondark">Le terminal des données <span className="accent-light">publiques françaises</span>.</h1>
            <p className="ln-lead ondark">France Monitor centralise, structure et visualise en temps réel les données officielles de la France.</p>
            {ctas}
            <div className="ln-nots ondark">
              <span className="ln-not ondark"><Icon n="check" s={15} /> Sources tracées</span>
              <span className="ln-not ondark"><Icon n="check" s={15} /> Temps réel</span>
              <span className="ln-not ondark"><Icon n="check" s={15} /> France entière</span>
            </div>
          </div>
          <HeroVisual height={360} />
        </div>
      </div>
    );
  }
  // split (default)
  return (
    <div className="ln-hero">
      <div>{eyebrow}{title}{lead}{ctas}{nots}</div>
      <HeroVisual height={360} />
    </div>
  );
}

function Landing({ heroVariant, go }) {
  return (
    <div className="landing">
      <LandingNav go={go} />
      <div className="ln-wrap">
        <Hero variant={heroVariant} go={go} />

        <div className="ln-sources" id="sources">
          <div className="ln-src-h">Des sources exclusivement officielles</div>
          <div className="ln-src-row">{SOURCES_LAND.map(s => <span className="ln-src" key={s}>{s}</span>)}</div>
        </div>

        <div className="ln-section" id="features">
          <div className="ln-eyebrow">Pourquoi France Monitor</div>
          <h2 className="ln-sec-title">La fiabilité au cœur du produit</h2>
          <p className="ln-sec-sub">Un terminal de données décisionnelles qui combine un terminal Bloomberg, une plateforme géospatiale et un moteur de données publiques.</p>
          <div className="ln-feat">
            {FEATURES_LAND.map(f => (
              <div className="ln-fcard" key={f.t}>
                <div className="ln-ficon"><Icon n={f.icon} s={20} /></div>
                <div className="ln-ftitle">{f.t}</div>
                <div className="ln-ftext">{f.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ln-section" id="pos" style={{ paddingTop: 0 }}>
          <div className="ln-eyebrow">Positionnement</div>
          <h2 className="ln-sec-title">Ce que France Monitor n'est pas</h2>
          <div className="ln-pos">
            <div className="ln-poscard no"><div className="ln-pos-k">✗ PAS UN MÉDIA</div><div className="ln-pos-t">Ni un média</div><div className="ln-pos-d">Aucune ligne éditoriale, aucune opinion. Seulement des données structurées.</div></div>
            <div className="ln-poscard no"><div className="ln-pos-k">✗ PAS DE L'ACTUALITÉ</div><div className="ln-pos-t">Ni un site d'actualité</div><div className="ln-pos-d">Pas de flux d'information, pas de breaking news. Des indicateurs, pas des articles.</div></div>
            <div className="ln-poscard yes"><div className="ln-pos-k">✓ UN TERMINAL</div><div className="ln-pos-t">Un terminal de données décisionnelles</div><div className="ln-pos-d">Explorer et analyser la France à travers ses indicateurs officiels.</div></div>
          </div>
        </div>

        <div className="ln-section" id="users" style={{ paddingTop: 0 }}>
          <div className="ln-eyebrow">Pour qui</div>
          <h2 className="ln-sec-title">Conçu pour les décideurs</h2>
          <div className="ln-users">
            {USERS_LAND.map(u => (
              <div className="ln-ucard" key={u.n}>
                <span className="ln-uicon"><Icon n={u.icon} s={22} /></span>
                <div className="ln-uname">{u.n}</div>
                <div className="ln-udesc">{u.d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ln-cta">
          <div className="ln-cta-t">Comprendre la France,<br />indicateur par indicateur.</div>
          <p className="ln-cta-s">Créez un compte et explorez les données publiques françaises en temps réel.</p>
          <div className="ln-cta-b">
            <Button variant="primary" size="lg" icon={<Icon n="arrow-right" />} onClick={() => go('signup')}>Créer un compte</Button>
            <Button size="lg" style={{ background:'transparent', color:'#fff', border:'1px solid var(--gray-700)' }} onClick={() => go('login')}>Se connecter</Button>
          </div>
        </div>

        <div className="ln-foot">
          <BrandLogo size={22} />
          <span className="ln-meta">© 2026 France Monitor · Données publiques officielles · Licence Ouverte</span>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Landing });
