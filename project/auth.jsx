// auth.jsx — signup, login, forgot password, loading & success states
function AuthLayout({ children }) {
  return (
    <div className="auth">
      <div className="auth-form-col">
        <div className="auth-form-top"><BrandLogo size={26} /></div>
        <div className="auth-form-mid">
          <div className="auth-form-inner">{children}</div>
        </div>
        <div className="auth-form-foot">© 2026 France Monitor · Données publiques officielles</div>
      </div>
      <AuthBrandPanel values={{ '11':92,'84':74,'93':68,'76':61,'75':55,'44':58,'32':47,'52':42,'28':39,'53':35,'24':33,'27':29,'94':22 }} />
    </div>
  );
}

function AuthField({ label, type = "text", placeholder, value, onChange, autoFocus, trailing }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <label className="af">
      <span className="af-label">{label}</span>
      <span className="af-box" style={{ borderColor: focus ? "var(--border-focus)" : "var(--border)", boxShadow: focus ? "var(--ring-focus)" : "none" }}>
        <input
          className="af-input" type={type} placeholder={placeholder} value={value} autoFocus={autoFocus}
          onChange={onChange} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} />
        {trailing}
      </span>
    </label>
  );
}

function PasswordField({ label, value, onChange, placeholder = "••••••••", autoFocus }) {
  const [show, setShow] = React.useState(false);
  return (
    <AuthField
      label={label} type={show ? "text" : "password"} placeholder={placeholder}
      value={value} onChange={onChange} autoFocus={autoFocus}
      trailing={
        <button type="button" className="af-eye" onClick={() => setShow(s => !s)} aria-label={show ? "Masquer" : "Afficher"}>
          <Icon n={show ? "eye-off" : "eye"} s={17} />
        </button>
      } />
  );
}

function SSOGroup({ go }) {
  return (
    <div className="sso-group">
      <SSOButton glyph={<GoogleGlyph />} label="Continuer avec Google" onClick={() => go('loading')} />
      <SSOButton glyph={<AppleGlyph />} label="Continuer avec Apple" onClick={() => go('loading')} />
      <SSOButton glyph={<MicrosoftGlyph />} label="Continuer avec Microsoft" onClick={() => go('loading')} />
    </div>
  );
}

function OrDivider({ children = "ou" }) {
  return <div className="auth-or"><span>{children}</span></div>;
}

// ---------------- Login ----------------
function LoginScreen({ go }) {
  const { Button } = window.FranceMonitorDesignSystem_5343d8;
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  return (
    <AuthLayout>
      <div className="auth-eyebrow">Accès terminal</div>
      <h1 className="auth-title">Se connecter</h1>
      <p className="auth-sub">Accédez à votre terminal de données publiques françaises.</p>

      <SSOGroup go={go} />
      <OrDivider>ou avec votre e-mail professionnel</OrDivider>

      <form className="auth-fields" onSubmit={(e) => { e.preventDefault(); go('loading'); }}>
        <AuthField label="E-mail professionnel" type="email" placeholder="prenom@organisation.fr" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <PasswordField label="Mot de passe" value={pw} onChange={(e) => setPw(e.target.value)} />
        <div className="auth-row-between">
          <label className="auth-check"><input type="checkbox" defaultChecked /> Rester connecté</label>
          <button type="button" className="auth-link" onClick={() => go('forgot')}>Mot de passe oublié ?</button>
        </div>
        <Button type="submit" variant="primary" size="lg" fullWidth iconRight={<Icon n="arrow-right" />}>Se connecter</Button>
      </form>

      <div className="auth-switch">Pas encore de compte ? <button className="auth-link strong" onClick={() => go('signup')}>Créer un compte</button></div>
    </AuthLayout>
  );
}

