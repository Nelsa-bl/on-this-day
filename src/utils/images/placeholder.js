export const getNoImagePlaceholder = (label) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320">
      <rect width="320" height="320" fill="#efefef"/>
      <g fill="none" stroke="#c9c9c9" stroke-width="6" stroke-linecap="square">
        <rect x="80" y="92" width="160" height="104"/>
        <path d="M95 188l44-74 40 64 18-26 28 36"/>
        <path d="M84 224L240 68"/>
      </g>
      <circle cx="112" cy="112" r="13" fill="#c9c9c9"/>
      <text x="160" y="248" text-anchor="middle" font-family="Outfit, Arial, sans-serif" font-size="19" font-weight="300" fill="#b4b4b4">${label}</text>
    </svg>
  `);
