// landing.jsx — marketing landing page (dark theme)
const { Button } = window.FranceMonitorDesignSystem_5343d8;

const VALUES_LAND = { '11':92,'84':74,'93':68,'76':61,'75':55,'44':58,'32':47,'52':42,'28':39,'53':35,'24':33,'27':29,'94':22 };
const SOURCES_LAND = ['INSEE','Banque de France','data.gouv.fr','DGFiP','Assemblée nationale','Sénat','Ministère de l\'Intérieur','Ministère de l\'Économie'];

const FEATURES_LAND = [
  { icon:'map', t:'Carte interactive', d:"Explorez la France région par région. Couches activables, choroplèthes dynamiques, zoom département." },
  { icon:'shield-check', t:'Sources officielles', d:"INSEE, Banque de France, ministères, data.gouv.fr. Aucune donnée non vérifiée." },
  { icon:'git-branch', t:'Traçabilité totale', d:"Chaque indicateur documente son origine jusqu'au producteur, avec date de référence." },
  { icon:'trending-up', t:'Indicateurs macro', d:"PIB, inflation, dette, emploi, balance commerciale — suivis en continu." },
  { icon:'download', t:'Export structuré', d:"CSV et PDF avec métadonnées sources incluses. Prêt pour vos présentations." },
  { icon:'bell', t:'Alertes personnalisées', d:"Notification dès qu'un indicateur franchit un seuil que vous définissez." },
];

const USERS_LAND = [
  { icon:'line-chart', n:'Analystes & investisseurs', d:'Suivre les indicateurs macro et territoriaux en temps réel.' },
  { icon:'newspaper', n:'Journalistes', d:'Sourcer des chiffres fiables et tracés en quelques secondes.' },
  { icon:'briefcase', n:'Cabinets de conseil', d:'Cartographier un territoire pour une mission stratégique.' },
  { icon:'landmark', n:'Collectivités & administrations', d:'Comparer sa région aux moyennes nationales.' },
];

const STATS_LAND = [
  { n:'100+', label:'Indicateurs', sub:'macro, territoriaux, sectoriels' },
  { n:'8', label:'Sources officielles', sub:'toutes tracées et vérifiées' },
  { n:'96', label:'Territoires', sub:'départements et régions couverts' },
  { n:'10 ans', label:'Historique', sub:'de recul sur chaque indicateur' },
];

const TESTIMONIALS_LAND = [
  { q:"NomosLab m'a économisé des heures de sourcing par semaine. Je cite les chiffres directement avec la source officielle — aucune double vérification manuelle.", name:"Claire Fontaine", role:"Journaliste économique", org:"Le Monde", init:"CF" },
  { q:"Pour nos missions de conseil territorial, c'est devenu le premier réflexe. La profondeur des données départementales et la carte interactive sont vraiment différenciantes.", name:"Thomas Renard", role:"Directeur associé", org:"Roland Berger", init:"TR" },
  { q:"En tant qu'analyste macro, la traçabilité est non-négociable. NomosLab est le seul outil qui documente chaque donnée jusqu'à l'organisme producteur original.", name:"Sophie Lecomte", role:"Analyste senior", org:"Société Générale CIB", init:"SL" },
];

const PRICING_LAND = [
  {
    name:"Découverte", price:"Gratuit", period:"", sub:"Pour explorer le terminal", highlight:false, badge:null, ctaVariant:"secondary", cta:"Créer un compte",
    features:["5 indicateurs au choix","Carte interactive nationale","Sources officielles liées","Mise à jour mensuelle"],
  },
  {
    name:"Analyste", price:"29€", period:"/mois", sub:"Pour les professionnels", highlight:true, badge:"Le plus populaire", ctaVariant:"primary", cta:"Commencer — 14 jours gratuits",
    features:["Tous les indicateurs disponibles","Carte interactive complète","Export CSV & PDF avec sources","Alertes par e-mail","Historique sur 10 ans","Mise à jour en temps réel"],
  },
  {
    name:"Institution", price:"Sur devis", period:"", sub:"Pour les équipes & organismes", highlight:false, badge:null, ctaVariant:"secondary", cta:"Nous contacter",
    features:["Tout le plan Analyste","Multi-utilisateurs illimités","API REST documentée","SSO / SAML","Support prioritaire dédié","SLA garanti 99,9 %"],
  },
];

