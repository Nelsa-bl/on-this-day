// Import constants
import { ACCESS_TOKEN } from '../constants/constants';

// Import date
import { month, day } from '../date/date';

// Get data
export async function getData(language = 'bs') {
  const url = `https://api.wikimedia.org/feed/v1/wikipedia/${language}/onthisday/all/${month}/${day}`;

  const getDataFromAPI = await fetch(url, {
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
  });

  if (!getDataFromAPI.ok) {
    throw new Error(`Problem getting data. Status: ${getDataFromAPI.status}`);
  }

  const data = await getDataFromAPI.json();
  return data;
}
