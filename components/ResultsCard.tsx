import React from 'react';
import { Copy, Download, Save, Check } from 'lucide-react';
import { ScrapeResult } from '../types';

interface ResultsCardProps {
  data: ScrapeResult | null;
  onSave: () => void;
  isSaving: boolean;
  isSaved: boolean;
  isLoggedIn: boolean;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ 
  data, 
  onSave, 
  isSaving, 
  isSaved,
  isLoggedIn 
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!data) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(data.emails.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Source URL\n"
      + data.emails.map(e => `${e},${data.url}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `emails_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-fade-in-up">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center flex-wrap gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Results for:</h3>
            <p className="text-sm text-gray-500 truncate max-w-xs sm:max-w-md">{data.url}</p>
          </div>
          <div className="flex gap-2">
             {isLoggedIn && (
                <button
                    onClick={onSave}
                    disabled={isSaved || isSaving}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                        isSaved 
                        ? 'bg-green-100 text-green-700 cursor-default' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {isSaved ? <Check className="w-4 h-4"/> : <Save className="w-4 h-4"/>}
                    {isSaved ? 'Saved' : 'Save'}
                </button>
             )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {data.emails.length > 0 ? (
            <>
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {data.emails.length} Emails Found
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={handleCopy}
                        className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                        title="Copy to clipboard"
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                    <button 
                        onClick={handleDownloadCsv}
                        className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                        title="Download CSV"
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto border border-gray-100">
                <ul className="space-y-2">
                  {data.emails.map((email, idx) => (
                    <li key={idx} className="flex items-center text-gray-700 font-mono text-sm">
                      <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-3"></span>
                      {email}
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-300 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p className="text-gray-500">No emails found on this page.</p>
              <p className="text-xs text-gray-400 mt-1">Try a different URL or check the "Contact" page directly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};