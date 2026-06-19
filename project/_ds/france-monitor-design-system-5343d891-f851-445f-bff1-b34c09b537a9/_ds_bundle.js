/* @ds-bundle: {"format":3,"namespace":"FranceMonitorDesignSystem_5343d8","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Badge","sourcePath":"components/core/Badge.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"DeltaPill","sourcePath":"components/core/DeltaPill.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"SourceTag","sourcePath":"components/core/SourceTag.jsx"},{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"Sparkline","sourcePath":"components/data/Sparkline.jsx"},{"name":"StatTile","sourcePath":"components/data/StatTile.jsx"},{"name":"TrendBar","sourcePath":"components/data/TrendBar.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"SearchField","sourcePath":"components/forms/SearchField.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Toggle","sourcePath":"components/forms/Toggle.jsx"},{"name":"FranceMap","sourcePath":"components/map/FranceMap.jsx"},{"name":"FRANCE_VIEWBOX","sourcePath":"components/map/regionPaths.js"},{"name":"FRANCE_REGIONS","sourcePath":"components/map/regionPaths.js"},{"name":"Alert","sourcePath":"components/surfaces/Alert.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"SectionHeader","sourcePath":"components/surfaces/SectionHeader.jsx"},{"name":"Tabs","sourcePath":"components/surfaces/Tabs.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"f0a10f046783","components/core/Badge.jsx":"adf217d51e36","components/core/Button.jsx":"7e3cdd84a979","components/core/DeltaPill.jsx":"7fcdd059f13b","components/core/IconButton.jsx":"1870ba4d901a","components/core/SourceTag.jsx":"5aeaf358d935","components/data/DataTable.jsx":"d4d197336415","components/data/Sparkline.jsx":"3ce0df74ce4f","components/data/StatTile.jsx":"a7e8903fed49","components/data/TrendBar.jsx":"0c9bb1c570f1","components/forms/Input.jsx":"bafb8dc423e1","components/forms/SearchField.jsx":"81725ddbff9b","components/forms/Select.jsx":"b32243fe7ad6","components/forms/Toggle.jsx":"6cca85924e4a","components/map/FranceMap.jsx":"69e8097e83c9","components/map/regionPaths.js":"e9b828c40276","components/surfaces/Alert.jsx":"2d44d8fffed3","components/surfaces/Card.jsx":"fd43402110b6","components/surfaces/SectionHeader.jsx":"fca30af72308","components/surfaces/Tabs.jsx":"f50615c6aaf6"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FranceMonitorDesignSystem_5343d8 = window.FranceMonitorDesignSystem_5343d8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 26,
  md: 34,
  lg: 44
};

/** Circular user/initials avatar. Pass `src` for an image or `initials` for a monogram. */
function Avatar({
  src,
  initials = '',
  size = 'md',
  tone = 'neutral',
  style = {},
  ...rest
}) {
  const d = SIZES[size] || SIZES.md;
  const tones = {
    neutral: {
      background: 'var(--gray-100)',
      color: 'var(--gray-700)'
    },
    blue: {
      background: 'var(--blue-100)',
      color: 'var(--blue-700)'
    }
  }[tone] || {};
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d,
      height: d,
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0,
      fontFamily: 'var(--font-sans)',
      fontSize: d * 0.4,
      fontWeight: 600,
      border: '1px solid var(--border)',
      ...tones,
      ...style
    }
  }, rest), src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : initials);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Badge.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const TONES = {
  neutral: {
    background: 'var(--gray-100)',
    color: 'var(--gray-700)',
    border: 'var(--gray-200)'
  },
  blue: {
    background: 'var(--blue-50)',
    color: 'var(--blue-700)',
    border: 'var(--blue-100)'
  },
  pos: {
    background: 'var(--pos-tint)',
    color: 'var(--green-700)',
    border: 'var(--green-100)'
  },
  neg: {
    background: 'var(--neg-tint)',
    color: 'var(--red-700)',
    border: 'var(--red-100)'
  },
  warn: {
    background: 'var(--warn-tint)',
    color: 'var(--amber-700)',
    border: 'var(--amber-100)'
  }
};

/** Compact status / category label. Optional leading dot. Tones: neutral·blue·pos·neg·warn. */
function Badge({
  tone = 'neutral',
  dot = false,
  children,
  style = {},
  ...rest
}) {
  const t = TONES[tone] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.02em',
      lineHeight: 1,
      padding: '4px 9px',
      borderRadius: 'var(--radius-pill)',
      background: t.background,
      color: t.color,
      border: `1px solid ${t.border}`,
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), dot && /*#__PURE__*/React.createElement("span", {
    style: {
      width: 5,
      height: 5,
      borderRadius: '50%',
      background: 'currentColor',
      flexShrink: 0
    }
  }), children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Badge.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: '6px 12px',
    fontSize: 13,
    height: 30,
    gap: 6
  },
  md: {
    padding: '9px 16px',
    fontSize: 14,
    height: 38,
    gap: 8
  },
  lg: {
    padding: '12px 22px',
    fontSize: 15,
    height: 46,
    gap: 8
  }
};
const VARIANTS = {
  primary: {
    background: 'var(--accent)',
    color: 'var(--on-accent)',
    border: '1px solid var(--accent)'
  },
  secondary: {
    background: 'var(--surface)',
    color: 'var(--text)',
    border: '1px solid var(--border-strong)'
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid transparent'
  },
  danger: {
    background: 'var(--neg)',
    color: 'var(--white)',
    border: '1px solid var(--neg)'
  }
};
const HOVERS = {
  primary: 'var(--accent-hover)',
  secondary: 'var(--surface-hover)',
  ghost: 'var(--surface-hover)',
  danger: 'var(--red-700)'
};

/** Primary action control. Variants: primary · secondary · ghost · danger. */
function Button({
  variant = 'primary',
  size = 'md',
  icon = null,
  iconRight = null,
  fullWidth = false,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const s = SIZES[size] || SIZES.md;
  const v = VARIANTS[variant] || VARIANTS.primary;
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s.gap,
      padding: s.padding,
      minHeight: s.height,
      fontFamily: 'var(--font-sans)',
      fontSize: s.fontSize,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      whiteSpace: 'nowrap',
      width: fullWidth ? '100%' : 'auto',
      transition: 'background var(--dur-fast) var(--ease-out), border-color var(--dur-fast)',
      opacity: disabled ? 0.45 : 1,
      ...v,
      ...(hover && !disabled ? {
        background: HOVERS[variant],
        borderColor: variant === 'secondary' ? 'var(--border-strong)' : HOVERS[variant]
      } : {}),
      ...style
    }
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: '1.05em',
      height: '1.05em'
    }
  }, icon), children, iconRight && /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: '1.05em',
      height: '1.05em'
    }
  }, iconRight));
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/DeltaPill.jsx
try { (() => {
/**
 * Signed change indicator for financial figures: green for gains, red for losses.
 * Renders an arrow + value with tabular numerals. Pass a numeric `value` (sign
 * decides color/arrow) or set `tone` manually with string `value`.
 */
function DeltaPill({
  value,
  tone,
  suffix = '%',
  size = 'md',
  subtle = false,
  style = {}
}) {
  const num = typeof value === 'number' ? value : parseFloat(value);
  const dir = tone || (num > 0 ? 'pos' : num < 0 ? 'neg' : 'flat');
  const color = dir === 'pos' ? 'var(--pos)' : dir === 'neg' ? 'var(--neg)' : 'var(--gray-500)';
  const bg = dir === 'pos' ? 'var(--pos-tint)' : dir === 'neg' ? 'var(--neg-tint)' : 'var(--gray-100)';
  const arrow = dir === 'pos' ? '▲' : dir === 'neg' ? '▼' : '–';
  const fs = size === 'sm' ? 12 : size === 'lg' ? 15 : 13;
  const display = typeof value === 'number' ? `${num > 0 ? '+' : ''}${num}${suffix}` : value;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-mono)',
      fontSize: fs,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      color,
      padding: subtle ? 0 : '2px 7px',
      borderRadius: 'var(--radius-sm)',
      background: subtle ? 'transparent' : bg,
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: '0.78em'
    }
  }, arrow), display);
}
Object.assign(__ds_scope, { DeltaPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/DeltaPill.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: 30,
  md: 38,
  lg: 46
};

/** Square icon-only button. Variants match Button; use for toolbar/topbar actions. */
function IconButton({
  variant = 'ghost',
  size = 'md',
  label,
  active = false,
  disabled = false,
  children,
  style = {},
  ...rest
}) {
  const d = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const base = {
    ghost: {
      background: active ? 'var(--surface-active)' : 'transparent',
      color: active ? 'var(--text)' : 'var(--text-secondary)',
      border: '1px solid transparent'
    },
    secondary: {
      background: 'var(--surface)',
      color: 'var(--text)',
      border: '1px solid var(--border)'
    }
  }[variant] || {};
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    disabled: disabled,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: d,
      height: d,
      borderRadius: 'var(--radius-md)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      flexShrink: 0,
      transition: 'background var(--dur-fast)',
      opacity: disabled ? 0.45 : 1,
      ...base,
      ...(hover && !disabled ? {
        background: 'var(--surface-hover)',
        color: 'var(--text)'
      } : {}),
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      width: '1.15em',
      height: '1.15em',
      fontSize: size === 'sm' ? 16 : 18
    }
  }, children));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/SourceTag.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Traceability tag naming an official data source (INSEE, Banque de France…).
 * Core to France Monitor's credibility — every figure carries its provenance.
 */
