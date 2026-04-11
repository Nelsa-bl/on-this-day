// Add known hard cases here after checking their Wikimedia pageid.
// Overrides are intentionally data-only so they are easy to review.
export const CATEGORY_OVERRIDES_BY_PAGE_ID = {
  // '12345': 'sports',
};

export const getCategoryOverride = (event, primaryPage) => {
  const pageId = String(primaryPage?.pageid || '');
  if (!pageId) return null;
  return CATEGORY_OVERRIDES_BY_PAGE_ID[pageId] || null;
};
