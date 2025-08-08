interface AppStoreData {
  name: string;
  description: string;
  logo: string;
  genre: string;
  screenshots: string[];
  developerName?: string;
  rating?: number;
  price?: string;
  features?: string[];
}

export class AppStoreAPI {
  private static CORS_PROXY = 'https://corsproxy.io/?';
  
  static async fetchAppData(appUrl: string): Promise<AppStoreData | null> {
    try {
      // Extract app ID from various URL formats
      const appId = this.extractAppId(appUrl);
      if (!appId) {
        throw new Error('Invalid App Store URL');
      }

      // Fetch from iTunes API
      const apiUrl = `https://itunes.apple.com/lookup?id=${appId}`;
      const proxyUrl = `${this.CORS_PROXY}${encodeURIComponent(apiUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch app data');
      }

      const data = await response.json();
      const results = data.results;
      
      if (!results || results.length === 0) {
        throw new Error('App not found');
      }

      const appInfo = results[0];
      
      // Extract screenshots (combine iPhone and iPad)
      const screenshots = [
        ...(appInfo.screenshotUrls || []),
        ...(appInfo.ipadScreenshotUrls || [])
      ].filter(Boolean).slice(0, 6);

      // Extract key features from description
      const features = this.extractFeatures(appInfo.description);

      return {
        name: appInfo.trackName,
        description: appInfo.description,
        logo: appInfo.artworkUrl512 || appInfo.artworkUrl100,
        genre: appInfo.primaryGenreName,
        screenshots,
        developerName: appInfo.artistName,
        rating: appInfo.averageUserRating,
        price: appInfo.formattedPrice,
        features
      };
    } catch (error) {
      console.error('Error fetching app data:', error);
      return null;
    }
  }

  private static extractAppId(url: string): string | null {
    // Handle various App Store URL formats
    const patterns = [
      /apps\.apple\.com\/.*\/app\/.*\/id(\d+)/,
      /apps\.apple\.com\/app\/id(\d+)/,
      /itunes\.apple\.com\/.*\/app\/.*\/id(\d+)/,
      /id(\d+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  }

  private static extractFeatures(description: string): string[] {
    const features: string[] = [];
    
    // Look for bullet points or feature lists
    const lines = description.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Common patterns for features
      if (trimmed.startsWith('•') || 
          trimmed.startsWith('-') || 
          trimmed.startsWith('*') ||
          trimmed.match(/^\d+\./)) {
        const feature = trimmed.replace(/^[•\-\*]|\d+\./, '').trim();
        if (feature.length > 10 && feature.length < 100) {
          features.push(feature);
        }
      }
    }

    // If no features found, extract from first paragraph
    if (features.length === 0) {
      const firstParagraph = description.split('\n\n')[0];
      const sentences = firstParagraph.split('. ');
      features.push(...sentences.slice(0, 3).map(s => s.trim()));
    }

    return features.slice(0, 5);
  }

  static mapGenreToCategory(genre: string): string {
    const genreMap: { [key: string]: string } = {
      'Business': 'Business',
      'Developer Tools': 'Productivity',
      'Education': 'Education',
      'Entertainment': 'Entertainment',
      'Finance': 'Finance',
      'Food & Drink': 'Other',
      'Games': 'Entertainment',
      'Graphics & Design': 'Productivity',
      'Health & Fitness': 'Health & Fitness',
      'Kids': 'Education',
      'Lifestyle': 'Other',
      'Magazines & Newspapers': 'Other',
      'Medical': 'Health & Fitness',
      'Music': 'Entertainment',
      'Navigation': 'Travel',
      'News': 'Other',
      'Photo & Video': 'Entertainment',
      'Productivity': 'Productivity',
      'Reference': 'Education',
      'Shopping': 'E-commerce',
      'Social Networking': 'Social',
      'Sports': 'Health & Fitness',
      'Travel': 'Travel',
      'Utilities': 'Productivity',
      'Weather': 'Other'
    };
    
    return genreMap[genre] || 'Other';
  }
}