import { useMemo } from "react";
import { CreditCard, Transaction, MerchantCategory } from "../types";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface MonthlyReportProps {
  cards: CreditCard[];
  transactions: Transaction[];
  onNavigate: (tab: string, arg?: string) => void;
}

export default function MonthlyReport({ cards, transactions, onNavigate }: MonthlyReportProps) {
  // Stats
  const { earned, potential, missed, percent } = useMemo(() => {
    const ern = transactions.reduce((acc, t) => acc + t.cashbackEarned, 0);
    const pot = transactions.reduce((acc, t) => acc + t.potentialCashback, 0);
    const msd = Math.max(0, pot - ern);
    const pct = pot > 0 ? Math.round((ern / pot) * 100) : 0;
    return { earned: ern, potential: pot, missed: msd, percent: pct };
  }, [transactions]);

  // Breakdown of category spend and rewards
  const categorySummary = useMemo(() => {
    const rawBreakdown: Record<MerchantCategory, { earned: number; potential: number; color: string }> = {
      Dining: { earned: 0, potential: 0, color: "bg-orange-500" },
      Grocery: { earned: 0, potential: 0, color: "bg-green-500" },
      Petrol: { earned: 0, potential: 0, color: "bg-amber-500" },
      Online: { earned: 0, potential: 0, color: "bg-indigo-505" },
      Transport: { earned: 0, potential: 0, color: "bg-purple-500" },
      Grab: { earned: 0, potential: 0, color: "bg-emerald-500" },
      Others: { earned: 0, potential: 0, color: "bg-slate-400" },
    };

    transactions.forEach((tx) => {
      const cat = tx.category in rawBreakdown ? tx.category : "Others" as MerchantCategory;
      if (rawBreakdown[cat]) {
        rawBreakdown[cat].earned += tx.cashbackEarned;
        rawBreakdown[cat].potential += tx.potentialCashback;
      }
    });

    return Object.entries(rawBreakdown).map(([name, val]) => ({
      name,
      earned: val.earned,
      potential: val.potential,
      color: val.color,
    })).filter(cat => cat.potential > 0);
  }, [transactions]);

  // SVG parameters for donut
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <div className="space-y-6" id="monthly-report-root">
      {/* Selection Month Banner */}
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800 leading-tight">Efficiency Report - May 2026</h2>
          <p className="text-xs text-slate-405 text-slate-400">Statement review and leakage assessment</p>
        </div>
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 text-xs font-semibold">
          <span className="bg-white text-slate-800 px-3 py-1 rounded-md shadow-2xs">Monthly</span>
          <span className="text-slate-400 px-3 py-1 my-auto cursor-pointer">Quarterly</span>
        </div>
      </div>

      {/* Donut Chart Block (Screen 3 visual card) - HIGH DENSITY DESKTOP OPTIMIZED */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-10">
        {/* SVG Donut */}
        <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circular track */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#f1f5f9"
              strokeWidth="12"
              fill="transparent"
            />
            {/* Colored active stroke */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#4f46e5"
              strokeWidth="12"
              className="transition-all duration-700 donut-circle"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>
          <div className="absolute text-center">
            <p className="text-3xl font-black text-slate-900">{percent}%</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Optimized</p>
          </div>
        </div>

        {/* Stat Description */}
        <div className="flex-1 space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
            <p className="text-sm font-bold text-amber-900">Max potential: S${potential.toFixed(2)}</p>
            <p className="text-xs text-amber-700 mt-1">
              You missed <strong className="text-slate-900 font-bold font-mono">S${missed.toFixed(2)}</strong> this month. Switching transaction flows can easily recover this leakage!
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex justify-between items-center text-slate-500 border-b border-slate-100 pb-1.5">
              <span>Optimized Yield</span>
              <span className="font-bold text-emerald-600 font-mono">S${earned.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 border-b border-slate-100 pb-1.5">
              <span>Unclaimed Leakage</span>
              <span className="font-bold text-rose-500 font-mono">S${missed.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cashback by category breakdown progress (Screen 3 breakdown) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cashback by Reward Categories</h3>
          <span className="text-xs text-slate-500 font-bold font-mono">S${earned.toFixed(2)} achieved</span>
        </div>

        <div className="space-y-4">
          {categorySummary.map((cat, index) => {
            const catPct = cat.potential > 0 ? (cat.earned / cat.potential) * 100 : 0;
            return (
              <div key={index} className="space-y-1.5" id={`category-breakdown-${cat.name}`}>
                <div className="flex justify-between items-baseline text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">({Math.round(catPct)}% optimization)</span>
                  </div>
                  <div className="font-mono text-slate-500 font-semibold">
                    S${cat.earned.toFixed(2)} <span className="text-[10px] text-slate-400">/ S${cat.potential.toFixed(2)}</span>
                  </div>
                </div>
                {/* Horizontal Progress bar */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  {/* Earned portion */}
                  <div 
                    className="bg-indigo-650 h-full rounded-l bg-indigo-600" 
                    style={{ width: `${catPct}%` }}
                  ></div>
                  {/* Missed portion */}
                  <div 
                    className="bg-rose-100 h-full rounded-r" 
                    style={{ width: `${100 - catPct}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Switch Cards Advice Banner (Screen 3 Amber Box) */}
      {missed > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl space-y-3 shadow-sm" id="amber-recommender-card">
          <div className="flex gap-2 items-center">
            <Sparkles className="h-5 w-5 text-amber-600 shrink-0" />
            <h4 className="font-bold text-sm text-amber-900">
              S${missed.toFixed(2)} left unclaimed this month
            </h4>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed font-semibold">
            Your spending contains leakages on groceries and dining. Switching only <strong className="text-slate-900 font-bold">2 cards</strong> in your daily workflow unlocks this hidden cashback!
          </p>
          <div className="pt-3 border-t border-amber-200/60">
            <button 
              onClick={() => onNavigate("ask-ai", "How do I fix my monthly cashback leak and unlock my full potential of S$" + potential.toFixed(0) + "?")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4.5 py-3 rounded-xl shadow-md transition-all flex items-center justify-between w-full"
            >
              <span>See what to fix and launch AI Plan</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Optimised Status validation feedback */}
      {missed <= 3 && (
        <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-3xl flex gap-3 text-emerald-800">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-emerald-950">Incredibly optimized month!</h4>
            <p className="text-xs text-emerald-700 leading-relaxed">
              Your wallet allocations are perfectly coordinated. You are capturing virtually 100% of the available rewards in Singapore's credit terms. Keep uploading statement imports to verify next cycles!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
