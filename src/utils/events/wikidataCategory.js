import { getPrimaryPage } from './eventMeta';

const PAGEIDS_CHUNK_SIZE = 50;
const ENTITY_IDS_CHUNK_SIZE = 50;
const CACHE_KEY = 'wikidata-category-cache-v3';
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
const SUBCLASS_PROPERTIES = ['P31', 'P106', 'P136', 'P641', 'P921', 'P361', 'P793'];

const CATEGORY_QID_SETS = {
  sports: [SPORTS_INSTANCE_QIDS, SPORTS_OCCUPATION_QIDS],
  war: [WAR_INSTANCE_QIDS],
  culture: [CULTURE_INSTANCE_QIDS, CULTURE_OCCUPATION_QIDS],
  politics: [POLITICS_INSTANCE_QIDS, POLITICS_OCCUPATION_QIDS],
  science: [SCIENCE_INSTANCE_QIDS, SCIENCE_OCCUPATION_QIDS],
  discovery: [DISCOVERY_INSTANCE_QIDS],
};

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

const hasAnyOrSubclass = (entity, propertyId, expectedIds, subclassById = {}) => {
  const values = claimValues(entity, propertyId);
  return values.some((id) => {
    if (expectedIds.has(id)) return true;
    return (subclassById[id] || []).some((parentId) => expectedIds.has(parentId));
  });
};

const hasAnyCategorySignal = (entity, category, subclassById = {}) => {
  const expectedSets = CATEGORY_QID_SETS[category] || [];
  return SUBCLASS_PROPERTIES.some((propertyId) =>
    expectedSets.some((expectedIds) =>
      hasAnyOrSubclass(entity, propertyId, expectedIds, subclassById),
    ),
  );
};

const hasClaim = (entity, propertyId) =>
  Array.isArray(entity?.claims?.[propertyId]) &&
  entity.claims[propertyId].length > 0;

