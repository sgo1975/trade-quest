import React, { useState, useEffect } from 'react';
import { useGameLogic } from './useGameLogic';
import { CLASS_TYPES, INITIAL_PARTY } from './gameConfig';

function App() {
  const [party, setParty] = useState(() => {
    const saved = localStorage.getItem('tq_party');
    return saved ? JSON.parse(saved) : INITIAL_PARTY;
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [newCoinId, setNewCoinId] = useState('');
  const [newClass, setNewClass] = useState('tank');

  const activeHero = party[activeIndex] || party[0];
  const { price, level, hp, xp, status, change24h, loading, error, manualRefetch, lastUpdate } = 
    useGameLogic(activeHero.id, activeHero.classType);

  // Speichere die Party-Konfiguration lokal
  useEffect(() => {
    localStorage.setItem('tq_party', JSON.stringify(party));
  }, [party]);

  const addHero = () => {
    if (!newCoinId) return;
    const id = newCoinId.toLowerCase().trim().replace(/\s+/g, '-');
    setParty([...party, { id, classType: newClass }]);
    setNewCoinId('');
    setIsAdding(false);
    setActiveIndex(party.length);
  };

  const removeHero = (e, index) => {
    e.stopPropagation();
    if (party.length <= 1) return;
    const newParty = party.filter((_, i) => i !== index);
    setParty(newParty);
    setActiveIndex(0);
  };

  // Dynamische Ermittlung des anzuzeigenden Emojis
  const getDisplayEmoji = () => {
    if (error) return '⚠️';
    if (loading && !price) return '🔍'; 
    if (hp <= 0) return '💀';
    return status === 'Buffed' ? CLASS_TYPES[activeHero.classType].emoji : '💢';
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center p-4 font-mono select-none overflow-x-hidden">
      
      {/* App Bar */}
      <div className="w-full max-w-sm flex justify-between items-center mb-6 pt-4 px-2">
        <h1 className="text-xl font-black italic tracking-tighter text-blue-500 uppercase">TradeQuest</h1>
        <button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-500 text-[10px] px-4 py-2 rounded-xl font-bold shadow-lg transition-all active:scale-95">
          + SUMMON
        </button>
      </div>

      {/* Hero Battle Card */}
      <div className={`w-full max-w-sm bg-slate-800 border-x-4 border-t-4 border-slate-700 rounded-t-3xl p-6 shadow-2xl relative z-10 min-h-[400px] flex flex-col justify-between transition-all duration-300 ${error ? 'border-red-900 shadow-red-900/10' : 'border-slate-700'}`}>
        
        {loading && (
          <div className="absolute top-4 right-4 animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full z-30"></div>
        )}

        <div>
          <div className="flex justify-between items-start mb-6">
            <div className="max-w-[70%]">
              <span className="text-[10px] text-slate-500 uppercase block truncate tracking-widest font-bold italic">{activeHero.id}</span>
              <h2 className={`text-xl font-black truncate ${CLASS_TYPES[activeHero.classType].color}`}>
                {CLASS_TYPES[activeHero.classType].name}
              </h2>
            </div>
            <div className="bg-blue-600 px-3 py-1 rounded text-xs font-black italic">LVL {level}</div>
          </div>

          <div className="h-40 flex flex-col items-center justify-center relative">
            <div className={`text-8xl mb-4 transition-all duration-300 ${loading ? 'scale-110 blur-[1px]' : 'scale-100 blur-0'}`}>
              {getDisplayEmoji()}
            </div>
            
            {error ? (
              <div className="text-red-500 text-[10px] font-black uppercase text-center px-4 bg-red-500/10 py-1 rounded-lg border border-red-500/20 max-w-[80%]">
                {error}
              </div>
            ) : (
              <div className={`px-4 py-1 rounded-full text-xs font-black border-2 ${Number(change24h) >= 0 ? 'bg-green-500/10 border-green-500 text-green-400' : 'bg-red-500/10 border-red-500 text-red-400'}`}>
                {Number(change24h) >= 0 ? '▲' : '▼'} {Math.abs(change24h)}%
              </div>
            )}
          </div>
        </div>

        {/* Stats Bars */}
        <div className="space-y-4">
          <div className="h-4 w-full bg-slate-950 rounded border border-slate-700 p-0.5 shadow-inner">
            <div className="bg-red-600 h-full rounded-sm transition-all duration-1000 shadow-[0_0_10px_rgba(220,38,38,0.4)]" style={{ width: `${hp}%` }}></div>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.4)]" style={{ width: `${xp}%` }}></div>
          </div>
        </div>
      </div>

      {/* Hero Selection (Inventory) */}
      <div className="w-full max-w-sm bg-slate-800 rounded-b-3xl border-x-4 border-b-4 border-slate-700 relative mb-8">
        <div className="overflow-x-auto flex gap-3 p-4 snap-x snap-mandatory scrollbar-hide">
          {party.map((hero, i) => (
            <div key={i} className="relative snap-center">
              <button 
                onClick={() => setActiveIndex(i)}
                className={`flex flex-col items-center p-4 rounded-2xl transition-all min-w-[85px] ${activeIndex === i ? 'bg-slate-900 ring-2 ring-blue-500 shadow-xl scale-105' : 'bg-slate-700/30 opacity-40 hover:opacity-80'}`}
              >
                <span className="text-2xl">{CLASS_TYPES[hero.classType].emoji}</span>
                <span className="text-[9px] uppercase font-black mt-2 truncate w-16 text-center tracking-tighter">{hero.id}</span>
              </button>
              {party.length > 1 && (
                <button onClick={(e) => removeHero(e, i)} className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] w-5 h-5 rounded-full border-2 border-slate-800 flex items-center justify-center font-bold hover:scale-110 transition-transform">×</button>
              )}
            </div>
          ))}
          <div className="min-w-[20px]"></div>
        </div>
      </div>

      {/* Action Button */}
      <button 
        onClick={() => manualRefetch()} 
        disabled={loading} 
        className="w-full max-w-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-30 py-4 rounded-2xl font-black shadow-[0_4px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none transition-all uppercase tracking-[0.2em] italic"
      >
        {loading ? 'Consulting Oracle...' : 'Search for Loot'}
      </button>

      {/* Summoning Modal */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-50 p-6 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-800 p-8 rounded-[2.5rem] border-2 border-blue-500 w-full max-w-xs shadow-2xl scale-in-95 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-6 text-center italic uppercase">Summon Hero</h3>
            <input 
              type="text" 
              placeholder="coin id (e.g. solana)" 
              value={newCoinId}
              onChange={(e) => setNewCoinId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl mb-6 text-center focus:ring-2 focus:ring-blue-500 outline-none uppercase text-xs font-black tracking-widest shadow-inner"
            />
            <div className="grid grid-cols-3 gap-3 mb-8">
              {Object.entries(CLASS_TYPES).map(([key, val]) => (
                <button 
                  key={key} 
                  onClick={() => setNewClass(key)} 
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center transition-all ${newClass === key ? 'border-blue-500 bg-blue-500/10 scale-105' : 'border-transparent bg-slate-900 opacity-40'}`}
                >
                  <span className="text-2xl mb-1">{val.emoji}</span>
                  <span className="text-[8px] font-black uppercase">{key}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsAdding(false)} className="flex-1 bg-slate-700 py-4 rounded-xl text-[10px] font-black uppercase opacity-50">Back</button>
              <button onClick={addHero} className="flex-1 bg-blue-600 py-4 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/30">Summon</button>
            </div>
          </div>
        </div>
      )}

      {/* Oracle Footer */}
      <div className="mt-auto pt-8 text-center">
        <p className="text-slate-600 text-[10px] tracking-[0.4em] uppercase mb-1 font-bold">Oracle Price Feed</p>
        <p className="text-3xl font-black tracking-tighter">${price ? price.toLocaleString() : '---'}</p>
        <p className="text-[9px] text-slate-700 mt-2 font-black uppercase italic tracking-widest">
          {lastUpdate ? `Last Sync: ${lastUpdate}` : 'Awaiting data stream...'}
        </p>
      </div>
    </div>
  );
}

export default App;