
import React from 'react';
import { X, Cloud, CheckCircle, AlertCircle } from 'lucide-react';

interface SyncConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  connectionError: string | null;
}

const SyncConfigModal: React.FC<SyncConfigModalProps> = ({
  isOpen,
  onClose,
  isConnected,
  connectionError
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Cloud className={isConnected ? "text-green-500" : "text-gray-400"} size={24} />
            雲端連線狀態
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className={`p-5 rounded-xl border flex flex-col items-center text-center gap-3 ${isConnected ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            
            {isConnected ? (
              <>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                   <CheckCircle className="text-green-600" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-green-800 text-lg">已成功連線</h3>
                  <p className="text-sm text-green-700 mt-1">
                    您的代購清單正在與雲端資料庫同步。<br/>
                    Ash 與 Greg 的裝置將即時看到最新內容。
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                   <AlertCircle className="text-red-500" size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-red-800 text-lg">尚未連線</h3>
                  <p className="text-sm text-red-700 mt-1">
                    系統偵測不到有效的 Firebase 設定。<br/>
                    請檢查 <code className="bg-red-100 px-1 rounded">constants.ts</code> 是否已填入正確的 API Key。
                  </p>
                  {connectionError && (
                    <div className="mt-3 text-xs bg-white/50 p-2 rounded border border-red-200 text-red-600 font-mono break-all">
                      {connectionError}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyncConfigModal;
