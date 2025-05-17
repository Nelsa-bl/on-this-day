// Get date
function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const weekday = date.toLocaleString('en', { weekday: 'long' });

  return { year, month, day, weekday };
}

const today = new Date();
export const { year, month, day, weekday } = getFormattedDate(today);
