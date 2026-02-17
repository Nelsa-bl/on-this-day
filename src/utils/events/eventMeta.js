export const CATEGORY_OPTIONS = [
  'all',
  'science',
  'war',
  'sports',
  'culture',
  'politics',
  'discovery',
];

const COUNTRY_LIKE_WORDS = [
  'state',
  'country',
  'republic',
  'kingdom',
  'territory',
  'država',
  'republika',
  'kraljevina',
  'zemlja',
];

const CATEGORY_KEYWORDS = {
  science: [
    { term: 'scientist', weight: 2.2 },
    { term: 'physics', weight: 2.4 },
    { term: 'chemistry', weight: 2.4 },
    { term: 'biology', weight: 2.4 },
    { term: 'medicine', weight: 2.1 },
    { term: 'research', weight: 2.0 },
    { term: 'nobel', weight: 2.1 },
    { term: 'laboratory', weight: 2.2 },
    { term: 'mathematics', weight: 2.4 },
    { term: 'astronomy', weight: 2.4 },
    { term: 'space', weight: 1.8 },
    { term: 'planet', weight: 1.7 },
    { term: 'naučnik', weight: 2.4 },
    { term: 'naucnik', weight: 2.4 },
    { term: 'naučnica', weight: 2.4 },
    { term: 'naucnica', weight: 2.4 },
    { term: 'fizičar', weight: 2.4 },
    { term: 'fizicar', weight: 2.4 },
    { term: 'hemičar', weight: 2.4 },
    { term: 'hemicar', weight: 2.4 },
    { term: 'biolog', weight: 2.2 },
    { term: 'matematičar', weight: 2.4 },
    { term: 'matematicar', weight: 2.4 },
    { term: 'astronom', weight: 2.3 },
    { term: 'istraživač', weight: 2.2 },
    { term: 'istrazivac', weight: 2.2 },
    { term: 'doktor medicine', weight: 2.1 },
    { term: 'scientific', weight: 2.1 },
    { term: 'physicist', weight: 2.3 },
    { term: 'chemist', weight: 2.3 },
    { term: 'biologist', weight: 2.2 },
    { term: 'astronomer', weight: 2.3 },
    { term: 'engineer', weight: 2.1 },
    { term: 'inventor', weight: 2.1 },
    { term: 'laboratorij', weight: 2.1 },
    { term: 'znanstvenik', weight: 2.4 },
    { term: 'znanstvenica', weight: 2.4 },
    { term: 'naučni', weight: 2.0 },
    { term: 'naucni', weight: 2.0 },
    { term: 'znanstveni', weight: 2.0 },
    { term: 'inženjer', weight: 2.1 },
    { term: 'inzenjer', weight: 2.1 },
    { term: 'izumitelj', weight: 2.2 },
    { term: 'mikrobiolog', weight: 2.2 },
    { term: 'geolog', weight: 2.1 },
    { term: 'svemir', weight: 1.9 },
    { term: 'kosmos', weight: 1.9 },
    { term: 'istraživanje', weight: 2.0 },
    { term: 'istrazivanje', weight: 2.0 },
  ],
  war: [
    { term: 'war', weight: 2.6 },
    { term: 'battle', weight: 2.5 },
    { term: 'army', weight: 2.2 },
    { term: 'military', weight: 2.3 },
    { term: 'siege', weight: 2.5 },
    { term: 'invasion', weight: 2.4 },
    { term: 'revolt', weight: 2.0 },
    { term: 'rebellion', weight: 2.0 },
    { term: 'conflict', weight: 2.0 },
    { term: 'assassination', weight: 1.7 },
    { term: 'borba', weight: 2.0 },
    { term: 'narodnooslobodilačka borba', weight: 3.0 },
    { term: 'narodnooslobodilacka borba', weight: 3.0 },
    { term: 'oslobodilačka borba', weight: 2.7 },
    { term: 'oslobodilacka borba', weight: 2.7 },
    { term: 'narodni heroj', weight: 2.7 },
    { term: 'heroj jugoslavije', weight: 2.8 },
    { term: 'partizan', weight: 2.5 },
    { term: 'partizanski', weight: 2.4 },
    { term: 'učesnik rata', weight: 2.6 },
    { term: 'ucesnik rata', weight: 2.6 },
    { term: 'nob', weight: 2.3 },
    { term: 'rat', weight: 2.5 },
    { term: 'bitka', weight: 2.5 },
    { term: 'vojska', weight: 2.2 },
    { term: 'vojni', weight: 2.2 },
    { term: 'invazija', weight: 2.4 },
    { term: 'opsada', weight: 2.4 },
    { term: 'front', weight: 2.1 },
    { term: 'brigada', weight: 2.1 },
    { term: 'pukovnik', weight: 2.0 },
    { term: 'general', weight: 2.0 },
    { term: 'ustanak', weight: 2.2 },
    { term: 'gerila', weight: 2.1 },
    { term: 'uprising', weight: 2.2 },
    { term: 'insurgency', weight: 2.1 },
    { term: 'regiment', weight: 2.1 },
    { term: 'division', weight: 2.0 },
    { term: 'commander', weight: 2.1 },
    { term: 'occupation', weight: 2.2 },
    { term: 'armistice', weight: 2.2 },
    { term: 'ustanak', weight: 2.3 },
    { term: 'okupacija', weight: 2.2 },
    { term: 'primirje', weight: 2.2 },
    { term: 'ofanziva', weight: 2.2 },
    { term: 'komandant', weight: 2.1 },
    { term: 'divizija', weight: 2.0 },
    { term: 'brigada', weight: 2.0 },
    { term: 'pobuna', weight: 2.1 },
    { term: 'oružani sukob', weight: 2.5 },
    { term: 'oruzani sukob', weight: 2.5 },
  ],
  sports: [
    { term: 'football', weight: 2.6 },
    { term: 'soccer', weight: 2.6 },
    { term: 'basketball', weight: 2.6 },
    { term: 'tennis', weight: 2.5 },
    { term: 'olympic', weight: 2.6 },
    { term: 'championship', weight: 2.4 },
    { term: 'athlete', weight: 2.2 },
    { term: 'match', weight: 2.1 },
    { term: 'league', weight: 2.0 },
    { term: 'sport', weight: 1.8 },
    { term: 'cup', weight: 1.9 },
    { term: 'sportista', weight: 2.2 },
    { term: 'sportaš', weight: 2.2 },
    { term: 'olimpijski', weight: 2.4 },
    { term: 'prvenstvo', weight: 2.2 },
    { term: 'liga', weight: 2.0 },
    { term: 'utakmica', weight: 2.0 },
    { term: 'fudbal', weight: 2.6 },
    { term: 'nogomet', weight: 2.6 },
    { term: 'košarka', weight: 2.6 },
    { term: 'kosarka', weight: 2.6 },
    { term: 'rukomet', weight: 2.4 },
    { term: 'odbojka', weight: 2.4 },
    { term: 'teniser', weight: 2.4 },
    { term: 'plivač', weight: 2.3 },
    { term: 'plivac', weight: 2.3 },
    { term: 'reprezentacija', weight: 2.3 },
    { term: 'turnir', weight: 2.2 },
    { term: 'trener', weight: 2.1 },
    { term: 'goalkeeper', weight: 2.2 },
    { term: 'striker', weight: 2.2 },
    { term: 'runner', weight: 2.1 },
    { term: 'sprinter', weight: 2.1 },
    { term: 'medalist', weight: 2.2 },
    { term: 'world cup', weight: 2.5 },
    { term: 'grand slam', weight: 2.5 },
    { term: 'rekord', weight: 2.0 },
    { term: 'rekorder', weight: 2.1 },
    { term: 'golman', weight: 2.3 },
    { term: 'napadač', weight: 2.2 },
    { term: 'napadac', weight: 2.2 },
    { term: 'svjetsko prvenstvo', weight: 2.5 },
    { term: 'evropsko prvenstvo', weight: 2.4 },
    { term: 'europsko prvenstvo', weight: 2.4 },
    { term: 'olimpijac', weight: 2.4 },
    { term: 'olimpijka', weight: 2.4 },
    { term: 'atletičar', weight: 2.3 },
    { term: 'atleticar', weight: 2.3 },
    { term: 'atletičarka', weight: 2.3 },
    { term: 'atleticarka', weight: 2.3 },
  ],
  culture: [
    { term: 'film', weight: 2.5 },
    { term: 'movie', weight: 2.4 },
    { term: 'music', weight: 2.4 },
    { term: 'album', weight: 2.5 },
    { term: 'book', weight: 2.2 },
    { term: 'novel', weight: 2.4 },
    { term: 'poet', weight: 2.2 },
    { term: 'actor', weight: 2.2 },
    { term: 'actress', weight: 2.2 },
    { term: 'artist', weight: 2.1 },
    { term: 'theatre', weight: 2.3 },
    { term: 'painting', weight: 2.3 },
    { term: 'musician', weight: 2.5 },
    { term: 'singer', weight: 2.4 },
    { term: 'songwriter', weight: 2.4 },
    { term: 'composer', weight: 2.3 },
    { term: 'actor', weight: 2.4 },
    { term: 'actress', weight: 2.4 },
    { term: 'singer-songwriter', weight: 2.6 },
    { term: 'glumica', weight: 2.8 },
    { term: 'glumac', weight: 2.8 },
    { term: 'glumica i model', weight: 2.8 },
    { term: 'filmska glumica', weight: 2.8 },
    { term: 'kantautor', weight: 2.8 },
    { term: 'kantautorka', weight: 2.8 },
    { term: 'pjevač', weight: 2.6 },
    { term: 'pjevac', weight: 2.6 },
    { term: 'pevač', weight: 2.6 },
    { term: 'pevac', weight: 2.6 },
    { term: 'muzičar', weight: 2.5 },
    { term: 'muzicar', weight: 2.5 },
    { term: 'glazbenik', weight: 2.5 },
    { term: 'kompozitor', weight: 2.3 },
    { term: 'tekstopisac', weight: 2.3 },
    { term: 'muzički', weight: 2.0 },
    { term: 'glazbeni', weight: 2.0 },
    { term: 'plesačica', weight: 2.6 },
    { term: 'plesacica', weight: 2.6 },
    { term: 'plesač', weight: 2.4 },
    { term: 'plesac', weight: 2.4 },
    { term: 'balerina', weight: 2.5 },
    { term: 'voditelj', weight: 2.1 },
    { term: 'tv voditelj', weight: 2.2 },
    { term: 'televizijski voditelj', weight: 2.3 },
    { term: 'redatelj', weight: 2.3 },
    { term: 'reditelj', weight: 2.3 },
    { term: 'scenarist', weight: 2.2 },
    { term: 'umjetnik', weight: 2.0 },
    { term: 'književnik', weight: 2.3 },
    { term: 'knjizevnik', weight: 2.3 },
    { term: 'pjesnik', weight: 2.3 },
    { term: 'pisac', weight: 2.2 },
    { term: 'dancer', weight: 2.4 },
    { term: 'choreographer', weight: 2.4 },
    { term: 'screenwriter', weight: 2.3 },
    { term: 'producer', weight: 2.0 },
    { term: 'broadcaster', weight: 2.0 },
    { term: 'television host', weight: 2.2 },
    { term: 'poetry', weight: 2.2 },
    { term: 'poetess', weight: 2.1 },
    { term: 'koreograf', weight: 2.4 },
    { term: 'koreografkinja', weight: 2.4 },
    { term: 'dramaturg', weight: 2.2 },
    { term: 'voditeljica', weight: 2.2 },
    { term: 'spisatelj', weight: 2.2 },
    { term: 'spisateljica', weight: 2.2 },
    { term: 'pjesnikinja', weight: 2.2 },
    { term: 'romanopisac', weight: 2.3 },
    { term: 'romanopisacica', weight: 2.3 },
    { term: 'novinar', weight: 2.0 },
    { term: 'novinarka', weight: 2.0 },
    { term: 'televizija', weight: 1.8 },
    { term: 'pozorište', weight: 2.2 },
    { term: 'pozoriste', weight: 2.2 },
    { term: 'kazalište', weight: 2.2 },
    { term: 'kazaliste', weight: 2.2 },
    { term: 'režiser', weight: 2.3 },
    { term: 'reziser', weight: 2.3 },
    { term: 'režiserka', weight: 2.3 },
    { term: 'reziserka', weight: 2.3 },
  ],
  politics: [
    { term: 'president', weight: 2.5 },
    { term: 'prime minister', weight: 2.6 },
    { term: 'king', weight: 2.1 },
    { term: 'queen', weight: 2.1 },
    { term: 'election', weight: 2.6 },
    { term: 'government', weight: 2.2 },
    { term: 'parliament', weight: 2.4 },
    { term: 'constitution', weight: 2.5 },
    { term: 'treaty', weight: 2.2 },
    { term: 'law', weight: 1.6 },
    { term: 'senate', weight: 2.3 },
    { term: 'predsjednik', weight: 2.5 },
    { term: 'premijer', weight: 2.5 },
    { term: 'vlada', weight: 2.2 },
    { term: 'parlament', weight: 2.4 },
    { term: 'izbori', weight: 2.5 },
    { term: 'državnik', weight: 2.3 },
    { term: 'drzavnik', weight: 2.3 },
    { term: 'ministar', weight: 2.3 },
    { term: 'ministarka', weight: 2.3 },
    { term: 'senator', weight: 2.3 },
    { term: 'gradonačelnik', weight: 2.3 },
    { term: 'gradonacelnik', weight: 2.3 },
    { term: 'ambasador', weight: 2.2 },
    { term: 'diplomat', weight: 2.2 },
    { term: 'premijerka', weight: 2.5 },
    { term: 'kancelar', weight: 2.4 },
    { term: 'statesman', weight: 2.3 },
    { term: 'cabinet', weight: 2.2 },
    { term: 'governor', weight: 2.2 },
    { term: 'member of parliament', weight: 2.4 },
    { term: 'secretary of state', weight: 2.3 },
    { term: 'foreign minister', weight: 2.3 },
    { term: 'parliamentary', weight: 2.1 },
    { term: 'predsjednica', weight: 2.5 },
    { term: 'premijer', weight: 2.5 },
    { term: 'premijerka', weight: 2.5 },
    { term: 'zastupnik', weight: 2.3 },
    { term: 'zastupnica', weight: 2.3 },
    { term: 'poslanik', weight: 2.3 },
    { term: 'poslanica', weight: 2.3 },
    { term: 'državni sekretar', weight: 2.3 },
    { term: 'drzavni sekretar', weight: 2.3 },
    { term: 'opština', weight: 1.8 },
    { term: 'opstina', weight: 1.8 },
    { term: 'gradonačelnica', weight: 2.3 },
    { term: 'gradonacelnica', weight: 2.3 },
    { term: 'parlamentarna', weight: 2.1 },
  ],
  discovery: [
    { term: 'discovered', weight: 2.3 },
    { term: 'invented', weight: 2.4 },
    { term: 'invention', weight: 2.3 },
    { term: 'launched', weight: 2.2 },
    { term: 'founded', weight: 1.9 },
    { term: 'founded in', weight: 2.1 },
    { term: 'first', weight: 1.2 },
    { term: 'opened', weight: 1.8 },
    { term: 'created', weight: 1.3 },
    { term: 'patent', weight: 2.2 },
    { term: 'otkrio', weight: 2.3 },
    { term: 'otkriven', weight: 2.3 },
    { term: 'izumio', weight: 2.3 },
    { term: 'izum', weight: 2.2 },
    { term: 'lansiran', weight: 2.1 },
    { term: 'osnovan', weight: 1.8 },
    { term: 'otkriće', weight: 2.4 },
    { term: 'otkrice', weight: 2.4 },
    { term: 'pronalazak', weight: 2.3 },
    { term: 'eksperiment', weight: 2.0 },
    { term: 'prvi put', weight: 1.9 },
    { term: 'inovacija', weight: 2.1 },
    { term: 'svemirska letjelica', weight: 2.2 },
    { term: 'breakthrough', weight: 2.2 },
    { term: 'pioneered', weight: 2.0 },
    { term: 'prototype', weight: 2.0 },
    { term: 'mission', weight: 1.9 },
    { term: 'probe', weight: 2.0 },
    { term: 'patented', weight: 2.2 },
    { term: 'landed on', weight: 2.1 },
    { term: 'orbiter', weight: 2.0 },
    { term: 'sonda', weight: 2.0 },
    { term: 'misija', weight: 1.9 },
    { term: 'inovativni', weight: 2.0 },
    { term: 'inovativna', weight: 2.0 },
    { term: 'eksperimentalni', weight: 2.0 },
    { term: 'eksperimentalna', weight: 2.0 },
    { term: 'patentirao', weight: 2.2 },
    { term: 'patentirala', weight: 2.2 },
  ],
};