// ---------------- Signup ----------------
function SignupScreen({ go }) {
  const { Button } = window.FranceMonitorDesignSystem_5343d8;
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [pw, setPw] = React.useState("");
  const [agree, setAgree] = React.useState(false);
  return (
    <AuthLayout>
      <div className="auth-eyebrow">Nouveau compte</div>
      <h1 className="auth-title">Créer un compte</h1>
      <p className="auth-sub">Quelques secondes suffisent pour accéder au terminal.</p>

      <SSOGroup go={go} />
      <OrDivider>ou avec votre e-mail professionnel</OrDivider>

      <form className="auth-fields" onSubmit={(e) => { e.preventDefault(); if (agree) go('loading'); }}>
        <AuthField label="Nom complet" placeholder="Marie Lefèvre" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        <AuthField label="E-mail professionnel" type="email" placeholder="prenom@organisation.fr" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PasswordField label="Mot de passe" placeholder="8 caractères minimum" value={pw} onChange={(e) => setPw(e.target.value)} />
        <label className="auth-check terms"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} /> J'accepte les <a className="auth-link" href="#" onClick={(e) => e.preventDefault()}>conditions d'utilisation</a> et la politique de confidentialité.</label>
        <Button type="submit" variant="primary" size="lg" fullWidth disabled={!agree} iconRight={<Icon n="arrow-right" />}>Créer mon compte</Button>
      </form>

      <div className="auth-switch">Déjà un compte ? <button className="auth-link strong" onClick={() => go('login')}>Se connecter</button></div>
    </AuthLayout>
  );
}

// ---------------- Forgot password ----------------
function ForgotScreen({ go }) {
  const { Button } = window.FranceMonitorDesignSystem_5343d8;
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);

  if (sent) {
    return (
      <AuthLayout>
        <div className="auth-confirm-icon"><Icon n="mail-check" s={26} color="var(--accent)" /></div>
        <h1 className="auth-title">Vérifiez votre boîte mail</h1>
        <p className="auth-sub">Si un compte est associé à <strong>{email || "votre adresse"}</strong>, un lien de réinitialisation vient d'être envoyé. Le lien expire dans 30 minutes.</p>
        <div className="auth-fields">
          <Button variant="primary" size="lg" fullWidth onClick={() => go('login')}>Retour à la connexion</Button>
          <button className="auth-link" onClick={() => setSent(false)}>Renvoyer le lien</button>
        </div>
      </AuthLayout>
    );
  }
  return (
    <AuthLayout>
      <button className="auth-back" onClick={() => go('login')}><Icon n="arrow-left" s={16} /> Retour</button>
      <div className="auth-eyebrow">Réinitialisation</div>
      <h1 className="auth-title">Mot de passe oublié</h1>
      <p className="auth-sub">Saisissez votre e-mail professionnel. Nous vous enverrons un lien pour définir un nouveau mot de passe.</p>
      <form className="auth-fields" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
        <AuthField label="E-mail professionnel" type="email" placeholder="prenom@organisation.fr" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
        <Button type="submit" variant="primary" size="lg" fullWidth>Envoyer le lien</Button>
      </form>
      <div className="auth-switch">Vous vous souvenez ? <button className="auth-link strong" onClick={() => go('login')}>Se connecter</button></div>
    </AuthLayout>
  );
}

// ---------------- Loading & Success ----------------
function AuthStatus({ phase }) {
  return (
    <div className="auth-status">
      <div className="auth-status-inner">
        <BrandLogo size={30} mono />
        {phase === 'loading' ? (
          <>
            <div className="auth-spinner" />
            <div className="auth-status-t">Connexion sécurisée…</div>
            <div className="auth-status-s">Authentification et chargement de votre terminal.</div>
          </>
        ) : (
          <>
            <div className="auth-check-circle"><Icon n="check" s={34} color="#fff" /></div>
            <div className="auth-status-t">Connexion réussie</div>
            <div className="auth-status-s">Redirection vers votre terminal…</div>
          </>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { LoginScreen, SignupScreen, ForgotScreen, AuthStatus });
