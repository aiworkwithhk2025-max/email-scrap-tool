/**
 * SERVICE: Scraper Engine
 * 
 * Free Tier Strategy:
 * Browser-based fetching is blocked by CORS policies on most websites.
 * Firebase Cloud Functions require the "Blaze" (Paid) plan for outbound network requests 
 * to non-Google services.
 * 
 * Solution: We use a public CORS proxy (corsproxy.io) to fetch the HTML content
 * directly from the client. This keeps the architecture 100% Serverless and Free.
 */

const EMAIL_REGEX = /[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+/gi;
const PROXY_URL = 'https://corsproxy.io/?';

// Rate limiting state
let lastRequestTime = 0;
const RATE_LIMIT_MS = 5000; // 5 seconds

export const extractEmailsFromUrl = async (targetUrl: string): Promise<string[]> => {
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
    // We append the target URL to the proxy service
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(validUrl)}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch website. Status: ${response.status}`);
    }

    const htmlText = await response.text();

    // 4. Parse Emails with Regex
    const found = htmlText.match(EMAIL_REGEX);
    
    if (!found) {
      return [];
    }

    // 5. Clean and Deduplicate
    // Filter out common false positives like image extensions or simple 'user@domain' placeholders if needed.
    const uniqueEmails = Array.from(new Set(found.map(e => e.toLowerCase())));
    
    // Basic filter to remove image files mistagged as emails (e.g., image@2x.png)
    const filteredEmails = uniqueEmails.filter(email => {
        const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.js', '.css'];
        return !invalidExtensions.some(ext => email.endsWith(ext));
    });

    return filteredEmails;

  } catch (error: any) {
    console.error("Scrape failed:", error);
    throw new Error(error.message || "Failed to scrape url");
  }
};