const inferCategoryFromEntity = (entity, subclassById = {}) => {
  if (!entity) return null;
  const isHuman = hasAnyOrSubclass(entity, 'P31', HUMAN_INSTANCE_QIDS, subclassById);
  const hasOccupation = hasClaim(entity, 'P106');
  const hasSport = hasClaim(entity, 'P641');
  const hasConflict = hasClaim(entity, 'P607');
  const hasSportsOccupation = hasAnyOrSubclass(
    entity,
    'P106',
    SPORTS_OCCUPATION_QIDS,
    subclassById,
  );
  const hasScienceOccupation = hasAnyOrSubclass(
    entity,
    'P106',
    SCIENCE_OCCUPATION_QIDS,
    subclassById,
  );
  const hasCultureOccupation = hasAnyOrSubclass(
    entity,
    'P106',
    CULTURE_OCCUPATION_QIDS,
    subclassById,
  );
  const hasPoliticsOccupation = hasAnyOrSubclass(
    entity,
    'P106',
    POLITICS_OCCUPATION_QIDS,
    subclassById,
  );
  const hasPosition = hasClaim(entity, 'P39');

  // For people, occupation and held office are stronger signals than generic sport tags.
  if (isHuman) {
    if (hasPoliticsOccupation || hasPosition) return 'politics';
    if (hasScienceOccupation) return 'science';
    if (hasCultureOccupation) return 'culture';
    if (hasSportsOccupation || hasSport) return 'sports';
    // Some biographies include conflict participation; don't override professions.
    if (hasConflict && !hasOccupation) return 'war';
  }

  if (
    hasAnyCategorySignal(entity, 'sports', subclassById) ||
    hasSport ||
    hasSportsOccupation
  ) {
    return 'sports';
  }

  if (
    hasAnyCategorySignal(entity, 'war', subclassById) ||
    (!isHuman && hasConflict) // conflict
  ) {
    return 'war';
  }

  if (
    hasAnyCategorySignal(entity, 'science', subclassById) ||
    hasScienceOccupation
  ) {
    return 'science';
  }

  if (
    hasAnyCategorySignal(entity, 'culture', subclassById) ||
    hasCultureOccupation ||
    hasClaim(entity, 'P136') // genre
  ) {
    return 'culture';
  }

  if (
    hasAnyCategorySignal(entity, 'politics', subclassById) ||
    hasPoliticsOccupation
  ) {
    return 'politics';
  }

  if (isHuman) {
    // For biographies, party membership alone should not override arts/sports/science.
    if (hasPosition) return 'politics'; // position held
  } else if (hasPosition || hasClaim(entity, 'P102')) {
    // For non-human entities (institutions/events), these are stronger political signals.
    return 'politics';
  }

  if (
    hasAnyCategorySignal(entity, 'discovery', subclassById) ||
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
  const entitiesById = {};

  for (const ids of chunks) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join(
      '|',
    )}&props=claims&format=json&origin=*`;
    const response = await fetch(url, { signal });
    if (!response.ok) continue;
    const payload = await response.json();
    const entities = payload?.entities || {};

    Object.assign(entitiesById, entities);
  }

  const relatedIds = new Set();
  Object.values(entitiesById).forEach((entity) => {
    SUBCLASS_PROPERTIES.forEach((propertyId) => {
      claimValues(entity, propertyId).forEach((id) => relatedIds.add(id));
    });
  });

  const subclassById = {};
  Object.entries(entitiesById).forEach(([id, entity]) => {
    if (relatedIds.has(id)) subclassById[id] = claimValues(entity, 'P279');
  });
  const missingRelatedIds = Array.from(relatedIds).filter((id) => !entitiesById[id]);
  for (const ids of chunk(missingRelatedIds, ENTITY_IDS_CHUNK_SIZE)) {
    const url = `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${ids.join(
      '|',
    )}&props=claims&format=json&origin=*`;
    const response = await fetch(url, { signal });
    if (!response.ok) continue;
    const payload = await response.json();
    const entities = payload?.entities || {};
    Object.entries(entities).forEach(([id, entity]) => {
      subclassById[id] = claimValues(entity, 'P279');
    });
  }

  Object.entries(entitiesById).forEach(([id, entity]) => {
    const category = inferCategoryFromEntity(entity, subclassById);
    if (category) categoryByEntityId[id] = category;
  });

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
  const cachedCategoryByPageId = {};
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
        cachedCategoryByPageId[pageIdStr] = {
          category: cached.category,
          source: cached.source || 'wikidata-cache',
        };
        return;
      }

      pageIds.add(pageIdStr);
    });
  });

  const applyCategories = (categoryByPageId) => {
    if (!Object.keys(categoryByPageId).length) return data;

    const nextData = { ...data };
    groups.forEach((group) => {
      nextData[group] = (data?.[group] || []).map((event) => {
        const pageId = String(
          getPrimaryPage(event)?.pageid ?? event?.pages?.[0]?.pageid ?? '',
        );
        const derived = categoryByPageId[pageId];
        if (!derived) return event;

        return {
          ...event,
          _normalizedEvent: false,
          _derivedCategory: derived.category,
          _derivedCategorySource: derived.source,
          _derivedCategoryPageId: pageId,
        };
      });
    });

    return nextData;
  };

  if (pageIds.size === 0) return applyCategories(cachedCategoryByPageId);

  try {
    const pageIdToItem = await fetchWikibaseItemsByPageId({
      language,
      pageIds: Array.from(pageIds).slice(0, MAX_PAGE_IDS_PER_PASS),
      signal,
    });
    const entityIds = Array.from(new Set(Object.values(pageIdToItem)));
    if (entityIds.length === 0) return applyCategories(cachedCategoryByPageId);

    const categoryByEntityId = await fetchEntityCategoryMap({
      entityIds,
      signal,
    });
    const categoryByPageId = { ...cachedCategoryByPageId };

    Object.entries(pageIdToItem).forEach(([pageId, entityId]) => {
      const derivedCategory = categoryByEntityId[entityId];
      if (!derivedCategory) return;

      categoryByPageId[pageId] = {
        category: derivedCategory,
        source: 'wikidata',
      };
      cache[pageId] = {
        category: derivedCategory,
        source: 'wikidata-cache',
        updatedAt: now,
      };
    });

    if (typeof window !== 'undefined') {
      writeCache(cache);
    }

    return applyCategories(categoryByPageId);
  } catch {
    return applyCategories(cachedCategoryByPageId);
  }
};
