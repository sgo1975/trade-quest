import { useState, useEffect, useCallback, useRef } from 'react';
import { CLASS_TYPES } from './gameConfig';

// Globaler Cache speichert den Zustand jedes Helden separat
const sessionCache = {};

export const useGameLogic = (symbol = 'bitcoin', classType = 'tank') => {
  // Initialisierung aus dem Cache oder Standardwerte
  const [stats, setStats] = useState(() => {
    return sessionCache[symbol]?.stats || {
      price: 0, level: 1, hp: 100, xp: 0, status: 'Idle',
      change24h: 0, lastUpdate: ''
    };
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => sessionCache[symbol]?.error || null);
  
  const config = CLASS_TYPES[classType];
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (!symbol) return;
    
    // Alten Request abbrechen um Race Conditions zu vermeiden
    if (abortControllerRef.current) abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null); // Reset Error-State bei jedem neuen Versuch

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&include_24hr_change=true&vs_currencies=usd`,
        { signal: abortControllerRef.current.signal }
      );
      
      const data = await response.json();
      
      if (!data[symbol] || Object.keys(data[symbol]).length === 0) {
        throw new Error(`Hero "${symbol}" not found`);
      }

      const currentPrice = data[symbol].usd;
      const change = data[symbol].usd_24h_change || 0;
      const currentStats = sessionCache[symbol]?.stats || stats;

      // RPG-Logik Kalkulation
      const xpGain = change > 0 ? (change * 10 * config.multiplier) : 0;
      const hpLoss = change < 0 ? (Math.abs(change) * 5 * config.defense) : -0.5;

      const finalStats = {
        price: currentPrice,
        change24h: change.toFixed(2),
        lastUpdate: new Date().toLocaleTimeString(),
        status: change >= 0 ? 'Buffed' : 'Taking Damage',
        xp: Math.round(((currentStats.xp || 0) + xpGain) % 100),
        level: Math.floor(((currentStats.xp || 0) + xpGain) / 100) + (currentStats.level || 1),
        hp: Math.min(100, Math.max(0, (currentStats.hp || 100) - hpLoss))
      };

      // In Cache und State sichern
      sessionCache[symbol] = { stats: finalStats, error: null };
      setStats(finalStats);
      setError(null);

    } catch (e) {
      if (e.name !== 'AbortError') {
        const errorMsg = e.message;
        sessionCache[symbol] = { 
          stats: sessionCache[symbol]?.stats || stats, 
          error: errorMsg 
        };
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [symbol, config.multiplier, config.defense]);

  // Effekt bei Hero-Wechsel
  useEffect(() => {
    const cachedData = sessionCache[symbol];
    if (cachedData) {
      setStats(cachedData.stats);
      setError(cachedData.error);
    } else {
      setError(null);
    }

    fetchData();
    const interval = setInterval(fetchData, 60000); // Auto-Update jede Minute
    
    return () => {
      clearInterval(interval);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [symbol, fetchData]);

  return { ...stats, loading, error, manualRefetch: fetchData };
};