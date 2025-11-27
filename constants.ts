
export const DEFAULT_EXCHANGE_RATE = 0.20;
export const STORAGE_KEY = 'japan_shopping_list_v1';
export const RATE_STORAGE_KEY = 'japan_shopping_rate_v1';
export const USER_STORAGE_KEY = 'japan_shopping_user_v1';

// ---------------------------------------------------------
// 請在此填入您的 Firebase 設定 (從 Firebase Console -> Project Settings -> General -> SDK setup 複製)
// 填入後，所有裝置打開網頁都會自動連線，無需手動設定。
// ---------------------------------------------------------
export const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY_HERE",           // 範例: "AIzaSyD..."
  authDomain: "YOUR_AUTH_DOMAIN",        // 範例: "japan-wishlist.firebaseapp.com"
  databaseURL: "YOUR_DATABASE_URL",      // 範例: "https://japan-wishlist-default-rtdb.firebaseio.com"
  projectId: "YOUR_PROJECT_ID",          // 範例: "japan-wishlist"
  storageBucket: "YOUR_STORAGE_BUCKET",  // 範例: "japan-wishlist.appspot.com"
  messagingSenderId: "YOUR_SENDER_ID",   // 範例: "123456789"
  appId: "YOUR_APP_ID"                   // 範例: "1:123456789:web:abcdef"
};