const CATEGORY_KEYWORDS_EXTRA = {
  science: [
    { term: 'scientific paper', weight: 2.2 },
    { term: 'theorem', weight: 2.3 },
    { term: 'equation', weight: 2.1 },
    { term: 'algorithm', weight: 2.1 },
    { term: 'genetics', weight: 2.2 },
    { term: 'neuroscience', weight: 2.2 },
    { term: 'naucno', weight: 2.0 },
    { term: 'znanstveno', weight: 2.0 },
    { term: 'laboratorija', weight: 2.1 },
    { term: 'akademik', weight: 2.0 },
    { term: 'profesor', weight: 1.8 },
  ],
  war: [
    { term: 'civil war', weight: 2.8 },
    { term: 'world war', weight: 2.8 },
    { term: 'peace treaty', weight: 2.2 },
    { term: 'navy', weight: 2.0 },
    { term: 'air force', weight: 2.0 },
    { term: 'marines', weight: 2.0 },
    { term: 'ratni', weight: 2.4 },
    { term: 'ratovao', weight: 2.3 },
    { term: 'ratovala', weight: 2.3 },
    { term: 'puk', weight: 1.9 },
    { term: 'vojnik', weight: 2.1 },
  ],
  sports: [
    { term: 'champion', weight: 2.4 },
    { term: 'final', weight: 2.0 },
    { term: 'medal', weight: 2.2 },
    { term: 'tournament', weight: 2.2 },
    { term: 'playoff', weight: 2.1 },
    { term: 'coach', weight: 2.1 },
    { term: 'sportsman', weight: 2.2 },
    { term: 'sportswoman', weight: 2.2 },
    { term: 'reprezentativac', weight: 2.3 },
    { term: 'reprezentativka', weight: 2.3 },
    { term: 'takmicenje', weight: 2.0 },
    { term: 'takmicar', weight: 2.2 },
    { term: 'takmicarka', weight: 2.2 },
  ],
  culture: [
    { term: 'drama', weight: 2.1 },
    { term: 'comedy', weight: 2.0 },
    { term: 'actor and producer', weight: 2.4 },
    { term: 'tv presenter', weight: 2.2 },
    { term: 'radio host', weight: 2.0 },
    { term: 'performer', weight: 2.0 },
    { term: 'autor', weight: 2.0 },
    { term: 'autorka', weight: 2.0 },
    { term: 'plesac', weight: 2.4 },
    { term: 'balerina', weight: 2.5 },
    { term: 'glazba', weight: 2.2 },
    { term: 'muzika', weight: 2.2 },
    { term: 'serija', weight: 1.9 },
    { term: 'filmografija', weight: 2.1 },
  ],
  politics: [
    { term: 'prime minister of', weight: 2.6 },
    { term: 'head of state', weight: 2.5 },
    { term: 'head of government', weight: 2.5 },
    { term: 'political leader', weight: 2.4 },
    { term: 'party leader', weight: 2.4 },
    { term: 'member of senate', weight: 2.4 },
    { term: 'leader of', weight: 1.8 },
    { term: 'predsjednistvo', weight: 2.3 },
    { term: 'skupstina', weight: 2.2 },
    { term: 'vlada republike', weight: 2.4 },
    { term: 'stranka', weight: 2.2 },
  ],
  discovery: [
    { term: 'discovery', weight: 2.4 },
    { term: 'inventor of', weight: 2.3 },
    { term: 'first successful', weight: 2.1 },
    { term: 'successfully launched', weight: 2.3 },
    { term: 'space mission', weight: 2.2 },
    { term: 'exploration', weight: 2.0 },
    { term: 'otkrivena', weight: 2.3 },
    { term: 'otkriveno', weight: 2.3 },
    { term: 'izumljen', weight: 2.2 },
    { term: 'izumljena', weight: 2.2 },
    { term: 'patentiran', weight: 2.2 },
  ],
};

