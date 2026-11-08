import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  BookmarkPlus,
  Check,
  ExternalLink,
  RefreshCw,
  Share2,
  ListPlus,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import { VideoItem, PersonalPlaylist } from '../types';
import { formatCompactNumber, HERO_IMG } from '../data';

interface VideoPlayerPanelProps {
  activeVideo: VideoItem;
  upNextVideos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  playlists: PersonalPlaylist[];
  onToggleVideoInPlaylist: (playlistId: string, videoId: string) => void;
  onCreatePlaylist: (name: string, description: string, initialVideoId?: string) => void;
  onSyncSourceUrl: (url: string) => Promise<void>;
  isSyncing: boolean;
}

export const VideoPlayerPanel: React.FC<VideoPlayerPanelProps> = ({
  activeVideo,
  upNextVideos,
  onSelectVideo,
  playlists,
  onToggleVideoInPlaylist,
  onCreatePlaylist,
  onSyncSourceUrl,
  isSyncing,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackMode, setPlaybackMode] = useState<'native' | 'source_bridge'>('native');
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [customSourceInput, setCustomSourceInput] = useState(activeVideo.sourceUrl);
  const [copiedNotice, setCopiedNotice] = useState(false);
  const [imgError, setImgError] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleCreateNewPlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(
      newPlaylistName.trim(),
      'Danh sách phát tùy chỉnh trên thiết bị',
      activeVideo.id
    );
    setNewPlaylistName('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(activeVideo.sourceUrl).catch(() => {});
    }
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2000);
  };

  const isSavedInAny = playlists.some((pl) => pl.videoIds.includes(activeVideo.id));

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 8 cols: Video Stage + Controls */}
        <div className="lg:col-span-8 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
          {/* Mode Bar */}
          <div className="flex items-center justify-between gap-4 px-4 py-2.5 bg-slate-100/70 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 truncate">
              <span className="font-semibold text-slate-900 dark:text-slate-200">
                Nguồn: hanime1.me/playlist?list={activeVideo.playlistId}
              </span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{activeVideo.resolution}</span>
              <span aria-hidden="true">·</span>
              <span>{activeVideo.episode}</span>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-200/80 dark:bg-slate-900 rounded-lg shrink-0">
              <button
                onClick={() => setPlaybackMode('native')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  playbackMode === 'native'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Trình Phát Mượt (HLS/MP4)
              </button>
              <button
                onClick={() => setPlaybackMode('source_bridge')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  playbackMode === 'source_bridge'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Đồng Bộ Nguồn Web
              </button>
            </div>
          </div>

          {/* Video Surface */}
          {playbackMode === 'native' ? (
            <div className="relative aspect-video bg-slate-950 group overflow-hidden">
              <video
                ref={videoRef}
                key={activeVideo.id}
                src={activeVideo.streamUrl}
                poster={!imgError ? activeVideo.thumbnail : HERO_IMG}
                className="w-full h-full object-cover"
                playsInline
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              {/* Subtle Top Scrim Overlay with Quick Actions */}
              <div className="pointer-events-none absolute inset-x-0 top-0 p-4 bg-gradient-to-b from-black/75 via-black/30 to-transparent flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <div className="text-xs text-slate-200 font-medium truncate pr-4">
                  {activeVideo.japaneseTitle}
                </div>
                <div className="pointer-events-auto flex items-center gap-1.5">
                  <button
                    onClick={togglePlay}
                    className="min-h-[36px] min-w-[36px] rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title={isPlaying ? 'Tạm dừng' : 'Phát'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="min-h-[36px] min-w-[36px] rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title={isMuted ? 'Bật âm' : 'Tắt âm'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleFullscreen}
                    className="min-h-[36px] min-w-[36px] rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Toàn màn hình"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-slate-950 p-6 flex flex-col justify-between relative overflow-hidden">
              {!imgError && (
                <img
                  src={activeVideo.thumbnail}
                  alt={activeVideo.title}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="absolute inset-0 w-full h-full object-cover opacity-20"
                />
              )}
              <div className="relative z-10 space-y-2">
                <div className="text-xs font-mono text-rose-400">
                  CẦU NỐI NGUỒN WEB TRỰC TIẾP · HANIME1.ME PLAYLIST #{activeVideo.playlistId}
                </div>
                <h3 className="text-lg font-bold text-white">
                  Trình Đồng Bộ & Trích Xuất Nguồn Hanime1
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Nhập liên kết danh sách phát hoặc đường dẫn Google Redirect của nguồn{' '}
                  <code className="text-rose-300 font-mono">hanime1.me/playlist?list=1712</code> để
                  cập nhật tập mới nhất về bộ nhớ ứng dụng Android mà không bị chặn khung hình.
                </p>
              </div>

              <div className="relative z-10 space-y-3 my-auto">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={customSourceInput}
                    onChange={(e) => setCustomSourceInput(e.target.value)}
                    placeholder="https://hanime1.me/playlist?list=1712"
                    className="flex-1 min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-rose-500"
                  />
                  <button
                    onClick={() => onSyncSourceUrl(customSourceInput)}
                    disabled={isSyncing}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Đang đồng bộ...' : 'Đồng Bộ Tập Mới'}</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <a
                    href={activeVideo.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-rose-400 hover:text-rose-300 font-medium underline underline-offset-4"
                  >
                    <span>Mở trang gốc hanime1.me ({activeVideo.id})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span aria-hidden="true">·</span>
                  <button
                    onClick={() => setPlaybackMode('native')}
                    className="text-slate-300 hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    Quay lại trình phát video tích hợp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Details & Action Bar */}
          <div className="p-4 sm:p-5 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    {activeVideo.studio}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{activeVideo.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {formatCompactNumber(activeVideo.views)} lượt xem
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    Độ phổ biến {activeVideo.popularityScore}%
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">★ {activeVideo.rating.toFixed(1)}</span>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                  {activeVideo.title}
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {activeVideo.japaneseTitle}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 relative">
                <button
                  onClick={() => setShowPlaylistMenu((prev) => !prev)}
                  className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSavedInAny
                      ? 'bg-rose-600 text-white hover:bg-rose-500'
                      : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  {isSavedInAny ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Đã Lưu Playlist</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      <span>Lưu Vào Playlist</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleShare}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
                  title="Sao chép liên kết nguồn"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedNotice ? 'Đã chép link' : 'Chia sẻ'}</span>
                </button>

                {/* Save to Personal Playlist Popover */}
                {showPlaylistMenu && (
                  <div className="absolute right-0 top-12 z-30 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-xl space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Chọn Danh Sách Phát Cá Nhân
                      </span>
                      <button
                        onClick={() => setShowPlaylistMenu(false)}
                        className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-44 overflow-y-auto">
                      {playlists.map((pl) => {
                        const checked = pl.videoIds.includes(activeVideo.id);
                        return (
                          <button
                            key={pl.id}
                            onClick={() => onToggleVideoInPlaylist(pl.id, activeVideo.id)}
                            className="w-full min-h-[40px] px-3 py-2 rounded-xl flex items-center justify-between text-left text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          >
                            <div className="truncate pr-2">
                              <div className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {pl.name}
                              </div>
                              <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                                {pl.videoIds.length} video
                              </div>
                            </div>
                            <span
                              className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                                checked
                                  ? 'bg-rose-600 border-rose-600 text-white'
                                  : 'border-slate-300 dark:border-slate-700'
                              }`}
                            >
                              {checked && <Check className="w-3.5 h-3.5" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <form onSubmit={handleCreateNewPlaylist} className="pt-2 border-t border-slate-100 dark:border-slate-800 flex gap-1.5">
                      <input
                        type="text"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        placeholder="Tên danh sách phát mới..."
                        className="flex-1 min-h-[38px] px-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                      />
                      <button
                        type="submit"
                        className="min-h-[38px] px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <ListPlus className="w-3.5 h-3.5" />
                        <span>Tạo</span>
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {activeVideo.synopsis}
            </p>

            {/* Unboxed Metadata Tag Line (Zero-Pill Discipline) */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Tags:</span>
              {activeVideo.tags.map((tag, index) => (
                <React.Fragment key={tag}>
                  <span className="text-slate-600 dark:text-slate-300">{tag}</span>
                  {index < activeVideo.tags.length - 1 && (
                    <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                      /
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Playlist #1712 Queue & Quick Source Sync */}
        <div className="lg:col-span-4 flex flex-col justify-between bg-slate-50/50 dark:bg-slate-950/40">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <SkipForward className="w-4 h-4 text-rose-500" />
                <span>Danh Sách Phát Nguồn #1712</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono tabular-nums">
                Tự động chuyển tập · {upNextVideos.length} tập sẵn sàng
              </p>
            </div>
            <button
              onClick={() => onSyncSourceUrl(activeVideo.sourceUrl)}
              disabled={isSyncing}
              className="min-h-[36px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              title="Kiểm tra video mới từ hanime1.me/playlist?list=1712"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-rose-500' : ''}`} />
              <span>Làm mới</span>
            </button>
          </div>

          {/* Up Next Queue List */}
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70 max-h-[380px] overflow-y-auto">
            {upNextVideos.slice(0, 6).map((item, idx) => {
              const isCurrent = item.id === activeVideo.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectVideo(item)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-rose-50/80 dark:bg-rose-950/25'
                      : 'hover:bg-slate-100/80 dark:hover:bg-slate-900/60'
                  }`}
                >
                  <span className="text-xs font-mono tabular-nums text-slate-400 dark:text-slate-500 pt-1 w-5 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-slate-800 shrink-0">
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono tabular-nums px-1 py-0.5 rounded">
                      {item.duration}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {item.episode} · {item.studio}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums mt-1">
                      {formatCompactNumber(item.views)} xem · {item.popularityScore}% phổ biến
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Source Footer Info */}
          <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 truncate">
              <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Nguồn tích hợp: hanime1.me/playlist?list=1712</span>
            </span>
            <a
              href="https://hanime1.me/playlist?list=1712"
              target="_blank"
              rel="noopener noreferrer"
              className="text-rose-600 dark:text-rose-400 hover:underline font-medium shrink-0 ml-2"
            >
              Web gốc
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
