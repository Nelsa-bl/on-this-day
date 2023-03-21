import { useState, useEffect, useMemo } from 'react';

const useSessionStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const storedValue = sessionStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialValue;
  });

  useEffect(() => {
    sessionStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return useMemo(() => [value, setValue], [value]);
};

export default useSessionStorage;