const GUARD_TERMS = {
  geoState: [
    'state',
    'country',
    'republic',
    'kingdom',
    'capital',
    'population',
    'unitary',
    'parliamentary republic',
    'drzava',
    'republika',
    'kraljevina',
    'glavni grad',
    'stanovnika',
    'teritorija',
  ],
  biography: [
    'born',
    'died',
    'actor',
    'actress',
    'musician',
    'singer',
    'writer',
    'athlete',
    'politician',
    'rodjen',
    'rodena',
    'preminuo',
    'preminula',
    'glumac',
    'glumica',
    'pjevac',
    'pevac',
    'muzi',
    'sportista',
  ],
  military: [
    'war',
    'battle',
    'army',
    'military',
    'invasion',
    'conflict',
    'siege',
    'rat',
    'bitka',
    'vojska',
    'vojni',
    'invazija',
    'opsada',
    'sukob',
  ],
  artCulture: [
    'film',
    'movie',
    'music',
    'album',
    'actor',
    'actress',
    'dance',
    'theatre',
    'poetry',
    'glumac',
    'glumica',
    'muzika',
    'plesac',
    'plesacica',
    'pozoriste',
    'kazaliste',
    'pjesnik',
  ],
  sportsContext: [
    'championship',
    'olympic',
    'league',
    'tournament',
    'match',
    'football',
    'soccer',
    'basketball',
    'tennis',
    'prvenstvo',
    'olimpijski',
    'utakmica',
    'fudbal',
    'nogomet',
    'kosarka',
    'rukomet',
    'odbojka',
  ],
  scienceContext: [
    'research',
    'scientific',
    'laboratory',
    'theorem',
    'equation',
    'astronomy',
    'physics',
    'chemistry',
    'biology',
    'naucni',
    'znanstveni',
    'istrazivanje',
    'laboratorij',
    'matematika',
    'astronomija',
  ],
};

