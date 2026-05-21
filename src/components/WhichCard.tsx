import { useState, useMemo } from "react";
import { CreditCard } from "../types";
import { MERCHANT_DATABASE } from "../data/mockData";
import { Search, AlertTriangle, Sparkles } from "lucide-react";

interface WhichCardProps {
  cards: CreditCard[];
}

export default function WhichCard({ cards }: WhichCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Dining");
  const [transactionAmount, setTransactionAmount] = useState<string>("100");

  const categories = ["Dining", "Grocery", "Petrol", "Online", "Transport", "Grab"];

  // Sync category selection with preset merchants
  const recommendedResults = useMemo(() => {
    // Check if there is a search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      // Look up merchant list
      const matchedMerchant = MERCHANT_DATABASE.find(m => 
        m.merchant.toLowerCase().includes(q) || 
        m.category.toLowerCase().includes(q)
      );

      if (matchedMerchant) {
        return matchedMerchant;
      }
    }

    // Default to selected category
    const categoryMerchant = MERCHANT_DATABASE.find(m => m.category === selectedCategory);
    if (categoryMerchant) {
      return categoryMerchant;
    }

    // Fallback if none found
    return {
      merchant: `Unknown ${selectedCategory} Merchant`,
      category: selectedCategory,
      bestCard: "Citi Cash Back+",
      bestRate: "1.6%",
      differenceVsCiti: "+$0.00 (same as usual flat card)",
      others: [
        { cardName: "OCBC 365", rate: "0.3%", note: "requires $800 min monthly spend" },
        { cardName: "UOB One", rate: "0.3%", note: "reverts to base if unmet" },
        { cardName: "DBS Live Fresh", rate: "0.3%", note: "requires online/contactless" }
      ]
    };
  }, [searchQuery, selectedCategory]);

  // Check if recommended bestCard matches a card that is missing min spend
  const isBestCardMinSpendUnmet = useMemo(() => {
    if (!recommendedResults) return false;
    const cardIdMapped = recommendedResults.bestCard.toLowerCase().includes("uob") ? "uob_one" :
                         recommendedResults.bestCard.toLowerCase().includes("ocbc") ? "ocbc_365" :
                         recommendedResults.bestCard.toLowerCase().includes("dbs") ? "dbs_live_fresh" : "";
    
    if (cardIdMapped) {
      const heldCard = cards.find(c => c.id === cardIdMapped);
      return heldCard && heldCard.currentSpend < heldCard.minSpendRequired;
    }
    return false;
  }, [recommendedResults, cards]);

  // Compute calculated rewards for each held card based on amount
  const computedRewards = useMemo(() => {
    const amt = parseFloat(transactionAmount) || 0;
    if (amt <= 0) return [];

    return cards.map(c => {
      let activeRate = c.cashbackRate; // default base rate
      let isBonusApplied = false;
      let reason = "Base rate only";

      // Simple rules simulation
      const cat = recommendedResults ? recommendedResults.category : selectedCategory;
      const isMinMet = c.currentSpend >= c.minSpendRequired;

      if (c.id === "ocbc_365") {
        if (isMinMet) {
          if (cat === "Dining") { activeRate = 6.0; isBonusApplied = true; reason = "6% Dining Bonus"; }
          else if (cat === "Grocery") { activeRate = 3.0; isBonusApplied = true; reason = "3% Grocery Bonus"; }
          else if (cat === "Transport" || cat === "Grab") { activeRate = 3.0; isBonusApplied = true; reason = "3% Transport Bonus"; }
          else if (cat === "Online") { activeRate = 3.0; isBonusApplied = true; reason = "3% Online Utilities/Travel"; }
        } else {
          reason = "Unmet $800 minimum spend";
        }
      } else if (c.id === "uob_one") {
        if (isMinMet) {
          if (cat === "Grab" || cat === "Grocery") { activeRate = 10.0; isBonusApplied = true; reason = "10% Partner Merchant Spend"; }
          else { activeRate = 5.0; isBonusApplied = true; reason = "5% Flat Tier Spend"; }
        } else {
          activeRate = 0.3;
          reason = "Unmet $500 minimum spend (0.3% base)";
        }
      } else if (c.id === "dbs_live_fresh") {
        if (isMinMet) {
          if (cat === "Online") { activeRate = 5.0; isBonusApplied = true; reason = "5% Online Shopping"; }
          else if (cat === "Dining" || cat === "Grocery") { activeRate = 5.0; isBonusApplied = true; reason = "5% Contactless payment"; }
          else { activeRate = 0.3; reason = "Transport Mccs excluded"; }
        } else {
          reason = "Unmet $600 minimum spend";
        }
      } else if (c.id === "citi_cashback_plus") {
        activeRate = 1.6;
        isBonusApplied = true;
        reason = "Flat 1.6% (no minimum)";
      }

      const yieldCashback = (amt * activeRate) / 100;

      return {
        cardName: c.name,
        bank: c.bank,
        rate: activeRate,
        yieldCashback,
        isBonusApplied,
        reason,
        isMinMet,
        minSpend: c.minSpendRequired
      };
    }).sort((a,b) => b.yieldCashback - a.yieldCashback);
  }, [cards, selectedCategory, recommendedResults, transactionAmount]);

  return (
    <div className="space-y-6" id="which-card-root">
      {/* Title & Search Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800" id="whichcard-title">Which card for...</h2>
          <p className="text-xs text-slate-400 mt-0.5">Find the exact card to maximize cashback from Singapore merchants</p>
        </div>

        {/* Search Searchbar */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search className="h-4 h-4" />
          </span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter merchant (e.g. GrabFood, Cold Storage, Dino, McDonald's...)" 
            className="w-full pl-10 pr-4 py-3 bg-slate-100 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-500 text-slate-800 focus:bg-white outline-none transition-all placeholder-slate-400"
          />
        </div>

        {/* Category Toggles */}
        <div className="flex flex-wrap gap-2 pt-1" id="category-toggles">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setSearchQuery(""); // Clear search to show category default
              }}
              className={`px-4.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                selectedCategory === cat && !searchQuery 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Target Recommendation Output */}
      {recommendedResults && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Best Card Recommendation</h3>
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded uppercase">Optimized Match</span>
          </div>
          
          <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 relative overflow-hidden shadow-sm">
            {/* Background sparkle visual */}
            <div className="absolute top-2 right-2 opacity-10">
              <Sparkles className="h-20 w-20 text-indigo-650" />
            </div>

            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                  Best For {recommendedResults.category}
                </span>
                <h4 className="text-2xl font-extrabold text-slate-850 mt-2">
                  {recommendedResults.bestCard}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Matched for <span className="font-semibold text-slate-850">"{recommendedResults.merchant}"</span>
                </p>
              </div>

              {/* Large rate badge */}
              <div className="bg-indigo-600 px-4 py-2 rounded-xl text-center text-white shadow-xs">
                <span className="text-2xl font-black leading-none">{recommendedResults.bestRate}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider block mt-0.5">Cashback</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center bg-slate-50 p-3 rounded-xl">
              <span className="text-xs text-slate-500 font-medium font-sans">Yield boost projection:</span>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                {recommendedResults.differenceVsCiti} vs flat card
              </span>
            </div>

            {recommendedResults.warning && (
              <div className="bg-rose-50 text-rose-700 border border-rose-100 text-xs p-3 rounded-xl flex gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{recommendedResults.warning}</span>
              </div>
            )}

            {isBestCardMinSpendUnmet && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl flex gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Caution: Unmet Min Spend!</strong> You hold this card but haven't triggered your base minimum monthly spend. Reverts to standard rates unless minimum spend criteria is met!
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Spend Estimator / Reward Calculator */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Compare Real Reward Yields</h3>
            <p className="text-[11px] text-slate-400">Estimate exactly how much S$ cashback you get on a custom payment</p>
          </div>
          <div className="flex gap-1.5 items-center bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span className="text-xs font-mono font-bold text-slate-500">S$</span>
            <input 
              type="number" 
              value={transactionAmount}
              onChange={(e) => setTransactionAmount(e.target.value)}
              placeholder="100" 
              className="w-16 bg-transparent border-none outline-none text-xs font-bold font-mono text-slate-800 text-right"
            />
          </div>
        </div>

        {/* List of custom card yields */}
        <div className="space-y-2.5">
          {computedRewards.map((res, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border flex justify-between items-center transition-all ${
                idx === 0 
                  ? 'bg-emerald-50 border-emerald-100 shadow-xs' 
                  : 'bg-slate-50/40 border-slate-200'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{res.cardName}</span>
                  <span className="text-[9px] font-mono font-bold uppercase bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-500">{res.bank}</span>
                  {!res.isMinMet && res.minSpend > 0 && (
                     <span className="text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                       <AlertTriangle className="h-2 w-2 text-amber-550 text-amber-500" />
                       Unmet Spend
                     </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">
                  {res.reason} • <span className="font-mono">{res.rate}% back</span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-sm font-extrabold font-mono ${idx === 0 ? 'text-emerald-600' : 'text-slate-700'}`}>
                  +S${res.yieldCashback.toFixed(2)}
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">Rebate S$</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alternative cards table comparison */}
      {recommendedResults && recommendedResults.others && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold tracking-wider text-slate-400 uppercase">Comparison vs other wallet options</h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-[#FAF9FB]">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500">Other Cards</th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-slate-500">Estimated Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recommendedResults.others.map((other, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-slate-800">{other.cardName}</span>
                        {other.note && <p className="text-[10px] text-slate-400 mt-0.5">{other.note}</p>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-705 text-slate-755">
                      {other.rate}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
