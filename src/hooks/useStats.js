import { useState, useCallback } from 'react';

const STORAGE_KEY = 'eve-hack-stats-v1';

const DEFAULT_STATS = {
  rookie:   { wins: 0, losses: 0 },
  standard: { wins: 0, losses: 0 },
  elite:    { wins: 0, losses: 0 },
};

function loadStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    // Merge with defaults to handle missing keys
    return {
      rookie:   { ...DEFAULT_STATS.rookie,   ...(parsed.rookie   ?? {}) },
      standard: { ...DEFAULT_STATS.standard, ...(parsed.standard ?? {}) },
      elite:    { ...DEFAULT_STATS.elite,    ...(parsed.elite    ?? {}) },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

function saveStats(stats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

export function useStats() {
  const [data, setData] = useState(loadStats);

  const recordWin = useCallback((difficultyKey) => {
    setData(prev => {
      const next = {
        ...prev,
        [difficultyKey]: {
          wins:   (prev[difficultyKey]?.wins   ?? 0) + 1,
          losses:  prev[difficultyKey]?.losses  ?? 0,
        },
      };
      saveStats(next);
      return next;
    });
  }, []);

  const recordLoss = useCallback((difficultyKey) => {
    setData(prev => {
      const next = {
        ...prev,
        [difficultyKey]: {
          wins:    prev[difficultyKey]?.wins   ?? 0,
          losses: (prev[difficultyKey]?.losses ?? 0) + 1,
        },
      };
      saveStats(next);
      return next;
    });
  }, []);

  return { data, recordWin, recordLoss };
}
