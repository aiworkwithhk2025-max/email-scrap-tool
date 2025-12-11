import React from 'react';
import { ScrapeResult } from '../types';
import { Clock, Trash2, ExternalLink, ChevronLeft } from 'lucide-react';

interface HistorySidebarProps {
  isOpen: boolean;
  history: ScrapeResult[];
  onToggle: () => void;
  onSelect: (item: ScrapeResult) => void;
  onDelete: (id: string) => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({ 
  isOpen, 
  history, 
  onToggle, 
  onSelect,
  onDelete 
}) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 z-40 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out border-r border-gray-100 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" /> History
          </h2>
          <button onClick={onToggle} className="p-1 hover:bg-gray-200 rounded text-gray-500">
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 text-sm">
              <p>No saved scrapes yet.</p>
              <p className="mt-1">Scrape a site and click "Save" to build your list.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id} 
                className="group relative p-3 rounded-lg border border-gray-100 hover:border-brand-200 hover:bg-brand-50 transition-all cursor-pointer bg-white shadow-sm"
                onClick={() => onSelect(item)}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-gray-800 text-sm truncate max-w-[180px]" title={item.url}>
                    {item.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </h3>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(item.id) onDelete(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.emails.length} found
                    </span>
                    <span className="text-[10px] text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};