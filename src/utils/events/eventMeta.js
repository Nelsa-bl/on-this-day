export const CATEGORY_OPTIONS = [
  'all',
  'science',
  'war',
  'sports',
  'culture',
  'politics',
  'discovery',
];

const CATEGORY_PATTERNS = {
  science: [
    'scientist',
    'physics',
    'chemistry',
    'biology',
    'medicine',
    'research',
    'nobel',
    'laboratory',
    'mathematics',
    'astronomy',
    'space',
    'planet',
  ],
  war: [
    'war',
    'battle',
    'army',
    'military',
    'siege',
    'invasion',
    'revolt',
    'rebellion',
    'conflict',
    'assassination',
  ],
  sports: [
    'football',
    'soccer',
    'basketball',
    'tennis',
    'olympic',
    'championship',
    'athlete',
    'match',
    'league',
    'sport',
    'cup',
  ],
  culture: [
    'film',
    'movie',
    'music',
    'album',
    'book',
    'novel',
    'poet',
    'actor',
    'actress',
    'artist',
    'theatre',
    'painting',
  ],
  politics: [
    'president',
    'prime minister',
    'king',
    'queen',
    'election',
    'government',
    'parliament',
    'constitution',
    'treaty',
    'law',
    'senate',
  ],
  discovery: [
    'discovered',
    'invented',
    'invention',
    'launched',
    'founded',
    'founded in',
    'first',
    'opened',
    'created',
    'patent',
  ],
};

function normalizeEventText(event) {
  const page = event?.pages?.[0];
  return [
    event?.text || '',
    page?.description || '',
    page?.extract || '',
    page?.titles?.normalized || '',
  ]
    .join(' ')
    .toLowerCase();
}

export function categorizeEvent(event) {
  const text = normalizeEventText(event);

  for (const [category, patterns] of Object.entries(CATEGORY_PATTERNS)) {
    if (patterns.some((pattern) => text.includes(pattern))) {
      return category;
    }
  }

  return 'discovery';
}

export function getEraLabel(year) {
  if (!Number.isFinite(year)) return 'Unknown';
  if (year < 500) return 'Ancient world';
  if (year < 1500) return 'Middle Ages';
  if (year < 1800) return 'Early modern period';
  if (year < 1914) return 'Industrial age';
  if (year < 1946) return 'World war era';
  if (year < 1992) return 'Cold War era';
  return 'Contemporary era';
}

export function getThenVsNow(event, type, language = 'en') {
  const year = Number(event?.year);
  if (!Number.isFinite(year)) return null;

  const currentYear = new Date().getFullYear();
  const decade = Math.floor(year / 10) * 10;
  const yearsAgo = currentYear - year;
  const category = categorizeEvent(event);
  const era = getEraLabel(year);

  const summaries = {
    en: {
      births: 'People born in this period often shaped later generations.',
      events: 'This moment contributed to long-term historical momentum.',
      holidays: 'Public memory and identity were reinforced by this tradition.',
      default: 'This event marks a notable point in the historical timeline.',
    },
    bs: {
      births:
        'Ljudi rođeni u ovom periodu često su oblikovali naredne generacije.',
      events: 'Ovaj događaj je uticao na dugoročni tok historije.',
      holidays: 'Kolektivno sjećanje i identitet su ojačani ovom tradicijom.',
      default: 'Ovaj događaj je važna tačka na historijskoj liniji.',
    },
  };

  const lang = summaries[language] ? language : 'en';
  const typeSummary = summaries[lang][type] || summaries[lang].default;

  return {
    year,
    decade,
    yearsAgo,
    era,
    category,
    summary: typeSummary,
  };
}
