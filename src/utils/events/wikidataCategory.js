import { getPrimaryPage } from './eventMeta';

const PAGEIDS_CHUNK_SIZE = 50;
const ENTITY_IDS_CHUNK_SIZE = 50;
const CACHE_KEY = 'wikidata-category-cache-v2';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days
const MAX_PAGE_IDS_PER_PASS = 120;

const SPORTS_INSTANCE_QIDS = new Set([
  'Q31629', // sport
  'Q16510064', // sporting event
]);

const WAR_INSTANCE_QIDS = new Set([
  'Q198', // war
  'Q178561', // battle
  'Q180684', // conflict
  'Q645883', // military operation
  'Q350604', // armed conflict
]);

const CULTURE_INSTANCE_QIDS = new Set([
  'Q11424', // film
  'Q571', // book
  'Q2188189', // musical work
  'Q838948', // work of art
  'Q1344', // opera
]);

const POLITICS_INSTANCE_QIDS = new Set([
  'Q40231', // election
  'Q7278', // political party
  'Q49892', // parliamentary election
]);

const SCIENCE_INSTANCE_QIDS = new Set([
  'Q17444909', // scientific theory
  'Q12136', // disease
  'Q18123741', // scientific publication
]);

const DISCOVERY_INSTANCE_QIDS = new Set([
  'Q1190554', // occurrence
  'Q1195339', // discovery
  'Q2635894', // invention
]);

const SCIENCE_OCCUPATION_QIDS = new Set([
  'Q901', // scientist
  'Q169470', // physicist
  'Q593644', // chemist
  'Q864503', // biologist
  'Q1650915', // researcher
  'Q170790', // astronomer
  'Q205375', // inventor
]);

const SPORTS_OCCUPATION_QIDS = new Set([
  'Q2066131', // athlete
  'Q937857', // association football player
  'Q3665646', // basketball player
  'Q10833314', // tennis player
  'Q10873124', // sportsperson
]);

const CULTURE_OCCUPATION_QIDS = new Set([
  'Q33999', // actor
  'Q177220', // singer
  'Q36180', // writer
  'Q1028181', // painter
  'Q2526255', // film director
  'Q6625963', // novelist
]);

const POLITICS_OCCUPATION_QIDS = new Set([
  'Q82955', // politician
  'Q1933916', // diplomat
  'Q30461', // president
  'Q14212', // prime minister
]);
const HUMAN_INSTANCE_QIDS = new Set(['Q5']); // human

const chunk = (items, size) => {
  const result = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
};

const readCache = () => {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writeCache = (cache) => {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // Ignore storage quota and serialization issues.
  }
};

const claimValues = (entity, propertyId) => {
  const claims = entity?.claims?.[propertyId] || [];
  return claims
    .map((claim) => claim?.mainsnak?.datavalue?.value?.id)
    .filter(Boolean);
};

const hasAny = (entity, propertyId, expectedIds) => {
  const values = claimValues(entity, propertyId);
  return values.some((id) => expectedIds.has(id));
};

const hasClaim = (entity, propertyId) =>
  Array.isArray(entity?.claims?.[propertyId]) &&
  entity.claims[propertyId].length > 0;

const inferCategoryFromEntity = (entity) => {
  if (!entity) return null;
  const isHuman = hasAny(entity, 'P31', HUMAN_INSTANCE_QIDS);

  if (
    hasAny(entity, 'P31', SPORTS_INSTANCE_QIDS) ||
    hasClaim(entity, 'P641') ||
    hasAny(entity, 'P106', SPORTS_OCCUPATION_QIDS)
  ) {
    return 'sports';
  }

  if (
    hasAny(entity, 'P31', WAR_INSTANCE_QIDS) ||
    hasClaim(entity, 'P607') // conflict
  ) {
    return 'war';
  }

  if (
    hasAny(entity, 'P31', SCIENCE_INSTANCE_QIDS) ||
    hasAny(entity, 'P106', SCIENCE_OCCUPATION_QIDS)
  ) {
    return 'science';
  }

  if (
    hasAny(entity, 'P31', CULTURE_INSTANCE_QIDS) ||
    hasAny(entity, 'P106', CULTURE_OCCUPATION_QIDS) ||
    hasClaim(entity, 'P136') // genre
  ) {
    return 'culture';
  }

  if (
    hasAny(entity, 'P31', POLITICS_INSTANCE_QIDS) ||
    hasAny(entity, 'P106', POLITICS_OCCUPATION_QIDS)
  ) {
    return 'politics';
  }

  if (isHuman) {
    // For biographies, party membership alone should not override arts/sports/science.
    if (hasClaim(entity, 'P39')) return 'politics'; // position held
  } else if (hasClaim(entity, 'P39') || hasClaim(entity, 'P102')) {
    // For non-human entities (institutions/events), these are stronger political signals.
    return 'politics';
  }

  if (
    hasAny(entity, 'P31', DISCOVERY_INSTANCE_QIDS) ||
    hasClaim(entity, 'P61') // discoverer or inventor
  ) {
    return 'discovery';
  }

  return null;
};

