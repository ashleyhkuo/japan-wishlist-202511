
import React, { useState, useRef, useEffect } from 'react';
import { WishlistItem, Category } from '../types';
import { Trash2, Check, ExternalLink, Calculator, X, Image as ImageIcon, Wand2, Pencil } from 'lucide-react';
import { CATEGORY_CONFIG } from '../constants';

interface ItemCardProps {
  item: WishlistItem;
  exchangeRate: number;
  onUpdate: (id: string, updates: Partial<WishlistItem>) => void;
  onDelete: (id: string) => void;
}

// Helper: Convert Google Drive or other share links to direct view links
const processUrl = (url: string) => {
  if (!url) return '';
  try {
    // Handle Google Drive Links
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    // Handle Dropbox (dl=0 -> raw=1)
    if (url.includes('dropbox.com') && url.includes('dl=0')) {
      return url.replace('dl=0', 'raw=1');
    }
  } catch (e) {
    return url;
  }
  return url;
};

const ItemCard: React.FC<ItemCardProps> = ({ item, exchangeRate, onUpdate, onDelete }) => {
  const [isBuying, setIsBuying] = useState(false);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  
  // Logic for display:
  // 1. Image Source: Always use imageUrl if available. 
  // 2. Link URL: Use productUrl if available. Fallback to imageUrl (for legacy items).
  const displayImage = item.imageUrl; 
  const displayLink = item.productUrl || item.imageUrl;
  
  // Resolve Category (Fallback to Other if undefined)
  const currentCategory = item.category || 'Other';
  const categoryConfig = CATEGORY_CONFIG[currentCategory];

  // Image State
  const initialUrl = processUrl(displayImage);
  const [imgSrc, setImgSrc] = useState(initialUrl);
  const [imgError, setImgError] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);

  // Update image source if item prop changes
  useEffect(() => {
    setImgSrc(processUrl(displayImage));
    setImgError(false);
    setIsMagicLink(false);
  }, [displayImage]);

  const handleImageError = () => {
    if (!imgSrc) return;
    
    // If we haven't tried Microlink yet, try it now
    if (!isMagicLink) {
      // Use Microlink API to extract the OG:Image from the website URL
      const magicUrl = `https://api.microlink.io/?url=${encodeURIComponent(displayImage)}&embed=image.url`;
      setImgSrc(magicUrl);
      setIsMagicLink(true);
    } else {
      // If Microlink also fails, show placeholder
      setImgError(true);
    }
  };
  
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
  const startBuying = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent propagation if called from parent click
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
            <div className="flex items-start flex-wrap gap-2 mb-1">
              <h3 className={`text-lg font-bold text-gray-900 leading-tight break-words mr-1 ${item.isBought ? 'line-through text-gray-400' : ''}`}>
                {item.name}
              </h3>
              
              <div className="flex flex-wrap gap-1.5 mt-0.5">
                 {/* Creator Badge - Updated to text-sm */}
                 <span className={`text-sm font-bold px-2 py-0.5 rounded border ${creatorColor} whitespace-nowrap`}>
                  {creatorLabel}
                 </span>
                 {/* Category Badge removed from here, moved to right column */}
              </div>
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

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          
          {/* Image Block (If image URL exists) */}
          {displayImage && (
            <div className="shrink-0 order-2 sm:order-1 self-start">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden shadow-sm relative group/img">
                <a href={displayLink} target="_blank" rel="noopener noreferrer" className="block w-full h-full cursor-zoom-in">
                  <img 
                    src={imgSrc} 
                    alt={item.name} 
                    className={`w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110 ${imgError ? 'opacity-50' : ''}`}
                    onError={handleImageError}
                  />
                  
                  {/* Magic Link Indicator */}
                  {isMagicLink && !imgError && (
                    <div className="absolute bottom-1 right-1 bg-black/60 backdrop-blur-sm text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <Wand2 size={10} /> 預覽
                    </div>
                  )}

                  {/* Fallback (Load Failed) */}
                  {imgError && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-2 text-center bg-gray-50">
                        <ImageIcon size={24} className="mb-1 opacity-50" />
                        <span className="text-[10px] break-words leading-none">無法載入</span>
                     </div>
                  )}

                  <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/img:opacity-100">
                    <ExternalLink className="text-white drop-shadow-md" size={20} />
                  </div>
                </a>
              </div>
            </div>
          )}

           {/* If no image, fallback to a nice Link Card for layout consistency */}
           {!displayImage && displayLink && (
              <div className="shrink-0 order-2 sm:order-1 self-start">
                  <a href={displayLink} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all flex flex-col items-center justify-center text-center p-2 gap-1 group/linkcard">
                     <div className="bg-white p-2 rounded-full shadow-sm group-hover/linkcard:scale-110 transition-transform">
                        <ExternalLink size={16} className="text-blue-500" />
                     </div>
                     <span className="text-[10px] font-bold text-slate-500 group-hover/linkcard:text-blue-600">前往購買</span>
                  </a>
              </div>
           )}


          {/* Center Column: Quantity, Notes, URL */}
          <div className="flex-1 order-3 sm:order-2 flex flex-col gap-3 min-w-0">
            
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

            {/* Product Link (Text version) */}
            {displayLink && (
              <div className="mt-1">
                <a 
                  href={displayLink} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-500 hover:text-blue-700 truncate block hover:underline flex items-center gap-1.5 max-w-full"
                >
                   <ExternalLink size={14} className="shrink-0" /> 
                   <span className="truncate">{displayLink}</span>
                </a>
              </div>
            )}
          </div>

          {/* Right Column: Category + Price */}
          <div className="w-full sm:w-44 shrink-0 order-1 sm:order-3 flex flex-col gap-2">
            
            {/* NEW: Category Switcher (Moved here) - Updated font size */}
            <div className="flex justify-end relative">
               {isEditingCategory ? (
                 <div className="flex flex-wrap justify-end gap-1.5 p-1.5 bg-gray-50 rounded-xl border border-gray-100 w-full animate-in fade-in zoom-in-95 duration-200 z-10">
                   {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
                     <button
                       key={cat}
                       onClick={(e) => {
                         e.stopPropagation();
                         onUpdate(item.id, { category: cat });
                         setIsEditingCategory(false);
                       }}
                       className={`text-sm font-bold px-2 py-1.5 rounded-md border transition-all ${
                          currentCategory === cat
                            ? CATEGORY_CONFIG[cat].activeClass + ' shadow-sm border-transparent' 
                            : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-100 hover:text-gray-700'
                       }`}
                     >
                       {CATEGORY_CONFIG[cat].label}
                     </button>
                   ))}
                 </div>
               ) : (
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setIsEditingCategory(true);
                   }}
                   className={`text-sm font-bold px-3 py-1 rounded border ${categoryConfig.color} ${categoryConfig.bg} ${categoryConfig.border} hover:opacity-80 transition-opacity`}
                   title="點擊修改分類"
                 >
                   {categoryConfig.label} ▾
                 </button>
               )}
            </div>

            {/* Price / Buying Input Block */}
            <div className="min-h-[60px]">
              {isBuying ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3 animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                  <div className="text-sm font-bold text-indigo-800 mb-1.5 flex items-center gap-1">
                    <Calculator size={14} />
                    確認金額 (JPY)
                  </div>
                  <input
                    ref={priceInputRef}
                    type="number"
                    min="0"
                    value={buyPrice}
                    onChange={(e) => setBuyPrice(e.target.value)}
                    className="w-full px-2 py-1 mb-2 text-lg font-mono font-bold border border-indigo-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="實際金額"
                  />
                  
                  {/* Tax Toggle */}
                  <div className="flex flex-col gap-2">
                    <div className="flex bg-indigo-100 p-1 rounded-lg">
                      <button
                        onClick={() => setBuyTax(true)}
                        className={`flex-1 py-1 text-xs font-bold rounded transition-all ${
                          buyTax 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        稅前 +10%
                      </button>
                      <button
                        onClick={() => setBuyTax(false)}
                        className={`flex-1 py-1 text-xs font-bold rounded transition-all ${
                          !buyTax 
                            ? 'bg-white text-green-600 shadow-sm' 
                            : 'text-indigo-400 hover:text-indigo-600'
                        }`}
                      >
                        稅後 (含)
                      </button>
                    </div>
                    
                    <div className="flex gap-2 justify-end mt-1">
                       <button onClick={cancelBuying} className="p-1.5 text-gray-400 hover:bg-white rounded hover:text-gray-600 transition-colors">
                         <X size={18} />
                       </button>
                       <button onClick={confirmBuying} className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm font-bold hover:bg-indigo-700 shadow-sm flex items-center gap-1 transition-colors">
                         <Check size={14} /> 確定
                       </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={startBuying}
                  className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-right shadow-sm cursor-pointer hover:bg-white hover:border-indigo-300 hover:shadow-md transition-all relative group/price active:scale-95"
                  title="點擊修改價格"
                >
                   {/* Edit Icon Overlay - Always visible on mobile if needed, or controlled via group-hover */}
                   <div className="absolute top-1.5 left-2 text-indigo-300 opacity-60 sm:opacity-0 sm:group-hover/price:opacity-100 transition-opacity">
                      <Pencil size={14} />
                   </div>

                   <div className="flex flex-col items-end">
                      <div className="flex items-baseline gap-1.5">
                        <span className={`text-2xl font-bold font-mono tracking-tight leading-none ${item.isBought ? 'text-green-600' : 'text-rose-500'}`}>
                          ¥{totalJpy.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <span className={`text-[10px] px-1.5 rounded font-bold ${item.addTax ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                           {item.addTax ? '稅前計價' : '稅後價'}
                        </span>
                        <div className="text-sm font-medium text-gray-500 font-mono ml-1">
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
