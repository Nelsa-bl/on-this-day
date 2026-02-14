// Import constants
import { WIKIMEDIA_API_BASE, WIKIMEDIA_TOKEN } from '../constants/constants';

// Import date
import { year, month, day } from '../date/date';

// Get data
export async function getData(language = 'bs', signal) {
  const url = `${WIKIMEDIA_API_BASE}/${language}/onthisday/all/${month}/${day}`;
  const headers = WIKIMEDIA_TOKEN
    ? { Authorization: `Bearer ${WIKIMEDIA_TOKEN}` }
    : undefined;

  const getDataFromAPI = await fetch(url, {
    headers,
    signal,
  });

  if (!getDataFromAPI.ok) {
    throw new Error(`Problem getting data. Status: ${getDataFromAPI.status}`);
  }

  const data = await getDataFromAPI.json();
  return data;
}

export async function getFeaturedData(language = 'bs', signal) {
  const headers = WIKIMEDIA_TOKEN
    ? { Authorization: `Bearer ${WIKIMEDIA_TOKEN}` }
    : undefined;

  const languageCandidates = [
    language,
    language === 'bs' ? 'sr' : null,
  ].filter(Boolean);

  for (const lang of [...new Set(languageCandidates)]) {
    const urls = [
      `${WIKIMEDIA_API_BASE}/${lang}/featured/${year}/${month}/${day}`,
      `https://${lang}.wikipedia.org/api/rest_v1/feed/featured/${year}/${month}/${day}`,
    ];

    for (const url of urls) {
      const response = await fetch(url, {
        headers,
        signal,
      }).catch(() => null);

      if (!response?.ok) continue;
      const data = await response.json().catch(() => null);
      if (!data) continue;

      const hasMostRead = Array.isArray(data?.mostread?.articles);
      const hasNews = Array.isArray(data?.news);
      const hasTfa = Boolean(data?.tfa);
      if (!hasMostRead && !hasNews && !hasTfa) continue;

      return data;
    }
  }

  throw new Error('Problem getting featured data for all fallback languages.');
}
