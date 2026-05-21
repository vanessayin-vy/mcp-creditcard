import { useState } from "react";
import { CreditCard, Transaction } from "../types";
import { CreditCard as CardIcon, ArrowUpRight, TrendingUp, AlertTriangle, CheckCircle, Info, Plus } from "lucide-react";

interface HomeDashboardProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  onToggleCard: (cardId: string) => void;
  onAddCustomSpend: (cardId: string, amount: number) => void;
}

export default function HomeDashboard({
  cards,
  transactions,
  onNavigate,
  onToggleCard,
  onAddCustomSpend,
}: HomeDashboardProps) {
  const [showAddSpendId, setShowAddSpendId] = useState<string | null>(null);
  const [spendAmount, setSpendAmount] = useState<string>("50");

  // Calculate stats
  const earned = transactions.reduce((acc, t) => acc + t.cashbackEarned, 0);
  const potential = transactions.reduce((acc, t) => acc + t.potentialCashback, 0);
  const missed = Math.max(0, potential - earned);
  const percent = potential > 0 ? Math.round((earned / potential) * 100) : 0;

  // Find Cards
  const uobCard = cards.find(c => c.id === "uob_one");
  const isUobActive = uobCard ? true : false;
  const isUobUnmet = uobCard && uobCard.currentSpend < uobCard.minSpendRequired;
  const uobGap = uobCard ? uobCard.minSpendRequired - uobCard.currentSpend : 0;

  const handleAddSpendSubmit = (id: string) => {
    const amt = parseFloat(spendAmount);
    if (!isNaN(amt) && amt > 0) {
      onAddCustomSpend(id, amt);
      setShowAddSpendId(null);
      setSpendAmount("50");
    }
  };

  return (
    <div className="space-y-6" id="home-dashboard-root">
      {/* Top Welcome Title */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-slate-800 flex items-center gap-2" id="dashboard-brand-title">
            SGCashMax <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2.5 py-0.5 rounded uppercase">Live Advisor</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Singapore's high-density cashback optimization engine</p>
        </div>
        <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
          Active Portfolio
        </div>
      </div>

      {/* Grid containing Accumulated stats + top pick banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Main Cashback Counter Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4" id="may-cashback-hero">
          <div>
            <span className="text-slate-500 font-medium text-xs">Accumulated Cashback</span>
            <div className="flex justify-between items-baseline mt-1" id="cashback-large-number">
              <span className="text-5xl font-black text-indigo-600 mt-1 italic tracking-tight">${earned.toFixed(2)}</span>
              <span className="text-xs text-slate-400 font-medium font-mono">earned this cycle</span>
            </div>
          </div>

          <div className="pt-3 border-t border-dashed border-slate-200 flex items-end justify-between">
            <div>
              <p className="text-rose-500 font-bold text-lg leading-none">-${missed.toFixed(2)}</p>
              <p className="text-xs text-slate-400">Potential Gap</p>
            </div>
            <button 
              onClick={() => onNavigate("report")}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg shadow-lg shadow-slate-200 transition-all"
            >
              Efficiency Report
            </button>
          </div>
        </div>

        {/* Progress Optimization Box styled like high density theme */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-slate-500 font-medium text-xs block">Efficiency level</span>
            <div className="flex justify-between items-end">
              <span className="text-4xl font-extrabold text-slate-800">{percent}%</span>
              <span className="text-xs text-indigo-600 font-bold font-mono">optimal capture</span>
            </div>
            <div className="h-2 w-full bg-slate-150 rounded-full overflow-hidden flex bg-slate-100">
              <div 
                className="bg-indigo-600 h-full transition-all duration-700 ease-out" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Potential Max</span>
              <span className="text-sm font-bold text-slate-700 block font-mono">${potential.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Missed leakage</span>
              <span className="text-sm font-bold text-rose-500 block font-mono">${missed.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Pick Right Now Banner */}
      <div 
        className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl flex justify-between items-center cursor-pointer hover:bg-emerald-100/70 transition-all duration-200"
        id="top-pick-banner"
        onClick={() => onNavigate("cards")}
      >
        <div className="space-y-1">
          <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase bg-emerald-100 px-2.5 py-0.5 rounded">Top pick right now</span>
          <h3 className="text-base font-bold text-slate-800 mt-1">Use OCBC 365 card</h3>
          <p className="text-xs text-slate-500">Currently gives 3% on Grocery (NTUC FairPrice) → <span className="font-semibold text-emerald-600 font-mono">+$4.20 extra</span> rewards</p>
        </div>
        <div className="h-9 w-9 rounded-full bg-white flex items-center justify-center border border-emerald-200 text-emerald-600 shadow-xs">
          <ArrowUpRight className="h-5 w-5" />
        </div>
      </div>

      {/* Wallet / Your Cards */}
      <div className="space-y-3" id="wallet-section">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Interactive Singapore Wallet</h3>
          <span className="text-xs text-slate-400 font-medium">Add spend to simulate cycle checks</span>
        </div>

        {/* Card List with Spend trackers */}
        <div className="space-y-3">
          {cards.map((card) => {
            const isUnmet = card.currentSpend < card.minSpendRequired;
            const unmetPercent = card.minSpendRequired > 0 
              ? Math.min(100, Math.round((card.currentSpend / card.minSpendRequired) * 100))
              : 100;

            return (
              <div 
                key={card.id} 
                className={`bg-white border rounded-2xl overflow-hidden shadow-sm transition-colors duration-200 ${
                  isUnmet && card.minSpendRequired > 0 ? 'border-amber-300' : 'border-slate-200 hover:border-slate-300'
                }`}
                id={`wallet-card-${card.id}`}
              >
                <div className="p-5 flex justify-between items-start gap-4">
                  <div className="flex gap-4">
                    <div className={`p-3 rounded-xl flex items-center justify-center shrink-0 ${
                      card.bank === "OCBC" ? "bg-red-50 text-red-600" : 
                      card.bank === "UOB" ? "bg-blue-50 text-blue-800" : 
                      card.bank === "DBS" ? "bg-red-50 text-emerald-700" : 
                      "bg-slate-50 text-slate-700"
                    }`}>
                      <CardIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-800">{card.name}</h4>
                        <span className="text-[10px] font-bold font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500">{card.bank}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Spend: <strong className="text-slate-850 font-semibold font-mono">${card.currentSpend}</strong></span>
                        {card.minSpendRequired > 0 && (
                          <span>Target: <strong className="text-slate-400 font-mono">${card.minSpendRequired}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Side Buttons */}
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                      Up to {card.maxCashbackRate}%
                    </span>
                    <button 
                      onClick={() => setShowAddSpendId(showAddSpendId === card.id ? null : card.id)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add Spend
                    </button>
                  </div>
                </div>

                {/* Add Spend Modal Drawer */}
                {showAddSpendId === card.id && (
                  <div className="bg-slate-50 border-t border-slate-150 p-4 flex sm:flex-row flex-col justify-between items-center gap-3">
                    <span className="text-xs text-slate-650 font-medium">Add purchase to simulate spend progress:</span>
                    <div className="flex gap-2 items-center w-full sm:w-auto">
                      <span className="text-xs text-slate-400 font-mono">$</span>
                      <input 
                        type="number" 
                        value={spendAmount}
                        onChange={(e) => setSpendAmount(e.target.value)}
                        placeholder="50" 
                        className="w-20 px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-center font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <button 
                        onClick={() => handleAddSpendSubmit(card.id)}
                        className="bg-slate-900 hover:bg-slate-800 text-white text-xs px-3.5 py-1.5 rounded-lg font-bold transition-colors"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}

                {/* Spend meter progress */}
                {card.minSpendRequired > 0 && (
                  <div className="px-5 pb-4 pt-1.5 space-y-2 border-t border-slate-100 bg-slate-50/40">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-550">Monthly Spend Threshold Progress</span>
                      <span className={`font-mono font-bold ${isUnmet ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {unmetPercent}% ({isUnmet ? `$${card.minSpendRequired - card.currentSpend} needed` : 'Threshold Met! 🎉'})
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200/60 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${isUnmet ? 'bg-amber-400' : 'bg-emerald-500'}`}
                        style={{ width: `${unmetPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Threshold Alert Banner */}
      {isUobActive && isUobUnmet && (
        <div className="bg-amber-50 border border-amber-200 p-5 rounded-3xl flex gap-4" id="threshold-alert-card">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1.5">
            <h4 className="font-bold text-sm text-amber-950">UOB One Critical Spend Alert!</h4>
            <p className="text-xs text-amber-700 leading-relaxed font-semibold">
              You are exactly <strong className="text-slate-900 font-bold font-mono">${uobGap}</strong> away from hitting the <strong className="text-slate-900 font-semibold font-mono">$500</strong> min spend tier. 
              Failing to hit this will drop your quarterly base rate to 0.3% — costing you an estimated <strong className="text-red-650 font-bold font-mono">$43.60</strong> rewards leakage!
            </p>
            <div className="pt-2 flex gap-2 flex-wrap">
              <button 
                onClick={() => onNavigate("upload")}
                className="text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors"
              >
                Upload Bill Statement to sync
              </button>
              <button 
                onClick={() => onNavigate("ask-ai")}
                className="text-xs bg-white hover:bg-slate-50 text-amber-800 font-bold px-3 py-1.5 rounded-lg border border-amber-200 transition-colors"
              >
                Ask AI what to buy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Continuous Improvement Feed Info banner */}
      <div className="bg-indigo-950 p-6 rounded-3xl text-white space-y-3 shadow-lg">
        <div className="flex gap-2 items-center">
          <Info className="h-5 w-5 text-emerald-450 shrink-0 text-emerald-400" />
          <h4 className="font-bold text-sm text-indigo-100 font-sans uppercase tracking-wider">SingSaver Optimization Channel</h4>
        </div>
        <p className="text-xs text-indigo-250 leading-relaxed text-indigo-200">
          We found a card campaign for Singaporeans: **HSBC Live+ Card** currently gives a **S$150 sign-up bonus** and **8% cashback on dining** (min spend S$600).
        </p>
        <button 
          onClick={() => onNavigate("ask-ai")}
          className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-xl inline-flex items-center gap-1 transition-colors"
        >
          Check eligibility with AI Max
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