const FAQ_LAND = [
  { q:"D'où proviennent les données ?", a:"Exclusivement de sources officielles françaises : INSEE, Banque de France, DGFiP, data.gouv.fr, Assemblée nationale, Sénat et ministères. Chaque indicateur affiche sa source et sa date de référence, vérifiable jusqu'au producteur original." },
  { q:"Les données sont-elles mises à jour en temps réel ?", a:"La fréquence dépend de l'indicateur. Certaines données (taux, marchés obligataires) sont quotidiennes, d'autres trimestrielles ou annuelles — comme les publie leur organisme producteur. La date de dernière mise à jour est toujours visible." },
  { q:"Puis-je exporter les données pour mes analyses ?", a:"Oui, à partir du plan Analyste. Chaque indicateur peut être exporté en CSV ou PDF, avec les métadonnées et références sources incluses pour garantir la traçabilité." },
  { q:"NomosLab est-il adapté aux administrations publiques ?", a:"Oui. Le plan Institution inclut SSO/SAML, accès multi-utilisateurs et une API REST documentée. Nous accompagnons déjà plusieurs collectivités territoriales et organismes publics." },
  { q:"Y a-t-il un engagement minimum ?", a:"Non. Le plan Analyste est mensuel, sans engagement, résiliable à tout moment. Le plan Institution est sur devis annuel, avec une période d'essai négociable selon vos besoins." },
];

const STEPS_LAND = [
  { n:'01', t:'Choisissez un territoire', d:"Cliquez sur la carte ou recherchez un département, une région ou la France entière." },
  { n:'02', t:'Sélectionnez vos indicateurs', d:"PIB, emploi, démographie, énergie — plus de 100 indicateurs officiels disponibles." },
  { n:'03', t:'Analysez et exportez', d:"Comparez, créez des alertes, exportez avec les sources en un clic." },
];

function useReveal() {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); obs.disconnect(); }
    }, { threshold: 0.08 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function AnimCounter({ target, inView }) {
  const [display, setDisplay] = React.useState('0');
  React.useEffect(() => {
    if (!inView) return;
    const raw = target.replace(/[^0-9]/g, '');
    if (!raw) { setDisplay(target); return; }
    const num = parseInt(raw, 10);
    const suffix = target.replace(/[0-9]/g, '');
    let start = null;
    const dur = 1400;
    const raf = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * num) + suffix);
      if (p < 1) requestAnimationFrame(raf);
      else setDisplay(target);
    };
    requestAnimationFrame(raf);
  }, [inView, target]);
  return display;
}

function LandingNav({ go }) {
  return (
    <div className="ln-nav">
      <div className="ln-nav-in">
        <BrandLogo size={26} mono />
        <div className="ln-links">
          <a href="#features">Modules</a>
          <a href="#sources">Sources</a>
          <a href="#pricing">Tarifs</a>
          <a href="#users">Pour qui</a>
        </div>
        <div className="ln-nav-cta">
          <button onClick={() => go('login')} style={{ background:'none',border:'none',cursor:'pointer',fontFamily:'var(--font-sans)',fontSize:14,fontWeight:600,color:'rgba(255,255,255,.65)',padding:'8px 14px',borderRadius:'var(--radius-md)',transition:'color .18s' }}
            onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>
            Se connecter
          </button>
          <Button variant="primary" size="sm" onClick={() => go('signup')}>Créer un compte</Button>
        </div>
      </div>
    </div>
  );
}

function HeroVisual({ height = 360 }) {
  const { FranceMap, Badge } = window.FranceMonitorDesignSystem_5343d8;
  return (
    <div className="ln-herovis-wrap">
      <div className="ln-herovis">
        <div className="ln-hv-top">
          <span className="ln-hv-lbl">Indicateur · Densité de PME</span>
          <Badge tone="blue" dot>Officiel</Badge>
        </div>
        <FranceMap values={VALUES_LAND} selected="11" height={height} />
      </div>
      <div className="ln-float-badge f1">
        <span className="ln-fbdot pos" />PIB 2024 · <strong>+1.4 %</strong>
      </div>
      <div className="ln-float-badge f2">
        <span className="ln-fbdot neg" />Chômage · <strong>7.3 %</strong>
      </div>
    </div>
  );
}

