// Import constants
import { WIKIMEDIA_API_BASE, WIKIMEDIA_TOKEN } from '../constants/constants';

// Import date
import { month, day } from '../date/date';

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
