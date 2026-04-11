import { useState, useEffect, useMemo } from 'react';

const useSessionStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    try {
      const storedValue = sessionStorage.getItem(key);
      return storedValue !== null ? JSON.parse(storedValue) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore unavailable storage or quota issues.
    }
  }, [key, value]);

  return useMemo(() => [value, setValue], [value]);
};

export default useSessionStorage;