const CATEGORY_PRIORITY = [
  'sports',
  'war',
  'politics',
  'science',
  'culture',
  'discovery',
];

const escapeRegExp = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeForMatch = (value = '') =>
  String(value)
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const titleOfPage = (page) =>
  page?.titles?.normalized || page?.normalizedtitle || page?.title || '';

const extractSubjectCandidate = (eventText = '') => {
  const value = String(eventText || '').trim();
  if (!value) return '';
  return value.split(',')[0]?.trim() || '';
};

const tokenize = (value = '') =>
  normalizeForMatch(value)
    .split(' ')
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);

const looksLikeCountryPage = (page) => {
  const desc = normalizeForMatch(page?.description || '');
  return COUNTRY_LIKE_WORDS.some((word) => desc.includes(word));
};

const scorePageAgainstEvent = (event, page) => {
  const title = titleOfPage(page);
  const normalizedTitle = normalizeForMatch(title);
  if (!normalizedTitle) return 0;

  const subject = extractSubjectCandidate(event?.text || '');
  const normalizedSubject = normalizeForMatch(subject);
  let score = 0;

  if (normalizedSubject) {
    if (normalizedTitle === normalizedSubject) score += 120;
    if (normalizedTitle.includes(normalizedSubject)) score += 75;
    if (normalizedSubject.includes(normalizedTitle)) score += 45;

    const titleTokens = tokenize(normalizedTitle);
    const subjectTokens = tokenize(normalizedSubject);
    const shared = subjectTokens.filter((token) => titleTokens.includes(token));
    score += shared.length * 16;
  }

  const description = normalizeForMatch(page?.description || '');
  if (
    normalizedSubject &&
    description &&
    description.includes(normalizedSubject)
  ) {
    score += 25;
  }

  if (looksLikeCountryPage(page) && normalizedSubject && normalizedSubject.length > 3) {
    score -= 14;
  }

  return score;
};

