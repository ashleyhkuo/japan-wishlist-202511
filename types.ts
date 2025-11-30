
export type User = 'Ash' | 'Greg';

export interface WishlistItem {
  id: string;
  createdBy: User;
  name: string;
  quantity: number;
  priceJpy: number; // 0 if unknown
  addTax: boolean; // true if 10% tax needs to be added
  notes: string;
  imageUrl: string; // Used for the thumbnail image
  productUrl?: string; // Used for the clickable link at the bottom
  isBought: boolean;
  createdAt: number;
}

export interface SummaryStats {
  totalCount: number;
  totalJpy: number;
  totalTwd: number;
  boughtCount: number;
  boughtJpy: number;
  boughtTwd: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
