import { CreditCard, Transaction } from "../types";

export const INITIAL_CARDS: CreditCard[] = [
  {
    id: "ocbc_365",
    name: "OCBC 365",
    bank: "OCBC",
    cashbackRate: 0.3,
    maxCashbackRate: 6.0,
    minSpendRequired: 800,
    currentSpend: 820,
    unmetMinSpendWarning: false,
  },
  {
    id: "uob_one",
    name: "UOB One",
    bank: "UOB",
    cashbackRate: 3.33,
    maxCashbackRate: 10.0,
    minSpendRequired: 500,
    currentSpend: 320, // $180 more needed to meet $500 tier
    unmetMinSpendWarning: true,
  },
  {
    id: "dbs_live_fresh",
    name: "DBS Live Fresh",
    bank: "DBS",
    cashbackRate: 0.3,
    maxCashbackRate: 5.0,
    minSpendRequired: 600,
    currentSpend: 650,
    unmetMinSpendWarning: false,
  },
  {
    id: "citi_cashback_plus",
    name: "Citi Cash Back+",
    bank: "Citi",
    cashbackRate: 1.6,
    maxCashbackRate: 1.6,
    minSpendRequired: 0,
    currentSpend: 400,
    unmetMinSpendWarning: false,
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "tx_1",
    merchant: "SHENG SIONG SUPERMARKET",
    amount: 120.0,
    category: "Grocery",
    date: "2026-05-01",
    cardUsed: "ocbc_365",
    cashbackRateUsed: 3.0,
    cashbackEarned: 3.60,
    bestCardId: "ocbc_365",
    bestCardRate: 3.0,
    potentialCashback: 3.60,
    status: "optimized",
  },
  {
    id: "tx_2",
    merchant: "MC DONALD S - AMK HUB",
    amount: 18.50,
    category: "Dining",
    date: "2026-05-02",
    cardUsed: "dbs_live_fresh",
    cashbackRateUsed: 5.0,
    cashbackEarned: 0.93,
    bestCardId: "ocbc_365",
    bestCardRate: 6.0,
    potentialCashback: 1.11,
    status: "missed",
  },
  {
    id: "tx_3",
    merchant: "SIMPLYGO MRT BUSES",
    amount: 45.0,
    category: "Transport",
    date: "2026-05-03",
    cardUsed: "uob_one",
    cashbackRateUsed: 3.33,
    cashbackEarned: 1.50,
    bestCardId: "uob_one",
    bestCardRate: 3.33,
    potentialCashback: 1.50,
    status: "optimized",
  },
  {
    id: "tx_4",
    merchant: "CALTEX BUONA VISTA",
    amount: 85.0,
    category: "Petrol",
    date: "2026-05-04",
    cardUsed: "citi_cashback_plus",
    cashbackRateUsed: 1.6,
    cashbackEarned: 1.36,
    bestCardId: "ocbc_365",
    bestCardRate: 16.0, // Petrol discounts + cashback
    potentialCashback: 13.60,
    status: "missed",
  },
  {
    id: "tx_5",
    merchant: "DIN TAI FUNG RAFFLES CITY",
    amount: 110.0,
    category: "Dining",
    date: "2026-05-06",
    cardUsed: "ocbc_365",
    cashbackRateUsed: 6.0,
    cashbackEarned: 6.60,
    bestCardId: "ocbc_365",
    bestCardRate: 6.0,
    potentialCashback: 6.60,
    status: "optimized",
  },
  {
    id: "tx_6",
    merchant: "GRABFOOD SINGAPORE",
    amount: 32.40,
    category: "Dining",
    date: "2026-05-08",
    cardUsed: "dbs_live_fresh",
    cashbackRateUsed: 5.0,
    cashbackEarned: 1.62,
    bestCardId: "uob_one", // UOB One is optimized on Grab when min spend is met (up to 10%)
    bestCardRate: 10.0,
    potentialCashback: 3.24,
    status: "missed",
  },
  {
    id: "tx_7",
    merchant: "COVET COUTURE ONLINE",
    amount: 156.0,
    category: "Online",
    date: "2026-05-09",
    cardUsed: "dbs_live_fresh",
    cashbackRateUsed: 5.0,
    cashbackEarned: 7.80,
    bestCardId: "dbs_live_fresh",
    bestCardRate: 5.0,
    potentialCashback: 7.80,
    status: "optimized",
  },
  {
    id: "tx_8",
    merchant: "NTUC FAIRPRICE VIVO",
    amount: 98.40,
    category: "Grocery",
    date: "2026-05-12",
    cardUsed: "citi_cashback_plus",
    cashbackRateUsed: 1.6,
    cashbackEarned: 1.57,
    bestCardId: "ocbc_365", // 3% on Grocery
    bestCardRate: 3.0,
    potentialCashback: 2.95,
    status: "missed",
  },
];

// Database of best cards for raw merchant MCC matching inside WhichCard
export interface MerchantRule {
  merchant: string;
  category: string;
  bestCard: string;
  bestRate: string;
  differenceVsCiti: string;
  warning?: string;
  others: { cardName: string; rate: string; note?: string }[];
}