export function getPrimaryPageIndex(event) {
  const pages = event?.pages || [];
  if (!Array.isArray(pages) || pages.length === 0) return -1;
  if (pages.length === 1) return 0;

  let bestIndex = 0;
  let bestScore = Number.NEGATIVE_INFINITY;
  pages.forEach((page, index) => {
    const score = scorePageAgainstEvent(event, page);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

export function getPrimaryPage(event) {
  const index = getPrimaryPageIndex(event);
  if (index < 0) return null;
  return event?.pages?.[index] || null;
}

function normalizeEventText(event) {
  const page = getPrimaryPage(event) || event?.pages?.[0];
  return [
    event?.text || '',
    page?.description || '',
    page?.extract || '',
    page?.titles?.normalized || '',
  ]
    .join(' ')
    .toLowerCase();
}

const getPatternRegex = (term) => {
  const escaped = escapeRegExp(term.trim());
  if (!escaped) return null;
  return new RegExp(
    `(?:^|[^\\p{L}\\p{N}_])${escaped}(?=[^\\p{L}\\p{N}_]|$)`,
    'gu',
  );
};

const countTermMatches = (text, terms = []) =>
  terms.reduce((count, term) => {
    const regex = getPatternRegex(term);
    if (!regex) return count;
    const matches = text.match(regex);
    return count + (matches?.length || 0);
  }, 0);

const applyGuardAdjustments = (scores, text) => {
  const geoStateHits = countTermMatches(text, GUARD_TERMS.geoState);
  const biographyHits = countTermMatches(text, GUARD_TERMS.biography);
  const militaryHits = countTermMatches(text, GUARD_TERMS.military);
  const artHits = countTermMatches(text, GUARD_TERMS.artCulture);
  const sportsHits = countTermMatches(text, GUARD_TERMS.sportsContext);
  const scienceHits = countTermMatches(text, GUARD_TERMS.scienceContext);

  if (geoStateHits > 0) {
    scores.politics += geoStateHits * 0.9;
    scores.culture -= geoStateHits * 0.9;
    scores.sports -= geoStateHits * 0.6;
    scores.discovery -= geoStateHits * 0.7;
  }

  if (biographyHits > 0) {
    scores.culture += biographyHits * 0.45;
    scores.science += biographyHits * 0.25;
    scores.sports += biographyHits * 0.25;
  }

  if (militaryHits > 0) {
    scores.war += militaryHits * 0.7;
    scores.discovery -= militaryHits * 0.3;
  }

  if (artHits > 0) {
    scores.culture += artHits * 0.55;
    scores.politics -= artHits * 0.25;
    scores.war -= artHits * 0.2;
  }

  if (sportsHits > 0) {
    scores.sports += sportsHits * 0.65;
    scores.war -= sportsHits * 0.2;
  }

  if (scienceHits > 0) {
    scores.science += scienceHits * 0.65;
    scores.discovery += scienceHits * 0.15;
  }

  Object.keys(scores).forEach((category) => {
    scores[category] = Number(Math.max(0, scores[category]).toFixed(2));
  });
};

const computeFallbackScores = (text) => {
  const scores = {
    science: 0,
    war: 0,
    sports: 0,
    culture: 0,
    politics: 0,
    discovery: 0,
  };

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, entries]) => {
    const extra = CATEGORY_KEYWORDS_EXTRA[category] || [];
    const combined = [...entries, ...extra];

    combined.forEach(({ term, weight }) => {
      const regex = getPatternRegex(term);
      if (!regex) return;
      const matches = text.match(regex);
      if (!matches?.length) return;
      scores[category] += matches.length * weight;
    });
  });

  applyGuardAdjustments(scores, text);

  return scores;
};

