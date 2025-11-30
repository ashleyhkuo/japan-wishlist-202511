
import React, { useState, useEffect } from 'react';
import { User, WishlistItem } from '../types';
import { Plus, Image as ImageIcon, Wand2, Link as LinkIcon } from 'lucide-react';

interface AddItemFormProps {
  currentUser: User;
  onAddItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'isBought'>) => void;
}

// Helper: Convert Google Drive or other share links to direct view links
const processUrl = (url: string) => {
  if (!url) return '';
  try {
    const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
    }
    if (url.includes('dropbox.com') && url.includes('dl=0')) {
      return url.replace('dl=0', 'raw=1');
    }
  } catch (e) {
    return url;
  }
  return url;
};

const AddItemForm: React.FC<AddItemFormProps> = ({ currentUser, onAddItem }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [priceJpy, setPriceJpy] = useState<string>('');
  const [addTax, setAddTax] = useState(false);
  const [notes, setNotes] = useState('');
  
  // URL States
  const [productUrl, setProductUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Preview Logic
  const [previewSrc, setPreviewSrc] = useState('');
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!imageUrl) {
        setPreviewSrc('');
        setIsMagicLink(false);
        setImgError(false);
        return;
    }
    setPreviewSrc(processUrl(imageUrl));
    setIsMagicLink(false);
    setImgError(false);
  }, [imageUrl]);

  const handlePreviewError = () => {
    if (!previewSrc) return;
    if (!isMagicLink) {
        // Try Microlink fallback
        setPreviewSrc(`https://api.microlink.io/?url=${encodeURIComponent(imageUrl)}&embed=image.url`);
        setIsMagicLink(true);
    } else {
        setImgError(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddItem({
      createdBy: currentUser,
      name,
      quantity: quantity || 1,
      priceJpy: priceJpy ? parseFloat(priceJpy) : 0,
      addTax,
      notes,
      imageUrl,
      productUrl,
    });

    // Reset form
    setName('');
    setQuantity(1);
    setPriceJpy('');
    setAddTax(false);
    setNotes('');
    setImageUrl('');
    setProductUrl('');
    setPreviewSrc('');
  };

  const themeColor = currentUser === 'Ash' ? 'rose' : 'blue';
  const buttonClass = currentUser === 'Ash' ? 'bg-rose-500 hover:bg-rose-600' : 'bg-blue-500 hover:bg-blue-600';
  const ringClass = currentUser === 'Ash' ? 'focus:ring-rose-500' : 'focus:ring-blue-500';

  // Shared input style
  const inputStyle = `w-full px-4 py-2 bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:bg-white focus:ring-2 ${ringClass} focus:border-transparent outline-none transition-all placeholder-gray-400`;

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-${themeColor}-100 p-6 mb-8`}>
      <h2 className={`text-lg font-bold text-gray-800 mb-4 flex items-center gap-2`}>
        <span className={`w-2 h-6 rounded-full bg-${themeColor}-500`}></span>
        新增清單 ({currentUser} 建立)
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Name and Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              代購商品名稱 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Wakamoto, Uniqlo T-shirt..."
              className={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              數量 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
              className={`${inputStyle} text-center`}
            />
          </div>
        </div>

        {/* Row 2: Price and Tax */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              單價 JPY (稅前)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">¥</span>
              <input
                type="number"
                min="0"
                value={priceJpy}
                onChange={(e) => setPriceJpy(e.target.value)}
                placeholder="0"
                className={`${inputStyle} pl-8`}
              />
            </div>
          </div>
          <div className="pb-2">
             <label className="flex items-center space-x-2 cursor-pointer select-none">
              <div className="relative">
                <input 
                  type="checkbox" 
                  checked={addTax} 
                  onChange={(e) => setAddTax(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={`w-10 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 ${ringClass} peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-${themeColor}-500`}></div>
              </div>
              <span className="text-sm text-gray-600 font-medium">需計算 10% 稅</span>
            </label>
          </div>
        </div>

        {/* Row 3: Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            備註 (規格、顏色、尺寸)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="請詳細描述商品細節..."
            rows={4} 
            className={`${inputStyle} resize-y`}
          />
        </div>

        {/* Row 4: URLs (Split into Product Link and Image Link) */}
        <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          
          {/* 1. Product URL */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <LinkIcon size={12} /> 商品連結 (購買網址)
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="https://www.uniqlo.com/..."
              className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:border-indigo-300 outline-none transition-colors"
            />
            <p className="text-[10px] text-gray-400 mt-1 pl-1">
               此連結會顯示在清單卡片下方，方便點擊購買。
            </p>
          </div>

          {/* 2. Image URL + Preview */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
              <ImageIcon size={12} /> 參考圖片 URL (僅顯示圖片)
            </label>
            <div className="flex gap-4 items-start">
               <div className="flex-grow">
                 <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="貼上圖片網址 或 Google Drive 連結"
                  className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md bg-white text-gray-700 focus:border-indigo-300 outline-none transition-colors"
                />
               </div>
               {/* Preview Thumbnail */}
               {imageUrl && (
                 <div className="shrink-0 w-16 h-16 bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm relative">
                   <img 
                     src={previewSrc} 
                     alt="Preview" 
                     className={`w-full h-full object-cover transition-opacity duration-300 ${imgError ? 'opacity-30' : 'opacity-100'}`}
                     onError={handlePreviewError}
                   />
                   {isMagicLink && !imgError && (
                      <div className="absolute bottom-0 right-0 bg-indigo-500 text-white p-0.5 rounded-tl-md">
                          <Wand2 size={8} />
                      </div>
                   )}
                 </div>
               )}
            </div>
            <p className="text-[10px] text-gray-400 mt-1 pl-1">
               此網址不會顯示文字，只會用來呈現縮圖。
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full ${buttonClass} text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 mt-2`}
        >
          <Plus size={20} />
          新增清單 ({currentUser} 建立)
        </button>
      </form>
    </div>
  );
};

export default AddItemForm;
