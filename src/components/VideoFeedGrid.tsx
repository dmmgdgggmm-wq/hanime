import React, { useState } from 'react';
import {
  Play,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  Film,
  RotateCcw,
  LayoutGrid,
  Rows3,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { VideoItem, PersonalPlaylist } from '../types';
import { formatCompactNumber, HERO_IMG } from '../data';

interface VideoFeedGridProps {
  videos: VideoItem[];
  activeVideoId: string;
  includedTags: string[];
  onSelectVideo: (video: VideoItem) => void;
  playlists: PersonalPlaylist[];
  onQuickToggleSave: (videoId: string) => void;
  onQuickFilterTag: (tag: string) => void;
  onResetFilters: () => void;
  onOpenMobileFilter: () => void;
  activeFilterCount: number;
}

const STUDIO_BADGE_COLORS: Record<string, string> = {
  'Studio Shinkai Works': 'bg-rose-600 text-white',
  'Atelier Tsukuyomi': 'bg-amber-600 text-white',
  'MechaVault Animation': 'bg-sky-600 text-white',
  'Celestia Pictures': 'bg-indigo-600 text-white',
};

const YouTubeStyleVideoCard: React.FC<{
  video: VideoItem;
  isActive: boolean;
  isSaved: boolean;
  viewMode: 'grid' | 'compact';
  includedTags: string[];
  onSelect: () => void;
  onToggleSave: (e: React.MouseEvent) => void;
  onClickTag: (tag: string, e: React.MouseEvent) => void;
}> = ({
  video,
  isActive,
  isSaved,
  viewMode,
  includedTags,
  onSelect,
  onToggleSave,
  onClickTag,
}) => {
  const [imgError, setImgError] = useState(false);

  const studioInitials = video.studio
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const avatarColor =
    STUDIO_BADGE_COLORS[video.studio] || 'bg-slate-700 text-white';

  // Simulated watch progress bar for active or popular videos
  const progressPercent = isActive ? 42 : video.popularityScore > 95 ? 100 : 0;

  if (viewMode === 'compact') {
    return (
      <article
        onClick={onSelect}
        className={`group rounded-2xl p-2.5 sm:p-3 transition-colors flex flex-col sm:flex-row gap-3.5 cursor-pointer border ${
          isActive
            ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-500/60'
            : 'bg-white dark:bg-slate-900/70 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-100/70 dark:hover:bg-slate-900'
        }`}
      >
        {/* Left 16:9 Thumbnail (YouTube Tablet/Search horizontal style) */}
        <div className="relative w-full sm:w-60 md:w-64 aspect-video rounded-xl bg-slate-950 overflow-hidden shrink-0">
          <img
            src={!imgError ? video.thumbnail : HERO_IMG}
            alt={video.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

          {isActive && (
            <div className="absolute top-2 left-2 bg-rose-600 text-white text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Play className="w-3 h-3 fill-white" />
              <span>Đang phát</span>
            </div>
          )}

          <div className="absolute bottom-2 right-2 bg-black/85 text-white text-[11px] font-mono tabular-nums font-medium px-1.5 py-0.5 rounded">
            {video.resolution} · {video.duration}
          </div>

          {progressPercent > 0 && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/25">
              <div
                className="h-full bg-rose-600"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>

        {/* Right Info Stack */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
                {video.title}
              </h3>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={onToggleSave}
                  className={`min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={isSaved ? 'Đã lưu vào Playlist' : 'Lưu vào Playlist'}
                >
                  {isSaved ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>
                <a
                  href={video.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 flex items-center justify-center transition-colors"
                  title="Mở trực tiếp trên hanime1.me"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* YouTube-style Channel & Metrics Line */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <span className="font-sans font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1">
                {video.studio}
                <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              </span>
              <span aria-hidden="true">·</span>
              <span>{video.episode}</span>
              <span aria-hidden="true">·</span>
              <span>{formatCompactNumber(video.views)} lượt xem</span>
              <span aria-hidden="true">·</span>
              <span>Hot {video.popularityScore}%</span>
              <span aria-hidden="true">·</span>
              <span>{video.releaseDate}</span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 pt-1 leading-relaxed">
              {video.synopsis}
            </p>
          </div>

          {/* Interactive Tag Strip */}
          <div className="pt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            {video.tags.map((tag, i) => {
              const isSelected = includedTags.includes(tag);
              return (
                <React.Fragment key={tag}>
                  <button
                    onClick={(e) => onClickTag(tag, e)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'font-bold text-rose-600 dark:text-rose-400 underline underline-offset-4'
                        : 'hover:text-rose-600 dark:hover:text-rose-400 hover:underline'
                    }`}
                  >
                    #{tag}
                  </button>
                  {i < video.tags.length - 1 && (
                    <span aria-hidden="true">·</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </article>
    );
  }

  // Standard YouTube Visual Card (1 col Mobile, 2 col Tablet sm/md, 3 col Desktop xl)
  return (
    <article
      onClick={onSelect}
      className="group flex flex-col gap-3 cursor-pointer"
    >
      {/* 16:9 Thumbnail Frame with YouTube-style Overlays & Progress Scrubber */}
      <div
        className={`relative aspect-video rounded-2xl bg-slate-950 overflow-hidden border transition-all duration-150 ${
          isActive
            ? 'border-rose-500 ring-2 ring-rose-500/40'
            : 'border-slate-200/80 dark:border-slate-800/80 group-hover:border-slate-300 dark:group-hover:border-slate-700'
        }`}
      >
        <img
          src={!imgError ? video.thumbnail : HERO_IMG}
          alt={video.title}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />

        {/* Measured Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

        {/* Top Left Status Indicator if Currently Playing or New */}
        {isActive ? (
          <div className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
            <Play className="w-3 h-3 fill-white" />
            <span>Đang phát</span>
          </div>
        ) : video.isNewRelease ? (
          <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
            Tập mới #1712
          </div>
        ) : null}

        {/* Top Right Quick Action Cluster (Save to Playlist + Direct Web Bridge Link) */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <a
            href={video.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="min-h-[38px] min-w-[38px] rounded-xl bg-black/65 hover:bg-black/85 text-white flex items-center justify-center transition-colors"
            title="Mở trực tiếp trên web hanime1.me"
            aria-label="Mở trên web gốc"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            onClick={onToggleSave}
            className={`min-h-[38px] min-w-[38px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
              isSaved
                ? 'bg-rose-600 text-white'
                : 'bg-black/65 hover:bg-black/85 text-white'
            }`}
            title={isSaved ? 'Đã lưu trong Playlist' : 'Lưu vào Playlist cá nhân'}
            aria-label="Lưu vào danh sách phát"
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Center Play Hover Affordance */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-rose-600/95 text-white flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>

        {/* Bottom Timestamp & Resolution Bar */}
        <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-xs text-white font-mono tabular-nums">
          <span className="font-sans font-semibold bg-black/65 backdrop-blur-xs px-2 py-0.5 rounded-md">
            {video.episode}
          </span>
          <span className="bg-black/80 px-1.5 py-0.5 rounded-md font-medium">
            {video.resolution} · {video.duration}
          </span>
        </div>

        {/* Bottom Red YouTube Watch Progress Bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/25">
            <div
              className="h-full bg-rose-600"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* YouTube-Style Avatar + Title + Channel Metadata Row */}
      <div className="flex items-start gap-3 px-0.5">
        {/* Studio Channel Avatar */}
        <div
          className={`w-9 h-9 rounded-full ${avatarColor} font-display text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-xs`}
          title={video.studio}
        >
          {studioInitials}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          {/* Primary Video Title */}
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors line-clamp-2 leading-snug">
            {video.title}
          </h3>

          {/* Studio Name & Verified Check */}
          <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
            <span className="truncate font-medium">{video.studio}</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums text-[11px]">
              ★ {video.rating.toFixed(1)}
            </span>
          </div>

          {/* Views · Popularity · Date Line */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            <span>{formatCompactNumber(video.views)} lượt xem</span>
            <span aria-hidden="true">·</span>
            <span>Phổ biến {video.popularityScore}%</span>
            <span aria-hidden="true">·</span>
            <span>{video.releaseDate}</span>
          </div>

          {/* Interactive Unboxed Tag Links (Click to combine tags) */}
          <div className="pt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            {video.tags.slice(0, 4).map((tag, i) => {
              const isTagSelected = includedTags.includes(tag);
              return (
                <React.Fragment key={tag}>
                  <button
                    onClick={(e) => onClickTag(tag, e)}
                    className={`transition-colors cursor-pointer ${
                      isTagSelected
                        ? 'font-bold text-rose-600 dark:text-rose-400 underline underline-offset-4'
                        : 'hover:text-rose-600 dark:hover:text-rose-400 hover:underline'
                    }`}
                    title={
                      isTagSelected
                        ? `Bỏ Tag #${tag} khỏi tổ hợp`
                        : `Gộp thêm Tag #${tag} vào bộ lọc`
                    }
                  >
                    #{tag}
                  </button>
                  {i < Math.min(video.tags.length, 4) - 1 && (
                    <span aria-hidden="true">·</span>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </article>
  );
};

export const VideoFeedGrid: React.FC<VideoFeedGridProps> = ({
  videos,
  activeVideoId,
  includedTags,
  onSelectVideo,
  playlists,
  onQuickToggleSave,
  onQuickFilterTag,
  onResetFilters,
  onOpenMobileFilter,
  activeFilterCount,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'compact'>('grid');

  return (
    <div className="space-y-4">
      {/* Adaptive Feed Header Bar (Supports Phone, Tablet, and Desktop) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
            Danh Sách Video Nguồn Web
          </span>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            ({videos.length} tập khớp bộ lọc)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher: Grid (YouTube Home) vs Compact List (YouTube Search/Tablet) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setViewMode('grid')}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Chế độ Lưới trực quan (Tự động 1 cột Điện thoại · 2 cột Tablet · 3 cột PC)"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lưới YouTube</span>
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Chế độ Danh sách ngang chi tiết"
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Danh Sách Ngang</span>
            </button>
          </div>

          {/* Mobile & Tablet Filter Drawer Trigger */}
          <button
            onClick={onOpenMobileFilter}
            className="xl:hidden min-h-[38px] px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              Bộ Lọc Sâu {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
            </span>
          </button>
        </div>
      </div>

      {/* Video Grid or Empty State */}
      {videos.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <Film className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Không tìm thấy video khớp tổ hợp Tag này
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Thử chuyển chế độ kết hợp từ <strong>AND (Khớp tất cả)</strong> sang{' '}
            <strong>OR (Khớp bất kỳ)</strong> hoặc gỡ bớt 1 Tag trong thanh Tổ Hợp Tag Thông Minh.
          </p>
          <button
            onClick={onResetFilters}
            className="mt-2 min-h-[42px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Đặt lại toàn bộ bộ lọc</span>
          </button>
        </div>
      ) : viewMode === 'compact' ? (
        <div className="space-y-3">
          {videos.map((video) => {
            const isSaved = playlists.some((pl) => pl.videoIds.includes(video.id));
            return (
              <YouTubeStyleVideoCard
                key={video.id}
                video={video}
                isActive={video.id === activeVideoId}
                isSaved={isSaved}
                viewMode="compact"
                includedTags={includedTags}
                onSelect={() => onSelectVideo(video)}
                onToggleSave={(e) => {
                  e.stopPropagation();
                  onQuickToggleSave(video.id);
                }}
                onClickTag={(tag, e) => {
                  e.stopPropagation();
                  onQuickFilterTag(tag);
                }}
              />
            );
          })}
        </div>
      ) : (
        /* Responsive Grid: 1 col on Phones (<640px), 2 cols on Tablets (640px-1279px), 3 cols on Desktop/Large Tablet Landscape (>=1280px) */
        <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-3 gap-x-5 gap-y-7">
          {videos.map((video) => {
            const isSaved = playlists.some((pl) => pl.videoIds.includes(video.id));
            return (
              <YouTubeStyleVideoCard
                key={video.id}
                video={video}
                isActive={video.id === activeVideoId}
                isSaved={isSaved}
                viewMode="grid"
                includedTags={includedTags}
                onSelect={() => onSelectVideo(video)}
                onToggleSave={(e) => {
                  e.stopPropagation();
                  onQuickToggleSave(video.id);
                }}
                onClickTag={(tag, e) => {
                  e.stopPropagation();
                  onQuickFilterTag(tag);
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