function SourceTag({
  source = 'INSEE',
  date,
  verified = true,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("span", _extends({
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      fontWeight: 500,
      color: 'var(--text-tertiary)',
      letterSpacing: '0.01em',
      padding: '2px 7px',
      borderRadius: 'var(--radius-sm)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      whiteSpace: 'nowrap',
      ...style
    }
  }, rest), verified && /*#__PURE__*/React.createElement("svg", {
    width: "11",
    height: "11",
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      color: 'var(--accent)'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M20 6 9 17l-5-5",
    stroke: "currentColor",
    strokeWidth: "3",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), source, date ? ` · ${date}` : '');
}
Object.assign(__ds_scope, { SourceTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/SourceTag.jsx", error: String((e && e.message) || e) }); }

// components/data/DataTable.jsx
try { (() => {
/**
 * Compact data table. `columns` define keys, headers and alignment;
 * `rows` are plain objects. Cells may hold strings or React nodes (badges, deltas).
 */
function DataTable({
  columns = [],
  rows = [],
  dense = false,
  onRowClick,
  style = {}
}) {
  const pad = dense ? '8px 14px' : '12px 16px';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      overflowX: 'auto',
      ...style
    }
  }, /*#__PURE__*/React.createElement("table", {
    style: {
      width: '100%',
      borderCollapse: 'collapse',
      fontFamily: 'var(--font-sans)'
    }
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => /*#__PURE__*/React.createElement("th", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: pad,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: 'var(--text-tertiary)',
      borderBottom: '1px solid var(--border)',
      whiteSpace: 'nowrap'
    }
  }, c.header)))), /*#__PURE__*/React.createElement("tbody", null, rows.map((row, ri) => /*#__PURE__*/React.createElement("tr", {
    key: ri,
    onClick: onRowClick ? () => onRowClick(row, ri) : undefined,
    style: {
      cursor: onRowClick ? 'pointer' : 'default'
    },
    onMouseEnter: e => {
      e.currentTarget.style.background = 'var(--surface-hover)';
    },
    onMouseLeave: e => {
      e.currentTarget.style.background = 'transparent';
    }
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    style: {
      textAlign: c.align || 'left',
      padding: pad,
      fontSize: 14,
      color: c.strong ? 'var(--text)' : 'var(--text-secondary)',
      fontWeight: c.strong ? 600 : 400,
      fontFamily: c.mono ? 'var(--font-mono)' : 'inherit',
      fontVariantNumeric: c.mono ? 'tabular-nums' : 'normal',
      borderBottom: ri === rows.length - 1 ? 'none' : '1px solid var(--border-subtle)',
      whiteSpace: 'nowrap'
    }
  }, c.render ? c.render(row[c.key], row) : row[c.key])))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/Sparkline.jsx
try { (() => {
/** Minimal inline trend line from a numeric series. No axes — pure shape. */
function Sparkline({
  data = [],
  width = 120,
  height = 36,
  tone,
  fill = true,
  strokeWidth = 1.6,
  style = {}
}) {
  if (!data.length) return null;
  const min = Math.min(...data),
    max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * stepX, height - (v - min) / span * (height - 4) - 2]);
  const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const last = data[data.length - 1],
    first = data[0];
  const color = tone || (last >= first ? 'var(--pos)' : 'var(--neg)');
  const area = `${line} L ${width} ${height} L 0 ${height} Z`;
  const id = React.useId();
  return /*#__PURE__*/React.createElement("svg", {
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`,
    style: {
      display: 'block',
      overflow: 'visible',
      ...style
    }
  }, fill && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("defs", null, /*#__PURE__*/React.createElement("linearGradient", {
    id: id,
    x1: "0",
    y1: "0",
    x2: "0",
    y2: "1"
  }, /*#__PURE__*/React.createElement("stop", {
    offset: "0%",
    stopColor: color,
    stopOpacity: "0.16"
  }), /*#__PURE__*/React.createElement("stop", {
    offset: "100%",
    stopColor: color,
    stopOpacity: "0"
  }))), /*#__PURE__*/React.createElement("path", {
    d: area,
    fill: `url(#${id})`
  })), /*#__PURE__*/React.createElement("path", {
    d: line,
    fill: "none",
    stroke: color,
    strokeWidth: strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: pts[pts.length - 1][0],
    cy: pts[pts.length - 1][1],
    r: "2.4",
    fill: color
  }));
}
Object.assign(__ds_scope, { Sparkline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/Sparkline.jsx", error: String((e && e.message) || e) }); }

// components/data/StatTile.jsx
try { (() => {
/**
 * Headline metric tile: label, big tabular figure, optional delta, sparkline and
 * source. The fundamental building block of the terminal's data panels.
 */
function StatTile({
  label,
  value,
  unit,
  delta,
  deltaSuffix = '%',
  series,
  source,
  sourceDate,
  selected = false,
  onClick,
  style = {}
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      padding: 18,
      borderRadius: 'var(--radius-lg)',
      background: 'var(--surface)',
      border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
      boxShadow: selected ? 'var(--ring-focus)' : hover && onClick ? 'var(--shadow-sm)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'box-shadow var(--dur-fast), border-color var(--dur-fast)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-secondary)'
    }
  }, label), delta != null && /*#__PURE__*/React.createElement(__ds_scope.DeltaPill, {
    value: delta,
    suffix: deltaSuffix,
    size: "sm"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontWeight: 600,
      fontSize: 30,
      lineHeight: 1,
      color: 'var(--text)',
      letterSpacing: '-0.01em'
    }
  }, value, unit && /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 16,
      fontWeight: 500,
      color: 'var(--text-tertiary)',
      marginLeft: 4
    }
  }, unit)), series && series.length > 1 && /*#__PURE__*/React.createElement(__ds_scope.Sparkline, {
    data: series,
    width: 96,
    height: 34
  })), source && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.SourceTag, {
    source: source,
    date: sourceDate
  })));
}
Object.assign(__ds_scope, { StatTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StatTile.jsx", error: String((e && e.message) || e) }); }

// components/data/TrendBar.jsx
try { (() => {
/**
 * Labeled horizontal bar for ranked comparisons (régions, postes budgétaires…).
 * `value` is absolute; `max` sets the full-width reference.
 */
function TrendBar({
  label,
  value,
  max,
  display,
  tone = 'var(--accent)',
  style = {}
}) {
  const pct = Math.max(0, Math.min(100, value / (max || 1) * 100));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'baseline',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontVariantNumeric: 'tabular-nums',
      fontSize: 13,
      fontWeight: 600,
      color: 'var(--text)'
    }
  }, display != null ? display : value)), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 7,
      borderRadius: 'var(--radius-pill)',
      background: 'var(--gray-100)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: `${pct}%`,
      height: '100%',
      borderRadius: 'var(--radius-pill)',
      background: tone,
      transition: 'width var(--dur-slow) var(--ease-out)'
    }
  })));
}
Object.assign(__ds_scope, { TrendBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/TrendBar.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Labeled text input. */
function Input({
  label,
  hint,
  error,
  id,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const inputId = id || (label ? `in-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      height: 40,
      padding: '0 12px',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      color: 'var(--text)',
      background: 'var(--surface)',
      outline: 'none',
      border: `1px solid ${error ? 'var(--neg)' : focus ? 'var(--border-focus)' : 'var(--border)'}`,
      boxShadow: focus && !error ? 'var(--ring-focus)' : 'none',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)'
    }
  }, rest)), (hint || error) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: error ? 'var(--neg)' : 'var(--text-tertiary)'
    }
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/SearchField.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Global search field with a leading magnifier. Used in the terminal top bar. */
function SearchField({
  value,
  onChange,
  placeholder = 'Rechercher un indicateur, une région, une source…',
  size = 'md',
  shortcut,
  style = {},
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const h = size === 'sm' ? 34 : size === 'lg' ? 46 : 40;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 9,
      width: '100%',
      height: h,
      padding: '0 12px',
      borderRadius: 'var(--radius-md)',
      background: 'var(--surface-sunken)',
      border: `1px solid ${focus ? 'var(--border-focus)' : 'var(--border)'}`,
      boxShadow: focus ? 'var(--ring-focus)' : 'none',
      transition: 'border-color var(--dur-fast), box-shadow var(--dur-fast)',
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      color: 'var(--text-tertiary)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("circle", {
    cx: "11",
    cy: "11",
    r: "7",
    stroke: "currentColor",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "m21 21-4.3-4.3",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round"
  })), /*#__PURE__*/React.createElement("input", _extends({
    value: value,
    onChange: onChange,
    placeholder: placeholder,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      color: 'var(--text)'
    }
  }, rest)), shortcut && /*#__PURE__*/React.createElement("kbd", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text-tertiary)',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-xs)',
      padding: '2px 6px',
      flexShrink: 0
    }
  }, shortcut));
}
Object.assign(__ds_scope, { SearchField });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SearchField.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Styled native select with custom chevron. `options` = [{value,label}] or strings. */
function Select({
  label,
  value,
  onChange,
  options = [],
  id,
  style = {},
  ...rest
}) {
  const selId = id || (label ? `sel-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);
  const opts = options.map(o => typeof o === 'string' ? {
    value: o,
    label: o
  } : o);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: selId,
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      fontWeight: 500,
      color: 'var(--text-secondary)'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selId,
    value: value,
    onChange: onChange,
    style: {
      width: '100%',
      height: 40,
      padding: '0 36px 0 12px',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      appearance: 'none',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      color: 'var(--text)',
      outline: 'none'
    }
  }, rest), opts.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value
  }, o.label))), /*#__PURE__*/React.createElement("svg", {
    width: "16",
    height: "16",
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      position: 'absolute',
      right: 11,
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-tertiary)',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "m6 9 6 6 6-6",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  }))));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/Toggle.jsx
try { (() => {
/** On/off switch. Controlled via `checked` + `onChange`. */
function Toggle({
  checked = false,
  onChange,
  label,
  disabled = false,
  style = {}
}) {
  const inner = /*#__PURE__*/React.createElement("span", {
    role: "switch",
    "aria-checked": checked,
    onClick: () => !disabled && onChange && onChange(!checked),
    style: {
      position: 'relative',
      width: 38,
      height: 22,
      borderRadius: 'var(--radius-pill)',
      background: checked ? 'var(--accent)' : 'var(--gray-300)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      flexShrink: 0,
      transition: 'background var(--dur-base) var(--ease-out)',
      opacity: disabled ? 0.5 : 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 2,
      left: checked ? 18 : 2,
      width: 18,
      height: 18,
      borderRadius: '50%',
      background: 'var(--white)',
      boxShadow: 'var(--shadow-sm)',
      transition: 'left var(--dur-base) var(--ease-out)'
    }
  }));
  if (!label) return inner;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 10,
      cursor: disabled ? 'not-allowed' : 'pointer',
      ...style
    }
  }, inner, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      color: 'var(--text-secondary)'
    }
  }, label));
}
Object.assign(__ds_scope, { Toggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Toggle.jsx", error: String((e && e.message) || e) }); }

// components/map/regionPaths.js
try { (() => {
// France régions geometry — projected (Mercator) from
// gregoiredavid/france-geojson (regions-version-simplifiee, Licence Ouverte / IGN Admin Express).
// viewBox 0 0 1000 963. Each region: { code (INSEE), nom, d (SVG path), c ([cx,cy] centroid) }.
const FRANCE_VIEWBOX = "0 0 1000 963";
const FRANCE_REGIONS = [{
  "code": "84",
  "nom": "Auvergne-Rhône-Alpes",
  "d": "M671.27 507.28L672.23 503.25L673.11 501.44L673.33 499.21L674.34 497.77L674.73 495.62L676.13 492.58L676.05 489.85L678.51 485.31L678.75 481.71L680.36 479.23L680.35 476.93L681.69 474.47L686.3 474.84L687.88 476.48L689.8 477.42L693.22 476.64L695.22 474.95L697.6 474.55L699.51 475.06L700.45 478.94L703.18 480.54L706.85 481.04L707.45 482.6L706.07 484.36L708.93 485.42L711.22 487.52L711.08 490.24L712.99 491.52L714.59 491.54L715.39 493.85L717.35 493.06L717.9 493.86L716.67 497.8L717.76 498.71L720.93 498.8L722.39 498.21L724.02 495.9L726.1 495.59L727.46 492.49L729.59 491.48L731.95 494.26L733.98 494.47L734 497.09L734.68 499.13L737.39 498.4L743.04 499L744.96 498.31L746.05 496.62L747.01 496.88L747.62 494.43L749.19 494.4L752.02 489.26L755.1 486.88L757.42 484.02L759.71 484.74L764.51 488.72L761.26 493.99L761.13 495.81L760.01 496.77L761.46 500.07L759.95 501.39L759.04 500.48L755.34 501.34L753.29 502.99L751.67 503.38L750.68 505.32L752.59 506.32L750.17 511.6L752.14 510.52L756.18 510.85L756.61 509.73L759.33 509.7L761.62 510.79L764.87 509.08L765.6 507.14L768.96 504.39L771.73 503.51L773.93 500.78L773.74 499.65L771.08 500.38L769.08 497.52L769.68 495.12L771.71 490.56L773.5 488.88L776.25 488.51L777.07 490.2L779.29 491.42L780.74 489.64L784.56 488.28L785.52 486.38L787.55 485.13L789.71 486.11L792.59 485.37L795.74 485.03L801.63 484.86L806.12 486.29L807.22 487.51L804.83 489.98L805.76 492.14L808.17 493.92L808.82 495.31L811.13 496.97L810.42 499.81L809.48 500.34L807.05 504.6L807.61 506.63L806.27 508.62L806.57 510.97L807.79 511.83L813.41 512.53L812.43 515.12L812.94 516.21L811.68 519.35L812.73 520.21L815.16 518.08L816.97 519.55L819.2 523.75L820.62 524.33L821.75 526.28L821.43 528.21L822.72 528.75L823.17 531.75L821.63 532.47L820.44 534.24L820.59 535.54L819.67 537.1L816.94 537.93L816.17 539.16L813.19 539.56L811.75 539.28L808.07 540.18L807.07 542.14L807.66 542.89L806.97 545.75L807.37 550.86L810.01 554.3L813.95 555.72L813.66 556.76L815.84 558.36L817.99 557.69L820.27 559.05L819.41 560.5L818.74 563.85L819.92 565.22L819.66 569.47L820.58 570.83L820.25 572.04L823.21 572.73L823.3 574.54L826.92 575.39L827.84 578.76L830.44 579.81L832.59 581.31L831.31 583.62L831.08 585.62L829.47 586.73L829.27 588.6L827.85 588.84L828.4 591.94L829.38 593.41L829.47 595.69L827.37 597.37L824.75 600.15L823.66 598.7L821.57 599.6L817.93 600.35L817.15 603.05L815.55 603.87L813.2 604.11L812.45 605.23L813.14 607.07L810.02 608.04L807.63 606.03L804.65 604.94L802.71 607.12L800.85 606.37L798.76 606.81L798.25 608.3L795.4 609.74L794.43 608.58L791.81 608.43L790.43 610.23L788.67 610.76L787.41 609.79L785.36 611.5L785.75 614.8L783.44 615.21L782.55 614.18L779.55 614.25L777.61 613.46L778.19 612.13L777.48 610.2L775.35 608.9L773.2 609.81L770.61 608.07L768.51 609.79L769.43 613.57L767.89 613.92L766.81 618.94L770.01 620.44L773.26 619.75L774.72 620.12L774.25 622L775.17 623L775.2 625.12L777.2 625.69L776.92 627.37L777.17 630.36L776.66 631.39L776.92 633.78L775.69 634.49L773.3 632.12L771.2 632.4L769.93 634.09L766.3 633.49L764.58 633.94L761.73 633.21L760.63 634.9L756.94 637.51L755.15 635.47L753.45 637.14L751.72 637.31L749.73 638.64L751.63 639.92L751.79 640.85L747.9 643.41L746.42 643.01L745.66 643.91L742.84 643.64L741.56 644.73L739.8 647.88L741.52 648.49L741.43 649.87L739.66 650.98L739.07 652.93L736.61 652.04L734.74 654.24L729.08 653.14L729.23 657.04L727.47 659.54L726.09 663.3L728.12 664.12L730.61 667.19L728.28 667.26L727.37 669.94L726.52 670.61L723.76 669.74L720.68 668.18L718.22 668.19L716.8 670.55L717.18 672.27L719.45 673.26L717.99 674.92L716.02 673.78L714.1 674.43L715.74 677.59L715.2 679.67L716.93 679.74L717.52 681.32L719.1 682.67L721.03 681.53L722.08 683.01L727.43 683.11L726.82 685.36L728.81 686.18L728.42 687.59L729.47 688.73L731.39 688.45L731.18 691.79L731.73 692.44L731.38 696.32L729.74 696.5L729.43 698.68L731.83 698.96L731.55 700.57L728.4 700.07L728.94 698.56L726.92 696.63L724.68 696.64L723.89 698.25L725.14 699.49L723.01 700.22L722.28 701.86L719.49 703.41L716.53 703.08L715.25 700.05L711.73 699.71L711.82 695.42L709.77 694.27L708.62 695.19L705.63 694.17L703.23 692.71L702 694.28L697.76 693.58L696.41 692.63L696.86 691.25L696.06 687.83L697.23 686.9L697.6 685.27L693.03 688.07L691.15 687.65L690.08 685.39L686.39 687.4L684.77 687.58L681.51 689.7L677.9 689.76L674.38 692.87L673.54 692.5L673.44 690.12L672.8 688.03L672.9 685.79L670.06 683.77L667.23 683.65L664.47 684.23L662.57 683.36L662.76 685.96L662.48 688.93L661.73 687.75L660.39 688.17L659.63 687.05L656.28 685.77L655.45 684.21L652.68 682.47L649.62 682.25L649.18 682.91L649 686.47L647.95 687.37L645.68 687.19L645.13 685.87L645.97 682.98L644.85 681.78L643.52 682.45L641.46 682.45L640.5 683.91L638.26 684.78L638.33 686.79L637.53 688.52L636.28 689.46L635.1 688.96L633.35 687.03L631.44 686.18L630.84 684.48L628.5 684.9L627.41 682.62L623.71 683.59L622.36 684.53L621.38 683.27L622.49 682.47L622.46 678.77L623.5 676.29L622.12 675.07L621.43 672.47L618.78 671.15L618.08 669.93L617.68 665.95L615.47 660.51L613.78 660.6L612.75 657.33L611.78 656.27L611.84 653.13L610.18 650.51L609.68 644.38L607.94 644L608.36 642.13L605.66 640.76L602.31 637.09L601.76 635.5L600.31 636.14L596.7 636.34L596.88 634.97L595.75 632.05L593.84 631.48L591.69 631.93L591.93 633.44L591.32 636.57L588.02 636.41L585.73 636.82L583.9 638.16L582.59 635.29L581.45 633.94L581.04 631.48L579.34 627.92L579.71 626.9L578.95 624.26L577.73 624.61L576.05 622.84L574.48 624.31L571.86 625.95L571 627.11L568.16 626.43L568.56 628.07L567.18 628.73L567.68 630.74L566.29 631.97L564.04 633.04L562.94 632.04L561.27 629.29L558.88 630.86L558.09 633.99L558.48 635.89L556.6 635.84L555.03 638.67L555.02 642.34L553.89 643.85L553.72 645.69L552.88 647.23L550.57 653.74L549.99 653.64L547.97 650.7L546.77 645.96L547.43 644.36L546.49 642.31L547.41 641.04L546.45 639.61L544.65 640.36L543.72 638.79L543.11 636.29L542.09 634.22L542.39 632.02L539.29 632.5L538.51 632.1L536.55 633.82L536.93 630.77L536.61 628.18L535.46 626.54L533.75 626.12L532.77 626.85L532.1 628.92L530.42 628.91L528.84 630.89L528.25 632.47L526.57 632.74L525.14 634.99L525.74 636.17L524.75 637.19L524.92 639.75L522.63 641.13L521.91 644.78L522.15 646.3L518.31 649.43L517.12 653.21L515.04 653.41L513.89 654.29L510.33 653.16L509.26 654.06L507.03 653.18L506.63 651.38L504.23 651.67L501.53 653.06L500.04 652.76L498.68 653.82L498.62 656.49L496.06 654.36L495.77 652L496.72 650.93L494.94 648.54L494.58 646.55L495 643.5L495.9 641.61L495.89 637.96L494.08 636.82L490.96 632.17L490.5 629.5L491.95 628.6L489.97 626.53L490.08 624.48L488.92 622.35L490.99 621.52L493.62 621.5L494.13 619.57L492.53 618.12L491.08 614.8L494.1 611.91L496.22 612.38L497.32 608.92L496.89 607.52L498.63 606.49L498.65 605.04L497.45 600.63L498.43 598.42L500.72 595.36L502.05 594.42L502.75 592.59L503.98 592.86L506.02 589.39L508.22 588.95L508.27 586.94L509.18 586.05L509.48 583.32L508.49 581.9L510.08 580.66L511.42 582.01L513.06 582.29L514.65 583.63L517.29 584.04L519.81 583.52L519.97 582.55L517.41 580.29L518.7 575.9L518.81 574.52L519.38 570.18L519.34 567.35L517.64 566.68L515.83 563.38L516.8 562.12L517.13 559.11L519.43 559.08L519.92 557.39L519.09 556.19L520.03 554.68L519.66 552.63L517.72 549.66L515.21 547.43L513.92 546.84L513.38 544.21L510.73 541.03L511.63 540.05L513.32 540.32L516.28 536.7L517.73 537.5L520.12 534.1L521.71 530.05L522.92 528.36L525.68 527.16L524.58 525.4L525.13 521.14L523.06 519.7L521.75 516.4L521.64 512.87L522.64 510.54L522.26 507.6L520.13 506.35L519.31 501.44L517.7 500.38L516.71 498.29L516.96 497.16L514.43 495.8L512.97 496.81L512.91 494.33L510.99 492.41L509.56 494.09L508.51 492.82L506.37 492.47L505.01 490.03L506.39 488.85L503.81 486.93L503.56 483.61L503.87 480.39L505.19 478.25L508.32 474.67L509.41 474.06L514.59 473.9L517.1 472.67L518.19 473.78L520.17 472.98L520.71 473.94L525.62 470.97L525.03 467.06L523.48 465.73L524.73 462.46L523.09 460.29L524.81 459.78L526.56 460.57L528.17 457.41L531.78 453.61L532.64 451.97L534.17 452.1L535.61 454.59L537.79 453.05L540.23 452.87L545.75 448.55L545.64 447.71L549.11 446.15L553.95 447.03L555.09 450.64L557.43 452.64L560.51 453.66L562.75 456.95L565.04 458.29L566.27 458L569.91 454.68L572 454.73L572.87 457.42L575.07 457.85L576.39 457.18L577.82 454.87L580.94 455.16L580.86 456.97L582.25 457.87L581.82 459.89L582.36 460.98L584.59 460.22L586.96 457.69L588.47 458.45L589.39 457.36L588.74 454.77L590.54 454.87L591.93 453.98L590.43 451.48L594.04 451.48L594.61 455.62L595.51 456.05L596.69 458.91L598.57 460.18L599.59 462.81L599.71 464.73L600.95 465.62L601.67 469.47L600.89 471.02L601.58 472L603.3 472.05L605.6 473.92L607.77 472.82L608.16 474.14L609.82 474.91L609.63 476.63L611.56 477.68L613.47 476.24L616.09 476.86L618.78 479.22L618.11 482.14L618.65 482.93L617.38 485.67L618.35 488.55L618.01 493.45L615.56 493.32L615.4 494.98L613.11 495.64L612.17 497.66L612.83 499.42L611.54 503.62L613.11 504.35L617.07 504.76L617.69 507.32L620.95 507.95L622.39 506.8L625.89 505.18L627.86 507.22L631.55 507.43L631.29 506.18L632.86 505.52L633.99 507.16L636.18 506.5L636.16 509.16L637.82 509.23L638.52 507.69L640.1 507.73L643.21 505.45L644.95 503.1L645.22 498.91L646.14 495.7L649.67 495.61L651.69 496.48L652.73 498.51L654.96 498.24L656.34 495.85L658.27 498.36L660.42 498.74L660.31 497.2L662.84 494.98L665.13 495.19L666.39 496.81L664.51 499.33L668.28 501.7L667.27 502.85L668.25 503.97L667.28 505.61L667.93 507.12L669.74 507.71L671.27 507.28ZM678.83 680.07L677.39 681.5L678.99 682.58L678.07 683.82L678.6 685.78L680.79 685.33L684.58 686.39L687.58 681.84L687.83 680.26L689.5 680.09L689.29 678.53L687.07 677.45L686.91 676.27L685.25 674.59L683.55 674.71L680.55 676.04L679.75 679.2L678.83 680.07Z",
  "c": [654.88, 570.39]
}, {
  "code": "27",
  "nom": "Bourgogne-Franche-Comté",
  "d": "M594.04 451.48L590.43 451.48L591.93 453.98L590.54 454.87L588.74 454.77L589.39 457.36L588.47 458.45L586.96 457.69L584.59 460.22L582.36 460.98L581.82 459.89L582.25 457.87L580.86 456.97L580.94 455.16L577.82 454.87L576.39 457.18L575.07 457.85L572.87 457.42L572 454.73L569.91 454.68L566.27 458L565.04 458.29L562.75 456.95L560.51 453.66L557.43 452.64L555.09 450.64L553.95 447.03L555.78 443.86L556.47 441.32L556.37 438.91L555.18 435.67L557.13 431.3L556.02 428.28L556.89 425L556.01 422.43L553.36 420.72L553.91 417.78L553.69 414.17L552.42 409.15L550.57 405L550.69 401.26L547.63 398.5L545.61 396.2L543.53 395.13L543.31 392.49L546.4 386.66L547.18 383.25L545.27 379.56L544.32 376.52L543.39 375.43L541.66 373.73L542.24 372.2L544.47 372.18L546.05 370.9L549.03 371.75L550.23 370.56L549.27 369.82L547.8 367.17L547.53 363.86L548.73 362.96L546.31 360.56L545.87 358.4L542.34 356.42L541.66 354.97L542.18 351.47L546.07 350.63L548.43 350.98L548.76 350.01L551.01 348.97L553.4 348.91L553.69 347.51L552.64 344.14L553.8 344.07L553.75 341.86L552.16 341.17L552.29 338.04L556.14 334.52L557.07 334.43L560.42 330.46L560.16 326.95L558.79 326.19L557.73 322.14L555.19 320.29L555.15 318.64L553.78 314.18L551.19 312.24L549.87 312.3L547.53 311.14L547.42 309.59L549.85 308.04L550.09 306.9L552.15 306.68L554.73 300.2L552.87 296.58L554.6 294.41L554.27 293.33L555.12 291.31L558.44 291.54L561.19 290.05L565.35 290.92L567.43 290.28L568.87 290.81L570.75 289.55L572.28 290.02L576.31 290.08L576.44 287.85L577.53 287.31L579.64 288.26L580.49 291.32L582.17 289.87L585.27 290.45L587.54 293.29L589.61 295.21L589.82 296.63L591.26 297.3L591.21 299.38L593.19 300.27L593.7 301.96L592.07 303.73L593.52 304.86L592.81 306.25L590.4 308.59L591.68 309.58L593.38 308.38L594.85 309.07L596.62 313.57L599.11 313.06L601.48 310.5L602.46 312.46L601.44 314.22L603.69 314.53L605.82 317.26L605.94 319.13L607.14 321.4L607.12 323.25L610.23 325.98L608.16 327.16L608.84 329.18L610.74 329.62L612.21 327.76L613.18 329.99L612.3 333.7L615.43 334.48L617.97 334.5L619.17 333.36L620.13 334.72L621.94 334.97L623.02 333.01L625.15 333.27L626.41 334.87L630.07 331.58L632.86 332.91L632.78 330.34L634.24 330.65L633.82 332.59L635.2 334.37L636.73 335.16L638.6 335L639.64 331.44L642.48 331.9L646.71 330.74L649.04 331.85L652.01 330.68L653.68 330.9L656.49 330.42L654.87 327.43L658.01 324.6L660.3 324.41L664.09 326.04L666.17 325.52L667.22 326.66L669.19 327.13L671.86 326.77L672.23 329.24L671.59 330.67L673.33 331.63L675.63 331.44L677.03 333.52L674.54 336.06L676.42 337.99L677.71 335.55L679.43 335.44L681.19 338.89L681.2 340.46L682.93 340.9L683.89 344.38L685.61 345.62L685.16 347.24L680.53 349.84L681.37 351.43L682.63 351.07L684.12 354.54L682.91 356.86L683.32 357.85L685.5 358.72L688.03 356.61L688.94 359.89L691.71 361.81L694.62 362.76L697.98 359.45L697.66 362.28L700.2 363.34L702.07 365.91L702.03 367.78L702.99 369.81L706.14 367.02L708.83 366.61L709.83 368.38L711.12 367.06L711.06 365.68L713.24 362.85L713.28 360.2L715.95 360.47L718.4 359.09L721.57 360.26L724.08 357.03L725.27 357.57L726.06 360.37L729.86 359.81L732.32 359.06L731.92 356.36L732.54 353.81L733.62 353.05L733.33 350.66L731.64 350.57L731.78 346.93L732.98 345.18L735.18 345.81L736.08 345.21L735.95 342.71L737.1 341.64L740.08 342.84L743.14 336.97L744.39 337.5L745.8 336.49L745.39 334.96L746.42 333.09L747.62 332.83L747.64 331L748.88 329.67L750.4 330.98L748.94 332.47L750.01 333.86L751.16 331.84L752.76 331.78L754.7 329.74L755.88 327.11L761.94 325.14L763.59 326.91L763.35 328.04L764.39 332.33L766.09 332.25L767.1 333.61L769.09 334.28L771.73 332.18L774.9 332.64L777.69 331.37L782.09 333.18L783.72 336.89L785.08 338.44L789.5 337.31L790.93 334.43L793.88 333.25L796.14 335.99L796.32 337.07L800.34 339.43L802.63 341.42L805.79 342.61L806.28 344.57L808.39 346.27L809.9 345.28L810.06 347.38L811 348.93L815.13 350.52L816.23 350.41L818.29 352.3L821.02 353.39L822.74 355.39L822 357.45L823.33 360.39L821.49 362.47L820.56 365.58L821.93 368.24L824.57 367.41L826.02 368.25L827.35 372.35L829.34 373.83L828.97 377.16L827.68 377.96L824.7 378.1L821.86 377.04L819.28 378.3L820.16 382.19L818.21 382.73L816.24 384.07L816.09 386.78L814.69 386.83L814.27 388.8L812.54 389.9L812.13 391.5L814.82 391.8L819.84 391.04L821.04 390.06L823.56 391.27L824.4 392.91L823.33 394.61L821.31 395.94L819.77 397.72L816.39 398.5L817.22 402.81L816.25 404.02L812.34 407.01L810.72 410.69L806.82 414.2L804.37 415.09L802.77 416.24L802.85 417.92L801.29 418.13L799.53 420.32L801.04 422.05L800.07 423.04L797.52 424.11L795.65 427.04L792.93 427.7L791.14 428.79L787.94 429.75L786.45 429.43L783.09 433.36L782.16 433.91L784.3 437.68L783.99 441.46L782.82 443.36L782.3 446.39L783.89 447.66L781.7 450.96L779.63 451.6L779.41 452.57L776.26 455.16L772.27 457.18L768.42 461.38L764.9 464.72L761.67 467.05L760.55 468.41L762.39 470.23L763.62 471.42L760.68 474.92L759.62 477.69L758.08 479.37L758.88 481.61L757.42 484.02L755.1 486.88L752.02 489.26L749.19 494.4L747.62 494.43L747.01 496.88L746.05 496.62L744.96 498.31L743.04 499L737.39 498.4L734.68 499.13L734 497.09L733.98 494.47L731.95 494.26L729.59 491.48L727.46 492.49L726.1 495.59L724.02 495.9L722.39 498.21L720.93 498.8L717.76 498.71L716.67 497.8L717.9 493.86L717.35 493.06L715.39 493.85L714.59 491.54L712.99 491.52L711.08 490.24L711.22 487.52L708.93 485.42L706.07 484.36L707.45 482.6L706.85 481.04L703.18 480.54L700.45 478.94L699.51 475.06L697.6 474.55L695.22 474.95L693.22 476.64L689.8 477.42L687.88 476.48L686.3 474.84L681.69 474.47L680.35 476.93L680.36 479.23L678.75 481.71L678.51 485.31L676.05 489.85L676.13 492.58L674.73 495.62L674.34 497.77L673.33 499.21L673.11 501.44L672.23 503.25L671.27 507.28L669.74 507.71L667.93 507.12L667.28 505.61L668.25 503.97L667.27 502.85L668.28 501.7L664.51 499.33L666.39 496.81L665.13 495.19L662.84 494.98L660.31 497.2L660.42 498.74L658.27 498.36L656.34 495.85L654.96 498.24L652.73 498.51L651.69 496.48L649.67 495.61L646.14 495.7L645.22 498.91L644.95 503.1L643.21 505.45L640.1 507.73L638.52 507.69L637.82 509.23L636.16 509.16L636.18 506.5L633.99 507.16L632.86 505.52L631.29 506.18L631.55 507.43L627.86 507.22L625.89 505.18L622.39 506.8L620.95 507.95L617.69 507.32L617.07 504.76L613.11 504.35L611.54 503.62L612.83 499.42L612.17 497.66L613.11 495.64L615.4 494.98L615.56 493.32L618.01 493.45L618.35 488.55L617.38 485.67L618.65 482.93L618.11 482.14L618.78 479.22L616.09 476.86L613.47 476.24L611.56 477.68L609.63 476.63L609.82 474.91L608.16 474.14L607.77 472.82L605.6 473.92L603.3 472.05L601.58 472L600.89 471.02L601.67 469.47L600.95 465.62L599.71 464.73L599.59 462.81L598.57 460.18L596.69 458.91L595.51 456.05L594.61 455.62L594.04 451.48Z",
  "c": [672.97, 403.15]
}, {
  "code": "53",
  "nom": "Bretagne",
  "d": "M104.93 261.01L106.45 259.85L110.16 259.92L109.92 255.12L111.9 254.07L112.24 251.97L109.98 249.65L110.38 247.88L113.26 246.41L112.87 244.33L114.06 243.65L117.77 244.32L120.3 246.97L122.49 246.61L123.5 245.07L125.21 244.68L127.47 242.89L131.58 243.08L132.67 240.87L134.42 239.91L135.55 243.17L137.89 241.27L140.79 240.09L142.83 239.79L143.56 243.91L145.56 245.14L148.25 244.43L148.75 246.66L146.12 247.93L148.43 250.09L152.5 250.39L153.93 251.4L152.85 254.75L154.18 256.08L156.53 257.09L157.17 259.49L158.79 259.51L160.78 261.89L161.53 266.04L161.27 267.68L163.95 268.54L164.42 270.01L167.94 271.54L167.89 273.84L169.4 276.59L170.93 276.08L170.53 274.01L173.97 274.52L173.91 273.3L175.63 271.91L178.71 268.41L183.04 266.12L184.54 264.68L184.86 261.99L187.04 261.73L188.61 262.81L192.05 261.38L195.16 259.5L196.53 260.94L195.24 263.65L193.62 265.02L195.34 265.86L196.15 264.58L198.59 262.59L202.49 269.17L204.49 269.42L205.72 268.21L205.14 266.6L207.97 266.58L206.78 263.83L208.82 263.03L211.36 262.98L212.57 264.25L214.24 264.69L214.02 266.07L215.36 268.29L215.81 270.46L218.13 273.65L219.76 273.23L218.88 272.07L216.81 267.62L215.69 266.25L214.53 263.53L214.53 261.79L216.59 260.92L218.3 258.26L220.43 257.43L222.59 257.84L223.62 256.98L226.43 257.41L227.25 258.78L225.48 260.19L224.88 262.21L226.67 265.36L231.44 266.67L239.01 265.94L245.05 264.34L247.17 267.03L246.94 269.01L248.55 270.41L247.59 272.3L248.51 273.11L250.12 276.26L250.5 278.24L253.23 278.57L254.58 280.95L257.71 281.54L260.25 279.89L261.32 277.54L264.64 276.23L265.11 273.73L269.52 272.89L270.74 274.26L271.9 274.01L273.51 275.39L274.62 274.96L278.67 276.3L278.3 277.22L278.96 282.1L277.81 283.89L278.2 286.1L279.76 288.9L279.04 290.49L280.36 294.58L277.87 297.54L276.57 301.23L278.43 307.38L278.04 309.12L279.33 312.48L280.05 318.54L281.81 320.64L281.05 324.18L282.16 326.32L281.95 328.06L278.61 329.38L276.49 328.65L274.92 330.23L273.04 330.98L272.67 333.64L271.55 337.83L270.18 338.65L270.68 340.82L269.02 343.14L268.88 344.46L267.39 346.57L266.88 349.9L262 348.34L259.18 347.73L257.18 344.75L255.34 344.82L252.16 344.11L251.48 345.03L252.06 346.82L249.54 347.48L247.94 348.99L243.56 349.96L242.02 351.15L240.73 353.3L240.55 355.33L239.38 356.5L237 356.27L234.81 357.68L232.91 356.81L231.54 357.71L228.18 356.93L225.4 356.86L220.55 358.88L219.31 360.37L218.35 358.71L215.64 360.41L213.87 360.69L212.87 362.42L211.26 362.37L209.76 364.39L210.57 365.4L210.44 367.24L209.31 368.57L209.79 370.26L209.66 374.08L205.8 375.27L205.92 377.82L203.97 378.28L203.47 376.26L199.88 378.09L198.73 376.1L196.2 377.41L195.26 378.86L195.28 380.98L192.46 381.93L191.38 381.09L189.43 381.83L187.88 379.73L185.84 381.22L185.5 382.61L184.1 383.1L182.8 381.7L183.42 380.01L182.62 378.49L186.66 377.83L184.99 376.29L181.53 374.83L179.77 375.17L179.17 376.21L175.77 375.84L175.76 374.38L172.5 373.53L172.53 374.56L170.55 377.87L168.26 376.9L163.67 378.03L162.9 378.84L159.27 377.58L159.39 376.26L157.54 374.04L154.99 373.18L155.25 371.5L157.04 371.22L158.42 373.37L161.32 372.75L162.23 372.02L165.11 373.83L167 372.28L168.26 369.85L168.33 368.21L165.43 366.23L165.64 363.94L162.91 365.57L160.49 366.12L159.15 365.62L156.66 367.14L156.27 369.31L153.39 367.86L152.48 369.57L148.85 370.85L147.39 369.11L142.8 371.03L140.89 370.55L140.22 374.23L141.32 377.84L142.82 379.2L140.48 380.06L138.98 377.07L138.96 374.68L140.13 372.6L139.79 369.54L138.54 366.82L136.16 365.33L135.09 363.46L135.2 361.2L136.38 359.29L137.99 359.5L140.57 357L140.71 355.21L138.47 353.82L137.33 354.09L137.51 357.36L134.57 360.81L134.74 363.01L130.99 359.66L129.85 357.46L126.29 356.68L125.75 354.7L123.19 357.36L120.28 357.23L118.78 358.02L115.72 354.62L114.21 351.8L113.6 349.32L114.45 347.07L113.2 345.93L113.04 343.97L114.07 342.66L112.95 343.96L112.75 345.42L114.07 347.35L113.02 351.3L111.31 350.71L107.74 350.62L104.42 349.5L103.48 349.89L99.78 347L98.03 348.51L95.44 348.81L94.09 347.87L92.05 347.98L88.67 343.76L86.4 339.3L83.45 337.06L82.78 339.45L83.54 342.2L79.28 343.01L77.26 341.18L73.6 341.16L71.08 342.66L70.31 339.98L68.83 341.47L70.02 343.65L71.36 344.39L69.78 347.52L67.52 348.26L63.99 348.47L62.02 347.53L57.74 348L56.61 345.37L58.58 344.49L58.55 341.85L57.4 338.07L56.02 334.9L53.64 331.27L51.62 329.38L47.84 327.04L45.78 326.27L44.16 327.57L40.64 325.88L39.58 324.61L38.28 325.35L35.12 324.78L33.99 321.28L36.84 321.45L37.37 320.5L40.34 320.67L43.13 319.33L44.91 319.81L46.32 318.69L49.33 318.87L50.74 317.6L53.24 317.59L56.93 316.49L61.46 318.6L62.89 317.04L63.02 314.81L63.82 314.19L63.73 312.07L62.21 311.34L62.46 309.84L61.72 307.98L59.78 306.83L57.4 306.93L56.8 305.73L50.99 303.61L48.39 304.39L47.13 308.31L44.87 310.7L44.99 306.65L44.21 304.21L45.52 303.31L44.73 301.57L42.89 302.23L41.36 301.33L44.04 298.76L43.1 295.41L44.94 293.46L45.46 294.9L44.97 297.95L46.15 298.98L47.3 297.85L48.33 299.31L51.52 298.11L53.62 298.22L54.4 299.65L56.26 299.88L59.38 298.83L61.39 297.66L63.83 297.79L64.49 299.45L67.09 297.75L63.19 295.92L60.01 295.88L60.84 293.76L57.42 292.97L56.88 294.72L52.38 294.68L52.27 292.45L55.02 288.29L53.54 287.52L52.85 288.96L51.32 288.71L48.03 289.79L45.95 291.61L45.17 291.12L41.21 293.55L39.91 293.59L36.53 291.78L35.43 292.05L34.58 294.12L30.23 294.43L30.39 291.14L31 290.03L30.09 288.35L30.14 286.78L28.72 285.96L29.83 282.29L31.12 280.16L29.92 276.85L31.19 275.04L30.9 274.03L33.03 271.45L34.77 270.17L36.35 270.34L39.93 269.16L41.13 269.48L42.41 267.63L44.29 267.21L44.64 264.64L47.19 263.51L48.38 264.87L53.08 263.45L54.02 261.47L55.35 261.38L58.57 259.25L60.8 259.71L63.82 262L67.04 262.12L67.99 259.87L69.51 258.24L74.75 257.43L78.19 257.96L78.47 256.53L79.84 255.58L82.02 255.69L83.17 254.19L84.29 254.87L83.83 256.47L84.11 259.37L85.45 261.66L88.53 260.49L89.47 262.8L92.42 264.29L91.71 262.05L92.41 260.77L91.82 258.25L94.09 256.73L96.32 256.69L97.78 255.96L99.96 256.11L102.03 257.85L104.93 257.39L106.03 259.7L104.93 261.01ZM8.07 283.63L8 279.96L10.54 279.05L12.24 280.69L10.72 282.32L8.07 283.63ZM120.86 365.52L119.59 364.78L118.17 365.49L115.1 363.47L115.82 362.16L120.34 363.3L120.86 365.52ZM136.14 390.76L138.71 391.24L139.79 394.33L142.92 395.79L145.26 396.12L144.12 398.51L142.78 398.95L138.42 398.05L137.92 397.13L136 397.9L134.33 397.8L132.45 395.69L133.08 395L131.68 392.06L131.65 390.15L134.43 389.42L136.14 390.76Z",
  "c": [159.88, 309.14]
}, {
  "code": "24",
  "nom": "Centre-Val de Loire",
  "d": "M543.39 375.43L544.32 376.52L545.27 379.56L547.18 383.25L546.4 386.66L543.31 392.49L543.53 395.13L545.61 396.2L547.63 398.5L550.69 401.26L550.57 405L552.42 409.15L553.69 414.17L553.91 417.78L553.36 420.72L556.01 422.43L556.89 425L556.02 428.28L557.13 431.3L555.18 435.67L556.37 438.91L556.47 441.32L555.78 443.86L553.95 447.03L549.11 446.15L545.64 447.71L545.75 448.55L540.23 452.87L537.79 453.05L535.61 454.59L534.17 452.1L532.64 451.97L531.78 453.61L528.17 457.41L526.56 460.57L524.81 459.78L523.09 460.29L524.73 462.46L523.48 465.73L525.03 467.06L525.62 470.97L520.71 473.94L520.17 472.98L518.19 473.78L517.1 472.67L514.59 473.9L509.41 474.06L508.32 474.67L505.19 478.25L503.87 480.39L503.56 483.61L501.46 483.03L499.05 483.34L497.95 482.84L495.96 483.25L493.4 483.66L490.66 484.73L489.68 483.67L487.67 483.52L484.23 482.59L483.23 481.72L479.62 482.49L478.6 481.36L476.87 482.43L472.58 482.67L471.17 480.26L467.76 480.73L468.6 482.91L466.42 486.63L465.3 486.37L463.46 483.83L460.86 486.88L458.81 485.08L455.82 485.06L454.24 486.23L454.09 483.95L452.64 483.01L448.66 487.99L446.81 489.11L445.45 490.73L445.04 489.36L443.33 488.05L441.48 485.58L439.22 486.6L437.93 488.42L435.06 487.66L432.3 488.91L431.33 486.79L429.49 487.16L431.75 482.74L427.76 480.8L427.86 478.49L426.65 476.32L427.6 475.64L424.86 472.78L423.47 472.13L418.97 472.24L418.58 469.25L416.73 469.46L413.62 467.91L411.94 466.43L410.5 463.58L411.32 461.43L411.45 458.02L412.75 456.77L410.95 452.79L408.7 451.6L406.05 448.8L404.97 447.07L404.79 443.8L400.95 440.56L397.75 436.39L397.88 433.07L396.96 429.41L393.18 428.32L392.01 426.15L388.53 426.66L389.29 428.87L390.83 429.53L390.85 430.91L388.36 431.26L386.67 430.8L384.22 431.03L380.33 432.67L379.92 433.81L375.08 431.85L372.28 433.71L371.37 433L370.66 429.46L371.16 426.9L370.53 424.96L371.24 422.54L370.5 421.58L368.73 422.32L366.96 419.87L364.44 421.65L362.17 419.87L363.97 417.9L362.66 415.62L361.01 416.71L359.52 416.26L359.62 414.91L355.61 414.68L354.1 410.75L354.95 408.18L354.06 407.45L355.35 405.14L355.04 402.49L355.76 398.87L358.37 394.08L360.37 392.79L360.51 391.12L362.76 389.33L361.76 388.67L361.73 386.84L362.92 384.93L362.65 382.16L364.52 378.09L365.25 377.26L365.57 374.75L364.01 373.05L364.91 370.43L366.22 369.7L365.92 366.68L367.88 366.29L369.14 367.77L372.16 368.21L373.27 369.56L375.88 370.64L377.5 369.65L377.12 368.11L374.95 364.92L377.07 363.45L378.93 365.74L380.68 365.59L381.13 363.65L383.93 363.06L385.16 362.05L387.03 361.88L388.06 360.46L389.72 360.68L391.74 359.27L391.72 358.13L389.44 356.32L391.53 354.75L392.14 352.82L394.19 352.04L399.13 347.68L400.49 344.95L402.46 343.61L401.31 338.45L402.86 336.53L404.78 336.5L405.32 334.12L407.22 333.43L406.7 330.69L405.42 328.63L406.34 327.89L406.89 325.44L404 323.82L404.25 320.38L407.06 320.26L406.93 317.21L407.7 314.14L411.81 313.98L411.66 312.6L408.33 310.79L406.64 310.78L404.01 308.01L406.2 306.02L403.34 301.28L403.89 298.74L402.08 295.16L403.19 293.3L405.43 292.4L409.79 291.65L411.48 290.29L414.14 287.02L413.83 285.72L414.8 282.97L413.28 279.64L414.66 278.96L414.5 276.77L415.36 274.72L412.4 273.34L413.48 272.04L410.29 269.85L408.71 269.72L407.49 268.62L407.29 266.54L405.36 265.37L405.97 263.92L405.16 259.9L406.02 258.83L408.33 258.18L409.32 255.29L411.04 255.79L414.59 255.16L415 254.25L418.53 254.01L421.55 251.09L424.01 251.91L425.55 251.31L425.74 247.79L427.8 248.16L428.29 249.77L429.99 249.48L434.1 249.78L435.72 251.02L437.74 250L439.03 250.67L442.89 247.53L441.64 245.02L441.89 243.21L445.06 240.46L448.12 239.52L449.22 236.71L447.67 234.01L448.55 232.66L451.24 232.3L451.64 233.67L453.73 234.27L453.73 235.81L455.14 238.32L454.25 239.31L456.62 241.08L456.33 242.17L457.26 245.18L456.22 247.66L457.02 249.38L459.62 251.98L456.48 256.68L458.64 257.94L458.06 260.69L461.31 263.15L462.3 265.63L465.56 265.56L464.7 268.55L465.18 269.25L468.95 270.13L470.42 271.72L469.65 274.36L469.72 276.22L471.49 279.94L473.43 280.44L474.29 282.29L476.09 283.26L478.41 283.22L479.47 281.46L480.71 284.73L479.72 285.99L483.12 287.34L482.91 288.41L483.81 291.11L482.68 293.37L483.35 295.51L481.96 296.5L483.04 298.67L484.3 298.73L487.64 298.74L488.23 297.83L490.17 298.02L495.14 296.92L496.82 296.2L498.27 292.88L499.72 293.7L500.67 295.73L504.52 296.55L505.67 294.27L506.69 294.04L509.08 296.41L511.72 295.29L512.95 297.51L513.13 301.38L515.06 302.42L516.17 301.89L518.71 304.84L519.8 307.97L518.88 309.22L518.67 311.84L517.12 311.03L515.57 313.81L517.6 314.84L519.69 314.77L520.77 313.46L522.98 313.41L525.14 314.35L527.63 313.61L529.22 315.28L532.11 315.02L533.04 313.8L535.37 312.92L534.45 311.5L538.31 310.65L538.23 313.42L539.78 314.53L542.95 311.84L547.53 311.14L549.87 312.3L551.19 312.24L553.78 314.18L555.15 318.64L555.19 320.29L557.73 322.14L558.79 326.19L560.16 326.95L560.42 330.46L557.07 334.43L556.14 334.52L552.29 338.04L552.16 341.17L553.75 341.86L553.8 344.07L552.64 344.14L553.69 347.51L553.4 348.91L551.01 348.97L548.76 350.01L548.43 350.98L546.07 350.63L542.18 351.47L541.66 354.97L542.34 356.42L545.87 358.4L546.31 360.56L548.73 362.96L547.53 363.86L547.8 367.17L549.27 369.82L550.23 370.56L549.03 371.75L546.05 370.9L544.47 372.18L542.24 372.2L541.66 373.73L543.39 375.43Z",
  "c": [463.48, 378.03]
}, {
  "code": "94",
  "nom": "Corse",
  "d": "M981.43 910.5L981.7 913.77L980.89 915.88L981.82 918.84L981.27 925.42L979.42 926.68L980.4 928.36L979.27 930.48L978.24 930.1L977.04 931.82L973.76 932.94L974.28 935.25L975.8 933.33L977.43 934.28L978.94 934.08L977.32 937.41L974.75 938.63L973.49 940.89L972.96 943.04L973.61 944.39L971.63 946.71L969.47 947.87L969.63 950.16L971.23 950.92L969.07 954.52L966.51 954.62L965.66 952.97L964.44 953L962.72 951.9L960.64 951.8L961.44 949.4L960.97 947.76L959.43 947.84L957.1 945.53L955.96 945.97L953.96 944.03L951.72 943.43L949.2 943.32L948.72 942.08L946.7 942.27L946.24 940.59L944.55 939.73L943.68 938.6L942.41 938.63L941.05 936.28L939.4 934.5L940.33 933.24L940.59 931.1L942.48 931.06L944.42 929.59L945.68 929.62L946.45 927.64L948.79 926.43L948.7 925.7L943.79 925L941.87 923.51L939.24 923.7L939.94 921.61L939.17 921.04L935.75 922.6L933.37 920.46L935.19 919.31L936.34 917.87L934.93 915.84L937.03 915.73L939.07 914.78L939.97 913.04L940.37 909.8L939.63 908.25L941.19 907.64L939.7 904.56L937 904.9L935.48 906.08L932.38 906.34L930.38 905.88L928.5 906.66L928.97 904.39L927.44 901.97L928.59 900.34L930.69 900.63L932.01 899.68L931.38 896.91L933.66 895.26L934.45 895.34L937.08 894.05L936.94 892.09L935.64 892.01L935 889.09L933.19 888.02L931.51 888.14L930.75 886.8L929.19 886.62L926.09 883.6L926.94 882.93L926.13 880.7L926.35 879.12L924.98 876.32L928.65 874.77L933.58 873.9L933.64 872.57L931.62 870.38L930.12 870.43L929.27 869.49L929.49 867.08L928.59 866.09L926.95 865.84L925.05 867.62L924.36 866.3L925.81 863.21L928.19 862.75L928.16 859.99L929.17 859.61L931.3 860.09L932.62 854.58L931.93 853.06L931.99 851.18L934.1 850.09L935.01 850.26L935.68 847.35L938.09 845.99L938.36 847.09L940.15 847.14L941.29 846.06L941.62 843.4L946.05 842.11L946.49 840.64L947.89 840.84L948.95 839.95L950.53 840.2L955.14 839.63L958.59 837.37L958.05 836.02L960.19 832.85L962.8 831.3L965.72 830.87L967.73 831.91L969.25 830.94L974.12 836.53L976.09 834.36L976.08 832.65L977.6 830.84L977.09 828.25L977.27 824.99L975.35 822.33L976.72 818.62L976.06 815.93L977.77 814.7L978.52 811.78L977.31 807.24L978.53 806.11L982.2 806.13L985.55 807.98L984.76 810L985.72 812.14L985.91 815.43L986.8 819.15L987.39 825.51L986.12 827.74L984.38 836.6L986.31 841.05L988.99 844.7L989.82 846.4L990.32 850.33L989.98 853.38L990.77 856.43L990.9 858.93L990.17 862.99L990.52 866.64L992 872.29L991.52 876.47L991.95 879.98L991.79 884.9L991.35 888.34L990.02 889.96L985.78 896.6L984.07 898.68L982.21 901.75L982.35 904.25L981.08 909.06L981.43 910.5Z",
  "c": [961.66, 883.76]
}, {
  "code": "44",
  "nom": "Grand Est",
  "d": "M634.55 127.35L639.58 126.12L642.38 127.93L644.34 127.84L648.9 129.46L651.23 128.38L653.16 128.5L655.18 126.28L657.41 125L664.18 123.29L665.83 117.32L664.72 115.75L666.02 112.96L669.33 111.26L670.05 108.68L674.22 106.13L674.74 106.84L677.93 107.04L678.96 108.87L677.34 109.95L677.19 112.74L676.03 112.35L674.56 117.92L675.3 119.01L673.73 121.31L673.86 123.45L671.93 126.07L671.98 127.28L675.96 128.53L676.49 129.94L678.58 132.36L676.07 137.43L677.13 139.61L677.1 142.3L676.31 144.57L681.38 145.14L683.07 143.65L685.94 143.85L686.61 145.66L690.25 147.73L692.07 147.41L693.74 149.86L694.45 152.66L697.14 153.42L697.17 154.9L700.03 154.73L702.36 155.65L703.95 154.52L708.29 158.85L706.72 160.81L706.93 163.12L709.03 161.76L712.42 162.76L714.94 165.28L715.67 169.62L717.22 170.85L716.05 173.08L717.62 175.16L722.33 173.29L723.33 171.85L725.84 172.61L727.35 172.07L728.75 170.21L730.52 169.42L733.07 170.79L735.17 170.27L737.98 168.36L739.29 169.57L742.18 170.48L742.13 172.82L744.34 175L745.97 175.19L749.09 174.77L751.23 175.77L751.95 179.93L754.98 179.46L756.85 178.45L758.27 178.63L761.41 177.61L763.54 174.48L770.33 173.84L771.85 174.52L773.02 176.93L774.09 176.9L777.57 179.06L780.47 178.23L781.24 177.46L784.67 178.72L790.32 183.3L789.39 185.08L790.92 186.4L792.52 186.75L791.27 190.87L793.09 192.38L792.64 193.22L794.56 195.27L795.97 195.95L797.43 199.51L799.06 201.43L799.75 204.14L801.41 203.58L802.21 205.15L800.86 206.95L802.68 209.51L805.77 209.05L809.12 210.76L810.9 207.96L810.26 205.73L809.18 204.61L810.66 203.49L812.52 204.64L815.89 203.5L817.49 205.47L818.52 204.77L820.15 206.36L822.53 206.83L822.08 208.85L823.32 212.08L823.87 214.74L827.12 211.88L830.74 213.85L832.57 212.88L834.09 213.63L836.69 212.98L839.19 214.3L840.27 214.25L842.36 211.43L844.58 211.4L844.79 208.6L850.09 207.39L850.78 209.23L853.38 208.89L853.25 211.74L854.82 213.86L855.72 216.32L858.41 218.11L860.49 217.74L862.58 219.09L862.86 220.73L865.49 221.66L867.69 220.74L869.36 221.73L871.86 221.39L873.55 219.54L878.53 222.78L880.06 221.4L881.74 222.08L882.95 220.36L884.85 221.88L885.99 223.6L887.11 223.37L890.64 224.82L893.46 227.37L896.71 228.48L902.28 228.73L902.96 229.65L900.47 230.75L896.67 237.22L895.69 239.48L893.8 245.63L891.29 247.83L889.29 248.07L888.87 249.91L887.67 250.89L885.3 251.23L884.86 254.7L880.01 260.62L876.58 262.83L875.84 265.23L874.19 267.8L873.93 269.19L874.38 275.03L873.56 276.95L871.78 278.21L871.56 281.55L869.62 286.86L869.35 289.77L870.22 293.78L869.43 295.58L867.41 296.49L865.04 305.05L863.58 306.56L862.4 309.23L860.57 311.64L860.29 314.18L858.97 315.47L859.15 316.91L858.43 319.38L858.59 324.5L860.86 327.18L861.97 330.33L859.37 334.46L859.38 337.41L857.59 339.58L858.04 342.36L855.88 348.89L855.94 350.76L857.01 353.6L856.7 355.36L854.7 357.27L855.28 361.31L858.24 364.24L859.96 367.97L859.46 369.78L854.19 373.05L855.47 375.48L854.27 375.94L854.23 377.89L852.9 379.27L849.39 377.66L848.59 379.01L850.43 379.91L848.43 382.87L845.79 384.22L842.88 383.32L839.12 383.99L836.75 385.18L835.85 383.53L834.1 383.93L831.69 382.98L832.75 378.33L830.89 378.37L828.97 377.16L829.34 373.83L827.35 372.35L826.02 368.25L824.57 367.41L821.93 368.24L820.56 365.58L821.49 362.47L823.33 360.39L822 357.45L822.74 355.39L821.02 353.39L818.29 352.3L816.23 350.41L815.13 350.52L811 348.93L810.06 347.38L809.9 345.28L808.39 346.27L806.28 344.57L805.79 342.61L802.63 341.42L800.34 339.43L796.32 337.07L796.14 335.99L793.88 333.25L790.93 334.43L789.5 337.31L785.08 338.44L783.72 336.89L782.09 333.18L777.69 331.37L774.9 332.64L771.73 332.18L769.09 334.28L767.1 333.61L766.09 332.25L764.39 332.33L763.35 328.04L763.59 326.91L761.94 325.14L755.88 327.11L754.7 329.74L752.76 331.78L751.16 331.84L750.01 333.86L748.94 332.47L750.4 330.98L748.88 329.67L747.64 331L747.62 332.83L746.42 333.09L745.39 334.96L745.8 336.49L744.39 337.5L743.14 336.97L740.08 342.84L737.1 341.64L735.95 342.71L736.08 345.21L735.18 345.81L732.98 345.18L731.78 346.93L731.64 350.57L733.33 350.66L733.62 353.05L732.54 353.81L731.92 356.36L732.32 359.06L729.86 359.81L726.06 360.37L725.27 357.57L724.08 357.03L721.57 360.26L718.4 359.09L715.95 360.47L713.28 360.2L713.24 362.85L711.06 365.68L711.12 367.06L709.83 368.38L708.83 366.61L706.14 367.02L702.99 369.81L702.03 367.78L702.07 365.91L700.2 363.34L697.66 362.28L697.98 359.45L694.62 362.76L691.71 361.81L688.94 359.89L688.03 356.61L685.5 358.72L683.32 357.85L682.91 356.86L684.12 354.54L682.63 351.07L681.37 351.43L680.53 349.84L685.16 347.24L685.61 345.62L683.89 344.38L682.93 340.9L681.2 340.46L681.19 338.89L679.43 335.44L677.71 335.55L676.42 337.99L674.54 336.06L677.03 333.52L675.63 331.44L673.33 331.63L671.59 330.67L672.23 329.24L671.86 326.77L669.19 327.13L667.22 326.66L666.17 325.52L664.09 326.04L660.3 324.41L658.01 324.6L654.87 327.43L656.49 330.42L653.68 330.9L652.01 330.68L649.04 331.85L646.71 330.74L642.48 331.9L639.64 331.44L638.6 335L636.73 335.16L635.2 334.37L633.82 332.59L634.24 330.65L632.78 330.34L632.86 332.91L630.07 331.58L626.41 334.87L625.15 333.27L623.02 333.01L621.94 334.97L620.13 334.72L619.17 333.36L617.97 334.5L615.43 334.48L612.3 333.7L613.18 329.99L612.21 327.76L610.74 329.62L608.84 329.18L608.16 327.16L610.23 325.98L607.12 323.25L607.14 321.4L605.94 319.13L605.82 317.26L603.69 314.53L601.44 314.22L602.46 312.46L601.48 310.5L599.11 313.06L596.62 313.57L594.85 309.07L593.38 308.38L591.68 309.58L590.4 308.59L592.81 306.25L593.52 304.86L592.07 303.73L593.7 301.96L593.19 300.27L591.21 299.38L591.26 297.3L589.82 296.63L589.61 295.21L587.54 293.29L585.27 290.45L582.17 289.87L580.49 291.32L579.64 288.26L580.13 285.93L578.1 284.82L579.08 281.98L577.86 279.15L580.98 277.41L579.01 274.33L580.22 273.76L582.62 274.05L583.99 272.63L583.04 270.02L585.19 268.04L585.61 266.54L589.09 264.97L586.63 263.63L586.53 262.62L582.7 261.64L581.37 260.56L583.3 258.25L582.96 256.12L583.32 253.02L581.62 253.14L580.67 251.08L578.36 250.84L579.28 248.34L581.52 248.1L580.8 245.44L584.35 244.14L584.36 241.4L585.91 237.47L587.27 235.25L590.31 234.3L590.35 232.51L592.2 231.89L591.5 230.33L593.45 229.76L594.67 226.04L596.44 225.7L597.31 224.54L596.36 222.46L595.27 222.04L591.23 222.81L591.24 220.19L594.69 217.95L592.86 214.18L592.76 212.39L593.56 210.79L595.65 211.04L597.69 210.45L598.89 211.62L602.05 210.18L602.21 208.06L600.48 208.49L599.07 207.69L598.58 205.21L596.26 204.85L596.82 201.71L595.77 199.32L595.91 196.42L595.01 194.19L598.7 192.21L601.61 191.74L603.98 189.75L606.99 189.63L608.71 188.91L609.27 187.14L608.02 185.64L609.84 184.64L612.07 185.89L613.89 184.41L616.31 187.53L618.57 187.47L619.76 189.49L621.29 189.33L621.59 185.46L622.13 184.61L621.44 181.25L622.77 179.91L621.75 178.11L621.64 173.99L624.1 172.27L624.01 170.76L622.82 169.44L624.05 167.52L621.01 163.05L621.73 161.44L623.22 160.7L625.33 161.51L627.26 159.39L627.43 156.45L628.58 155.35L631.3 154.29L631.74 152.48L633.99 151.34L634.21 149.63L635.48 148.47L634.89 147.16L632.84 145.74L634.12 144.5L633.29 143.14L633.91 140.23L635.6 137.87L636.07 133.04L633.48 131.83L634.55 127.35Z",
  "c": [726.94, 257.15]
}, {
  "code": "32",
  "nom": "Hauts-de-France",
  "d": "M622.13 184.61L621.59 185.46L621.29 189.33L619.76 189.49L618.57 187.47L616.31 187.53L613.89 184.41L612.07 185.89L609.84 184.64L608.02 185.64L609.27 187.14L608.71 188.91L606.99 189.63L603.98 189.75L601.61 191.74L598.7 192.21L595.01 194.19L595.91 196.42L595.77 199.32L596.82 201.71L596.26 204.85L598.58 205.21L599.07 207.69L600.48 208.49L602.21 208.06L602.05 210.18L598.89 211.62L597.69 210.45L595.65 211.04L593.56 210.79L592.76 212.39L592.86 214.18L594.69 217.95L591.24 220.19L591.23 222.81L595.27 222.04L596.36 222.46L597.31 224.54L596.44 225.7L594.67 226.04L593.45 229.76L591.5 230.33L592.2 231.89L590.35 232.51L590.31 234.3L587.27 235.25L585.91 237.47L584.36 241.4L582.72 242.67L582.15 240.95L578.96 240.18L577.33 239.07L577.49 237.64L576.39 234.16L573.97 235.6L572.81 234.33L572.25 231.51L569.78 232.58L568.7 229.1L567.18 227.46L563.1 224.57L564 220.04L562.11 217.75L562.89 216.07L560.94 215.28L558.77 215.23L556.63 214.24L555.05 217.44L552.37 216.9L550.1 218.61L545.19 217.53L544.75 218.39L542.14 219.11L541.41 217.61L537.83 217.04L537.51 218.57L535.26 220.06L532.12 219.55L529.87 216.97L527.19 215.18L524.32 218.12L522.15 216.2L517.57 215.38L518.47 214.23L516.34 212.4L512.42 210.67L510.95 210.97L507.93 209.7L505.56 207.17L503.92 209.89L501.64 210.61L499.37 207.76L496.91 208.48L493.6 206.66L491.2 206.83L489.72 204.88L484.74 208.27L482.93 207.44L482.06 208.49L480.1 208.43L476.99 209.61L476.44 208.71L474.33 208.87L470.97 207.29L468.27 208.39L467.39 207.81L466.85 203.59L464.86 202.47L465.27 199.15L466.88 198.68L468.88 199.29L470.57 200.86L471.45 198.38L469.65 195.54L469.12 193.45L469.54 191.92L468.55 188.47L465.93 185.73L465.5 184.24L466.11 181.7L467.75 179.06L469.65 177.83L469.54 176.29L470.62 174.51L469.39 173.54L467.97 175.36L465.85 174.02L467.78 170.97L466.39 170.57L466.57 168.53L465.56 166.97L464.95 163.88L466.01 162.25L465.16 159.72L466.26 157L468.07 156.14L466.84 154.25L464.87 156.14L463.86 154.7L465.6 153.27L465.89 151L467.61 150.16L467.36 148.8L470.19 148.11L468.45 145.77L467.07 142.92L465.25 134.48L464.11 133.83L463.12 131.48L457.45 128.26L456.1 125.66L452.95 123.3L452.26 121.73L450.69 121.09L447.93 118.74L448.4 116.41L446.02 115.54L445.05 116.98L443.19 116.07L448.05 111.41L449.99 104.91L451.98 101.84L454.39 100.42L457.6 103.54L459.69 103.07L462.78 104.67L463.48 103.8L462.06 100.59L459.36 100.43L457.42 97.37L457.33 96.1L454.45 95.68L453.69 93.34L454.56 86.23L455.93 85.38L458.72 85.18L460.64 86.04L459.55 83.97L456.48 83.19L454.88 81.25L455.84 76.32L456.34 68.72L456.87 66.53L459.15 66.74L456.6 63.84L456.28 62.84L456.21 55.28L455.22 49.36L457.45 45.62L458.15 42.66L458.22 39.46L456.37 33.05L456.75 31.08L460.68 30.34L462.37 28.91L464.06 26.45L466.5 24.05L469.98 22.25L473.45 21.37L476.05 20.11L477.29 20.39L479.04 19.13L487.74 17.61L489.24 16.74L492.08 16.89L494.01 15.25L497.46 15.51L497.57 13.73L499.36 14L502.08 12.8L507.66 11.32L511.22 12.07L513.2 11.5L521.36 8L522.47 10.54L523.35 15.97L523.21 17.06L525.5 18.8L527.15 23.19L524.29 26.06L525.47 26.77L525.65 32.12L527.31 37.36L532.89 37.31L534.19 40.56L537.17 43.91L537.49 45.74L539.27 47.53L541.63 46.89L543.09 49.01L544.98 49.93L546.59 49.03L547.6 44.86L549.77 44.06L553.28 41.68L555.92 40.79L557.75 41.54L559.25 39.34L562 40.59L565.17 45.64L566.01 47.92L568.22 47.94L569.14 49.25L569.41 51.6L567.98 53.79L568.93 57.52L569.94 58.76L570.71 62.3L570.32 64.29L571.03 67.56L576.14 70.14L577.05 71.41L580.81 69.72L583.61 66.93L586.66 68.05L585.11 70.61L586.85 71L589.94 70.36L591.08 71.47L592.54 70.75L594.99 74.35L596.38 75.41L597.01 82.09L595.98 84.02L597.01 87.85L599.48 91.19L600.9 90.22L601.21 86.98L601.96 86.17L609.03 86.1L611.51 88.37L612.8 88.53L616.75 86.23L618.5 86.41L620.75 85.48L621.43 87.01L627.09 91.7L627.25 94.29L632.84 94.36L633.8 96.04L631.62 98.15L629.65 101.75L628.93 104.66L629.25 106.08L627.43 108.83L632.13 108.79L632.16 111.53L634.18 114.62L633.53 116.59L630.58 118.18L629.79 117.82L628.06 120.8L629.49 124.17L628.36 125.16L630.48 125.33L632.14 126.31L632.06 127.56L634.55 127.35L633.48 131.83L636.07 133.04L635.6 137.87L633.91 140.23L633.29 143.14L634.12 144.5L632.84 145.74L634.89 147.16L635.48 148.47L634.21 149.63L633.99 151.34L631.74 152.48L631.3 154.29L628.58 155.35L627.43 156.45L627.26 159.39L625.33 161.51L623.22 160.7L621.73 161.44L621.01 163.05L624.05 167.52L622.82 169.44L624.01 170.76L624.1 172.27L621.64 173.99L621.75 178.11L622.77 179.91L621.44 181.25L622.13 184.61Z",
  "c": [536.36, 125.31]
}, {
  "code": "11",
  "nom": "Île-de-France",
  "d": "M524.32 218.12L527.19 215.18L529.87 216.97L532.12 219.55L535.26 220.06L537.51 218.57L537.83 217.04L541.41 217.61L542.14 219.11L544.75 218.39L545.19 217.53L550.1 218.61L552.37 216.9L555.05 217.44L556.63 214.24L558.77 215.23L560.94 215.28L562.89 216.07L562.11 217.75L564 220.04L563.1 224.57L567.18 227.46L568.7 229.1L569.78 232.58L572.25 231.51L572.81 234.33L573.97 235.6L576.39 234.16L577.49 237.64L577.33 239.07L578.96 240.18L582.15 240.95L582.72 242.67L584.36 241.4L584.35 244.14L580.8 245.44L581.52 248.1L579.28 248.34L578.36 250.84L580.67 251.08L581.62 253.14L583.32 253.02L582.96 256.12L583.3 258.25L581.37 260.56L582.7 261.64L586.53 262.62L586.63 263.63L589.09 264.97L585.61 266.54L585.19 268.04L583.04 270.02L583.99 272.63L582.62 274.05L580.22 273.76L579.01 274.33L580.98 277.41L577.86 279.15L579.08 281.98L578.1 284.82L580.13 285.93L579.64 288.26L577.53 287.31L576.44 287.85L576.31 290.08L572.28 290.02L570.75 289.55L568.87 290.81L567.43 290.28L565.35 290.92L561.19 290.05L558.44 291.54L555.12 291.31L554.27 293.33L554.6 294.41L552.87 296.58L554.73 300.2L552.15 306.68L550.09 306.9L549.85 308.04L547.42 309.59L547.53 311.14L542.95 311.84L539.78 314.53L538.23 313.42L538.31 310.65L534.45 311.5L535.37 312.92L533.04 313.8L532.11 315.02L529.22 315.28L527.63 313.61L525.14 314.35L522.98 313.41L520.77 313.46L519.69 314.77L517.6 314.84L515.57 313.81L517.12 311.03L518.67 311.84L518.88 309.22L519.8 307.97L518.71 304.84L516.17 301.89L515.06 302.42L513.13 301.38L512.95 297.51L511.72 295.29L509.08 296.41L506.69 294.04L505.67 294.27L504.52 296.55L500.67 295.73L499.72 293.7L498.27 292.88L496.82 296.2L495.14 296.92L490.17 298.02L488.23 297.83L487.64 298.74L484.3 298.73L483.04 298.67L481.96 296.5L483.35 295.51L482.68 293.37L483.81 291.11L482.91 288.41L483.12 287.34L479.72 285.99L480.71 284.73L479.47 281.46L478.41 283.22L476.09 283.26L474.29 282.29L473.43 280.44L471.49 279.94L469.72 276.22L469.65 274.36L470.42 271.72L468.95 270.13L465.18 269.25L464.7 268.55L465.56 265.56L462.3 265.63L461.31 263.15L458.06 260.69L458.64 257.94L456.48 256.68L459.62 251.98L457.02 249.38L456.22 247.66L457.26 245.18L456.33 242.17L456.62 241.08L454.25 239.31L455.14 238.32L453.73 235.81L453.73 234.27L451.64 233.67L451.24 232.3L450.97 228.36L449.6 228.44L449.6 224.56L448.31 223.58L447.62 221.65L448.51 219.85L450.13 221L453.7 218.87L454.97 219.15L457.97 217.62L458.44 218.3L460.21 214.57L461.6 212.94L462.17 210.56L462.83 204.72L464.86 202.47L466.85 203.59L467.39 207.81L468.27 208.39L470.97 207.29L474.33 208.87L476.44 208.71L476.99 209.61L480.1 208.43L482.06 208.49L482.93 207.44L484.74 208.27L489.72 204.88L491.2 206.83L493.6 206.66L496.91 208.48L499.37 207.76L501.64 210.61L503.92 209.89L505.56 207.17L507.93 209.7L510.95 210.97L512.42 210.67L516.34 212.4L518.47 214.23L517.57 215.38L522.15 216.2L524.32 218.12Z",
  "c": [518.43, 255.73]
}, {
  "code": "28",
  "nom": "Normandie",
  "d": "M275.35 189.77L278.13 186.38L281.35 186.27L284.13 185.46L287.44 185.7L291.74 188.33L295.11 189.57L302.02 190.66L307 190.76L310.3 191.4L313.36 190.75L315.9 190.86L320.15 191.84L322.64 191.83L326.26 193.14L330.18 195.66L335.34 197.37L339.1 196.91L344.07 195.68L350.45 192.86L355.46 188.78L357.89 185.78L359.19 184.89L362.28 183.92L365.24 182.43L370.43 182.11L373.23 180.97L373.25 180.05L368.81 179.68L367.72 180.41L365.09 179.73L363.4 179.88L358.62 178.67L356.54 176.69L356.32 174.72L355.15 174.21L355.51 171.12L357.65 166.24L359.6 162.6L360.85 159.49L361.5 155.57L363.34 153.51L367.31 151.76L369.49 150.37L371.99 149.86L374.3 148.45L375 147.34L379.57 145.01L385.56 141.23L388.93 138.61L393.57 137.1L397.87 136.25L398.65 136.52L403.56 135.9L406.35 134.45L409.18 133.92L412.88 132.67L415.12 131.3L418.93 131.69L424.71 129.54L431.41 125.71L434.13 123.43L439.9 118.02L443.19 116.07L445.05 116.98L446.02 115.54L448.4 116.41L447.93 118.74L450.69 121.09L452.26 121.73L452.95 123.3L456.1 125.66L457.45 128.26L463.12 131.48L464.11 133.83L465.25 134.48L467.07 142.92L468.45 145.77L470.19 148.11L467.36 148.8L467.61 150.16L465.89 151L465.6 153.27L463.86 154.7L464.87 156.14L466.84 154.25L468.07 156.14L466.26 157L465.16 159.72L466.01 162.25L464.95 163.88L465.56 166.97L466.57 168.53L466.39 170.57L467.78 170.97L465.85 174.02L467.97 175.36L469.39 173.54L470.62 174.51L469.54 176.29L469.65 177.83L467.75 179.06L466.11 181.7L465.5 184.24L465.93 185.73L468.55 188.47L469.54 191.92L469.12 193.45L469.65 195.54L471.45 198.38L470.57 200.86L468.88 199.29L466.88 198.68L465.27 199.15L464.86 202.47L462.83 204.72L462.17 210.56L461.6 212.94L460.21 214.57L458.44 218.3L457.97 217.62L454.97 219.15L453.7 218.87L450.13 221L448.51 219.85L447.62 221.65L448.31 223.58L449.6 224.56L449.6 228.44L450.97 228.36L451.24 232.3L448.55 232.66L447.67 234.01L449.22 236.71L448.12 239.52L445.06 240.46L441.89 243.21L441.64 245.02L442.89 247.53L439.03 250.67L437.74 250L435.72 251.02L434.1 249.78L429.99 249.48L428.29 249.77L427.8 248.16L425.74 247.79L425.55 251.31L424.01 251.91L421.55 251.09L418.53 254.01L415 254.25L414.59 255.16L411.04 255.79L409.32 255.29L408.33 258.18L406.02 258.83L405.16 259.9L405.97 263.92L405.36 265.37L407.29 266.54L407.49 268.62L408.71 269.72L410.29 269.85L413.48 272.04L412.4 273.34L415.36 274.72L414.5 276.77L414.66 278.96L413.28 279.64L414.8 282.97L413.83 285.72L414.14 287.02L411.48 290.29L409.79 291.65L405.43 292.4L403.19 293.3L402.08 295.16L403.89 298.74L403.34 301.28L406.2 306.02L404.01 308.01L401.76 309.31L399.04 307.64L397.15 303.8L395.81 301.94L394.31 301.04L392.33 302.89L389.35 302.99L386.45 302.43L386.07 300.86L383.67 298.71L383.2 296.59L379.43 296.71L377.74 295.9L376.16 293.96L376.19 291.82L375.43 286.22L376.09 284.74L374.36 281.39L370.63 279.13L365.11 279.82L363.22 281.02L362.04 280.73L360.64 283.52L358.28 283.69L357.14 286.23L355.09 286.61L354.68 289L351.89 289.28L350.71 287.69L347.49 289.33L346.82 289.1L346.63 284.4L347 281.89L343.34 282.47L340.85 281.75L339.32 275.58L340.78 274.35L339.12 273.42L336.6 270.78L334.76 270.85L332.91 272.31L334.28 273.4L332.84 274.77L332.26 276.41L328.99 274.84L327.79 277.11L325.81 277.88L320.7 275.77L318.39 277L316.59 276.58L314.89 277.65L313.56 279.77L310.31 280.1L306.79 282.84L305.77 278.59L303.37 280.48L301.47 279.93L301.1 281.1L302.5 282.33L299.67 283.58L298.16 282.63L298.28 280.66L296.96 280.68L292.75 277.02L290.37 277.69L288.59 275.91L286.3 275.48L285.24 277.71L283.11 278.26L279.31 275.61L278.67 276.3L274.62 274.96L273.51 275.39L271.9 274.01L270.74 274.26L269.52 272.89L265.11 273.73L264.64 276.23L261.32 277.54L260.25 279.89L257.71 281.54L254.58 280.95L253.23 278.57L250.5 278.24L250.12 276.26L248.51 273.11L247.59 272.3L248.55 270.41L246.94 269.01L247.17 267.03L245.05 264.34L246.9 263.86L248.77 265.17L251.35 265.12L253.61 264.23L256.99 261.9L250.77 258.25L249.28 257.77L247.68 253.71L245.79 253.26L244.83 251.59L245.2 246.42L244.83 244.48L242.78 242.83L243.97 241.96L244.7 239.94L245.15 236.59L246.36 235.64L246.91 233.32L245.66 232.3L245.75 226.12L243.53 223.97L242.48 218.16L242.65 215.01L243.47 212.76L242.62 206.12L243.83 202.34L241.97 202.53L240.99 204.31L239.48 201.52L238.75 199.04L235.65 192.91L234.77 192.7L232.06 188.95L229.22 188.09L228.1 185.04L227.9 179.73L226.7 177.87L226.16 173.8L224.19 172.88L223.94 170.7L225.8 169.54L226.94 167.45L226.66 162.55L225.65 159.33L223.27 157.8L219.88 156.82L220.54 154.81L219.81 153.65L220.15 151.51L221.87 151.58L224.13 153.57L225.75 152.54L227.04 152.96L228.16 155.17L231.4 156.15L235.21 156.25L237.29 156.96L238.25 158.55L240.91 158.24L241.46 159.71L248.47 158.58L250.78 157.35L251.76 154.51L252.79 155.06L255.11 153.78L258.64 153.48L263.26 154.84L265.4 154.65L265.19 156.27L267.33 159.1L268.01 163.63L266.31 163.22L265.51 165.27L263.5 166.27L262.63 169.43L262.82 170.85L266.42 176.88L270.45 181.87L272.1 184.37L272.52 186.04L271.39 187.41L272.37 188.63L275.35 189.77Z",
  "c": [358, 213.48]
}, {
  "code": "75",
  "nom": "Nouvelle-Aquitaine",
  "d": "M445.45 490.73L446.81 489.11L448.66 487.99L452.64 483.01L454.09 483.95L454.24 486.23L455.82 485.06L458.81 485.08L460.86 486.88L463.46 483.83L465.3 486.37L466.42 486.63L468.6 482.91L467.76 480.73L471.17 480.26L472.58 482.67L476.87 482.43L478.6 481.36L479.62 482.49L483.23 481.72L484.23 482.59L487.67 483.52L489.68 483.67L490.66 484.73L493.4 483.66L495.96 483.25L497.95 482.84L499.05 483.34L501.46 483.03L503.56 483.61L503.81 486.93L506.39 488.85L505.01 490.03L506.37 492.47L508.51 492.82L509.56 494.09L510.99 492.41L512.91 494.33L512.97 496.81L514.43 495.8L516.96 497.16L516.71 498.29L517.7 500.38L519.31 501.44L520.13 506.35L522.26 507.6L522.64 510.54L521.64 512.87L521.75 516.4L523.06 519.7L525.13 521.14L524.58 525.4L525.68 527.16L522.92 528.36L521.71 530.05L520.12 534.1L517.73 537.5L516.28 536.7L513.32 540.32L511.63 540.05L510.73 541.03L513.38 544.21L513.92 546.84L515.21 547.43L517.72 549.66L519.66 552.63L520.03 554.68L519.09 556.19L519.92 557.39L519.43 559.08L517.13 559.11L516.8 562.12L515.83 563.38L517.64 566.68L519.34 567.35L519.38 570.18L518.81 574.52L518.7 575.9L517.41 580.29L519.97 582.55L519.81 583.52L517.29 584.04L514.65 583.63L513.06 582.29L511.42 582.01L510.08 580.66L508.49 581.9L509.48 583.32L509.18 586.05L508.27 586.94L508.22 588.95L506.02 589.39L503.98 592.86L502.75 592.59L502.05 594.42L500.72 595.36L498.43 598.42L497.45 600.63L498.65 605.04L498.63 606.49L496.89 607.52L497.32 608.92L496.22 612.38L494.1 611.91L491.08 614.8L492.53 618.12L494.13 619.57L493.62 621.5L490.99 621.52L488.92 622.35L487.74 621.67L483.47 622.7L480.72 624.38L480.61 622.66L478.53 622.17L477.06 624.29L473.37 625.29L472.88 626.98L470.41 626.55L469.57 627.38L468.18 625.72L467.96 624.4L465.3 623.23L464.74 621.28L462.65 619.72L461.27 617.75L459.6 616.91L456.26 616.26L454.63 617.42L453.87 615.75L450.05 617.19L449.55 618.37L447.67 618.29L445.05 619.55L446.69 625.98L445.14 628.76L447.11 630.65L447.1 631.98L444.76 633.17L444.56 634.39L441.84 635.21L442.02 637.98L439.61 638.45L437.7 639.36L437.47 641.17L439.25 642.37L438.8 644.71L436.34 647.03L434.25 647.79L432.66 650.01L428.92 650.41L427.43 651.32L427.91 654.29L424.01 658.87L422.63 660.09L422.4 660.98L419.59 662.48L416.41 663.09L418.68 666.82L418.2 669.25L419.13 669.68L419.02 672.59L419.6 673.61L421.45 674.17L421.66 676.43L421.04 677.51L421.89 678.79L420.93 680.28L417.33 679.71L416.29 680.67L414.24 680.55L412.22 678.26L410.76 678.52L410.03 679.93L410.62 681.82L408.84 685.27L410.55 686.46L411.98 685.95L412.49 687.21L414.27 688.5L412.16 691.94L412.84 692.69L411.23 695.77L408.17 696.2L407.76 697.87L409.02 698.53L410.11 700.32L408.78 702.41L405.54 700.83L403.84 700.61L403.92 703.46L401.08 704.41L400.04 707.19L400.27 708.13L397.98 708.8L396.63 709.93L395.92 711.7L392.87 709.59L392.62 708.55L390.9 707.33L389.17 707.19L388.4 708.68L386.62 709.27L383.08 708.74L381.32 709.06L380.17 711.53L376.95 712.35L376.09 713.62L374.48 712.68L370.59 714.89L366.27 713.42L365.56 712.42L363.2 712.85L361.67 714.51L361.45 716.46L359.74 716.37L359.94 714.71L355.59 715.78L354.19 718.13L355.25 720.43L355.35 722.25L354.22 723.75L352.55 723.48L349.23 720.61L350.77 719.49L350.58 717.95L348.06 715.73L347.36 717.85L345.63 719.2L342.12 719.4L339.32 720.92L338.68 720.15L337.06 722.15L334.75 723.63L337.43 725.25L337.16 727.03L337.57 731.89L335.24 732.07L336.66 737.48L337.46 738.69L335.14 740.7L333.93 741.14L334.44 742.69L333.31 744L334.4 744.8L334.17 746.35L331.55 747.41L331.85 749.9L333.89 749.92L334.19 752.79L336.35 752.03L336.74 752.92L338.88 751.99L339.72 753.2L342.32 752.68L343.99 753.03L344.52 755.37L346.16 756.48L347.79 759.5L347.17 761.36L348.2 762.98L346.07 764.04L345.81 766.86L347.61 768.94L348.22 766.91L349.37 765.84L351.13 767.85L350.22 770.51L350.13 772.33L352.46 774.88L351.18 776.8L348.81 776.41L347.39 779.05L347.5 780.49L349.34 781.86L347.41 785.39L345.62 786.1L345.93 790.45L342.58 790.16L342.01 792.24L340.68 794.95L339.02 796.31L337.67 796.52L337.88 799.08L337.12 800.81L337.03 802.81L335.42 803.63L333.04 803.22L332.71 805.81L331.21 806.18L330.87 807.54L331.59 812.82L328.53 814.38L329.88 818.65L329.45 820.53L328.91 821.65L327.16 821.76L325.79 823.78L324.14 825.09L323.02 824.34L320.67 825.37L316.28 822.73L315.26 823.98L315.39 825.14L313.99 825.67L313.49 827.11L312.19 826.61L312.31 824.43L310.71 824.75L309.98 822.07L306.94 820L304.94 817.33L303.58 817.76L301.81 816.69L301.16 814.78L301.83 813.79L300.04 809.76L297.62 810.01L296.13 811.18L292.43 811.24L290.11 810.22L286.97 810.94L283.34 808.75L282.94 807.74L277.8 806.57L275.79 804.67L274.42 805.78L272.18 803.46L271.25 803.74L268.03 801.66L266.79 802.83L265.64 802.64L264.35 801.1L262.67 800.42L263.33 798.16L264.57 795.87L261.77 796.41L260.15 798.36L260.5 799.37L259.57 804.12L253.77 802.48L251.72 799.28L251.78 798.31L255.5 795.02L255.46 792.97L256.3 792.05L256.4 790.38L257.58 789.15L257.7 783.46L255.65 781.58L253.93 782.22L250.13 780.73L249.47 779.8L245.48 780.25L245.92 781.26L244.61 783.68L242.53 783.57L241.08 780.57L241.6 779.08L238.61 777.8L236.8 778L234.41 779.53L232.53 775.07L230.56 774.4L230.43 772.3L232.24 772.13L240.49 769.13L243.02 766.83L245.6 762.07L246.6 761.03L248.16 757.91L250.37 753.97L252.51 749.52L253.69 745.43L254.08 741.15L255.85 732.54L258.19 722.39L260.72 709.16L262.17 702.07L264.75 684.35L266.34 670.42L266.48 665.97L266.02 662.93L268.12 660.24L269.72 655.81L269.68 654.18L270.52 652.23L272.52 651.98L273.93 653.5L277.96 654.13L278.95 653.53L282.25 653.3L281.71 650.79L279.62 647.77L276.22 644.49L275.51 644.36L272.25 641.41L271.3 643.03L271.71 644.24L268.57 647.63L267.42 650.36L266.86 654.01L265.79 654.92L266.48 647.39L268.31 633.98L269.68 621.09L270.61 609.9L272.48 591.78L272.72 586.08L272.6 581.01L273.24 578.05L272.84 575.3L274.22 571.41L276.65 568.47L277.26 566.49L279.29 566.75L280.7 568.99L280.73 571.33L283.02 573.15L285.11 575.97L287.81 577.87L290.25 580.7L294.24 584.13L296.54 586.96L298.97 592.56L300.08 596.53L300.72 602.11L304.67 612.65L306.65 615.38L309.65 618.66L310.85 616.14L307.81 613.07L306.72 609.9L305.67 608.09L305.53 604.03L304.3 599.26L303.26 593.14L302.25 588.96L301.2 585.01L299.74 581.45L296.68 576.34L293.61 572.58L287.92 567.88L285.87 567.02L283.85 565.07L283.8 563.11L282.73 561.78L280.1 560.93L278.05 559.15L275.6 558.37L272.82 555.99L269.33 553.6L267.46 552.71L267.1 545.44L269.35 544.07L270.49 544.69L274.51 543.19L272.86 539.52L273.1 537.66L274.98 538.15L276.61 536.71L278.43 532.66L278.22 530.49L279.06 529.22L276.74 525.3L279.14 524.92L279.84 523.3L278.95 519.56L277.42 519.16L276.62 515.31L275.66 514.48L274.71 512.1L271.77 510.91L271.41 509.56L269.49 510.28L268.35 508.32L270 505.57L270.02 503.74L271.88 502.69L273.79 500.76L273.96 499.78L275.92 499.07L274.69 494.32L277.96 493.24L279.85 491.18L282.45 489.91L284.89 490.35L285.76 488.96L287.95 488.92L287.12 491.82L285.94 493.07L287.75 494.07L289.77 493.98L290.91 492.76L293.38 493.65L294.12 491.4L296.19 491.58L296.63 492.87L300.12 494.9L302.04 495.09L302.16 493.87L303.69 492.88L305.37 493.74L306.98 493.65L307.76 491.67L309.89 490.74L310 489.34L312.78 489.51L314.39 486.91L312.5 486.27L309.54 484.26L308.82 486.52L307.49 484.02L307.75 482.45L308.96 481.81L309.15 479.6L308.54 476.1L307.19 475.02L308.57 472.96L310.08 472.61L309.77 469.78L308.57 468.31L309.42 467.24L308.41 465.55L309.27 464.11L307.93 462.45L307.7 460.01L304.8 457.61L306.45 456.25L305.6 454.64L303.5 452.82L301.68 449.7L302.92 444.46L301.3 444.42L298.03 442.33L295.77 438.74L294.64 438.23L295.65 436.33L294.84 433.44L293.31 432.15L291.9 432.36L290.63 429.27L293.05 428.94L297.63 426.38L299.35 427.66L300.6 426.82L302.46 428.31L305.13 426.72L307.28 427.52L309.17 427.58L312.54 424.97L313.2 422.6L312.94 420.79L317.24 418.77L319.43 418.82L319.33 420.23L321.73 419.73L323.59 419.92L324.75 418.25L326.46 417.66L327.57 418.29L331.16 416.9L334.27 416.47L336.89 417.45L338.08 416.22L340.28 416.95L338.51 420.02L340.57 420.01L341.87 421.53L343.63 420.51L343.9 417.89L344.72 416.94L347.52 417.7L348.07 414.56L349.76 411.37L351.76 409.56L352.94 411.08L354.1 410.75L355.61 414.68L359.62 414.91L359.52 416.26L361.01 416.71L362.66 415.62L363.97 417.9L362.17 419.87L364.44 421.65L366.96 419.87L368.73 422.32L370.5 421.58L371.24 422.54L370.53 424.96L371.16 426.9L370.66 429.46L371.37 433L372.28 433.71L375.08 431.85L379.92 433.81L380.33 432.67L384.22 431.03L386.67 430.8L388.36 431.26L390.85 430.91L390.83 429.53L389.29 428.87L388.53 426.66L392.01 426.15L393.18 428.32L396.96 429.41L397.88 433.07L397.75 436.39L400.95 440.56L404.79 443.8L404.97 447.07L406.05 448.8L408.7 451.6L410.95 452.79L412.75 456.77L411.45 458.02L411.32 461.43L410.5 463.58L411.94 466.43L413.62 467.91L416.73 469.46L418.58 469.25L418.97 472.24L423.47 472.13L424.86 472.78L427.6 475.64L426.65 476.32L427.86 478.49L427.76 480.8L431.75 482.74L429.49 487.16L431.33 486.79L432.3 488.91L435.06 487.66L437.93 488.42L439.22 486.6L441.48 485.58L443.33 488.05L445.04 489.36L445.45 490.73ZM343.55 773.73L344.43 773.7L344.63 776.01L342.73 776.15L343.08 777.94L345.45 778.48L346.29 774.82L344.9 772.55L343.55 773.73ZM343.57 784.4L345.13 782.6L344.03 780.47L344.31 779.09L342.98 778.17L341.27 780.45L341.05 781.72L342.3 784.35L343.57 784.4ZM251.11 504.05L252.99 502.25L254.87 502.09L254.57 504.45L256.25 504.72L258.96 504.3L261.81 506.26L263.84 506.36L264.97 508.88L264.84 510.13L262.93 510.56L259.56 509.3L257.1 507.24L252.4 504.82L249.43 505.6L247.65 504.8L245.7 501.42L248.97 499.38L250.54 499.85L251.53 501.8L248.97 502.86L251.11 504.05ZM266.58 539.24L265.52 536.13L263.69 534.04L259.83 531.61L257.29 528.5L256.82 526.62L257.4 524.65L255.63 519.85L258.39 520.56L258.41 521.27L262.8 525.24L266.74 525.3L267.54 526.16L267.13 528.49L267.96 529.76L267.69 531.42L268.37 532.77L270.73 535.31L269.44 538.82L270.25 540.8L267.82 543.49L266.89 541.61L266.58 539.24Z",
  "c": [365.51, 598.28]
}, {
  "code": "76",
  "nom": "Occitanie",
  "d": "M470.34 845.72L469.47 845.07L466.3 844.19L467.11 842.28L463.46 841.04L462.02 841.54L460.35 840.55L458.28 840.81L456.89 840.25L455.33 838.43L454.45 838.22L451.24 839.19L449.81 838.62L449.09 840.71L449.62 841.95L448.17 843.12L447.13 842.99L445.79 840.93L445.37 838.31L443.61 836.84L443.73 835.55L441.37 834.23L441.61 832.77L439.4 832L436.23 832.92L434.54 832.76L432.91 831.68L432.16 832.32L428.45 833.18L426.54 831.54L426.18 829.13L424.77 827.58L422.33 826.65L416.46 826.23L414.9 824.53L412.46 825.93L408.08 822.7L404.27 821.35L403.26 821.76L399.99 820.59L398.02 819.43L394.71 821.52L395.44 822.82L395.48 824.61L393.74 826.6L394.12 828.33L396.27 833.37L395.48 835.11L391.26 834.27L389.86 834.64L386.02 833.94L385.28 834.93L382.54 834.19L379.72 835.07L377.47 834.51L376.83 832.99L374.62 832.05L372.38 833.71L372.01 835.73L370.13 836.48L368.32 834.57L367.94 832.77L365.7 832.6L364.31 831.51L362.28 830.83L361.25 831.96L359.65 832.15L357.95 833.26L356.55 832.62L353.57 834.48L352.13 833.96L349.77 835.61L346.47 834.79L345.86 832.55L343.61 832.22L339.76 825.29L338.51 826.39L334.48 824.3L331.92 821.8L329.45 820.53L329.88 818.65L328.53 814.38L331.59 812.82L330.87 807.54L331.21 806.18L332.71 805.81L333.04 803.22L335.42 803.63L337.03 802.81L337.12 800.81L337.88 799.08L337.67 796.52L339.02 796.31L340.68 794.95L342.01 792.24L342.58 790.16L345.93 790.45L345.62 786.1L347.41 785.39L349.34 781.86L347.5 780.49L347.39 779.05L348.81 776.41L351.18 776.8L352.46 774.88L350.13 772.33L350.22 770.51L351.13 767.85L349.37 765.84L348.22 766.91L347.61 768.94L345.81 766.86L346.07 764.04L348.2 762.98L347.17 761.36L347.79 759.5L346.16 756.48L344.52 755.37L343.99 753.03L342.32 752.68L339.72 753.2L338.88 751.99L336.74 752.92L336.35 752.03L334.19 752.79L333.89 749.92L331.85 749.9L331.55 747.41L334.17 746.35L334.4 744.8L333.31 744L334.44 742.69L333.93 741.14L335.14 740.7L337.46 738.69L336.66 737.48L335.24 732.07L337.57 731.89L337.16 727.03L337.43 725.25L334.75 723.63L337.06 722.15L338.68 720.15L339.32 720.92L342.12 719.4L345.63 719.2L347.36 717.85L348.06 715.73L350.58 717.95L350.77 719.49L349.23 720.61L352.55 723.48L354.22 723.75L355.35 722.25L355.25 720.43L354.19 718.13L355.59 715.78L359.94 714.71L359.74 716.37L361.45 716.46L361.67 714.51L363.2 712.85L365.56 712.42L366.27 713.42L370.59 714.89L374.48 712.68L376.09 713.62L376.95 712.35L380.17 711.53L381.32 709.06L383.08 708.74L386.62 709.27L388.4 708.68L389.17 707.19L390.9 707.33L392.62 708.55L392.87 709.59L395.92 711.7L396.63 709.93L397.98 708.8L400.27 708.13L400.04 707.19L401.08 704.41L403.92 703.46L403.84 700.61L405.54 700.83L408.78 702.41L410.11 700.32L409.02 698.53L407.76 697.87L408.17 696.2L411.23 695.77L412.84 692.69L412.16 691.94L414.27 688.5L412.49 687.21L411.98 685.95L410.55 686.46L408.84 685.27L410.62 681.82L410.03 679.93L410.76 678.52L412.22 678.26L414.24 680.55L416.29 680.67L417.33 679.71L420.93 680.28L421.89 678.79L421.04 677.51L421.66 676.43L421.45 674.17L419.6 673.61L419.02 672.59L419.13 669.68L418.2 669.25L418.68 666.82L416.41 663.09L419.59 662.48L422.4 660.98L422.63 660.09L424.01 658.87L427.91 654.29L427.43 651.32L428.92 650.41L432.66 650.01L434.25 647.79L436.34 647.03L438.8 644.71L439.25 642.37L437.47 641.17L437.7 639.36L439.61 638.45L442.02 637.98L441.84 635.21L444.56 634.39L444.76 633.17L447.1 631.98L447.11 630.65L445.14 628.76L446.69 625.98L445.05 619.55L447.67 618.29L449.55 618.37L450.05 617.19L453.87 615.75L454.63 617.42L456.26 616.26L459.6 616.91L461.27 617.75L462.65 619.72L464.74 621.28L465.3 623.23L467.96 624.4L468.18 625.72L469.57 627.38L470.41 626.55L472.88 626.98L473.37 625.29L477.06 624.29L478.53 622.17L480.61 622.66L480.72 624.38L483.47 622.7L487.74 621.67L488.92 622.35L490.08 624.48L489.97 626.53L491.95 628.6L490.5 629.5L490.96 632.17L494.08 636.82L495.89 637.96L495.9 641.61L495 643.5L494.58 646.55L494.94 648.54L496.72 650.93L495.77 652L496.06 654.36L498.62 656.49L498.68 653.82L500.04 652.76L501.53 653.06L504.23 651.67L506.63 651.38L507.03 653.18L509.26 654.06L510.33 653.16L513.89 654.29L515.04 653.41L517.12 653.21L518.31 649.43L522.15 646.3L521.91 644.78L522.63 641.13L524.92 639.75L524.75 637.19L525.74 636.17L525.14 634.99L526.57 632.74L528.25 632.47L528.84 630.89L530.42 628.91L532.1 628.92L532.77 626.85L533.75 626.12L535.46 626.54L536.61 628.18L536.93 630.77L536.55 633.82L538.51 632.1L539.29 632.5L542.39 632.02L542.09 634.22L543.11 636.29L543.72 638.79L544.65 640.36L546.45 639.61L547.41 641.04L546.49 642.31L547.43 644.36L546.77 645.96L547.97 650.7L549.99 653.64L550.57 653.74L552.88 647.23L553.72 645.69L553.89 643.85L555.02 642.34L555.03 638.67L556.6 635.84L558.48 635.89L558.09 633.99L558.88 630.86L561.27 629.29L562.94 632.04L564.04 633.04L566.29 631.97L567.68 630.74L567.18 628.73L568.56 628.07L568.16 626.43L571 627.11L571.86 625.95L574.48 624.31L576.05 622.84L577.73 624.61L578.95 624.26L579.71 626.9L579.34 627.92L581.04 631.48L581.45 633.94L582.59 635.29L583.9 638.16L585.73 636.82L588.02 636.41L591.32 636.57L591.93 633.44L591.69 631.93L593.84 631.48L595.75 632.05L596.88 634.97L596.7 636.34L600.31 636.14L601.76 635.5L602.31 637.09L605.66 640.76L608.36 642.13L607.94 644L609.68 644.38L610.18 650.51L611.84 653.13L611.78 656.27L612.75 657.33L613.78 660.6L615.47 660.51L617.68 665.95L618.08 669.93L618.78 671.15L621.43 672.47L622.12 675.07L623.5 676.29L622.46 678.77L622.49 682.47L621.38 683.27L622.36 684.53L623.71 683.59L627.41 682.62L628.5 684.9L630.84 684.48L631.44 686.18L633.35 687.03L635.1 688.96L636.28 689.46L637.53 688.52L638.33 686.79L638.26 684.78L640.5 683.91L641.46 682.45L643.52 682.45L644.85 681.78L645.97 682.98L645.13 685.87L645.68 687.19L647.95 687.37L649 686.47L649.18 682.91L649.62 682.25L652.68 682.47L655.45 684.21L656.28 685.77L659.63 687.05L660.39 688.17L661.73 687.75L662.48 688.93L662.8 690.43L664.19 691.91L664.32 694.35L666.32 694.17L666.27 696.2L667.36 696.7L666.38 704.53L667.9 706.83L669.76 707L671.79 708.14L671.86 709.34L675.12 712.82L675.42 715.47L673.67 715.26L673.6 717.23L671.19 720L668.5 721.29L667.45 722.98L665.43 724.93L661.98 726.56L663.62 728.67L662.02 729.91L662.85 732.62L662.61 734.49L661.18 736.31L660.09 739.36L660.05 740.8L661.03 743.01L658.7 743.29L657.96 742.47L654.94 741.43L651.6 742.2L650.82 744.81L649.39 745.23L647.57 749.49L648.42 750.41L650.8 750.63L649.12 752.93L647.46 752.77L646.38 755L642.64 756.28L638.76 759.32L634.99 760.74L634.36 764.34L630.02 763.26L627.44 761.64L626.75 759.83L628.23 757.69L625.69 755.63L622.68 755.34L619.66 755.81L616.8 756.96L612.68 759.1L608.92 761.91L605.26 766.11L600.45 768.45L600.5 769.8L598.3 770.56L596.24 770.62L592.24 774.02L589.26 777.39L586.01 781.72L583.16 781.27L580.68 780.04L577.77 780.6L574.88 781.86L569.48 785.69L567.95 787.17L563.7 791.53L561.25 794.9L558.03 800.38L556.77 803.23L554.68 810.38L554.52 813.17L555.87 814.33L554.72 821.56L554.44 825.07L554.4 831.34L554.18 836.17L554.29 840.93L554.83 843.81L555.13 847.86L555.64 849.03L557.63 850.23L558.89 850.09L561.07 851.07L560.05 851.96L560.73 854.13L562.07 854.44L562.36 856.11L563.49 858.28L559.91 858.06L557.54 859.2L555.09 856.47L554.54 854.87L552.65 855.47L551.06 854.8L549.72 855.53L548.25 854.08L546.73 856.21L542.64 855.73L541.16 856.19L539.38 857.99L538.33 859.83L536.5 860.39L535.24 859.21L532.76 859.62L529.91 861.1L528.69 862.57L529.78 866.86L525.72 866.35L523.47 865.34L521.91 865.7L520.94 867.53L518.27 866.7L517.11 867L516.07 865.25L513.78 863.6L513.92 862.53L508.13 860.9L505.29 858.9L504.32 859.43L501.92 858.02L501.25 858.83L498.19 860.03L495.19 859.39L493.34 860.38L492.42 863.15L490.7 863.9L490.31 864.9L486.27 865.58L483.75 864.96L482.05 862.25L481.9 859.33L480.79 858.82L480.35 856.64L479.1 857.31L477.01 857.03L476.74 856.09L474.62 855.4L474.18 854.5L471.48 853.37L468.81 853.62L466.66 853.08L466.33 850.84L466.98 847.82L468.24 846.51L470.34 845.72ZM482.02 855.11L482 856.67L483.44 857.2L485.55 857.12L483.79 854.63L482.02 855.11ZM343.57 784.4L342.3 784.35L341.05 781.72L341.27 780.45L342.98 778.17L344.31 779.09L344.03 780.47L345.13 782.6L343.57 784.4ZM343.55 773.73L344.9 772.55L346.29 774.82L345.45 778.48L343.08 777.94L342.73 776.15L344.63 776.01L344.43 773.7L343.55 773.73Z",
  "c": [494.69, 740.98]
}, {
  "code": "52",
  "nom": "Pays de la Loire",
  "d": "M185.5 382.61L185.84 381.22L187.88 379.73L189.43 381.83L191.38 381.09L192.46 381.93L195.28 380.98L195.26 378.86L196.2 377.41L198.73 376.1L199.88 378.09L203.47 376.26L203.97 378.28L205.92 377.82L205.8 375.27L209.66 374.08L209.79 370.26L209.31 368.57L210.44 367.24L210.57 365.4L209.76 364.39L211.26 362.37L212.87 362.42L213.87 360.69L215.64 360.41L218.35 358.71L219.31 360.37L220.55 358.88L225.4 356.86L228.18 356.93L231.54 357.71L232.91 356.81L234.81 357.68L237 356.27L239.38 356.5L240.55 355.33L240.73 353.3L242.02 351.15L243.56 349.96L247.94 348.99L249.54 347.48L252.06 346.82L251.48 345.03L252.16 344.11L255.34 344.82L257.18 344.75L259.18 347.73L262 348.34L266.88 349.9L267.39 346.57L268.88 344.46L269.02 343.14L270.68 340.82L270.18 338.65L271.55 337.83L272.67 333.64L273.04 330.98L274.92 330.23L276.49 328.65L278.61 329.38L281.95 328.06L282.16 326.32L281.05 324.18L281.81 320.64L280.05 318.54L279.33 312.48L278.04 309.12L278.43 307.38L276.57 301.23L277.87 297.54L280.36 294.58L279.04 290.49L279.76 288.9L278.2 286.1L277.81 283.89L278.96 282.1L278.3 277.22L278.67 276.3L279.31 275.61L283.11 278.26L285.24 277.71L286.3 275.48L288.59 275.91L290.37 277.69L292.75 277.02L296.96 280.68L298.28 280.66L298.16 282.63L299.67 283.58L302.5 282.33L301.1 281.1L301.47 279.93L303.37 280.48L305.77 278.59L306.79 282.84L310.31 280.1L313.56 279.77L314.89 277.65L316.59 276.58L318.39 277L320.7 275.77L325.81 277.88L327.79 277.11L328.99 274.84L332.26 276.41L332.84 274.77L334.28 273.4L332.91 272.31L334.76 270.85L336.6 270.78L339.12 273.42L340.78 274.35L339.32 275.58L340.85 281.75L343.34 282.47L347 281.89L346.63 284.4L346.82 289.1L347.49 289.33L350.71 287.69L351.89 289.28L354.68 289L355.09 286.61L357.14 286.23L358.28 283.69L360.64 283.52L362.04 280.73L363.22 281.02L365.11 279.82L370.63 279.13L374.36 281.39L376.09 284.74L375.43 286.22L376.19 291.82L376.16 293.96L377.74 295.9L379.43 296.71L383.2 296.59L383.67 298.71L386.07 300.86L386.45 302.43L389.35 302.99L392.33 302.89L394.31 301.04L395.81 301.94L397.15 303.8L399.04 307.64L401.76 309.31L404.01 308.01L406.64 310.78L408.33 310.79L411.66 312.6L411.81 313.98L407.7 314.14L406.93 317.21L407.06 320.26L404.25 320.38L404 323.82L406.89 325.44L406.34 327.89L405.42 328.63L406.7 330.69L407.22 333.43L405.32 334.12L404.78 336.5L402.86 336.53L401.31 338.45L402.46 343.61L400.49 344.95L399.13 347.68L394.19 352.04L392.14 352.82L391.53 354.75L389.44 356.32L391.72 358.13L391.74 359.27L389.72 360.68L388.06 360.46L387.03 361.88L385.16 362.05L383.93 363.06L381.13 363.65L380.68 365.59L378.93 365.74L377.07 363.45L374.95 364.92L377.12 368.11L377.5 369.65L375.88 370.64L373.27 369.56L372.16 368.21L369.14 367.77L367.88 366.29L365.92 366.68L366.22 369.7L364.91 370.43L364.01 373.05L365.57 374.75L365.25 377.26L364.52 378.09L362.65 382.16L362.92 384.93L361.73 386.84L361.76 388.67L362.76 389.33L360.51 391.12L360.37 392.79L358.37 394.08L355.76 398.87L355.04 402.49L355.35 405.14L354.06 407.45L354.95 408.18L354.1 410.75L352.94 411.08L351.76 409.56L349.76 411.37L348.07 414.56L347.52 417.7L344.72 416.94L343.9 417.89L343.63 420.51L341.87 421.53L340.57 420.01L338.51 420.02L340.28 416.95L338.08 416.22L336.89 417.45L334.27 416.47L331.16 416.9L327.57 418.29L326.46 417.66L324.75 418.25L323.59 419.92L321.73 419.73L319.33 420.23L319.43 418.82L317.24 418.77L312.94 420.79L313.2 422.6L312.54 424.97L309.17 427.58L307.28 427.52L305.13 426.72L302.46 428.31L300.6 426.82L299.35 427.66L297.63 426.38L293.05 428.94L290.63 429.27L291.9 432.36L293.31 432.15L294.84 433.44L295.65 436.33L294.64 438.23L295.77 438.74L298.03 442.33L301.3 444.42L302.92 444.46L301.68 449.7L303.5 452.82L305.6 454.64L306.45 456.25L304.8 457.61L307.7 460.01L307.93 462.45L309.27 464.11L308.41 465.55L309.42 467.24L308.57 468.31L309.77 469.78L310.08 472.61L308.57 472.96L307.19 475.02L308.54 476.1L309.15 479.6L308.96 481.81L307.75 482.45L307.49 484.02L308.82 486.52L309.54 484.26L312.5 486.27L314.39 486.91L312.78 489.51L310 489.34L309.89 490.74L307.76 491.67L306.98 493.65L305.37 493.74L303.69 492.88L302.16 493.87L302.04 495.09L300.12 494.9L296.63 492.87L296.19 491.58L294.12 491.4L293.38 493.65L290.91 492.76L289.77 493.98L287.75 494.07L285.94 493.07L287.12 491.82L287.95 488.92L285.76 488.96L284.89 490.35L282.45 489.91L279.85 491.18L277.96 493.24L274.69 494.32L272.16 493.41L269.81 493.76L270.26 495.27L269.53 496.4L269.46 498.56L264.47 494.35L260.26 491.24L258.77 490.59L256.47 491.38L254.63 490.74L252.11 491.2L250.64 487.41L249.68 485.85L247.54 484.73L246.53 485.06L242.35 484.29L235.85 480.64L232.65 478.31L231.23 476.56L228.77 476.31L228.26 473.54L225.93 465.26L223.61 462.71L220.24 457.2L218.59 457.11L217.43 454.33L211.44 448.21L206.81 444.79L205.87 437.73L208.07 437.57L209.33 434.66L212.36 431.71L214.3 426.04L217.59 424.04L215.95 420.84L214.08 419.65L212.68 417.62L208.61 416.06L205.83 415.77L204.35 414.86L201.88 414.68L201.05 413.99L201.1 411.88L205.06 410.51L205.64 406.28L204.15 403.91L204.83 403.24L204.86 400.4L203.7 399.2L199.8 401.64L198.16 403.26L196.03 403.57L193.48 401.72L191.46 399.52L189.54 399.12L186.61 401.18L185.7 400.44L181.78 398.81L182.52 394.44L181.3 391.46L178.76 389.9L180.43 389.07L183.8 386.15L186.02 384.87L185.5 382.61ZM195.82 455.4L193.75 457.49L191.75 456.8L189.91 455.2L189.5 453.77L191.34 453.15L194.91 454.46L195.82 455.4ZM202.98 431.69L201.3 430.3L198.53 430.73L196.07 427.96L196.64 425.65L197.71 424.04L199.45 424.2L201.58 426.05L201.09 429.23L205.72 431.8L206.38 433.36L206.31 435.44L205 435.89L204.48 433.84L202.98 431.69Z",
  "c": [296.16, 378.63]
}, {
  "code": "93",
  "nom": "Provence-Alpes-Côte d'Azur",
  "d": "M816.76 652.78L817.7 655.45L816.76 656.31L815.71 658.64L815.66 660.52L814.4 661.83L811.91 662.65L810.43 664.63L811.21 667.84L812.31 669.51L813.94 670.49L814.26 671.85L816.01 673.12L816 673.98L813.04 674.82L813.28 679.18L812.67 680.43L815.03 681.4L815.29 682.9L817.58 685.14L817.26 686.43L819.79 687.95L820.03 690.65L820.77 692.11L822.83 693.3L824.94 692.43L827.76 693.9L829.69 695.43L830.95 694.94L833.88 696.95L834.91 698.43L836.13 697.92L836.91 699.4L839.04 701.03L843.07 700.61L844.28 703.18L846.33 702.56L848.87 703.23L849.08 702.28L851.09 702.47L854.17 700.79L857.59 700.49L858.96 699.93L861.47 700.23L863.51 697.59L866.17 697.95L865.25 699.85L865 701.75L865.49 703.2L868.26 706.49L868.15 708.11L867.2 710.41L864.85 711.35L865.2 714.35L864.03 716.56L861.17 718.4L860.28 718.27L858.67 720.01L857.8 722.19L857.75 723.79L854.54 725.19L853.46 727.04L855.01 732.53L855.8 733.95L853.12 735.89L852.16 737.41L851.08 736.55L847.89 738.94L847.96 739.83L845.4 740.5L844.43 740.06L842.88 741.04L842.13 742.49L840.17 743.41L839.36 742.66L836.59 743.11L835.39 745.63L834.08 747.17L833.28 746.03L830.82 746.41L829.57 748.06L828.48 752.49L828.4 755.15L827.02 754.12L824.76 754.96L823.98 756.22L821.22 755.95L818.5 756.4L817.02 757.45L816.09 759.15L817.19 760.22L816.68 762.11L815.78 762.51L815.05 765.12L813.86 765.72L812.97 767.26L810.63 767.09L810.75 768.54L808.6 768.3L805.65 769.03L804.54 767.71L802.36 769.39L802.24 770.88L801.06 772.87L800.76 775.02L798.75 775.42L797.81 777.45L792.3 781.23L792.44 782.41L794.77 782.43L796.06 781.51L797.55 782.37L798.57 781.09L799.9 782.23L799.44 783.33L797.65 784.84L798.07 787.8L796.23 789.72L794.74 791.96L792.84 789.68L790.46 789.44L786.38 792.84L783.95 792.41L780.31 793.04L777.86 794.15L777.26 795.72L777.67 798.56L775.43 798.36L774.37 796.98L771.57 795.64L769.31 796.27L767.08 796.03L765.22 796.9L763.89 798.53L763.19 801.1L763.66 804.13L760.95 803.13L761.95 802.32L761.57 799.61L758.25 798.74L755.23 799.61L754.7 798.02L753.54 797.18L749.16 796.83L747.79 795.35L746.4 796.33L747.52 798.86L744.53 800.48L743.56 802.45L741.63 802.2L740.01 799.54L740.63 796.89L737.9 795.93L738.42 794.7L734.72 794.19L734.27 793.2L732.65 793.54L731.1 790.25L729.8 789.51L727.9 789.55L726.34 791.79L724.21 790.62L721.67 787.24L720.24 788.56L716.51 787.37L712.26 787.23L710.42 787.69L708.89 787L709.39 785.6L711.01 784.2L710.59 781.96L709.21 780.76L710.47 778.01L707.75 773.88L705.91 773.64L703.21 775.7L700.87 776.52L697.92 776.03L697.31 776.56L688.56 776.46L687.29 775.17L687.64 774.01L684.4 769.7L683.85 767.49L681.41 766.84L679.73 768.08L676.91 769.33L675.88 772.26L677.61 773.55L676.29 776.13L674.81 776.38L671.48 774.78L667.07 774.49L663.32 774.85L658.22 773.59L656.68 772.48L656.32 770.98L658.35 769.84L657.97 767.08L656.63 765.91L653.56 764.85L650.13 764.62L645.9 765.54L644.55 765.08L634.36 764.34L634.99 760.74L638.76 759.32L642.64 756.28L646.38 755L647.46 752.77L649.12 752.93L650.8 750.63L648.42 750.41L647.57 749.49L649.39 745.23L650.82 744.81L651.6 742.2L654.94 741.43L657.96 742.47L658.7 743.29L661.03 743.01L660.05 740.8L660.09 739.36L661.18 736.31L662.61 734.49L662.85 732.62L662.02 729.91L663.62 728.67L661.98 726.56L665.43 724.93L667.45 722.98L668.5 721.29L671.19 720L673.6 717.23L673.67 715.26L675.42 715.47L675.12 712.82L671.86 709.34L671.79 708.14L669.76 707L667.9 706.83L666.38 704.53L667.36 696.7L666.27 696.2L666.32 694.17L664.32 694.35L664.19 691.91L662.8 690.43L662.48 688.93L662.76 685.96L662.57 683.36L664.47 684.23L667.23 683.65L670.06 683.77L672.9 685.79L672.8 688.03L673.44 690.12L673.54 692.5L674.38 692.87L677.9 689.76L681.51 689.7L684.77 687.58L686.39 687.4L690.08 685.39L691.15 687.65L693.03 688.07L697.6 685.27L697.23 686.9L696.06 687.83L696.86 691.25L696.41 692.63L697.76 693.58L702 694.28L703.23 692.71L705.63 694.17L708.62 695.19L709.77 694.27L711.82 695.42L711.73 699.71L715.25 700.05L716.53 703.08L719.49 703.41L722.28 701.86L723.01 700.22L725.14 699.49L723.89 698.25L724.68 696.64L726.92 696.63L728.94 698.56L728.4 700.07L731.55 700.57L731.83 698.96L729.43 698.68L729.74 696.5L731.38 696.32L731.73 692.44L731.18 691.79L731.39 688.45L729.47 688.73L728.42 687.59L728.81 686.18L726.82 685.36L727.43 683.11L722.08 683.01L721.03 681.53L719.1 682.67L717.52 681.32L716.93 679.74L715.2 679.67L715.74 677.59L714.1 674.43L716.02 673.78L717.99 674.92L719.45 673.26L717.18 672.27L716.8 670.55L718.22 668.19L720.68 668.18L723.76 669.74L726.52 670.61L727.37 669.94L728.28 667.26L730.61 667.19L728.12 664.12L726.09 663.3L727.47 659.54L729.23 657.04L729.08 653.14L734.74 654.24L736.61 652.04L739.07 652.93L739.66 650.98L741.43 649.87L741.52 648.49L739.8 647.88L741.56 644.73L742.84 643.64L745.66 643.91L746.42 643.01L747.9 643.41L751.79 640.85L751.63 639.92L749.73 638.64L751.72 637.31L753.45 637.14L755.15 635.47L756.94 637.51L760.63 634.9L761.73 633.21L764.58 633.94L766.3 633.49L769.93 634.09L771.2 632.4L773.3 632.12L775.69 634.49L776.92 633.78L776.66 631.39L777.17 630.36L776.92 627.37L777.2 625.69L775.2 625.12L775.17 623L774.25 622L774.72 620.12L773.26 619.75L770.01 620.44L766.81 618.94L767.89 613.92L769.43 613.57L768.51 609.79L770.61 608.07L773.2 609.81L775.35 608.9L777.48 610.2L778.19 612.13L777.61 613.46L779.55 614.25L782.55 614.18L783.44 615.21L785.75 614.8L785.36 611.5L787.41 609.79L788.67 610.76L790.43 610.23L791.81 608.43L794.43 608.58L795.4 609.74L795.23 610.51L797.55 613.32L797.33 615.17L798.25 618.09L801.82 618.08L803.01 618.61L803.53 620.36L802.62 620.93L804.35 622.85L803.66 625.53L803.5 629.07L804.87 629.28L807.2 631.82L811.05 634.28L814.44 634.77L815.78 633.2L818.39 634.7L820.68 635.35L821.45 637.91L820.2 640.07L821.89 642.63L821.85 644.62L823.16 646.81L824.64 647.24L825.4 650.32L824.24 650.41L821.82 649.34L819.3 649.65L817.37 651.37L816.76 652.78ZM686.98 755.52L687.05 757.91L685.92 760.84L686.33 763.42L688.56 763.38L689.5 764.03L690.74 769.89L693.44 769.52L695.23 769.89L696.77 768.89L698.85 766.68L701.19 765.05L700.95 762.19L699.62 761.48L695.77 764.49L692.91 758.25L690.33 758.09L689.13 758.61L688.23 756.49L686.98 755.52ZM782.3 805.3L783.67 804.27L784.68 802.58L785.98 802.81L784.65 805.23L782.3 805.3ZM779.77 807.39L778.8 805.6L781.35 805.47L779.77 807.39ZM769.5 804.89L769.93 806.78L767.12 808.25L764.13 806.59L765.08 805.96L766.65 806.65L769.5 804.89ZM678.83 680.07L679.75 679.2L680.55 676.04L683.55 674.71L685.25 674.59L686.91 676.27L687.07 677.45L689.29 678.53L689.5 680.09L687.83 680.26L687.58 681.84L684.58 686.39L680.79 685.33L678.6 685.78L678.07 683.82L678.99 682.58L677.39 681.5L678.83 680.07Z",
  "c": [757.24, 717.87]
}];
Object.assign(__ds_scope, { FRANCE_VIEWBOX, FRANCE_REGIONS });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/map/regionPaths.js", error: String((e && e.message) || e) }); }

// components/map/FranceMap.jsx
try { (() => {
const SEQ = ['var(--seq-1)', 'var(--seq-2)', 'var(--seq-3)', 'var(--seq-4)', 'var(--seq-5)', 'var(--seq-6)', 'var(--seq-7)', 'var(--seq-8)'];

/**
 * Interactive choropleth of the 13 metropolitan régions of France.
 * Real IGN geometry (Licence Ouverte). Hover + click select; optional
 * value-driven blue choropleth and point-of-interest markers.
 */
function FranceMap({
  values = null,
  // { [regionCode]: number } → sequential blue fill
  selected = null,
  // region code
  onSelect,
  points = [],
  // [{ x, y, label, tone }]  (use region.c for centroids)
  showLabels = false,
  height = 'auto',
  className = '',
  style = {}
}) {
  // Quantize values across the sequential ramp.
  const colorFor = code => {
    if (!values || values[code] == null) return 'var(--gray-100)';
    const nums = Object.values(values).filter(n => n != null);
    const min = Math.min(...nums),
      max = Math.max(...nums);
    const t = max === min ? 0.5 : (values[code] - min) / (max - min);
    return SEQ[Math.min(SEQ.length - 1, Math.floor(t * SEQ.length))];
  };
  return /*#__PURE__*/React.createElement("svg", {
    viewBox: __ds_scope.FRANCE_VIEWBOX,
    className: className,
    style: {
      width: '100%',
      height,
      display: 'block',
      overflow: 'visible',
      ...style
    },
    role: "img",
    "aria-label": "Carte des r\xE9gions de France"
  }, /*#__PURE__*/React.createElement("g", null, __ds_scope.FRANCE_REGIONS.map(r => {
    const isSel = selected === r.code;
    return /*#__PURE__*/React.createElement("path", {
      key: r.code,
      d: r.d,
      fill: isSel ? 'var(--accent)' : colorFor(r.code),
      stroke: isSel ? 'var(--accent)' : 'var(--white)',
      strokeWidth: isSel ? 1.6 : 1,
      strokeLinejoin: "round",
      tabIndex: onSelect ? 0 : undefined,
      onClick: onSelect ? () => onSelect(r.code, r) : undefined,
      style: {
        cursor: onSelect ? 'pointer' : 'default',
        transition: 'fill var(--dur-fast) var(--ease-out), opacity var(--dur-fast)',
        outline: 'none'
      },
      onMouseEnter: e => {
        if (!isSel) e.currentTarget.style.opacity = '0.78';
      },
      onMouseLeave: e => {
        e.currentTarget.style.opacity = '1';
      }
    }, /*#__PURE__*/React.createElement("title", null, r.nom));
  })), showLabels && /*#__PURE__*/React.createElement("g", {
    style: {
      pointerEvents: 'none'
    }
  }, __ds_scope.FRANCE_REGIONS.map(r => /*#__PURE__*/React.createElement("text", {
    key: r.code,
    x: r.c[0],
    y: r.c[1],
    textAnchor: "middle",
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 600,
      fill: selected === r.code ? 'var(--white)' : 'var(--gray-600)'
    }
  }, r.nom.length > 16 ? r.nom.split(/[\s-]/)[0] : r.nom))), /*#__PURE__*/React.createElement("g", {
    style: {
      pointerEvents: 'none'
    }
  }, points.map((p, i) => /*#__PURE__*/React.createElement("g", {
    key: i
  }, /*#__PURE__*/React.createElement("circle", {
    cx: p.x,
    cy: p.y,
    r: "6",
    fill: p.tone || 'var(--blue-france)',
    stroke: "var(--white)",
    strokeWidth: "2"
  }), p.label && /*#__PURE__*/React.createElement("text", {
    x: p.x + 10,
    y: p.y + 4,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontWeight: 500,
      fill: 'var(--ink)'
    }
  }, p.label)))));
}
Object.assign(__ds_scope, { FranceMap });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/map/FranceMap.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Alert.jsx
try { (() => {
const KIND = {
  info: {
    color: 'var(--info)',
    bg: 'var(--info-tint)',
    border: 'var(--blue-100)'
  },
  success: {
    color: 'var(--pos)',
    bg: 'var(--pos-tint)',
    border: 'var(--green-100)'
  },
  warning: {
    color: 'var(--warn)',
    bg: 'var(--warn-tint)',
    border: 'var(--amber-100)'
  },
  error: {
    color: 'var(--neg)',
    bg: 'var(--neg-tint)',
    border: 'var(--red-100)'
  }
};
const ICON = {
  info: 'M12 16v-4M12 8h.01',
  success: 'M20 6 9 17l-5-5',
  warning: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  error: 'M18 6 6 18M6 6l12 12'
};

/** Inline alert / data notice. Kinds: info · success · warning · error. */
function Alert({
  kind = 'info',
  title,
  children,
  style = {}
}) {
  const k = KIND[kind] || KIND.info;
  return /*#__PURE__*/React.createElement("div", {
    role: "alert",
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 11,
      padding: '12px 14px',
      borderRadius: 'var(--radius-md)',
      background: k.bg,
      border: `1px solid ${k.border}`,
      ...style
    }
  }, /*#__PURE__*/React.createElement("svg", {
    width: "17",
    height: "17",
    viewBox: "0 0 24 24",
    fill: "none",
    style: {
      color: k.color,
      flexShrink: 0,
      marginTop: 1
    }
  }, kind === 'info' && /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9",
    stroke: "currentColor",
    strokeWidth: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: ICON[kind],
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      lineHeight: 1.5,
      color: 'var(--text-secondary)'
    }
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      fontWeight: 600,
      color: 'var(--text)',
      marginBottom: children ? 2 : 0
    }
  }, title), children));
}
Object.assign(__ds_scope, { Alert });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Alert.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/** Generic surface container with optional title row and trailing action. */
function Card({
  title,
  subtitle,
  action,
  padding = 20,
  flush = false,
  children,
  style = {},
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      overflow: 'hidden',
      ...style
    }
  }, rest), (title || action) && /*#__PURE__*/React.createElement("header", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      padding: '14px 18px',
      borderBottom: '1px solid var(--border-subtle)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minWidth: 0
    }
  }, title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 600,
      color: 'var(--text)',
      letterSpacing: '-0.01em'
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 12,
      color: 'var(--text-tertiary)'
    }
  }, subtitle)), action), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: flush ? 0 : padding
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/SectionHeader.jsx
try { (() => {
/** Section/panel header — uppercase eyebrow, title and an optional right-aligned slot. */
function SectionHeader({
  eyebrow,
  title,
  action,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, eyebrow && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'var(--accent)'
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h2", {
    style: {
      fontFamily: 'var(--font-sans)',
      fontSize: 20,
      fontWeight: 600,
      letterSpacing: '-0.01em',
      color: 'var(--text)'
    }
  }, title)), action);
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Tabs.jsx
try { (() => {
/** Underline tab bar. `tabs` = [{id,label,count?}]; controlled via `active`/`onChange`. */
function Tabs({
  tabs = [],
  active,
  onChange,
  style = {}
}) {
  return /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    style: {
      display: 'flex',
      gap: 24,
      borderBottom: '1px solid var(--border)',
      ...style
    }
  }, tabs.map(t => {
    const on = t.id === active;
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      role: "tab",
      "aria-selected": on,
      onClick: () => onChange && onChange(t.id),
      style: {
        position: 'relative',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0 0 12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 7,
        fontFamily: 'var(--font-sans)',
        fontSize: 14,
        fontWeight: on ? 600 : 500,
        color: on ? 'var(--text)' : 'var(--text-tertiary)',
        transition: 'color var(--dur-fast)'
      }
    }, t.label, t.count != null && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        fontWeight: 600,
        color: on ? 'var(--accent)' : 'var(--text-tertiary)',
        background: on ? 'var(--blue-50)' : 'var(--gray-100)',
        borderRadius: 'var(--radius-pill)',
        padding: '1px 7px'
      }
    }, t.count), on && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: -1,
        height: 2,
        background: 'var(--accent)',
        borderRadius: '2px 2px 0 0'
      }
    }));
  }));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Tabs.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.DeltaPill = __ds_scope.DeltaPill;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.SourceTag = __ds_scope.SourceTag;

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.Sparkline = __ds_scope.Sparkline;

__ds_ns.StatTile = __ds_scope.StatTile;

__ds_ns.TrendBar = __ds_scope.TrendBar;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.SearchField = __ds_scope.SearchField;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Toggle = __ds_scope.Toggle;

__ds_ns.FranceMap = __ds_scope.FranceMap;

__ds_ns.FRANCE_VIEWBOX = __ds_scope.FRANCE_VIEWBOX;

__ds_ns.FRANCE_REGIONS = __ds_scope.FRANCE_REGIONS;

__ds_ns.Alert = __ds_scope.Alert;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
