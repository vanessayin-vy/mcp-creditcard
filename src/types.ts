export type MerchantCategory = 'Dining' | 'Grocery' | 'Petrol' | 'Online' | 'Transport' | 'Grab' | 'Others';

export interface CreditCard {
  id: string;
  name: string;
  bank: string;
   cashbackRate: number; // base rate
  maxCashbackRate: number; // potential rate
  minSpendRequired: number;
  currentSpend: number;
  unmetMinSpendWarning?: boolean;
}

export interface Transaction {
  id: string;
  merchant: string;
  amount: number;
  category: MerchantCategory;
  date: string;
  cardUsed: string; // ID of the credit card used
  cashbackRateUsed: number;
  cashbackEarned: number;
  bestCardId: string; // Card that should have been used
  bestCardRate: number;
  potentialCashback: number;
  status: 'optimized' | 'missed';
}

export interface CashbackSummary {
  earned: number;
  potential: number;
  missed: number;
  percentage: number;
}

export interface GoalProgress {
  cardId: string;
  cardName: string;
  targetSpend: number;
  currentSpend: number;
  targetUnlockDescription: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}
