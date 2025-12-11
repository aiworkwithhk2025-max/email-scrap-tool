export interface ScrapeResult {
  id?: string;
  url: string;
  emails: string[];
  phoneNumbers: string[];
  timestamp: number;
  userId?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface ScraperError {
  message: string;
}