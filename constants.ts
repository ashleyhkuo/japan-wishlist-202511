
export const DEFAULT_EXCHANGE_RATE = 0.20;
export const STORAGE_KEY = 'japan_shopping_list_v1';
export const RATE_STORAGE_KEY = 'japan_shopping_rate_v1';
export const USER_STORAGE_KEY = 'japan_shopping_user_v1';

// ---------------------------------------------------------
// 請在此填入您的 Firebase 設定 (從 Firebase Console -> Project Settings -> General -> SDK setup 複製)
// 填入後，所有裝置打開網頁都會自動連線，無需手動設定。
// ---------------------------------------------------------
export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC1j5ESsNKJd8-qlZg0JBI-ocGzgGOwwJY",
  authDomain: "japan-wishlist-202511.firebaseapp.com",
  databaseURL: "https://japan-wishlist-202511-default-rtdb.firebaseio.com",
  projectId: "japan-wishlist-202511",
  storageBucket: "japan-wishlist-202511.firebasestorage.app",
  messagingSenderId: "96960694290",
  appId: "1:96960694290:web:1abf91cf41207bd5ee30cb"
};

export const CATEGORY_CONFIG = {
  Clothes: { label: '衣服', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', activeClass: 'bg-blue-600 text-white' },
  Cosmetics: { label: '藥妝', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', activeClass: 'bg-rose-500 text-white' },
  Supplements: { label: '營養補劑', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', activeClass: 'bg-emerald-600 text-white' },
  Other: { label: '其他', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', activeClass: 'bg-slate-600 text-white' },
};