export const MERCHANT_DATABASE: MerchantRule[] = [
  {
    merchant: "NTUC FairPrice",
    category: "Grocery",
    bestCard: "OCBC 365",
    bestRate: "3%",
    differenceVsCiti: "+$1.40 for ever $100 spent",
    others: [
      { cardName: "UOB One", rate: "up to 10%", note: "if min spend met + Dairy Farm partner" },
      { cardName: "Maybank F&F", rate: "8%", note: "requires $800 min monthly spend" },
      { cardName: "DBS Live Fresh", rate: "5%", note: "requires Contactless payment" },
      { cardName: "Citi Cash Back+", rate: "1.6%" }
    ]
  },
  {
    merchant: "Sheng Siong",
    category: "Grocery",
    bestCard: "OCBC 365 / Maybank F&F",
    bestRate: "3% or 8%",
    differenceVsCiti: "+$6.40 with Maybank F&F",
    others: [
      { cardName: "Maybank F&F", rate: "8%" },
      { cardName: "OCBC 365", rate: "3%" },
      { cardName: "DBS Live Fresh", rate: "5%", note: "contactless" },
      { cardName: "Citi Cash Back+", rate: "1.6%" }
    ]
  },
  {
    merchant: "McDonald's",
    category: "Dining",
    bestCard: "HSBC Live+ (or OCBC 365)",
    bestRate: "8% (or 6%)",
    differenceVsCiti: "+$6.40 vs Citi Cash Back+",
    others: [
      { cardName: "HSBC Live+", rate: "8%" },
      { cardName: "OCBC 365", rate: "6%" },
      { cardName: "UOB One", rate: "up to 10%", note: "via GrabPay/GrabFood delivery" },
      { cardName: "DBS Live Fresh", rate: "5%", note: "via Apple Pay/Contactless" }
    ]
  },
  {
    merchant: "Din Tai Fung",
    category: "Dining",
    bestCard: "HSBC Live+",
    bestRate: "8%",
    differenceVsCiti: "+$6.40 vs base card",
    others: [
      { cardName: "OCBC 365", rate: "6%" },
      { cardName: "DBS Live Fresh", rate: "5%", note: "if online/contactless" },
      { cardName: "Citi Cash Back+", rate: "1.6%" }
    ]
  },
  {
    merchant: "Caltex Gasoline",
    category: "Petrol",
    bestCard: "OCBC 365",
    bestRate: "up to 16% discount + 3% cashback",
    differenceVsCiti: "Saves ~$18 on a full tank",
    others: [
      { cardName: "HSBC Live+", rate: "14% discount + 5% cashback" },
      { cardName: "Maybank F&F", rate: "8% cashback" },
      { cardName: "Citi Cash Back+", rate: "14% default instant petrol discount" }
    ]
  },
  {
    merchant: "Grab / GrabFood",
    category: "Grab",
    bestCard: "UOB One Card",
    bestRate: "up to 10%",
    differenceVsCiti: "+$8.40 vs standard cards",
    warning: "Make sure you met UOB's minimum monthly spend or rate falls to 3.33%!",
    others: [
      { cardName: "OCBC 365", rate: "3%", note: "grab land transport/delivery" },
      { cardName: "HSBC Live+", rate: "8%", note: "on GrabFood delivery" },
      { cardName: "DBS Live Fresh", rate: "5%", note: "if online payment" }
    ]
  },
  {
    merchant: "Circles.Life / Singtel",
    category: "Online / Bills",
    bestCard: "OCBC 365",
    bestRate: "3% recurring utilities bill rate",
    differenceVsCiti: "+$1.40 cashback per bill",
    others: [
      { cardName: "Maybank F&F", rate: "8%", note: "requires Bills selected category" },
      { cardName: "DBS Live Fresh", rate: "5%", note: "if paid online recurring" },
      { cardName: "Citi Cash Back+", rate: "1.6%" }
    ]
  },
  {
    merchant: "SimplyGo (MRT & Bus)",
    category: "Transport",
    bestCard: "UOB One / OCBC 365",
    bestRate: "up to 3.33% / 3%",
    differenceVsCiti: "Fits min-spend tracker",
    others: [
      { cardName: "UOB One", rate: "3.33%", note: "unlocks flat quarterly returns" },
      { cardName: "OCBC 365", rate: "3%", note: "direct SimplyGo payments" },
      { cardName: "DBS Live Fresh", rate: "0.3%", note: "Transport MCCs excluded from 5%" }
    ]
  }
];

export const MOCK_CHANNELS = {
  "ocbc_365": { name: "OCBC 365", bank: "OCBC", color: "bg-red-50 text-red-700 border-red-200" },
  "uob_one": { name: "UOB One", bank: "UOB", color: "bg-blue-50 text-blue-700 border-blue-200" },
  "dbs_live_fresh": { name: "DBS Live Fresh", bank: "DBS", color: "bg-teal-50 text-teal-700 border-teal-200" },
  "citi_cashback_plus": { name: "Citi Cash Back+", bank: "Citi", color: "bg-gray-50 text-gray-700 border-gray-200" },
};
export type MockChannelKey = keyof typeof MOCK_CHANNELS;

export const CATEGORY_COLORS: Record<string, string> = {
  Grocery: "bg-green-100 text-green-800",
  Dining: "bg-orange-100 text-orange-800",
  Transport: "bg-purple-100 text-purple-800",
  Petrol: "bg-amber-100 text-amber-800",
  Online: "bg-indigo-100 text-indigo-800",
  Grab: "bg-emerald-100 text-emerald-800",
  Others: "bg-gray-100 text-gray-800",
};
