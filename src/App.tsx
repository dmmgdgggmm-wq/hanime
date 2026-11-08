import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  SlidersHorizontal,
  ListVideo,
  Bell,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react';
import {
  VideoItem,
  PersonalPlaylist,
  VideoNotification,
  FilterState,
  SavedTagCombo,
} from './types';
import {
  FALLBACK_VIDEOS,
  DEFAULT_PLAYLISTS,
  DEFAULT_NOTIFICATIONS,
  CATEGORIES,
  SMART_TAG_SYNONYMS,
} from './data';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { VideoPlayerPanel } from './components/VideoPlayerPanel';
import { DeepFilterPanel } from './components/DeepFilterPanel';
import { VideoFeedGrid } from './components/VideoFeedGrid';
import { PersonalPlaylistView } from './components/PersonalPlaylistView';
import { NotificationCenterView } from './components/NotificationCenterView';
import { SmartTagCommandBar } from './components/SmartTagCommandBar';

type ActiveTab = 'discover' | 'playlists' | 'notifications';

const INITIAL_FILTERS: FilterState = {
  searchQuery: '',
  category: 'ALL',
  includedTags: [],
  excludedTags: [],
  tagLogic: 'AND',
  minViews: 0,
  minPopularity: 0,
  minRating: 0,
  resolution: 'ALL',
  durationRange: 'ALL',
  releaseYear: 'ALL',
  sortBy: 'popularity_desc',
};

