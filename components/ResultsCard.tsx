import React from 'react';
import { Copy, Download, Save, Check, Mail, Phone } from 'lucide-react';
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
    const allContacts = [
        ...data.emails.map(e => `Email: ${e}`),
        ...data.phoneNumbers.map(p => `Phone: ${p}`)
    ].join('\n');
    
    navigator.clipboard.writeText(allContacts);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCsv = () => {
    // CSV Format: Type, Value, Source URL
    let csvContent = "data:text/csv;charset=utf-8,Type,Value,Source URL\n";
    
    data.emails.forEach(email => {
        csvContent += `Email,${email},${data.url}\n`;
    });
    
    data.phoneNumbers.forEach(phone => {
        csvContent += `Phone,${phone},${data.url}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `contacts_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasResults = data.emails.length > 0 || data.phoneNumbers.length > 0;

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
          {hasResults ? (
            <>
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Found: {data.emails.length} Emails, {data.phoneNumbers.length} Numbers
                </span>
                <div className="flex gap-2">
                    <button 
                        onClick={handleCopy}
                        className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-md transition-colors"
                        title="Copy all to clipboard"
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

              <div className="grid gap-6 md:grid-cols-2">
                {/* Emails Column */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-brand-500" /> Business Emails
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto border border-gray-100">
                        {data.emails.length > 0 ? (
                            <ul className="space-y-2">
                                {data.emails.map((email, idx) => (
                                    <li key={idx} className="flex items-center text-gray-700 font-mono text-xs break-all">
                                    <span className="w-1.5 h-1.5 bg-brand-400 rounded-full mr-2 flex-shrink-0"></span>
                                    {email}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No emails found.</p>
                        )}
                    </div>
                </div>

                {/* Phones Column */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-brand-500" /> Phone Numbers
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 max-h-60 overflow-y-auto border border-gray-100">
                        {data.phoneNumbers.length > 0 ? (
                            <ul className="space-y-2">
                                {data.phoneNumbers.map((phone, idx) => (
                                    <li key={idx} className="flex items-center text-gray-700 font-mono text-xs">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 flex-shrink-0"></span>
                                    {phone}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-400 italic">No phone numbers found.</p>
                        )}
                    </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-300 mb-2">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              </div>
              <p className="text-gray-500">No contact info found on this page.</p>
              <p className="text-xs text-gray-400 mt-1">Try a different URL or check the "Contact" page directly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};