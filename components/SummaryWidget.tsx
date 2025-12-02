
import React from 'react';
import { SummaryStats } from '../types';
import { CheckSquare } from 'lucide-react';

interface SummaryWidgetProps {
  stats: SummaryStats;
}

const SummaryWidget: React.FC<SummaryWidgetProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      {/* List Total (Green Box) */}
      <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm">
        <h3 className="text-emerald-800 font-bold text-lg mb-4 flex items-center gap-2">
          清單總計 (包含未定價品項)
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-emerald-900/70 font-medium text-sm sm:text-base">
            <span>總數量:</span>
            <span className="font-mono text-xl text-emerald-900 font-bold">{stats.totalCount}</span>
          </div>
          
          <div className="flex justify-between items-center text-emerald-900/70 font-medium border-t border-emerald-100 pt-2 text-sm sm:text-base">
            <span>預計總日幣 (JPY 最終需付):</span>
            <span className="font-mono text-xl text-emerald-600 font-bold tracking-tight">
              {stats.totalJpy.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-emerald-900/70 font-medium border-t border-emerald-100 pt-2 text-sm sm:text-base">
            <span>預計總台幣 (TWD 預估):</span>
            <span className="font-mono text-xl text-red-500 font-bold tracking-tight">
              {stats.totalTwd.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Bought Total (Yellow Box) */}
      <div className="bg-yellow-50 rounded-2xl border border-yellow-100 p-5 shadow-sm">
        <h3 className="text-yellow-800 font-bold text-lg mb-4 flex items-center gap-2">
          <CheckSquare className="bg-green-600 text-white rounded p-0.5" size={24} />
          已購買品項總額
        </h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-yellow-900/70 font-medium text-sm sm:text-base">
            <span>已購買數量:</span>
            <span className="font-mono text-xl text-yellow-900 font-bold">{stats.boughtCount}</span>
          </div>
          
          <div className="flex justify-between items-center text-yellow-900/70 font-medium border-t border-yellow-200/50 pt-2 text-sm sm:text-base">
            <span>已付總日幣 (JPY 實付):</span>
            <span className="font-mono text-xl text-yellow-700 font-bold tracking-tight">
              {stats.boughtJpy.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-yellow-900/70 font-medium border-t border-yellow-200/50 pt-2 text-sm sm:text-base">
            <span>已付總台幣 (TWD 實付):</span>
            <span className="font-mono text-xl text-orange-600 font-bold tracking-tight">
              {stats.boughtTwd.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryWidget;
