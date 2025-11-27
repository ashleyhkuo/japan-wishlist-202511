import React, { useState, useRef, useEffect } from 'react';
import { WishlistItem } from '../types';
import { Trash2, Check, ExternalLink, Calculator, X } from 'lucide-react';

interface ItemCardProps {
  item: WishlistItem;
  exchangeRate: number;
  onUpdate: (id: string, updates: Partial<WishlistItem>) => void;
  onDelete: (id: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, exchangeRate, onUpdate, onDelete }) => {
  const [isBuying, setIsBuying] = useState(false);
  
  // Local state for the buying process
  const [buyPrice, setBuyPrice] = useState<string>('');
  const [buyTax, setBuyTax] = useState(false);
  const priceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isBuying && priceInputRef.current) {
      priceInputRef.current.focus();
    }
  }, [isBuying]);

  // Calculations
  const taxMultiplier = item.addTax ? 1.1 : 1.0;
  const unitPriceJpy = item.priceJpy * taxMultiplier;
  const totalJpy = Math.round(unitPriceJpy * item.quantity);
  const totalTwd = Math.round(totalJpy * exchangeRate);

  const creatorColor = item.createdBy === 'Ash' ? 'text-rose-600 bg-rose-50 border-rose-200' : 'text-blue-600 bg-blue-50 border-blue-200';
  const creatorLabel = item.createdBy === 'Ash' ? 'Ash' : 'Greg';

  // Handlers
  const startBuying = () => {
    setBuyPrice(item.priceJpy.toString());
    setBuyTax(item.addTax);
    setIsBuying(true);
  };

  const cancelBuying = () => {
    setIsBuying(false);
  };

  const confirmBuying = () => {
    const finalPrice = parseFloat(buyPrice) || 0;
    onUpdate(item.id, {
      isBought: true,
      priceJpy: finalPrice,
      addTax: buyTax
    });
    setIsBuying(false);
  };

  const handleUnbuy = () => {
    onUpdate(item.id, { isBought: false });
  };

  return (
    <div className={`group relative bg-white rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-200 overflow-hidden ${item.isBought ? 'bg-gray-50' : ''}`}>
      
      {/* Top Banner Status */}
      {item.isBought && (
        <div className="absolute top-0 left-0 w-full h-1 bg-green-500 z-10"></div>
      )}

      <div className="p-4 sm:p-5">
        
        {/* Header: Checkbox + Title + User */}
        <div className="flex items-start gap-3 mb-4">
          {/* Checkbox Logic */}
          <div className="pt-1 shrink-0">
            {item.isBought ? (
              <button 
                onClick={handleUnbuy}
                className="w-6 h-6 rounded bg-green-500 border-green-500 text-white flex items-center justify-center shadow-sm hover:bg-green-600 transition-colors"
              >
                <Check size={16} strokeWidth={3} />
              </button>
            ) : (
              <button 
                onClick={startBuying}
                disabled={isBuying}
                className={`w-6 h-6 rounded border border-gray-300 bg-white flex items-center justify-center transition-all ${isBuying ? 'ring-2 ring-indigo-200 border-indigo-400' : 'hover:border-gray-400'}`}
              >
                {isBuying && <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>}
              </button>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2">
              <h3 className={`text-lg font-bold text-gray-900 leading-tight ${item.isBought ? 'line-through text-gray-400' : ''}`}>
                {item.name}
              </h3>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${creatorColor} whitespace-nowrap`}>
                由 {creatorLabel} 建立
              </span>
            </div>
          </div>

          {/* Delete Button (Top Right) */}
          <button 
            onClick={() => onDelete(item.id)}
            className="text-gray-300 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
            title="刪除項目"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          
          {/* Left Column: Quantity, Notes, URL */}
          <div className="flex-1 order-2 sm:order-1 flex flex-col gap-3">
            
            {/* EDITABLE Quantity Display */}
            <div className="flex items-center self-start bg-gray-100 rounded px-3 py-1.5 border border-transparent hover:border-gray-300 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <span className="text-gray-500 text-xs mr-2 font-medium select-none">數量</span>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => onUpdate(item.id, { quantity: Math.max(1, parseInt(e.target.value) || 0) })}
                className="font-mono font-bold text-gray-800 text-lg leading-none bg-transparent outline-none w-16"
              />
            </div>

            {/* EDITABLE Notes Section */}
            <div className="relative flex-grow group">
                <textarea
                  value={item.notes}
                  onChange={(e) => onUpdate(item.id, { notes: e.target.value })}
                  placeholder="無備註..."
                  rows={3}
                  className="w-full bg-yellow-50 border border-yellow-100 rounded-lg p-3 text-gray-700 text-sm focus:ring-2 focus:ring-yellow-200 focus:border-yellow-300 outline-none transition-all placeholder-gray-300 resize-y"
                />
                <span className="absolute top-2 right-2 text-[10px] font-bold text-yellow-600/50 uppercase pointer-events-none select-none">詳細備註</span>
            </div>

            {/* URL Link (Enlarged) */}
            {item.imageUrl && (
              <div className="mt-1">
                <a 
                  href={item.imageUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-base text-blue-600 hover:text-blue-800 truncate block hover:underline flex items-center gap-1.5 max-w-full break-all"
                >
                   <ExternalLink size={16} className="shrink-0" /> 
                   <span className="truncate">{item.imageUrl}</span>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Price Only (Image Removed) */}
          <div className="w-full sm:w-44 shrink-0 order-1 sm:order-2 flex flex-col gap-3">
            
            {/* Price / Buying Input Block */}
            <div className="min-h-[60px]">
              {isBuying ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                  <div className="text-xs font-bold text-indigo-800 mb-1.5 flex items-center gap-1">
                    <Calculator size={12} />
                    確認金額 (JPY)
                  </div>
                  <input
                    ref={priceInputRef}
                    type="number"
                    min="0"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-2 py-1 mb-2 text-base font-mono font-bold border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="實際金額"
                  />
                  <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={buyTax} 
                        onChange={(e) => setBuyTax(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
                      />
                      <span className="text-xs text-indigo-700">含 10% 稅</span>
                    </label>
                    
                    <div className="flex gap-1.5 justify-end mt-1">
                       <button onClick={cancelBuying} className="p-1 text-gray-400 hover:bg-white rounded hover:text-gray-600 transition-colors">
                         <X size={16} />
                       </button>
                       <button onClick={confirmBuying} className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-colors">
                         <Check size={12} /> 確定
                       </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-right shadow-sm">
                   <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-2xl font-bold font-mono tracking-tight leading-none ${item.isBought ? 'text-green-600' : 'text-rose-500'}`}>
                          ¥{totalJpy.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        {item.addTax && <span className="text-[10px] text-gray-500 bg-gray-200 px-1 rounded">含稅</span>}
                        <div className="text-sm font-medium text-gray-500 font-mono">
                          ≈ ${totalTwd.toLocaleString()}
                        </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;