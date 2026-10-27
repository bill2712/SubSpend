/**
 * Service catalog used by the quick-add search.
 *
 * Deliberately contains NAMES AND CATEGORIES ONLY. Prices differ by country,
 * plan and promotion and change often, so the user always types the price.
 * (Optional, clearly-labelled approximate hints live in ./priceHints.ts.)
 *
 * To add a service: append `{ id, name, category }`. `id` must be unique,
 * lowercase, kebab-case. `aliases` improve search (old names, abbreviations,
 * Chinese names). `nameZh` is only for generic entries that need translating.
 *
 * Names are trademarks of their owners; the site is not affiliated with them.
 */

export const CATEGORIES = [
  'streaming', 'music', 'ai', 'cloud', 'gaming', 'news', 'fitness', 'software', 'telecom', 'other',
] as const;

export type Category = (typeof CATEGORIES)[number];

export function isCategory(v: unknown): v is Category {
  return typeof v === 'string' && (CATEGORIES as readonly string[]).includes(v);
}

export interface CatalogItem {
  id: string;
  name: string;
  category: Category;
  aliases?: string[];
  /** Translated display name for generic (non-brand) entries. */
  nameZh?: string;
}

export const CATALOG: CatalogItem[] = [
  // Video streaming
  { id: 'netflix', name: 'Netflix', category: 'streaming', aliases: ['網飛'] },
  { id: 'disney-plus', name: 'Disney+', category: 'streaming', aliases: ['disney plus'] },
  { id: 'youtube-premium', name: 'YouTube Premium', category: 'streaming', aliases: ['yt'] },
  { id: 'prime-video', name: 'Amazon Prime Video', category: 'streaming', aliases: ['prime'] },
  { id: 'apple-tv', name: 'Apple TV', category: 'streaming', aliases: ['apple tv+', 'appletv'] },
  { id: 'hbo-max', name: 'HBO Max', category: 'streaming', aliases: ['max', 'hbo'] },
  { id: 'viu', name: 'Viu', category: 'streaming' },
  { id: 'mytv-super', name: 'myTV SUPER', category: 'streaming', aliases: ['tvb'] },
  { id: 'now-e', name: 'Now E', category: 'streaming', aliases: ['now tv'] },
  { id: 'crunchyroll', name: 'Crunchyroll', category: 'streaming', aliases: ['anime'] },
  { id: 'iqiyi', name: 'iQIYI', category: 'streaming', aliases: ['愛奇藝', 'iqiyi'] },
  { id: 'paramount-plus', name: 'Paramount+', category: 'streaming' },

  // Music & audio
  { id: 'spotify', name: 'Spotify', category: 'music' },
  { id: 'apple-music', name: 'Apple Music', category: 'music' },
  { id: 'youtube-music', name: 'YouTube Music', category: 'music' },
  { id: 'kkbox', name: 'KKBOX', category: 'music' },
  { id: 'joox', name: 'JOOX', category: 'music' },
  { id: 'tidal', name: 'TIDAL', category: 'music' },
  { id: 'audible', name: 'Audible', category: 'music', aliases: ['audiobooks'] },

  // AI tools
  { id: 'chatgpt', name: 'ChatGPT', category: 'ai', aliases: ['openai', 'gpt'] },
  { id: 'claude', name: 'Claude', category: 'ai', aliases: ['anthropic'] },
  { id: 'gemini', name: 'Google Gemini', category: 'ai', aliases: ['google ai', 'bard'] },
  { id: 'copilot', name: 'Microsoft Copilot', category: 'ai' },
  { id: 'github-copilot', name: 'GitHub Copilot', category: 'ai' },
  { id: 'perplexity', name: 'Perplexity', category: 'ai' },
  { id: 'midjourney', name: 'Midjourney', category: 'ai' },
  { id: 'cursor', name: 'Cursor', category: 'ai' },

  // Cloud storage
  { id: 'icloud', name: 'iCloud+', category: 'cloud', aliases: ['icloud'] },
  { id: 'google-one', name: 'Google One', category: 'cloud', aliases: ['google drive'] },
  { id: 'dropbox', name: 'Dropbox', category: 'cloud' },
  { id: 'onedrive', name: 'OneDrive', category: 'cloud' },
  { id: 'box', name: 'Box', category: 'cloud' },
  { id: 'proton', name: 'Proton', category: 'cloud', aliases: ['proton mail', 'proton drive', 'proton vpn'] },

  // Gaming
  { id: 'xbox-game-pass', name: 'Xbox Game Pass', category: 'gaming' },
  { id: 'playstation-plus', name: 'PlayStation Plus', category: 'gaming', aliases: ['ps plus', 'psn'] },
  { id: 'nintendo-switch-online', name: 'Nintendo Switch Online', category: 'gaming', aliases: ['nso'] },
  { id: 'apple-arcade', name: 'Apple Arcade', category: 'gaming' },
  { id: 'ea-play', name: 'EA Play', category: 'gaming' },
  { id: 'geforce-now', name: 'GeForce NOW', category: 'gaming', aliases: ['nvidia'] },

  // News & reading
  { id: 'scmp', name: 'South China Morning Post', category: 'news', aliases: ['scmp', '南華早報'] },
  { id: 'nytimes', name: 'The New York Times', category: 'news', aliases: ['nyt'] },
  { id: 'economist', name: 'The Economist', category: 'news' },
  { id: 'ft', name: 'Financial Times', category: 'news', aliases: ['ft'] },
  { id: 'wsj', name: 'The Wall Street Journal', category: 'news', aliases: ['wsj'] },
  { id: 'bloomberg', name: 'Bloomberg', category: 'news' },
  { id: 'medium', name: 'Medium', category: 'news' },
  { id: 'kindle-unlimited', name: 'Kindle Unlimited', category: 'news', aliases: ['ebooks'] },

  // Fitness & wellbeing
  { id: 'strava', name: 'Strava', category: 'fitness' },
  { id: 'apple-fitness', name: 'Apple Fitness+', category: 'fitness' },
  { id: 'peloton', name: 'Peloton App', category: 'fitness' },
  { id: 'fitbit-premium', name: 'Fitbit Premium', category: 'fitness' },
  { id: 'headspace', name: 'Headspace', category: 'fitness', aliases: ['meditation'] },
  { id: 'calm', name: 'Calm', category: 'fitness', aliases: ['meditation'] },
  { id: 'gym', name: 'Gym membership', category: 'fitness', nameZh: '健身室會籍', aliases: ['健身'] },

  // Software & productivity
  { id: 'microsoft-365', name: 'Microsoft 365', category: 'software', aliases: ['office', 'office 365'] },
  { id: 'adobe-cc', name: 'Adobe Creative Cloud', category: 'software', aliases: ['photoshop', 'lightroom'] },
  { id: 'canva', name: 'Canva', category: 'software' },
  { id: 'notion', name: 'Notion', category: 'software' },
  { id: '1password', name: '1Password', category: 'software', aliases: ['password manager'] },
  { id: 'duolingo', name: 'Duolingo', category: 'software', aliases: ['super duolingo'] },
  { id: 'nordvpn', name: 'NordVPN', category: 'software', aliases: ['vpn'] },
  { id: 'expressvpn', name: 'ExpressVPN', category: 'software', aliases: ['vpn'] },
  { id: 'zoom', name: 'Zoom', category: 'software' },

  // Telecom & utilities
  { id: 'mobile-plan', name: 'Mobile plan', category: 'telecom', nameZh: '手機月費計劃', aliases: ['sim', 'phone', '電話'] },
  { id: 'home-broadband', name: 'Home broadband', category: 'telecom', nameZh: '家居寬頻', aliases: ['internet', 'wifi', '上網'] },
  { id: 'csl', name: 'csl', category: 'telecom' },
  { id: 'smartone', name: 'SmarTone', category: 'telecom' },
  { id: '3hk', name: '3HK', category: 'telecom', aliases: ['three'] },
  { id: 'cmhk', name: 'China Mobile Hong Kong', category: 'telecom', aliases: ['cmhk', '中國移動'] },
  { id: 'hkbn', name: 'HKBN', category: 'telecom', aliases: ['香港寬頻'] },
  { id: 'netvigator', name: 'Netvigator', category: 'telecom', aliases: ['hkt', '網上行'] },
];