const confidenceFromScores = ({ topScore, secondScore }) => {
  if (topScore <= 0) return 0.34;
  const ratio = topScore / (topScore + secondScore + 0.0001);
  const magnitude = Math.min(1, topScore / 6);
  const confidence = 0.42 + ratio * 0.33 + magnitude * 0.2;
  return Math.max(0.35, Math.min(0.92, Number(confidence.toFixed(2))));
};

export function getCategoryClassification(event) {
  const primaryPageId = String(getPrimaryPage(event)?.pageid || '');
  if (
    event?._derivedCategory &&
    CATEGORY_OPTIONS.includes(event._derivedCategory) &&
    (!event?._derivedCategoryPageId ||
      String(event._derivedCategoryPageId) === primaryPageId)
  ) {
    return {
      category: event._derivedCategory,
      confidence: 0.97,
      source: event._derivedCategorySource || 'wikidata',
      scores: null,
    };
  }

  const text = normalizeEventText(event);
  const scores = computeFallbackScores(text);
  const ranked = Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .sort((a, b) => {
      if (b[1] !== a[1]) return b[1] - a[1];
      return CATEGORY_PRIORITY.indexOf(a[0]) - CATEGORY_PRIORITY.indexOf(b[0]);
    });

  const [topCategory = 'discovery', topScore = 0] = ranked[0] || [];
  const secondScore = ranked[1]?.[1] || 0;

  if (topScore <= 0) {
    return {
      category: 'discovery',
      confidence: 0.34,
      source: 'fallback-default',
      scores,
    };
  }

  return {
    category: topCategory,
    confidence: confidenceFromScores({ topScore, secondScore }),
    source: 'fallback-scored',
    scores,
  };
}

export function categorizeEvent(event) {
  const classification = getCategoryClassification(event);
  return classification.category;
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
