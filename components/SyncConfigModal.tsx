import React, { useState, useEffect } from 'react';
import { X, Cloud, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { FirebaseConfig } from '../types';

interface SyncConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: FirebaseConfig | null;
  onSave: (config: FirebaseConfig) => void;
  onDisconnect: () => void;
  isConnected: boolean;
  connectionError: string | null;
}

const SyncConfigModal: React.FC<SyncConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  onDisconnect,
  isConnected,
  connectionError
}) => {
  const [jsonInput, setJsonInput] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      setJsonInput(JSON.stringify(config, null, 2));
    }
  }, [config]);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      // Basic validation
      if (!parsed.apiKey || !parsed.databaseURL) {
        throw new Error('Missing required fields (apiKey, databaseURL)');
      }
      setParseError(null);
      onSave(parsed);
    } catch (e) {
      setParseError('格式錯誤：請確保輸入的是有效的 JSON 物件');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-slate-50 border-b border-gray-100 p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Cloud className={isConnected ? "text-green-500" : "text-gray-400"} size={24} />
            雲端同步設定 (Cloud Sync)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          
          {/* Status Indicator */}
          <div className={`mb-6 p-4 rounded-xl border ${isConnected ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
            <div className="flex items-start gap-3">
              {isConnected ? (
                <CheckCircle className="text-green-600 shrink-0 mt-0.5" size={20} />
              ) : (
                <AlertCircle className="text-gray-400 shrink-0 mt-0.5" size={20} />
              )}
              <div>
                <h3 className={`font-bold ${isConnected ? 'text-green-800' : 'text-gray-700'}`}>
                  {isConnected ? '已連線同步中' : '尚未連線'}
                </h3>
                <p className={`text-sm mt-1 ${isConnected ? 'text-green-700' : 'text-gray-500'}`}>
                  {isConnected 
                    ? '您的清單現在會即時同步到所有已連線的裝置。' 
                    : '請輸入 Firebase 設定以啟用多裝置同步功能。'}
                </p>
                {connectionError && (
                   <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                     連線錯誤: {connectionError}
                   </div>
                )}
              </div>
            </div>
          </div>

          {!isConnected ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Firebase Configuration (JSON)
                </label>
                <div className="text-xs text-gray-500 mb-2 bg-blue-50 p-3 rounded border border-blue-100 leading-relaxed">
                  <p className="font-bold mb-1 flex items-center gap-1"><HelpCircle size={12}/> 如何獲取設定：</p>
                  1. 前往 <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 underline">Firebase Console</a> 建立免費專案<br/>
                  2. 建立 "Realtime Database" 並設定規則為 true (測試用)<br/>
                  3. 在專案設定中建立 Web App 並複製 config 物件
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder={`{
  "apiKey": "AIzaSy...",
  "authDomain": "...",
  "databaseURL": "https://...",
  "projectId": "...",
  "storageBucket": "...",
  "messagingSenderId": "...",
  "appId": "..."
}`}
                  rows={8}
                  className="w-full font-mono text-xs p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-gray-50"
                />
                {parseError && <p className="text-red-500 text-xs mt-1">{parseError}</p>}
              </div>

              <button
                onClick={handleSave}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                儲存並連線
              </button>
            </div>
          ) : (
             <div className="space-y-4">
               <div className="bg-slate-100 p-4 rounded-lg">
                 <p className="text-xs text-gray-500 font-mono break-all">
                   Project ID: {config?.projectId}
                 </p>
                 <p className="text-xs text-gray-500 font-mono break-all">
                   Database: {config?.databaseURL}
                 </p>
               </div>
               <button
                 onClick={onDisconnect}
                 className="w-full bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold py-3 rounded-xl transition-all"
               >
                 中斷連線 (僅保留本機資料)
               </button>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SyncConfigModal;