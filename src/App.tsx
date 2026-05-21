import { useState } from "react";
import { INITIAL_CARDS, INITIAL_TRANSACTIONS } from "./data/mockData";
import { CreditCard, Transaction } from "./types";
import HomeDashboard from "./components/HomeDashboard";
import WhichCard from "./components/WhichCard";
import MonthlyReport from "./components/MonthlyReport";
import AskAI from "./components/AskAI";
import StatementUpload from "./components/StatementUpload";
import { 
  Home, 
  CreditCard as CardIcon, 
  BarChart3, 
  FileUp, 
  Sparkles, 
  BellRing, 
  Settings
} from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("home");
  const [cards, setCards] = useState<CreditCard[]>(INITIAL_CARDS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [contextualAiQuery, setContextualAiQuery] = useState<string | undefined>(undefined);

  // Tab navigation linking
  const handleNavigate = (tab: string, query?: string) => {
    setActiveTab(tab);
    if (query) {
      setContextualAiQuery(query);
    } else {
      setContextualAiQuery(undefined);
    }
  };

  // Switch card membership list (Onboarding / Phase 1 rules setup)
  const handleToggleCard = (cardId: string) => {
    setCards((prev) => 
      prev.map((c) => {
        if (c.id === cardId) {
          return { ...c };
        }
        return c;
      })
    );
  };

  // Simulate updating active spends (e.g., adding transactions directly)
  const handleAddCustomSpend = (cardId: string, amount: number) => {
    setCards((prev) => 
      prev.map((c) => {
        if (c.id === cardId) {
          const nextSpend = c.currentSpend + amount;
          return {
            ...c,
            currentSpend: nextSpend,
            unmetMinSpendWarning: nextSpend < c.minSpendRequired,
          };
        }
        return c;
      })
    );
  };

  // Import newly-parsed transactions from PDF Statement Upload
  const handleImportTransactions = (newTxs: Transaction[]) => {
    setTransactions((prev) => {
      // Find and remove duplicate sim IDs if loaded multiple times
      const existingIds = new Set(prev.map(t => t.id));
      const filteredNew = newTxs.filter(t => !existingIds.has(t.id));
      return [...prev, ...filteredNew];
    });

    // Also update DBS card spend state to reflect the imported statements total ($205.35 spend)
    setCards((prev) => 
      prev.map((c) => {
        if (c.id === "dbs_live_fresh") {
          const nextSpend = c.currentSpend + 205.35;
          return {
            ...c,
            currentSpend: parseFloat(nextSpend.toFixed(2)),
            unmetMinSpendWarning: nextSpend < c.minSpendRequired,
          };
        }
        return c;
      })
    );
  };

  // Compute stats for Next Milestone sidebar module
  const uobCard = cards.find((c) => c.id === "uob_one");
  const uobCurrent = uobCard ? uobCard.currentSpend : 320;
  const uobTarget = uobCard ? uobCard.minSpendRequired : 500;
  const uobGap = Math.max(0, uobTarget - uobCurrent);
  const milestoneProgressPercent = Math.min(100, Math.round((uobCurrent / uobTarget) * 100));

  const menuItems = [
    { id: "home", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { id: "cards", label: "Which Card?", icon: <CardIcon className="w-5 h-5" /> },
    { id: "report", label: "Monthly Insights", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "ask-ai", label: "Ask Max (AI)", icon: <Sparkles className="w-5 h-5" /> },
    { id: "upload", label: "Upload Bills", icon: <FileUp className="w-5 h-5" /> },
  ];

  return (
    <div className="h-screen w-screen bg-slate-50 flex font-sans overflow-hidden text-slate-900" id="cashmax-app-root">
      {/* SIDEBAR NAVIGATION - VISIBLE ON DESKTOP */}
      <nav className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 md:flex hidden" id="sidebar-nav">
        <div className="p-6 flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm shadow-indigo-200">$</div>
          <span className="font-bold text-lg tracking-tight text-slate-900">SGCashMax</span>
        </div>
        
        <div className="flex-1 px-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <div
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`p-3 rounded-xl flex items-center gap-3 transition-colors cursor-pointer text-sm font-medium ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700 font-semibold" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`}
                id={`sidebar-item-${item.id}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        {/* Dynamic UOB One Milestone Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="bg-indigo-900 rounded-2xl p-4 text-white relative overflow-hidden shadow-md">
            <div className="relative z-10">
              <p className="text-xs text-indigo-300 font-semibold uppercase tracking-wider">Next Milestone</p>
              <p className="text-sm font-bold mt-1">
                {uobGap > 0 ? `$${uobGap.toFixed(0)} to hit UOB One Tier` : "UOB One Min Spend Met! 🎉"}
              </p>
              <div className="w-full bg-indigo-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${milestoneProgressPercent}%` }}
                ></div>
              </div>
            </div>
            <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-white/5 rounded-full"></div>
          </div>
        </div>
      </nav>

      {/* MAIN VIEW AREA - SCROLLER CONTENT GRID */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* TOP COMPACT HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 sm:px-8 flex items-center justify-between shrink-0" id="top-app-header">
          <div className="flex items-center gap-1.5">
            <h1 className="text-lg font-bold text-slate-800">Morning, Keizah</h1>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-medium md:inline-block hidden">SGD</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full animate-pulse">
              AI Sync: 5m ago
            </div>
            <div className="relative cursor-pointer hover:opacity-85 transition-opacity">
              <BellRing className="h-5 w-5 text-slate-500" />
              <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-rose-500 text-[8px] font-bold text-white flex items-center justify-center">
                1
              </span>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-sm tracking-wide shadow-xs flex items-center justify-center border-2 border-white ring-1 ring-slate-200">
              WJ
            </div>
          </div>
        </header>

        {/* SCROLLABLE INTERACTIVE VIEW CONTENT */}
        <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 pb-24 md:pb-6" id="main-scroll-pane">
          <div className="max-w-4xl mx-auto w-full">
            {activeTab === "home" && (
              <HomeDashboard 
                cards={cards}
                transactions={transactions}
                onNavigate={handleNavigate}
                onToggleCard={handleToggleCard}
                onAddCustomSpend={handleAddCustomSpend}
              />
            )}

            {activeTab === "cards" && (
              <WhichCard cards={cards} />
            )}

            {activeTab === "report" && (
              <MonthlyReport 
                cards={cards}
                transactions={transactions}
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === "ask-ai" && (
              <AskAI 
                cards={cards}
                initialPrompt={contextualAiQuery}
              />
            )}

            {activeTab === "upload" && (
              <StatementUpload 
                cards={cards}
                onImportTransactions={handleImportTransactions}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </div>

        {/* BOTTOM GLOBAL NAVIGATION MENU - ONLY VISIBLE ON MOBILE */}
        <footer className="md:hidden flex fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 z-50 justify-around items-center" id="mobile-nav">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full transition-all ${
                  isActive 
                    ? "text-indigo-600 bg-indigo-50/40 font-bold" 
                    : "text-slate-400 hover:text-slate-600"
                }`}
                id={`mobile-nav-btn-${item.id}`}
              >
                {item.icon}
                <span className="text-[10px] tracking-wide font-medium">{item.label.replace(" (AI)", "")}</span>
              </button>
            );
          })}
        </footer>
      </main>
    </div>
  );
}
