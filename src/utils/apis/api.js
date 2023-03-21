// Import constants
import { API_URL } from '../constants/constants';

// Import date
import { month, day } from '../date/date';

// Get data
export async function getData() {
  const getDataFromAPI = await fetch(`${API_URL}/${month}/${day}`);
  if (!getDataFromAPI.ok) {
    throw new Error(`Problem getting data. Status: ${getDataFromAPI.status}`);
  }
  const data = await getDataFromAPI.json();
  return data;
}
