
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, WishlistItem, SummaryStats } from './types';
import { DEFAULT_EXCHANGE_RATE, STORAGE_KEY, RATE_STORAGE_KEY, USER_STORAGE_KEY, FIREBASE_CONFIG } from './constants';
import { Plane, RefreshCw, Trash2, Cloud } from 'lucide-react';
import AddItemForm from './components/AddItemForm';
import ItemCard from './components/ItemCard';
import SummaryWidget from './components/SummaryWidget';
import SyncConfigModal from './components/SyncConfigModal';

// Firebase Imports
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getDatabase, ref, set, onValue, Database, off } from 'firebase/database';

const App: React.FC = () => {
  // --- Local State ---
  const [items, setItems] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [exchangeRate, setExchangeRate] = useState<number>(() => {
    const saved = localStorage.getItem(RATE_STORAGE_KEY);
    return saved ? parseFloat(saved) : DEFAULT_EXCHANGE_RATE;
  });

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return (saved as User) || 'Ash';
  });

  // --- Sync State ---
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [dbInstance, setDbInstance] = useState<Database | null>(null);
  const [isSyncConnected, setIsSyncConnected] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // --- Persistence Effects (Local) ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(RATE_STORAGE_KEY, exchangeRate.toString());
  }, [exchangeRate]);

  useEffect(() => {
    localStorage.setItem(USER_STORAGE_KEY, currentUser);
  }, [currentUser]);

  // --- Firebase Initialization & Listeners ---
  useEffect(() => {
    // 檢查使用者是否已經填寫了 constants.ts 中的設定
    if (FIREBASE_CONFIG.apiKey === "YOUR_API_KEY_HERE" || !FIREBASE_CONFIG.databaseURL) {
      setSyncError("尚未設定 API Key");
      setIsSyncConnected(false);
      return;
    }

    try {
      // Avoid re-initializing if already exists
      let app: FirebaseApp;
      if (!getApps().length) {
        app = initializeApp(FIREBASE_CONFIG);
      } else {
        app = getApp(); // Use existing default app
      }
      
      const db = getDatabase(app);
      setDbInstance(db);
      setSyncError(null);

      // --- Setup Listeners ---
      const listRef = ref(db, 'shopping-list/data');
      
      const unsubscribe = onValue(listRef, (snapshot) => {
        setIsSyncConnected(true);
        setSyncError(null);
        const data = snapshot.val();
        
        if (data) {
          // Merge logic: Remote overwrites local for simplicity in this use case
          if (data.items) {
             setItems(data.items);
          }
          if (data.exchangeRate) {
             setExchangeRate(data.exchangeRate);
          }
        }
      }, (error) => {
        setIsSyncConnected(false);
        setSyncError(error.message);
        console.error("Firebase Read Error:", error);
      });

      return () => {
        off(listRef); // Cleanup listener
      };

    } catch (e: any) {
      setSyncError(e.message);
      setIsSyncConnected(false);
    }
  }, []); // Run once on mount


  // --- Helper to Write to Cloud ---
  const saveToCloud = useCallback((newItems: WishlistItem[], newRate: number) => {
    if (dbInstance) {
      const listRef = ref(dbInstance, 'shopping-list/data');
      set(listRef, {
        items: newItems,
        exchangeRate: newRate,
        updatedAt: Date.now(),
        updatedBy: currentUser
      }).catch(err => {
        console.error("Firebase Write Error:", err);
        setSyncError("寫入失敗，請檢查網路或權限");
      });
    }
  }, [dbInstance, currentUser]);


  // --- Action Handlers ---
  const handleAddItem = (newItem: Omit<WishlistItem, 'id' | 'createdAt' | 'isBought'>) => {
    const item: WishlistItem = {
      ...newItem,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      isBought: false,
    };
    const updatedItems = [item, ...items];
    setItems(updatedItems);
    saveToCloud(updatedItems, exchangeRate);
  };

  const handleUpdateItem = (id: string, updates: Partial<WishlistItem>) => {
    const updatedItems = items.map(item => item.id === id ? { ...item, ...updates } : item);
    setItems(updatedItems);
    saveToCloud(updatedItems, exchangeRate);
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('確定要刪除這個項目嗎？')) {
      const updatedItems = items.filter(item => item.id !== id);
      setItems(updatedItems);
      saveToCloud(updatedItems, exchangeRate);
    }
  };
  
  const handleClearAll = () => {
    if (window.confirm('警告：這將會刪除所有清單內容！確定嗎？')) {
      const updatedItems: WishlistItem[] = [];
      setItems(updatedItems);
      saveToCloud(updatedItems, exchangeRate);
    }
  };

  const handleRateChange = (newRate: number) => {
    setExchangeRate(newRate);
    saveToCloud(items, newRate);
  };

  // --- Stats Calculation ---
  const stats: SummaryStats = useMemo(() => {
    return items.reduce((acc, item) => {
      const taxMultiplier = item.addTax ? 1.1 : 1.0;
      const totalJpy = Math.round(item.priceJpy * item.quantity * taxMultiplier);
      const totalTwd = Math.round(totalJpy * exchangeRate);

      acc.totalCount += item.quantity;
      acc.totalJpy += totalJpy;
      acc.totalTwd += totalTwd;

      if (item.isBought) {
        acc.boughtCount += item.quantity;
        acc.boughtJpy += totalJpy;
        acc.boughtTwd += totalTwd;
      }

      return acc;
    }, {
      totalCount: 0,
      totalJpy: 0,
      totalTwd: 0,
      boughtCount: 0,
      boughtJpy: 0,
      boughtTwd: 0
    } as SummaryStats);
  }, [items, exchangeRate]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      
      {/* --- Header Section --- */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Plane size={24} />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                日本代購許願清單 
                <span className="text-indigo-500 ml-1">✈️</span>
              </h1>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* Sync Button - Only show when connected */}
              {isSyncConnected && (
                <button 
                  onClick={() => setIsSyncModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all bg-green-50 border-green-200 text-green-700"
                >
                  <Cloud size={16} className="fill-green-500 text-green-500" />
                  <span className="hidden sm:inline">同步中</span>
                </button>
              )}

              {/* Exchange Rate Input */}
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 px-3 py-1.5 shadow-sm">
                <span className="text-sm font-medium text-gray-500 mr-2 whitespace-nowrap">匯率 (1 JPY ≈)</span>
                <input
                  type="number"
                  step="0.001"
                  value={exchangeRate}
                  onChange={(e) => handleRateChange(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent font-bold text-gray-800 outline-none text-right"
                />
                <span className="text-sm font-medium text-gray-500 ml-1">TWD</span>
              </div>

              {/* User Toggle */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setCurrentUser('Ash')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    currentUser === 'Ash' 
                      ? 'bg-white text-rose-500 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Ash
                </button>
                <button
                  onClick={() => setCurrentUser('Greg')}
                  className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${
                    currentUser === 'Greg' 
                      ? 'bg-white text-blue-500 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Greg
                </button>
              </div>

            </div>
          </div>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Form & List */}
          <div className="w-full lg:flex-1">
            
            {/* Add Item Form */}
            <AddItemForm currentUser={currentUser} onAddItem={handleAddItem} />

            {/* Items List */}
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="font-bold text-gray-700 text-lg">
                  許願清單 ({items.length})
                </h3>
                {items.length > 0 && (
                  <button 
                    onClick={handleClearAll}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1 hover:underline"
                  >
                    <Trash2 size={12} /> 清空全部
                  </button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                  <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">目前沒有任何代購項目</p>
                  <p className="text-gray-400 text-sm mt-1">趕快新增一些想要的東西吧！</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {items.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      exchangeRate={exchangeRate}
                      onUpdate={handleUpdateItem}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Summary (Sticky on Desktop) */}
          <div className="w-full lg:w-80 lg:sticky lg:top-24">
             <SummaryWidget stats={stats} />
             
             {/* Info / Footer */}
             <div className="mt-6 text-center lg:text-left text-xs text-gray-400 px-2 space-y-1">
                <p>⚠️ 匯率僅供參考，實際金額請以購買當下為準。</p>
                {isSyncConnected && (
                  <p>☁️ 資料已透過 Firebase 雲端同步。</p>
                )}
             </div>
          </div>

        </div>
      </main>

      {/* Sync Modal (ReadOnly Status) */}
      <SyncConfigModal 
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        isConnected={isSyncConnected}
        connectionError={syncError}
      />
    </div>
  );
};

export default App;
