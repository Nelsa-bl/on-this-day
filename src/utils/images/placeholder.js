const LIGHT_COLORS = {
  background: '#efefef',
  stroke: '#c9c9c9',
  text: '#b4b4b4',
};

const DARK_COLORS = {
  background: '#1f2430',
  stroke: '#4f596e',
  text: '#8e9ab5',
};

const isDarkThemeActive = () => {
  if (typeof document === 'undefined') return false;
  return document.documentElement?.dataset?.theme === 'dark';
};

export const getNoImagePlaceholder = (label, options = {}) => {
  const { isDark = isDarkThemeActive() } = options;
  const palette = isDark ? DARK_COLORS : LIGHT_COLORS;

  return (
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
        <rect width="320" height="320" fill="${palette.background}"/>
        <g fill="none" stroke="${palette.stroke}" stroke-width="6" stroke-linecap="square">
          <rect x="80" y="92" width="160" height="104"/>
          <path d="M95 188l44-74 40 64 18-26 28 36"/>
          <path d="M84 224L240 68"/>
        </g>
        <circle cx="112" cy="112" r="13" fill="${palette.stroke}"/>
        <text x="160" y="248" text-anchor="middle" font-family="Outfit, Arial, sans-serif" font-size="19" font-weight="300" fill="${palette.text}">${label}</text>
      </svg>
    `)
  );
};
