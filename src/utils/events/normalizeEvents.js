import { categorizeEvent, getCategoryClassification, getPrimaryPage } from './eventMeta';

const EVENT_GROUPS = ['births', 'events', 'holidays'];

const getCurrentYear = () => new Date().getFullYear();

export const normalizeEvent = (event, currentYear = getCurrentYear()) => {
  if (!event || event._normalizedEvent) return event;

  const primaryPage = getPrimaryPage(event) || event?.pages?.[0] || null;
  const categoryMeta = getCategoryClassification(event);
  const category = categoryMeta.category || categorizeEvent(event);
  const eventYear = Number(event?.year);
  const yearsAgo =
    Number.isFinite(eventYear) && eventYear > 0 && eventYear <= currentYear
      ? currentYear - eventYear
      : null;

  return {
    ...event,
    _normalizedEvent: true,
    _primaryPage: primaryPage,
    _primaryPageId: primaryPage?.pageid != null ? String(primaryPage.pageid) : '',
    _category: category,
    _categoryMeta: categoryMeta,
    _title: primaryPage?.titles?.normalized || primaryPage?.normalizedtitle || '',
    _description: primaryPage?.description || '',
    _extract: primaryPage?.extract || '',
    _thumbnail: primaryPage?.thumbnail?.source || '',
    _yearsAgo: yearsAgo,
  };
};

export const normalizeEventsData = (data) => {
  if (!data) return data;
  const currentYear = getCurrentYear();
  const nextData = { ...data };

  EVENT_GROUPS.forEach((group) => {
    nextData[group] = (data?.[group] || []).map((event) =>
      normalizeEvent(event, currentYear),
    );
  });

  return nextData;
};

export const getEventPrimaryPage = (event) =>
  event?._primaryPage || getPrimaryPage(event) || event?.pages?.[0] || null;

export const getEventCategory = (event) =>
  event?._category || categorizeEvent(event);

export const getEventCategoryMeta = (event) =>
  event?._categoryMeta || getCategoryClassification(event);
