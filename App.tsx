import React, { useState, useEffect } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  db, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  deleteDoc,
  doc
} from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { extractContactsFromUrl } from './services/scraperService';
import { ScrapeResult } from './types';
import { HistorySidebar } from './components/HistorySidebar';
import { ResultsCard } from './components/ResultsCard';
import { Search, Menu, LogOut, Loader2, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false); // New state for auth loading
  const [currentResult, setCurrentResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ScrapeResult[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false); 

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchHistory(currentUser.uid);
      } else {
        setHistory([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch History (Optimized: limit to last 5)
  const fetchHistory = async (userId: string) => {
    try {
      const q = query(
        collection(db, 'users', userId, 'scrapes'),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(q);
      const fetchedHistory: ScrapeResult[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedHistory.push({ 
            id: doc.id, 
            url: data.url,
            emails: data.emails || [],
            phoneNumbers: data.phoneNumbers || [],
            timestamp: data.timestamp,
            userId: data.userId
        });
      });
      setHistory(fetchedHistory);
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  // 3. Login / Logout
  const handleLogin = async () => {
    // Safety check: Prevent login attempt if config is still placeholder
    if (auth.app.options.apiKey?.toString().includes("PLACEHOLDER")) {
      setError("Setup Required: Please update services/firebase.ts with your real Firebase Project credentials.");
      return;
    }

    setError(null);
    setIsLoggingIn(true);
    
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error("Login failed", err);
      
      // Handle specific error codes to be more user-friendly
      if (err.code === 'auth/cancelled-popup-request') {
        // User just closed the popup, not a real error
        setError(null);
      } else if (err.code === 'auth/network-request-failed') {
        setError("Network Error: Could not connect to Firebase. Please check your config and internet connection.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(null);
      } else {
        setError("Authentication failed. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setIsSidebarOpen(false);
    setCurrentResult(null);
    setUrlInput('');
  };

  // 4. Scrape Logic
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    setError(null);
    setIsLoading(true);
    setCurrentResult(null);
    setIsSaved(false);

    try {
      const { emails, phoneNumbers } = await extractContactsFromUrl(urlInput);
      
      const result: ScrapeResult = {
        url: urlInput,
        emails,
        phoneNumbers,
        timestamp: Date.now(),
      };
      
      setCurrentResult(result);
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Save Logic (Firestore Write Optimization)
  const handleSave = async () => {
    if (!user || !currentResult || isSaved) return;

    setIsSaving(true);
    try {
      const docRef = await addDoc(collection(db, 'users', user.uid, 'scrapes'), {
        ...currentResult,
        userId: user.uid
      });
      
      setIsSaved(true);
      
      const savedItem = { ...currentResult, id: docRef.id };
      setHistory(prev => [savedItem, ...prev].slice(0, 5));

    } catch (err) {
      console.error("Error saving scrape:", err);
      setError("Failed to save to history.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'scrapes', id));
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 relative flex overflow-hidden">
      
      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <HistorySidebar 
        isOpen={isSidebarOpen}
        history={history}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        onSelect={(item) => {
          setCurrentResult(item);
          setIsSaved(true); 
          setIsSidebarOpen(false);
        }}
        onDelete={handleDeleteHistory}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-0 md:ml-0' : ''}`}>
        
        {/* Navbar */}
        <header className="px-6 py-4 flex justify-between items-center border-b border-gray-100 bg-white/80 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-3">
            {user && (
              <button 
                onClick={() => setIsSidebarOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 text-brand-600 font-bold text-xl tracking-tight">
              <Zap className="w-6 h-6 fill-current" />
              Univise Help
            </div>
          </div>
          
          <div>
            {!user ? (
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={`bg-gray-900 text-white px-5 py-2 rounded-full font-medium text-sm transition-all hover:shadow-lg flex items-center gap-2 ${isLoggingIn ? 'opacity-75 cursor-not-allowed' : 'hover:bg-gray-800'}`}
              >
                {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
                {isLoggingIn ? 'Signing in...' : 'Sign In with Google'}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                 <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-gray-200"
                />
                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center">
          
          <div className="text-center mb-10 space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Extract business contacts.
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              A free, serverless tool to find business emails and phone numbers instantly. 
              { !user && <span className="block mt-1 text-brand-600 font-medium">Sign in to save your history.</span> }
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleScrape} className="w-full max-w-2xl relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-brand-500 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Enter website URL (e.g. example.com)" 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full pl-12 pr-32 py-4 rounded-full border border-gray-200 shadow-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 outline-none text-lg transition-all"
            />
            <button 
              type="submit"
              disabled={isLoading || !urlInput}
              className="absolute right-2 top-2 bottom-2 bg-brand-600 text-white px-6 rounded-full font-medium hover:bg-brand-700 disabled:opacity-50 disabled:hover:bg-brand-600 transition-all flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Scanning...</span>
                </>
              ) : (
                'Find Contacts'
              )}
            </button>
          </form>

          {/* Error Message */}
          {error && (
             <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100 max-w-2xl w-full text-center animate-fade-in-up">
                {error}
             </div>
          )}

          {/* Results Area */}
          <ResultsCard 
            data={currentResult} 
            isLoggedIn={!!user} 
            onSave={handleSave} 
            isSaving={isSaving}
            isSaved={isSaved}
          />

        </main>
        
        <footer className="py-6 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Univise Help. Free Tier Optimized SaaS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;