// dashboard.jsx — terminal (map + panel) and modules-grid variants
const DASH_MODULES = [
  { id:'dette', label:'Dette publique', icon:'landmark' },
  { id:'inflation', label:'Inflation', icon:'trending-up' },
  { id:'emploi', label:'Emploi', icon:'briefcase' },
  { id:'budget', label:"Budget de l'État", icon:'banknote' },
  { id:'energie', label:'Énergie', icon:'zap' },
  { id:'demographie', label:'Démographie', icon:'users' },
  { id:'sante', label:'Santé', icon:'activity' },
  { id:'logement', label:'Logement', icon:'house' },
  { id:'entreprises', label:'Entreprises', icon:'building-2' },
  { id:'securite', label:'Sécurité', icon:'shield' },
  { id:'education', label:'Éducation', icon:'graduation-cap' },
  { id:'transport', label:'Transport', icon:'train-front' },
];
const DASH_VALUES = { '11':108,'84':92,'93':99,'76':104,'75':112,'44':101,'32':115,'52':95,'28':97,'53':90,'24':88,'27':100,'94':86 };
const DASH_POP = { '11':'12,3 M','84':'8,0 M','93':'5,1 M','76':'6,0 M','75':'5,9 M','44':'3,8 M','32':'5,7 M','52':'3,3 M','28':'2,6 M','53':'3,3 M','24':'2,4 M','27':'2,8 M','94':'0,34 M' };