export default function App() {
  // Theme State (Dark mode default for comfortable anime viewing)
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('hanimeflow_theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('hanimeflow_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('hanimeflow_theme', 'light');
    }
  }, [isDark]);

  // Catalog & Active Video State
  const [videos, setVideos] = useState<VideoItem[]>(FALLBACK_VIDEOS);
  const [activeVideo, setActiveVideo] = useState<VideoItem>(FALLBACK_VIDEOS[0]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filter State
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);

  // Saved Custom Multi-Tag Combos State
  const [savedCombos, setSavedCombos] = useState<SavedTagCombo[]>(() => {
    try {
      const raw = localStorage.getItem('hanimeflow_saved_tag_combos');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [
      {
        id: 'saved-default-1',
        name: 'Tình Cảm Không Che 4K',
        includedTags: ['Romance', 'Uncensored', 'HD 60fps'],
        excludedTags: [],
        tagLogic: 'AND',
      },
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('hanimeflow_saved_tag_combos', JSON.stringify(savedCombos));
    } catch {
      // ignore
    }
  }, [savedCombos]);

  // Personal Playlists State (LocalStorage persisted)
  const [playlists, setPlaylists] = useState<PersonalPlaylist[]>(() => {
    try {
      const raw = localStorage.getItem('hanimeflow_playlists');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_PLAYLISTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hanimeflow_playlists', JSON.stringify(playlists));
    } catch {
      // ignore
    }
  }, [playlists]);

  // Notifications & Subscribed Tags State
  const [notifications, setNotifications] = useState<VideoNotification[]>(() => {
    try {
      const raw = localStorage.getItem('hanimeflow_notifications');
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_NOTIFICATIONS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hanimeflow_notifications', JSON.stringify(notifications));
    } catch {
      // ignore
    }
  }, [notifications]);

  const [subscribedTags, setSubscribedTags] = useState<string[]>([
    'Sci-Fi',
    'Uncensored',
    'HD 60fps',
    'Romance',
    'Vanilla',
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Load initial playlist #1712 from backend API
  useEffect(() => {
    let mounted = true;
    fetch('/api/playlist?list=1712')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data && Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
          setActiveVideo(data.videos[0]);
        }
      })
      .catch(() => {
        // Fallback already populated
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Sync Source URL handler (fetches new episode from /api/sync-source)
  const handleSyncSourceUrl = async (urlToSync?: string) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/sync-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: urlToSync || 'https://hanime1.me/playlist?list=1712',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.newEpisode) {
          const newEp: VideoItem = data.newEpisode;
          setVideos((prev) => [newEp, ...prev.filter((v) => v.id !== newEp.id)]);
          setActiveVideo(newEp);

          const newNotif: VideoNotification = {
            id: `notif-${Date.now()}`,
            videoId: newEp.id,
            title: newEp.title,
            episode: `${newEp.episode} vừa đồng bộ từ nguồn #${data.playlistId}`,
            studio: newEp.studio,
            tagMatched: newEp.tags.slice(0, 2).join(' · '),
            timestamp: 'Vừa xong',
            isRead: false,
            thumbnail: newEp.thumbnail,
          };
          setNotifications((prev) => [newNotif, ...prev]);
          showToast(`Đã đồng bộ tập mới từ hanime1.me/playlist?list=${data.playlistId}`);
        }
      }
    } catch {
      showToast('Đã làm mới danh sách phát cục bộ #1712');
    } finally {
      setIsSyncing(false);
    }
  };

  // Deep Filter & Sort Computation
  const filteredVideos = useMemo(() => {
    return videos
      .filter((video) => {
        // Category filter
        if (filters.category !== 'ALL' && video.category !== filters.category) {
          return false;
        }

        // Search query (Supports multi-keyword & Vietnamese Smart Tag Synonyms)
        if (filters.searchQuery.trim() !== '') {
          const q = filters.searchQuery.toLowerCase();
          const matchedTitle = video.title.toLowerCase().includes(q);
          const matchedJp = video.japaneseTitle.toLowerCase().includes(q);
          const matchedStudio = video.studio.toLowerCase().includes(q);
          const matchedId = video.id.toLowerCase().includes(q);
          const matchedTag = video.tags.some((t) => {
            if (t.toLowerCase().includes(q)) return true;
            const syns = SMART_TAG_SYNONYMS[t] || [];
            return syns.some((syn) => syn.includes(q));
          });
          if (!matchedTitle && !matchedJp && !matchedStudio && !matchedId && !matchedTag) {
            return false;
          }
        }

        // Excluded tags
        if (
          filters.excludedTags.length > 0 &&
          filters.excludedTags.some((exTag) => video.tags.includes(exTag))
        ) {
          return false;
        }

        // Included tags (AND / OR)
        if (filters.includedTags.length > 0) {
          if (filters.tagLogic === 'AND') {
            const allMatch = filters.includedTags.every((incTag) =>
              video.tags.includes(incTag)
            );
            if (!allMatch) return false;
          } else {
            const anyMatch = filters.includedTags.some((incTag) =>
              video.tags.includes(incTag)
            );
            if (!anyMatch) return false;
          }
        }

        // Minimum Views
        if (filters.minViews > 0 && video.views < filters.minViews) {
          return false;
        }

        // Minimum Popularity
        if (
          filters.minPopularity > 0 &&
          video.popularityScore < filters.minPopularity
        ) {
          return false;
        }

        // Minimum Rating
        if (filters.minRating > 0 && video.rating < filters.minRating) {
          return false;
        }

        // Resolution
        if (filters.resolution !== 'ALL' && video.resolution !== filters.resolution) {
          return false;
        }

        // Duration Range
        if (filters.durationRange !== 'ALL') {
          if (filters.durationRange === 'SHORT' && video.durationMinutes >= 25) {
            return false;
          }
          if (
            filters.durationRange === 'MEDIUM' &&
            (video.durationMinutes < 25 || video.durationMinutes > 28)
          ) {
            return false;
          }
          if (filters.durationRange === 'LONG' && video.durationMinutes <= 28) {
            return false;
          }
        }

        // Release Year
        if (
          filters.releaseYear !== 'ALL' &&
          String(video.releaseYear) !== filters.releaseYear
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'views_desc':
            return b.views - a.views;
          case 'date_desc':
            return b.releaseDate.localeCompare(a.releaseDate);
          case 'rating_desc':
            return b.rating - a.rating;
          case 'likes_desc':
            return b.likes - a.likes;
          case 'popularity_desc':
          default:
            return b.popularityScore - a.popularityScore;
        }
      });
  }, [videos, filters]);

  // Personal Playlist Actions
  const handleToggleVideoInPlaylist = (playlistId: string, videoId: string) => {
    setPlaylists((prev) =>
      prev.map((pl) => {
        if (pl.id !== playlistId) return pl;
        const exists = pl.videoIds.includes(videoId);
        const updatedIds = exists
          ? pl.videoIds.filter((id) => id !== videoId)
          : [...pl.videoIds, videoId];
        return {
          ...pl,
          videoIds: updatedIds,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
    showToast('Đã cập nhật danh sách phát cá nhân');
  };

  const handleQuickToggleSave = (videoId: string) => {
    const primaryPlaylist = playlists[0];
    if (!primaryPlaylist) return;
    handleToggleVideoInPlaylist(primaryPlaylist.id, videoId);
  };

  const handleCreatePlaylist = (
    name: string,
    description: string,
    initialVideoId?: string
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newPl: PersonalPlaylist = {
      id: `pl-${Date.now()}`,
      name,
      description,
      videoIds: initialVideoId ? [initialVideoId] : [],
      createdAt: today,
      updatedAt: today,
    };
    setPlaylists((prev) => [newPl, ...prev]);
    showToast(`Đã tạo danh sách phát "${name}"`);
  };

  const handleDeletePlaylist = (playlistId: string) => {
    setPlaylists((prev) => prev.filter((pl) => pl.id !== playlistId));
    showToast('Đã xóa danh sách phát');
  };

  const handleQuickFilterTag = (tag: string) => {
    setActiveTab('discover');
    setFilters((prev) => {
      const alreadyIncluded = prev.includedTags.includes(tag);
      const nextIncluded = alreadyIncluded
        ? prev.includedTags.filter((t) => t !== tag)
        : [...prev.includedTags, tag];
      showToast(
        alreadyIncluded
          ? `Đã gỡ Tag #${tag} khỏi tổ hợp lọc`
          : `Đã gộp thêm Tag #${tag} (${nextIncluded.length} Tag đang kết hợp)`
      );
      return {
        ...prev,
        includedTags: nextIncluded,
        excludedTags: prev.excludedTags.filter((t) => t !== tag),
      };
    });
  };

  const handleSaveCombo = (name: string) => {
    const newCombo: SavedTagCombo = {
      id: `combo-${Date.now()}`,
      name,
      includedTags: [...filters.includedTags],
      excludedTags: [...filters.excludedTags],
      tagLogic: filters.tagLogic,
    };
    setSavedCombos((prev) => [newCombo, ...prev]);
    showToast(`Đã lưu tổ hợp Tag "${name}"`);
  };

  const handleDeleteCombo = (id: string) => {
    setSavedCombos((prev) => prev.filter((c) => c.id !== id));
    showToast('Đã xóa tổ hợp Tag đã lưu');
  };

  const handleApplyCombo = (
    included: string[],
    excluded: string[],
    logic: 'AND' | 'OR',
    label?: string
  ) => {
    setActiveTab('discover');
    setFilters((prev) => ({
      ...prev,
      includedTags: included,
      excludedTags: excluded,
      tagLogic: logic,
    }));
    showToast(
      label
        ? `Đang áp dụng tổ hợp: ${label}`
        : `Đang lọc kết hợp ${included.length} Tag (${logic})`
    );
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const activeFilterCount =
    filters.includedTags.length +
    filters.excludedTags.length +
    (filters.minViews > 0 ? 1 : 0) +
    (filters.minPopularity > 0 ? 1 : 0) +
    (filters.minRating > 0 ? 1 : 0) +
    (filters.resolution !== 'ALL' ? 1 : 0) +
    (filters.durationRange !== 'ALL' ? 1 : 0) +
    (filters.releaseYear !== 'ALL' ? 1 : 0) +
    (filters.searchQuery.trim() !== '' ? 1 : 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20 md:pb-10">
      {/* Top Bar Contract: Strict 3-Zone Header separated by gap-8 */}
      <header className="sticky top-0 z-30 h-14 px-4 sm:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('discover');
          }}
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          HanimeFlow
        </a>

        {/* Zone 2: 4 concise single-line navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
          <a
            href="#discover"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('discover');
              setFilters((prev) => ({ ...prev, category: 'ALL' }));
            }}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'discover' && filters.category === 'ALL'
                ? 'text-rose-600 dark:text-rose-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Khám Phá
          </a>
          <a
            href="#playlist-1712"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('discover');
              setFilters((prev) => ({ ...prev, category: 'Playlist 1712' }));
            }}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'discover' && filters.category === 'Playlist 1712'
                ? 'text-rose-600 dark:text-rose-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Nguồn #1712
          </a>
          <a
            href="#playlists"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('playlists');
            }}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'playlists'
                ? 'text-rose-600 dark:text-rose-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Danh Sách Phát ({playlists.reduce((acc, p) => acc + p.videoIds.length, 0)})
          </a>
          <a
            href="#notifications"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('notifications');
            }}
            className={`hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 py-1 ${
              activeTab === 'notifications'
                ? 'text-rose-600 dark:text-rose-400 underline underline-offset-8 decoration-2'
                : ''
            }`}
          >
            Thông Báo {unreadNotificationsCount > 0 ? `(${unreadNotificationsCount})` : ''}
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action (PWA Android Install) */}
        <div className="flex items-center gap-3 shrink-0">
          <PWAInstallButton />
        </div>
      </header>

      {/* Workspace Category & Utility Toolbar below the Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 overflow-x-auto">
          {/* Smooth Category Navigation Pills (Interactive Filter Controls) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200/70 dark:border-slate-800 shrink-0">
            {CATEGORIES.map((cat) => {
              const isSelected =
                activeTab === 'discover' && filters.category === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab('discover');
                    setFilters((prev) => ({ ...prev, category: cat.id }));
                  }}
                  className={`min-h-[36px] px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Right Workspace Utilities: Sync Source + Dark Mode Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => handleSyncSourceUrl()}
              disabled={isSyncing}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              title="Đồng bộ tập mới từ hanime1.me/playlist?list=1712"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-rose-500 ${isSyncing ? 'animate-spin' : ''}`}
              />
              <span className="hidden sm:inline">Đồng Bộ #1712</span>
            </button>

            <button
              onClick={() => setIsDark((prev) => !prev)}
              className="min-h-[38px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              title={isDark ? 'Chuyển sang giao diện Sáng' : 'Chuyển sang chế độ Tối'}
            >
              {isDark ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-rose-400" />
                  <span>Chế Độ Tối</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Chế Độ Sáng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Container (Full 1440px desktop presence via max-w-7xl) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Toast Feedback Notification */}
        {toastMessage && (
          <div className="fixed bottom-20 md:bottom-6 right-4 z-50 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2.5 text-xs font-semibold shadow-xl border border-slate-700 dark:border-slate-200">
            {toastMessage}
          </div>
        )}

        {/* Active Video Stage & Source Bridge (Always accessible on Discover or when playing) */}
        {activeTab === 'discover' && (
          <>
            <VideoPlayerPanel
              activeVideo={activeVideo}
              upNextVideos={filteredVideos.length > 0 ? filteredVideos : videos}
              onSelectVideo={(v) => setActiveVideo(v)}
              playlists={playlists}
              onToggleVideoInPlaylist={handleToggleVideoInPlaylist}
              onCreatePlaylist={handleCreatePlaylist}
              onSyncSourceUrl={handleSyncSourceUrl}
              isSyncing={isSyncing}
            />

            {/* Smart Tag Command Bar & Multi-Tag Combination Builder */}
            <SmartTagCommandBar
              filters={filters}
              onChangeFilters={setFilters}
              allVideos={videos}
              matchedVideos={filteredVideos}
              savedCombos={savedCombos}
              onSaveCombo={handleSaveCombo}
              onDeleteCombo={handleDeleteCombo}
              onApplyCombo={handleApplyCombo}
            />

            {/* Main Adaptive Workspace: Full-width on Phone/Tablet (with Slide-Over Filter Drawer), 12-Col Split on Desktop XL */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-4">
                <DeepFilterPanel
                  filters={filters}
                  onChangeFilters={setFilters}
                  onResetFilters={() => setFilters(INITIAL_FILTERS)}
                  totalMatched={filteredVideos.length}
                  totalCatalog={videos.length}
                  matchedVideos={filteredVideos}
                  isOpenMobile={isMobileFilterOpen}
                  onCloseMobile={() => setIsMobileFilterOpen(false)}
                />
              </div>

              <div className="xl:col-span-8">
                <VideoFeedGrid
                  videos={filteredVideos}
                  activeVideoId={activeVideo.id}
                  includedTags={filters.includedTags}
                  onSelectVideo={(video) => {
                    setActiveVideo(video);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  playlists={playlists}
                  onQuickToggleSave={handleQuickToggleSave}
                  onQuickFilterTag={handleQuickFilterTag}
                  onResetFilters={() => setFilters(INITIAL_FILTERS)}
                  onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
                  activeFilterCount={activeFilterCount}
                />
              </div>
            </div>
          </>
        )}

        {/* Personal Playlists Tab */}
        {activeTab === 'playlists' && (
          <PersonalPlaylistView
            playlists={playlists}
            allVideos={videos}
            onCreatePlaylist={(name, desc) => handleCreatePlaylist(name, desc)}
            onDeletePlaylist={handleDeletePlaylist}
            onRemoveVideoFromPlaylist={handleToggleVideoInPlaylist}
            onPlayVideo={(video) => {
              setActiveVideo(video);
              setActiveTab('discover');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* New Video Release Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationCenterView
            notifications={notifications}
            subscribedTags={subscribedTags}
            onToggleSubscribedTag={(tag) =>
              setSubscribedTags((prev) =>
                prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
              )
            }
            onMarkAllRead={() =>
              setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
            }
            onMarkRead={(id) =>
              setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
              )
            }
            onTriggerSyncCheck={() => handleSyncSourceUrl()}
            onSelectVideoById={(videoId) => {
              const target = videos.find((v) => v.id === videoId);
              if (target) {
                setActiveVideo(target);
              }
              setActiveTab('discover');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            isSyncing={isSyncing}
            allVideos={videos}
          />
        )}
      </main>

      {/* Clean Quiet Footer */}
      <footer className="hidden md:block border-t border-slate-200 dark:border-slate-800 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            HanimeFlow Android Web App · Nguồn tích hợp: hanime1.me/playlist?list=1712
          </span>
          <a
            href="https://hanime1.me/playlist?list=1712"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-rose-500 transition-colors"
          >
            Mở danh sách phát gốc #1712
          </a>
        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation Bar (Android Ergonomic Thumb Zone, <= 15% viewport cap) */}
      <nav
        aria-label="Điều hướng di động"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid grid-cols-4 items-center"
      >
        <button
          onClick={() => {
            setActiveTab('discover');
            setIsMobileFilterOpen(false);
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'discover' && !isMobileFilterOpen
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Khám Phá
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('discover');
            setIsMobileFilterOpen(true);
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            isMobileFilterOpen
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <SlidersHorizontal className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Bộ Lọc {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('playlists');
            setIsMobileFilterOpen(false);
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center cursor-pointer ${
            activeTab === 'playlists'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <ListVideo className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Playlist ({playlists.length})
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notifications');
            setIsMobileFilterOpen(false);
          }}
          className={`min-h-[44px] flex flex-col items-center justify-center relative cursor-pointer ${
            activeTab === 'notifications'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Thông Báo {unreadNotificationsCount > 0 ? `(${unreadNotificationsCount})` : ''}
          </span>
        </button>
      </nav>

      <OfflineIndicator />
    </div>
  );
}
