import { getCategoryClassification } from './eventMeta';

const page = ({ title, description = '', extract = '', pageid = 1 }) => ({
  pageid,
  titles: { normalized: title },
  description,
  extract,
});

const CASES = [
  {
    name: 'scientist biography',
    expected: 'science',
    event: {
      _eventType: 'births',
      year: 1879,
      text: 'Albert Einstein, German-born physicist and Nobel Prize laureate, was born.',
      pages: [
        page({
          title: 'Albert Einstein',
          description: 'German-born theoretical physicist',
          extract:
            'Albert Einstein was a theoretical physicist who developed the theory of relativity.',
        }),
      ],
    },
  },
  {
    name: 'footballer biography',
    expected: 'sports',
    event: {
      _eventType: 'births',
      year: 1987,
      text: 'Lionel Messi, Argentine footballer, was born.',
      pages: [
        page({
          title: 'Lionel Messi',
          description: 'Argentine footballer',
          extract:
            'Lionel Messi is an Argentine professional footballer who plays as a forward.',
        }),
      ],
    },
  },
  {
    name: 'actor biography',
    expected: 'culture',
    event: {
      _eventType: 'births',
      year: 1929,
      text: 'Audrey Hepburn, British actress, was born.',
      pages: [
        page({
          title: 'Audrey Hepburn',
          description: 'British actress',
          extract:
            'Audrey Hepburn was a British actress and humanitarian, recognised as a film and fashion icon.',
        }),
      ],
    },
  },
  {
    name: 'battle event',
    expected: 'war',
    event: {
      _eventType: 'events',
      year: 1815,
      text: 'Napoleon Bonaparte is defeated at the Battle of Waterloo.',
      pages: [
        page({
          title: 'Battle of Waterloo',
          description: '1815 battle of the Napoleonic Wars',
          extract:
            'The Battle of Waterloo was fought between the French army and coalition forces.',
        }),
      ],
    },
  },
  {
    name: 'election event',
    expected: 'politics',
    event: {
      _eventType: 'events',
      year: 1994,
      text: 'South Africa holds its first democratic general election.',
      pages: [
        page({
          title: '1994 South African general election',
          description: 'general election',
          extract:
            'The election was held to elect a new National Assembly and provincial legislatures.',
        }),
      ],
    },
  },
  {
    name: 'album release',
    expected: 'culture',
    event: {
      _eventType: 'events',
      year: 1967,
      text: 'The Beatles release Sgt. Pepper’s Lonely Hearts Club Band.',
      pages: [
        page({
          title: 'Sgt. Pepper’s Lonely Hearts Club Band',
          description: 'album by the Beatles',
          extract:
            'Sgt. Pepper is a studio album by the English rock band the Beatles.',
        }),
      ],
    },
  },
  {
    name: 'space launch',
    expected: 'science',
    event: {
      _eventType: 'events',
      year: 1969,
      text: 'Apollo 11 is launched from Kennedy Space Center.',
      pages: [
        page({
          title: 'Apollo 11',
          description: '1969 crewed Moon landing mission',
          extract:
            'Apollo 11 was the American spaceflight that first landed humans on the Moon.',
        }),
      ],
    },
  },
  {
    name: 'country page guardrail',
    expected: 'politics',
    event: {
      _eventType: 'events',
      year: 1991,
      text: 'Slovenia declares independence from Yugoslavia.',
      pages: [
        page({
          title: 'Slovenia',
          description: 'country in Central Europe',
          extract:
            'Slovenia is a parliamentary republic and member state of the European Union.',
        }),
      ],
    },
  },
  {
    name: 'film about war should stay culture',
    expected: 'culture',
    event: {
      _eventType: 'events',
      year: 1979,
      text: 'Apocalypse Now is released in theaters.',
      pages: [
        page({
          title: 'Apocalypse Now',
          description: '1979 film by Francis Ford Coppola',
          extract:
            'Apocalypse Now is an American epic war film directed by Francis Ford Coppola.',
        }),
      ],
    },
  },
  {
    name: 'politician with military context',
    expected: 'politics',
    event: {
      _eventType: 'births',
      year: 1874,
      text: 'Winston Churchill, British prime minister, was born.',
      pages: [
        page({
          title: 'Winston Churchill',
          description: 'Prime Minister of the United Kingdom',
          extract:
            'Winston Churchill was a British statesman, soldier, and writer who led the United Kingdom during the Second World War.',
        }),
      ],
    },
  },
  {
    name: 'serbian footballer biography',
    expected: 'sports',
    event: {
      _eventType: 'births',
      year: 1979,
      text: 'Rođen je srpski fudbaler i reprezentativac.',
      pages: [
        page({
          title: 'Srpski fudbaler',
          description: 'srpski fudbaler',
          extract: 'Bio je profesionalni fudbaler i član reprezentacije.',
        }),
      ],
    },
  },
  {
    name: 'serbian actor biography',
    expected: 'culture',
    event: {
      _eventType: 'births',
      year: 1955,
      text: 'Rođena je poznata glumica.',
      pages: [
        page({
          title: 'Poznata glumica',
          description: 'filmska glumica',
          extract: 'Glumica je igrala u filmu, pozorištu i televizijskim serijama.',
        }),
      ],
    },
  },
  {
    name: 'independence day holiday',
    expected: 'politics',
    event: {
      _eventType: 'holidays',
      year: 0,
      text: 'Independence Day is a national day and public holiday.',
      pages: [
        page({
          title: 'Independence Day',
          description: 'national day',
          extract: 'Independence Day is a national holiday commemorating independence.',
        }),
      ],
    },
  },
  {
    name: 'memorial day holiday',
    expected: 'war',
    event: {
      _eventType: 'holidays',
      year: 0,
      text: 'Remembrance Day honors soldiers who died in war.',
      pages: [
        page({
          title: 'Remembrance Day',
          description: 'memorial day',
          extract: 'A remembrance day for military personnel and war dead.',
        }),
      ],
    },
  },
  {
    name: 'religious holiday',
    expected: 'culture',
    event: {
      _eventType: 'holidays',
      year: 0,
      text: 'Easter is a religious holiday and festival.',
      pages: [
        page({
          title: 'Easter',
          description: 'Christian holiday',
          extract: 'Easter is a Christian religious holiday and cultural festival.',
        }),
      ],
    },
  },
  {
    name: 'weak ambiguous event falls back to history',
    expected: 'history',
    event: {
      _eventType: 'events',
      year: 1200,
      text: 'A notable event is recorded in historical chronicles.',
      pages: [
        page({
          title: 'Historical chronicle',
          description: 'historical record',
          extract: 'The event is mentioned in later chronicles without a clear subject area.',
        }),
      ],
    },
  },
];

const rankedScores = (scores = {}) =>
  Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .map(([category, score]) => `${category}:${score}`)
    .join(', ');

describe('event category classifier diagnostics', () => {
  test('reports current category misses and scores', () => {
    const results = CASES.map(({ name, expected, event }) => {
      const classification = getCategoryClassification(event);
      return {
        case: name,
        expected,
        actual: classification.category,
        pass: expected === classification.category,
        confidence: classification.confidence,
        source: classification.source,
        scores: rankedScores(classification.scores),
      };
    });

    const misses = results.filter((result) => !result.pass);
    const accuracy = `${results.length - misses.length}/${results.length}`;

    // This is a diagnostic baseline, not a quality gate yet.
    // Run this test directly when tuning category rules to inspect misses.
    // eslint-disable-next-line no-console
    console.table(results);
    // eslint-disable-next-line no-console
    console.log(`Category diagnostic accuracy: ${accuracy}`);

    expect(results).toHaveLength(CASES.length);
  });
});
