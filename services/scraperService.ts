/**
 * SERVICE: Scraper Engine
 * 
 * Free Tier Strategy:
 * Browser-based fetching is blocked by CORS policies on most websites.
 * Firebase Cloud Functions require the "Blaze" (Paid) plan for outbound network requests.
 * 
 * Solution: We use a public CORS proxy (corsproxy.io) to fetch the HTML content.
 */

// REGEX EXPLANATION:
// Emails: Must end with a dot followed by at least 2 letters (e.g., .com, .io).
// This strictly excludes package versions like "jquery@3.7.1" because "1" is not a letter.
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// Phone Numbers: Matches common formats like (555) 555-5555, 555-555-5555, +1 555 555 5555
// Minimum length checks help reduce false positives (like dates).
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

const PROXY_URL = 'https://corsproxy.io/?';

// Rate limiting state
let lastRequestTime = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds

export const extractContactsFromUrl = async (targetUrl: string): Promise<{ emails: string[], phoneNumbers: string[] }> => {
  // 1. Rate Limiting Check
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_MS) {
    throw new Error(`Please wait ${Math.ceil((RATE_LIMIT_MS - (now - lastRequestTime)) / 1000)} seconds before scraping again.`);
  }
  lastRequestTime = now;

  // 2. Validate URL
  let validUrl = targetUrl;
  if (!validUrl.startsWith('http')) {
    validUrl = `https://${validUrl}`;
  }

  try {
    // 3. Fetch via Proxy
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(validUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website. Status: ${response.status}`);
    }

    const htmlText = await response.text();

    // 4. Parse Emails
    const foundEmails = htmlText.match(EMAIL_REGEX) || [];
    
    // 5. Parse Phone Numbers
    const foundPhones = htmlText.match(PHONE_REGEX) || [];

    // 6. Clean and Deduplicate Emails
    const uniqueEmails = Array.from(new Set(foundEmails.map(e => e.toLowerCase())));
    
    // Filter out common false positives (images, known libraries if regex leaks)
    const filteredEmails = uniqueEmails.filter(email => {
        const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.js', '.css'];
        // Double check to ensure no numeric-ending domains slipped through (redundant but safe)
        const domain = email.split('@')[1];
        if (!domain || /\d+$/.test(domain)) return false; 
        
        return !invalidExtensions.some(ext => email.endsWith(ext));
    });

    // 7. Clean and Deduplicate Phones
    const uniquePhones = Array.from(new Set(foundPhones.map(p => p.trim())));
    // Filter out potential years or short noise
    const filteredPhones = uniquePhones.filter(p => {
        const digits = p.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 15;
    });

    return {
        emails: filteredEmails,
        phoneNumbers: filteredPhones
    };

  } catch (error: any) {
    console.error("Scrape failed:", error);
    throw new Error(error.message || "Failed to scrape url");
  }
};