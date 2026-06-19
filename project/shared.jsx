// shared.jsx — icon helper, brand, SSO buttons, auth brand panel
const DS_PATH = "_ds/france-monitor-design-system-5343d891-f851-445f-bff1-b34c09b537a9";

// Lucide icon — renders an <i data-lucide> then upgrades it.
function Icon({ n, s = 18, color, style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = "";
      const el = document.createElement("i");
      el.setAttribute("data-lucide", n);
      ref.current.appendChild(el);
      window.lucide.createIcons({ attrs: { width: s, height: s } });
    }
  }, [n, s]);
  return <span ref={ref} style={{ display: "inline-flex", color, ...style }} />;
}

function BrandLogo({ size = 26, mono = false }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
      <img src="assets/logo-mark.svg" width={size} height={size} alt=""
           style={mono ? { filter: "brightness(0) invert(1)" } : undefined} />
      <span style={{ fontFamily: "var(--font-sans)", fontSize: Math.round(size * 0.62), fontWeight: 700,
                     color: mono ? "#fff" : "var(--ink)", letterSpacing: "-0.01em" }}>
        France<span style={{ fontWeight: 500, color: mono ? "var(--blue-200)" : "var(--gray-500)" }}> Monitor</span>
      </span>
    </div>
  );
}

// ---- SSO provider glyphs (standard brand marks for auth buttons) ----
const GoogleGlyph = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
    <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z"/>
    <path fill="#EA4335" d="M24 9.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 2.99 29.93 1 24 1 15.4 1 7.96 5.93 4.34 13.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
  </svg>
);
const AppleGlyph = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
    <path d="M16.37 12.78c.02 2.5 2.19 3.33 2.21 3.34-.02.06-.35 1.19-1.15 2.36-.69 1.01-1.41 2.02-2.54 2.04-1.11.02-1.47-.66-2.74-.66-1.27 0-1.66.64-2.71.68-1.09.04-1.92-1.09-2.62-2.1-1.42-2.06-2.51-5.83-1.05-8.37.72-1.27 2.02-2.07 3.42-2.09 1.07-.02 2.08.72 2.74.72.66 0 1.89-.89 3.18-.76.54.02 2.06.22 3.03 1.64-.08.05-1.81 1.06-1.8 3.16M14.28 4.94c.58-.71.98-1.69.87-2.67-.84.03-1.86.56-2.47 1.26-.54.62-1.02 1.62-.89 2.58.94.07 1.9-.47 2.49-1.17"/>
  </svg>
);
const MicrosoftGlyph = () => (
  <svg width="16" height="16" viewBox="0 0 23 23" aria-hidden="true">
    <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
    <rect x="12" y="1" width="10" height="10" fill="#7FBA00"/>
    <rect x="1" y="12" width="10" height="10" fill="#00A4EF"/>
    <rect x="12" y="12" width="10" height="10" fill="#FFB900"/>
  </svg>
);

function SSOButton({ glyph, label, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        width: "100%", height: 44, borderRadius: "var(--radius-md)", cursor: "pointer",
        fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "var(--text)",
        background: hover ? "var(--surface-hover)" : "var(--surface)",
        border: "1px solid var(--border-strong)",
        transition: "background var(--dur-fast)",
      }}>
      <span style={{ display: "inline-flex", width: 18, height: 18, alignItems: "center", justifyContent: "center" }}>{glyph}</span>
      {label}
    </button>
  );
}

// Right-hand brand panel for auth screens — deep Bleu France with a faint map.
function AuthBrandPanel({ values }) {
  const NS = window.FranceMonitorDesignSystem_5343d8;
  const { FranceMap } = NS;
  return (
    <div style={{
      position: "relative", overflow: "hidden",
      background: "var(--blue-france)", color: "#fff",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "44px 44px 40px",
    }}>
      <div style={{ position: "relative", zIndex: 2 }}>
        <BrandLogo size={30} mono />
      </div>

      <div style={{
        position: "absolute", right: "-12%", top: "50%", transform: "translateY(-50%)",
        width: "115%", opacity: 0.16, zIndex: 1, pointerEvents: "none",
        filter: "brightness(0) invert(1)",
      }}>
        <FranceMap values={values} height={520} />
      </div>

      <div style={{ position: "relative", zIndex: 2, maxWidth: 380 }}>
        <div style={{ fontFamily: "var(--font-sans)", fontSize: 30, fontWeight: 700,
                      letterSpacing: "-0.03em", lineHeight: 1.1, textWrap: "balance" }}>
          Le terminal des données publiques françaises.
        </div>
        <p style={{ fontFamily: "var(--font-sans)", fontSize: 15, lineHeight: 1.6,
                    color: "var(--blue-200)", marginTop: 16 }}>
          INSEE, Banque de France, ministères, data.gouv.fr — centralisés, structurés
          et tracés jusqu'à l'organisme producteur.
        </p>
        <div style={{ display: "flex", gap: 18, marginTop: 24 }}>
          {["Sources tracées", "Temps réel", "France entière"].map((t) => (
            <span key={t} style={{ display: "flex", alignItems: "center", gap: 7,
                                   fontFamily: "var(--font-sans)", fontSize: 13, color: "rgba(255,255,255,0.82)" }}>
              <Icon n="check" s={15} color="var(--blue-200)" /> {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Icon, BrandLogo, SSOButton, AuthBrandPanel, GoogleGlyph, AppleGlyph, MicrosoftGlyph, DS_PATH });
