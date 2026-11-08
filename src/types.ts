export interface VideoItem {
  id: string;
  title: string;
  japaneseTitle: string;
  studio: string;
  episode: string;
  duration: string;
  durationMinutes: number;
  views: number;
  likes: number;
  popularityScore: number;
  rating: number;
  releaseDate: string;
  releaseYear: number;
  resolution: '4K' | '1080p' | '720p';
  category: 'Trending' | 'New Releases' | 'Playlist 1712' | 'Top Rated' | 'Uncensored' | 'Series';
  tags: string[];
  thumbnail: string;
  streamUrl: string;
  sourceUrl: string;
  playlistId: string;
  synopsis: string;
  isNewRelease?: boolean;
}

export interface PersonalPlaylist {
  id: string;
  name: string;
  description: string;
  videoIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface VideoNotification {
  id: string;
  videoId: string;
  title: string;
  episode: string;
  studio: string;
  tagMatched: string;
  timestamp: string;
  isRead: boolean;
  thumbnail: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  includedTags: string[];
  excludedTags: string[];
  tagLogic: 'AND' | 'OR';
  minViews: number; // e.g., 0, 500000, 1000000, 1500000
  minPopularity: number; // 0 - 95
  minRating: number; // 0, 4.5, 4.7, 4.8
  resolution: 'ALL' | '4K' | '1080p';
  durationRange: 'ALL' | 'SHORT' | 'MEDIUM' | 'LONG';
  releaseYear: 'ALL' | '2026' | '2025';
  sortBy: 'popularity_desc' | 'views_desc' | 'date_desc' | 'rating_desc' | 'likes_desc';
}

export interface SmartTagComboPreset {
  id: string;
  label: string;
  description: string;
  includedTags: string[];
  excludedTags?: string[];
  tagLogic: 'AND' | 'OR';
}

export interface SavedTagCombo {
  id: string;
  name: string;
  includedTags: string[];
  excludedTags: string[];
  tagLogic: 'AND' | 'OR';
}

