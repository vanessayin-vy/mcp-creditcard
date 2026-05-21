import { useState, useEffect } from "react";
import { CreditCard, Transaction } from "../types";
import { FileCode, UploadCloud, CheckCircle2, ChevronRight, Activity, RotateCcw } from "lucide-react";

interface StatementUploadProps {
  cards: CreditCard[];
  onImportTransactions: (newTxs: Transaction[]) => void;
  onNavigate: (tab: string) => void;
}

export default function StatementUpload({
  cards,
  onImportTransactions,
  onNavigate,
}: StatementUploadProps) {
  const [selectedBank, setSelectedBank] = useState<string>("DBS");
  const [fileSelected, setFileSelected] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");

  // Step state: 'upload' | 'ready' | 'parsing' | 'results'
  const [parseStep, setParseStep] = useState<'upload' | 'ready' | 'parsing' | 'results'>('upload');
  
  // Progress counter inside Step 'parsing'
  const [progress, setProgress] = useState(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const bankOptions = ["DBS", "OCBC", "UOB", "Citi", "HSBC", "Maybank"];
  
  const parsingChecks = [
    "Reading PDF structure",
    "Extracting transactions",
    "Classifying merchants",
    "Calculating cashback"
  ];

  // Mock parsed results to update the main database with +$18.40 boost
  const simulatedParsedTransactions: Transaction[] = [
    {
      id: "sim_tx_1",
      merchant: "MC DONALD'S SINGAPORE",
      amount: 12.90,
      category: "Dining",
      date: "2026-05-18",
      cardUsed: "uob_one",
      cashbackRateUsed: 0.3,
      cashbackEarned: 0.04,
      bestCardId: "ocbc_365",
      bestCardRate: 6.0,
      potentialCashback: 0.77,
      status: "missed",
    },
    {
      id: "sim_tx_2",
      merchant: "NTUC FAIRPRICE XTRA",
      amount: 67.45,
      category: "Grocery",
      date: "2026-05-19",
      cardUsed: "dbs_live_fresh",
      cashbackRateUsed: 1.0,
      cashbackEarned: 0.67,
      bestCardId: "ocbc_365",
      bestCardRate: 3.0,
      potentialCashback: 2.02,
      status: "missed",
    },
    {
      id: "sim_tx_3",
      merchant: "CALTEX BUONA VISTA",
      amount: 80.00,
      category: "Petrol",
      date: "2026-05-20",
      cardUsed: "dbs_live_fresh",
      cashbackRateUsed: 0.3,
      cashbackEarned: 0.24,
      bestCardId: "ocbc_365",
      bestCardRate: 16.0,
      potentialCashback: 12.80,
      status: "missed",
    },
    {
      id: "sim_tx_4",
      merchant: "SIMPLYGO MRT BUSES",
      amount: 45.0,
      category: "Transport",
      date: "2026-05-21",
      cardUsed: "uob_one",
      cashbackRateUsed: 3.33,
      cashbackEarned: 1.50,
      bestCardId: "uob_one",
      bestCardRate: 3.33,
      potentialCashback: 1.50,
      status: "optimized",
    }
  ];

  // Auto progression during parsing simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (parseStep === 'parsing') {
      setProgress(0);
      setActiveStepIndex(0);

      const totalTime = 3000; // 3 seconds total parse time
      const increment = 5;
      const stepInterval = totalTime / (100 / increment);

      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + increment;
          if (next >= 100) {
            clearInterval(interval);
            setParseStep('results');
            return 100;
          }
          
          // Move checking index
          const nextIndex = Math.floor((next / 100) * parsingChecks.length);
          setActiveStepIndex(nextIndex);
          return next;
        });
      }, stepInterval);
    }
    return () => clearInterval(interval);
  }, [parseStep]);

  // Simulate file drops/clicks
  const handleSimulateDrop = () => {
    setFileName(`${selectedBank}_Statement_May2026.pdf`);
    setFileSize("2.3 MB");
    setFileSelected(true);
    setParseStep('ready');
  };

  const handleReset = () => {
    setFileSelected(false);
    setFileName("");
    setFileSize("");
    setParseStep('upload');
    setProgress(0);
  };

  const handleImportResults = () => {
    onImportTransactions(simulatedParsedTransactions);
    onNavigate("home");
  };

  return (
    <div className="space-y-6" id="statement-upload-root">
      {/* Dynamic Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm col-span-12">
        <h2 className="text-xl font-bold text-slate-800">Upload Bills & Statements</h2>
        <p className="text-xs text-slate-400 mt-0.5">Parse credit card billing statements directly via Gemini secure parsing</p>
      </div>

      {/* STEP 1: Upload bank selection & drag drop */}
      {parseStep === 'upload' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Bank Statement Issuer</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2" id="bank-selector-grid">
              {bankOptions.map((bank) => (
                <button
                  key={bank}
                  onClick={() => setSelectedBank(bank)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                    selectedBank === bank 
                      ? 'bg-indigo-650 text-white border-indigo-650 bg-indigo-600 ring-2 ring-indigo-500/10' 
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div 
            onClick={handleSimulateDrop}
            className="border-2 border-dashed border-slate-205 border-slate-200 hover:border-indigo-500 rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-50/40 text-center space-y-4"
            id="drag-drop-zone"
          >
            <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xs">
              <UploadCloud className="h-6 w-6 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800 leading-tight">Drag statement PDF here or click to simulate</h4>
              <p className="text-xs text-slate-400">PDF only • up to 10 MB limit • auto OCR extraction active</p>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 py-1.5 px-3 rounded-full uppercase tracking-wider">
              Simulate upload selection
            </span>
          </div>

          <div className="text-center font-normal">
            <span className="text-xs text-slate-400">Want to automate? Set up secure email statement forwarding to skip this step entirely!</span>
          </div>
        </div>
      )}

      {/* STEP 2: File Selected and Ready */}
      {parseStep === 'ready' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-bold text-slate-450 text-slate-400 uppercase tracking-widest">Active Statement</label>
            <div className="flex flex-wrap gap-2">
              {bankOptions.map((bank) => (
                <button
                  key={bank}
                  disabled
                  className={`py-2 px-4 rounded-xl text-xs font-bold border transition-all cursor-not-allowed ${
                    selectedBank === bank ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-100 text-slate-350 border-transparent text-slate-400'
                  }`}
                >
                  {bank}
                </button>
              ))}
            </div>
          </div>

          {/* PDF Info Card layout */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-3xl flex items-center justify-between gap-4" id="pdf-file-details">
            <div className="flex gap-3 items-center">
              <div className="h-10 w-10 bg-white border border-slate-200 text-indigo-600 flex items-center justify-center rounded-xl shadow-xs">
                <FileCode className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 truncate max-w-sm">{fileName}</h4>
                <p className="text-[10px] text-slate-400 font-mono font-medium">{fileSize} • {selectedBank} Electronic Statement</p>
              </div>
            </div>
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 shrink-0"></span>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setParseStep('parsing')}
              className="bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl text-xs hover:bg-slate-800 transition-all flex justify-center items-center gap-1.5 shadow-md"
              id="parse-trigger-btn"
            >
              Parse statement now
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              className="bg-white border border-slate-200 text-slate-650 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-slate-50 hover:border-slate-300 transition-all text-center"
            >
              Choose different file
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Progress State */}
      {parseStep === 'parsing' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6" id="parsing-panel">
          <div className="flex justify-between items-center bg-slate-50 text-slate-800 p-4 border border-slate-200 rounded-t-2xl">
            <div className="flex gap-2 items-center">
              <Activity className="h-4 w-4 text-indigo-600 animate-spin" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Analysing Statement via OCR...</span>
            </div>
            <span className="text-xs font-bold font-mono text-slate-700">{progress}%</span>
          </div>

          {/* Large text */}
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 leading-none">Mapping transaction MCC categories...</h3>
            <p className="text-xs text-slate-405 text-slate-400">Classifying raw merchant transactions with bank reward rules...</p>
          </div>

          {/* Graphical Progress Fill */}
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
            <div 
              className="bg-indigo-605 bg-indigo-600 h-full transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Staggered Checklists */}
          <div className="space-y-3 pt-2">
            {parsingChecks.map((step, idx) => {
              const isChecked = idx < activeStepIndex;
              const isCurrent = idx === activeStepIndex;

              return (
                <div 
                  key={idx} 
                  className={`flex items-center gap-3 text-xs font-medium transition-all duration-200 ${
                    isChecked ? 'text-emerald-650 text-emerald-600' : isCurrent ? 'text-indigo-600 scale-102 pl-1 font-bold' : 'text-slate-300'
                  }`}
                >
                  <div className={`h-5 w-5 rounded-full flex items-center justify-center border font-mono text-[10px] ${
                    isChecked ? 'bg-emerald-50 text-emerald-650 border-emerald-250 border-emerald-200 font-bold' : 
                    isCurrent ? 'bg-indigo-50 text-indigo-600 border-indigo-200 animate-pulse' : 'bg-transparent text-slate-200 border-slate-100'
                  }`}>
                    {isChecked ? "✓" : idx + 1}
                  </div>
                  <span>{step}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Parsing complete and results layout */}
      {parseStep === 'results' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 animate-fadeIn" id="results-panel">
          <div className="flex justify-between items-center bg-emerald-50 text-emerald-800 p-4 border border-emerald-150 rounded-t-2xl rounded-tr-2xl">
            <div className="flex gap-2 items-center">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-750">Statement successfully processed</span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-white text-emerald-700 px-2.5 py-0.5 border border-emerald-100 rounded uppercase">
              {selectedBank} IMPORT COMPLETE
            </span>
          </div>

          {/* Results Metadata Details banner */}
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-slate-800">4 Transactions Extracted</h3>
              <p className="text-xs text-slate-400 mt-1">Found May 2026 statement cycle records. Yield calculation matches portfolio terms.</p>
            </div>
          </div>

          {/* Stat Boost values */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left">
              <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider block mb-1">Total statement spend</span>
              <span className="text-xl font-bold font-sans text-slate-805 text-slate-800 font-mono">$205.35</span>
            </div>
            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-left">
              <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider block mb-1">Cashback Yield unlocked</span>
              <span className="text-xl font-black text-emerald-700 block font-mono">+$18.40</span>
            </div>
          </div>

          {/* Extracted Transactions List details matches Results Table */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Identified Leakage Details</h4>
            
            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {simulatedParsedTransactions.map((tx, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-150 flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-slate-850 text-slate-800">{tx.merchant}</h5>
                    <div className="text-[10px] text-slate-400 flex gap-2 mt-1">
                      <span className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">{tx.category}</span>
                      <span>•</span>
                      <span>Default Card: <strong className="font-mono">{tx.cashbackRateUsed}%</strong></span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-800 block">${tx.amount.toFixed(2)}</span>
                    <span className="text-[10px] font-bold text-emerald-650 text-emerald-650 block">
                      Best choice: {tx.bestCardRate}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Linked CTAs that append transactions and update parent state */}
          <div className="flex flex-col gap-2 pt-4 border-t border-slate-150">
            <button
              onClick={handleImportResults}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all text-center flex items-center justify-center gap-1 shadow-md"
              id="import-results-link-btn"
            >
              Merge statements & view report
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={handleReset}
              className="bg-white border border-slate-200 text-slate-600 font-semibold py-3 px-4 rounded-xl text-xs hover:bg-slate-50 hover:border-slate-300 transition-all text-center flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Upload another statement
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