const fetchWikibaseItemsByPageId = async ({ language, pageIds, signal }) => {
  if (!pageIds.length) return {};
  const chunks = chunk(pageIds, PAGEIDS_CHUNK_SIZE);
  const pageIdToItem = {};

  for (const ids of chunks) {
    const url = `https://${language}.wikipedia.org/w/api.php?action=query&prop=pageprops&pageids=${ids.join(
      '|',
    )}&ppprop=wikibase_item&format=json&origin=*`;
    const response = await fetch(url, { signal });
    if (!response.ok) continue;
    const payload = await response.json();
    const pages = payload?.query?.pages || {};
    Object.values(pages).forEach((page) => {
      const currentPageId = String(page?.pageid || '');
      const item = page?.pageprops?.wikibase_item;
      if (currentPageId && item) {
        pageIdToItem[currentPageId] = item;
      }
    });
  }

  return pageIdToItem;
};

const fetchEntityCategoryMap = async ({ entityIds, signal }) => {
  if (!entityIds.length) return {};
  const chunks = chunk(entityIds, ENTITY_IDS_CHUNK_SIZE);
  const categoryByEntityId = {};

  for (const ids of chunks) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join(
      '|',
    )}&props=claims&format=json&origin=*`;
    const response = await fetch(url, { signal });
    if (!response.ok) continue;
    const payload = await response.json();
    const entities = payload?.entities || {};

    Object.entries(entities).forEach(([id, entity]) => {
      const category = inferCategoryFromEntity(entity);
      if (category) categoryByEntityId[id] = category;
    });
  }

  return categoryByEntityId;
};

export const enrichEventsWithWikidataCategory = async ({
  data,
  language = 'en',
  signal,
}) => {
  if (!data) return data;
  const groups = ['births', 'events', 'holidays'];
  const pageIds = new Set();
  const cache = typeof window !== 'undefined' ? readCache() : {};
  const now = Date.now();

  groups.forEach((group) => {
    (data?.[group] || []).forEach((event) => {
      const pageId = getPrimaryPage(event)?.pageid ?? event?.pages?.[0]?.pageid;
      if (pageId == null) return;
      const pageIdStr = String(pageId);
      const cached = cache[pageIdStr];
      const isFresh =
        cached &&
        typeof cached === 'object' &&
        typeof cached.category === 'string' &&
        now - Number(cached.updatedAt || 0) < CACHE_TTL_MS;

      if (isFresh) {
        event._derivedCategory = cached.category;
        event._derivedCategorySource = cached.source || 'wikidata-cache';
        return;
      }

      pageIds.add(pageIdStr);
    });
  });

  if (pageIds.size === 0) return data;

  try {
    const pageIdToItem = await fetchWikibaseItemsByPageId({
      language,
      pageIds: Array.from(pageIds).slice(0, MAX_PAGE_IDS_PER_PASS),
      signal,
    });
    const entityIds = Array.from(new Set(Object.values(pageIdToItem)));
    if (entityIds.length === 0) return data;

    const categoryByEntityId = await fetchEntityCategoryMap({
      entityIds,
      signal,
    });

    groups.forEach((group) => {
      (data?.[group] || []).forEach((event) => {
        const pageId = String(
          getPrimaryPage(event)?.pageid ?? event?.pages?.[0]?.pageid ?? '',
        );
        const entityId = pageIdToItem[pageId];
        const derivedCategory = categoryByEntityId[entityId];
        if (derivedCategory) {
          event._derivedCategory = derivedCategory;
          event._derivedCategorySource = 'wikidata';
          event._derivedCategoryPageId = pageId;
          cache[pageId] = {
            category: derivedCategory,
            source: 'wikidata-cache',
            updatedAt: now,
          };
        }
      });
    });

    if (typeof window !== 'undefined') {
      writeCache(cache);
    }
  } catch {
    return data;
  }

  return data;
};
