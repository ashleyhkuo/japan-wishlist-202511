export type User = 'Ash' | 'Greg';

export interface WishlistItem {
  id: string;
  createdBy: User;
  name: string;
  quantity: number;
  priceJpy: number; // 0 if unknown
  addTax: boolean; // true if 10% tax needs to be added
  notes: string;
  imageUrl: string;
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
