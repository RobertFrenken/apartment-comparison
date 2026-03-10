import { useState, useCallback } from "react";

// Reusable hook for localStorage-backed state.
// Usage: const [value, setValue] = useLocalStorage("key", defaultValue);
export default function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const set = useCallback((newValue) => {
    setValue((prev) => {
      const resolved = typeof newValue === "function" ? newValue(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  }, [key]);

  const reset = useCallback(() => {
    localStorage.removeItem(key);
    setValue(defaultValue);
  }, [key, defaultValue]);

  return [value, set, reset];
}