function Hero({ go }) {
  return (
    <div className="ln-hero-wrap">
      <div className="ln-hero-blobs">
        <div className="ln-blob b1" />
        <div className="ln-blob b2" />
        <div className="ln-blob b3" />
      </div>
      <div className="ln-hero">
        <div>
          <span className="ln-pill">
            <Icon n="circle-check-big" s={14} />
            Données publiques · 100 % officielles
          </span>
          <h1 className="ln-h1">Le terminal des données <span style={{color:'#fff'}}>publiques </span><span style={{WebkitTextFillColor:'initial',backgroundImage:'none'}}><span style={{color:'#4F8EF7'}}>fran</span><span style={{color:'#fff'}}>çai</span><span style={{color:'#E1000F'}}>ses</span></span>.</h1>
          <p className="ln-lead">NomosLab centralise, structure et visualise en temps réel les données officielles de la France — pour comprendre l'état du pays en un coup d'œil.</p>
          <div className="ln-hero-cta">
            <Button variant="primary" size="lg" icon={<Icon n="arrow-right" />} onClick={() => go('signup')}>Créer un compte</Button>
            <button onClick={() => go('login')} style={{ display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,.07)',color:'#fff',border:'1px solid rgba(255,255,255,.14)',borderRadius:'var(--radius-md)',padding:'10px 20px',fontFamily:'var(--font-sans)',fontSize:15,fontWeight:600,cursor:'pointer',transition:'background .2s,border-color .2s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,.12)';e.currentTarget.style.borderColor='rgba(255,255,255,.25)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,.07)';e.currentTarget.style.borderColor='rgba(255,255,255,.14)'}}>
              <Icon n="play" s={16} /> Voir une démo
            </button>
          </div>
          <div className="ln-nots">
            <span className="ln-not"><Icon n="check" s={15} /> Sources tracées</span>
            <span className="ln-not"><Icon n="check" s={15} /> Temps réel</span>
            <span className="ln-not"><Icon n="check" s={15} /> France entière</span>
          </div>
        </div>
        <HeroVisual height={360} />
      </div>
    </div>
  );
}

function SourcesMarquee() {
  const doubled = [...SOURCES_LAND, ...SOURCES_LAND];
  return (
    <div className="ln-sources" id="sources">
      <div className="ln-src-eyebrow">Sources exclusivement officielles</div>
      <div className="ln-marquee-wrap">
        <div className="ln-marquee" aria-hidden="true">
          {doubled.map((s, i) => (
            <span className="ln-src" key={i}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatBar() {
  const [ref, inView] = useReveal();
  return (
    <div ref={ref} className="ln-stats">
      {STATS_LAND.map((s, i) => (
        <div key={s.label} className={`ln-stat reveal${inView ? ' in-view' : ''}`} style={{'--i': i}}>
          <div className="ln-stat-n"><AnimCounter target={s.n} inView={inView} /></div>
          <div className="ln-stat-l">{s.label}</div>
          <div className="ln-stat-s">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function SectionFeatures() {
  const [ref, inView] = useReveal();
  return (
    <div className="ln-section" id="features" ref={ref}>
      <div className={`reveal${inView ? ' in-view' : ''}`}>
        <div className="ln-eyebrow">Pourquoi NomosLab</div>
        <h2 className="ln-sec-title">La fiabilité au cœur du produit</h2>
        <p className="ln-sec-sub">Un terminal de données décisionnelles qui combine la puissance d'un Bloomberg, la précision d'une plateforme géospatiale et la fiabilité de la donnée publique française.</p>
      </div>
      <div className="ln-feat ln-feat-6">
        {FEATURES_LAND.map((f, i) => (
          <div className={`ln-fcard reveal${inView ? ' in-view' : ''}`} key={f.t} style={{'--i': i + 1}}>
            <div className="ln-ficon"><Icon n={f.icon} s={20} /></div>
            <div className="ln-ftitle">{f.t}</div>
            <div className="ln-ftext">{f.d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionSteps() {
  const [ref, inView] = useReveal();
  return (
    <div className="ln-section" ref={ref}>
      <div className={`reveal${inView ? ' in-view' : ''}`}>
        <div className="ln-eyebrow">Comment ça marche</div>
        <h2 className="ln-sec-title">Opérationnel en trois étapes</h2>
      </div>
      <div className="ln-steps-section" style={{ marginTop: 40 }}>
        <div className="ln-steps">
          {STEPS_LAND.map((s, i) => (
            <div className={`ln-step reveal${inView ? ' in-view' : ''}`} key={s.n} style={{'--i': i + 1}}>
              <div className="ln-step-n">{s.n}</div>
              <div className="ln-step-t">{s.t}</div>
              <div className="ln-step-d">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionTestimonials() {
  const [ref, inView] = useReveal();
  return (
    <div className="ln-section" ref={ref}>
      <div className={`reveal${inView ? ' in-view' : ''}`}>
        <div className="ln-eyebrow">Ce qu'ils en disent</div>
        <h2 className="ln-sec-title">Utilisé par des professionnels exigeants</h2>
      </div>
      <div className="ln-testimonials">
        {TESTIMONIALS_LAND.map((t, i) => (
          <div className={`ln-tcard reveal${inView ? ' in-view' : ''}`} key={t.name} style={{'--i': i + 1}}>
            <span className="ln-tquote-mark">"</span>
            <p className="ln-tquote">{t.q}</p>
            <div className="ln-tauthor">
              <div className="ln-tavatar">{t.init}</div>
              <div>
                <div className="ln-tname">{t.name}</div>
                <div className="ln-trole">{t.role} · <span className="ln-torg">{t.org}</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionPricing({ go }) {
  const [ref, inView] = useReveal();
  return (
    <div className="ln-section" id="pricing" ref={ref}>
      <div className={`reveal${inView ? ' in-view' : ''}`}>
        <div className="ln-eyebrow">Tarification</div>
        <h2 className="ln-sec-title">Simple et transparent</h2>
        <p className="ln-sec-sub">Commencez gratuitement, évoluez selon vos besoins. Aucun engagement, résiliable à tout moment.</p>
      </div>
      <div className="ln-pricing">
        {PRICING_LAND.map((p, i) => (
          <div className={`ln-pcard${p.highlight ? ' featured' : ''} reveal${inView ? ' in-view' : ''}`} key={p.name} style={{'--i': i + 1}}>
            {p.badge && <div className="ln-pbadge">{p.badge}</div>}
            <div className="ln-pname">{p.name}</div>
            <div className="ln-psub">{p.sub}</div>
            <div className="ln-pprice">
              <span className="ln-pprice-n">{p.price}</span>
              {p.period && <span className="ln-pprice-per">{p.period}</span>}
            </div>
            <ul className="ln-pfeatures">
              {p.features.map(f => (
                <li key={f}>
                  <span className="ln-pcheck"><Icon n="check" s={14} /></span>
                  {f}
                </li>
              ))}
            </ul>
            <div className="ln-pmt">
              <Button variant={p.ctaVariant} size="lg" fullWidth onClick={() => go('signup')}>{p.cta}</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionFAQ() {
  const [open, setOpen] = React.useState(null);
  const [ref, inView] = useReveal();
  return (
    <div className="ln-section" ref={ref}>
      <div className={`reveal${inView ? ' in-view' : ''}`}>
        <div className="ln-eyebrow">Questions fréquentes</div>
        <h2 className="ln-sec-title">Tout ce que vous devez savoir</h2>
      </div>
      <div className="ln-faq">
        {FAQ_LAND.map((item, i) => (
          <div className={`ln-faq-item reveal${inView ? ' in-view' : ''}`} key={i} style={{'--i': i + 1}}>
            <button className={`ln-faq-q${open === i ? ' open' : ''}`} onClick={() => setOpen(open === i ? null : i)}>
              {item.q}
              <span className="ln-faq-icon"><Icon n="plus" s={17} /></span>
            </button>
            {open === i && <div className="ln-faq-a">{item.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Landing({ heroVariant: _heroVariant, go }) {
  React.useEffect(() => {
    const glow = document.querySelector('.ln-cursor-glow');
    if (!glow) return;
    const h = (e) => { glow.style.transform = `translate(${e.clientX - 350}px,${e.clientY - 350}px)`; };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);

  return (
    <div className="landing">
      <div className="ln-cursor-glow" aria-hidden="true" />
      <LandingNav go={go} />
      <div className="ln-wrap">
        <Hero go={go} />
        <SourcesMarquee />
        <StatBar />

        <SectionFeatures />

        <div className="ln-section" id="pos" style={{ paddingTop: 0 }}>
          <div className="ln-eyebrow">Positionnement</div>
          <h2 className="ln-sec-title">Ce que NomosLab n'est pas</h2>
          <div className="ln-pos">
            <div className="ln-poscard no"><div className="ln-pos-k">✗ PAS UN MÉDIA</div><div className="ln-pos-t">Ni un média</div><div className="ln-pos-d">Aucune ligne éditoriale, aucune opinion. Seulement des données structurées.</div></div>
            <div className="ln-poscard no"><div className="ln-pos-k">✗ PAS DE L'ACTUALITÉ</div><div className="ln-pos-t">Ni un site d'actualité</div><div className="ln-pos-d">Pas de flux d'information, pas de breaking news. Des indicateurs, pas des articles.</div></div>
            <div className="ln-poscard yes"><div className="ln-pos-k">✓ UN TERMINAL</div><div className="ln-pos-t">Un terminal de données décisionnelles</div><div className="ln-pos-d">Explorer et analyser la France à travers ses indicateurs officiels.</div></div>
          </div>
        </div>

        <SectionSteps />
        <SectionTestimonials />
        <SectionPricing go={go} />
        <SectionFAQ />

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
            <button onClick={() => go('login')} style={{ background:'rgba(255,255,255,.08)',color:'#fff',border:'1px solid rgba(255,255,255,.18)',borderRadius:'var(--radius-md)',padding:'10px 22px',fontFamily:'var(--font-sans)',fontSize:15,fontWeight:600,cursor:'pointer',transition:'background .2s' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.14)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.08)'}>
              Se connecter
            </button>
          </div>
        </div>

        <div className="ln-foot">
          <BrandLogo size={22} mono />
          <div className="ln-foot-links">
            <a href="#features">Modules</a>
            <a href="#pricing">Tarifs</a>
            <a href="#sources">Sources</a>
            <a href="#users">Pour qui</a>
          </div>
          <span className="ln-meta">© 2026 NomosLab · Données publiques officielles · Licence Ouverte</span>
        </div>
      </div>
    </div>
  );
}