function DashSidebar({ active, onSelect }) {
  return (
    <aside className="db-side">
      <div className="db-brand"><BrandLogo size={24} /></div>
      <div className="db-side-scroll">
        <div className="db-side-cat">Modules</div>
        {DASH_MODULES.map(m => (
          <button key={m.id} className={'db-mod' + (m.id === active ? ' on' : '')} onClick={() => onSelect(m.id)}>
            <Icon n={m.icon} s={17} />{m.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

function DashTopBar({ go }) {
  const { SearchField, IconButton, Avatar } = window.FranceMonitorDesignSystem_5343d8;
  const [menu, setMenu] = React.useState(false);
  return (
    <div className="db-top">
      <div className="db-search"><SearchField shortcut="⌘K" /></div>
      <div className="db-spacer" />
      <div className="db-actions">
        <IconButton label="Aide"><Icon n="circle-help" s={18} /></IconButton>
        <span className="db-dot"><IconButton label="Notifications"><Icon n="bell" s={18} /></IconButton></span>
        <IconButton label="Paramètres"><Icon n="settings" s={18} /></IconButton>
        <span className="db-div" />
        <div style={{ position: 'relative' }}>
          <button className="db-avatar-btn" onClick={() => setMenu(m => !m)}><Avatar initials="ML" tone="blue" /></button>
          {menu && (
            <>
              <div className="db-menu-scrim" onClick={() => setMenu(false)} />
              <div className="db-menu">
                <div className="db-menu-head"><Avatar initials="ML" tone="blue" /><div><div className="db-menu-nm">Marie Lefèvre</div><div className="db-menu-em">marie@organisation.fr</div></div></div>
                <button className="db-menu-item"><Icon n="user" s={16} /> Profil</button>
                <button className="db-menu-item"><Icon n="settings" s={16} /> Paramètres</button>
                <div className="db-menu-sep" />
                <button className="db-menu-item danger" onClick={() => go('landing')}><Icon n="log-out" s={16} /> Se déconnecter</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Terminal variant: map + right panel ----
function TerminalView({ module }) {
  const { FranceMap, FRANCE_REGIONS, StatTile, Badge, SourceTag, DataTable, Toggle } = window.FranceMonitorDesignSystem_5343d8;
  const [sel, setSel] = React.useState('11');
  const [layerReg, setLayerReg] = React.useState(true);
  const [layerPoi, setLayerPoi] = React.useState(true);
  const mod = DASH_MODULES.find(m => m.id === module) || DASH_MODULES[0];
  const reg = FRANCE_REGIONS.find(r => r.code === sel);
  const v = DASH_VALUES[sel] ?? 100;
  const points = layerPoi ? [
    { x: 612, y: 232, label: 'Paris', tone: 'var(--blue-france)' },
    { x: 612, y: 690, label: 'Marseille', tone: 'var(--blue-france)' },
    { x: 470, y: 560, label: 'Lyon', tone: 'var(--blue-france)' },
  ] : [];
  const tableRows = FRANCE_REGIONS.map(r => ({ region: r.nom, code: r.code, ratio: DASH_VALUES[r.code] ?? 100 })).sort((a, b) => b.ratio - a.ratio).slice(0, 6);

  return (
    <div className="db-stage">
      <div className="db-mapwrap">
        <div className="db-map-head">
          <div>
            <div className="db-map-title">{mod.label}</div>
            <div className="db-map-sub">Ratio dette / PIB par région · en % · France métropolitaine</div>
          </div>
          <Badge tone="blue" dot>Officiel · INSEE</Badge>
        </div>
        <div className="db-map-card">
          <FranceMap className="fmap" values={layerReg ? DASH_VALUES : null} selected={sel} onSelect={setSel} points={points} />
          <div className="db-layers">
            <span className="db-lh">Couches</span>
            <Toggle checked={layerReg} onChange={setLayerReg} label="Données régionales" />
            <Toggle checked={layerPoi} onChange={setLayerPoi} label="Points d'intérêt" />
          </div>
          <div className="db-legend">
            <div className="db-lh">Ratio dette / PIB</div>
            <div className="db-ramp">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} style={{ background:`var(--seq-${i})` }} />)}
            </div>
            <div className="db-ax"><span>86 %</span><span>115 %</span></div>
          </div>
        </div>
      </div>

      <div className="db-panel">
        <div className="db-panel-head">
          <div className="db-panel-nm">{reg ? reg.nom : '—'}</div>
          <div className="db-panel-meta">
            <span>Région · code {sel}</span><span>Pop. {DASH_POP[sel] || '—'}</span>
          </div>
        </div>
        <div className="db-panel-body">
          <span className="db-blk-lbl">Indicateurs clés</span>
          <div className="db-tile-row">
            <StatTile label="Dette / PIB" value={String(v).replace('.', ',')} unit="%" delta={2.1} series={[v-7,v-5,v-3,v-1,v]} />
            <StatTile label="Chômage" value="7,4" unit="%" delta={-0.2} series={[7.9,7.8,7.6,7.5,7.4]} />
            <StatTile label="Inflation" value="2,3" unit="%" delta={-0.4} series={[5.1,4.6,3.8,3.1,2.3]} />
            <StatTile label="Entreprises" value="312" unit="k" delta={1.6} series={[300,303,307,309,312]} />
          </div>
          <span className="db-blk-lbl" style={{ marginTop: 4 }}>Classement régional</span>
          <div className="db-table">
            <DataTable dense onRowClick={(row) => setSel(row.code)}
              columns={[
                { key:'region', header:'Région', strong:true },
                { key:'ratio', header:'Dette/PIB', align:'right', mono:true, render:(x) => x + ' %' },
              ]}
              rows={tableRows} />
          </div>
          <span className="db-blk-lbl" style={{ marginTop: 4 }}>Sources</span>
          <div className="db-sources">
            <SourceTag source="INSEE" date="T3 2024" /><SourceTag source="DGFiP" /><SourceTag source="Banque de France" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Modules variant: KPI overview grid ----
const KPI_CARDS = [
  { icon:'landmark', label:'Dette publique', value:'3 228', unit:'Md€', delta:2.1, series:[2950,3020,3100,3180,3228], src:'INSEE', date:'T3 2024' },
  { icon:'trending-up', label:'Inflation (IPC)', value:'2,3', unit:'%', delta:-0.4, series:[5.1,4.6,3.8,3.1,2.3], src:'INSEE', date:'Mai 2026' },
  { icon:'briefcase', label:'Taux de chômage', value:'7,4', unit:'%', delta:-0.2, series:[7.9,7.8,7.6,7.5,7.4], src:'INSEE', date:'T1 2026' },
  { icon:'banknote', label:"Déficit public", value:'-5,5', unit:'%', delta:-0.6, series:[-4.8,-4.9,-5.1,-5.3,-5.5], src:'INSEE', date:'2025' },
  { icon:'zap', label:'Production électrique', value:'521', unit:'TWh', delta:3.4, series:[480,495,505,512,521], src:'RTE', date:'2025' },
  { icon:'building-2', label:'Créations d\'entreprises', value:'1,05', unit:'M', delta:1.8, series:[0.98,1.00,1.02,1.03,1.05], src:'INSEE', date:'2025' },
];

function ModulesView({ onOpenModule }) {
  const { StatTile, FranceMap, Badge, TrendBar, SourceTag, Alert } = window.FranceMonitorDesignSystem_5343d8;
  return (
    <div className="db-modules">
      <div className="db-mod-head">
        <div>
          <div className="db-mod-eyebrow">Vue d'ensemble</div>
          <h1 className="db-mod-title">Tableau de bord national</h1>
          <p className="db-mod-sub">Les indicateurs clés de la France, agrégés depuis les sources publiques officielles.</p>
        </div>
        <Badge tone="blue" dot>Mise à jour il y a 4 min</Badge>
      </div>

      <div className="db-kpi-grid">
        {KPI_CARDS.map(c => (
          <button key={c.label} className="db-kpi-card" onClick={() => onOpenModule && onOpenModule()}>
            <div className="db-kpi-top"><span className="db-kpi-ico"><Icon n={c.icon} s={18} /></span><Icon n="arrow-up-right" s={16} color="var(--text-tertiary)" /></div>
            <StatTile label={c.label} value={c.value} unit={c.unit} delta={c.delta} series={c.series} source={c.src} sourceDate={c.date} />
          </button>
        ))}
      </div>

      <div className="db-mod-lower">
        <div className="db-mod-mapcard">
          <div className="db-mod-card-h"><span className="db-mod-card-t">Densité économique par région</span><Badge tone="blue" dot>Officiel</Badge></div>
          <div className="db-mod-map"><FranceMap values={DASH_VALUES} selected="11" height={340} onSelect={() => {}} /></div>
        </div>
        <div className="db-mod-rank">
          <div className="db-mod-card-h"><span className="db-mod-card-t">Dette par région</span><SourceTag source="INSEE" date="2024" /></div>
          <div className="db-mod-rank-body">
            <TrendBar label="Île-de-France" value={765} max={765} display="765 Md€" />
            <TrendBar label="Auvergne-Rhône-Alpes" value={285} max={765} display="285 Md€" tone="var(--viz-2)" />
            <TrendBar label="Nouvelle-Aquitaine" value={185} max={765} display="185 Md€" tone="var(--viz-3)" />
            <TrendBar label="Occitanie" value={178} max={765} display="178 Md€" tone="var(--viz-4)" />
            <TrendBar label="Hauts-de-France" value={165} max={765} display="165 Md€" tone="var(--viz-6)" />
            <Alert kind="warning" title="Donnée provisoire">Le dernier trimestre est une estimation INSEE, susceptible d'être révisée.</Alert>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ variant, go }) {
  const [module, setModule] = React.useState('dette');
  return (
    <div className="db-app">
      <DashSidebar active={module} onSelect={setModule} />
      <div className="db-main">
        <DashTopBar go={go} />
        {variant === 'modules'
          ? <div className="db-scroll"><ModulesView onOpenModule={() => setModule('dette')} /></div>
          : <TerminalView module={module} />}
      </div>
    </div>
  );
}

Object.assign(window, { Dashboard });
