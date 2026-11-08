import React, { useState } from 'react';
import {
  FolderPlus,
  Play,
  Trash2,
  ListVideo,
  X,
  Download,
  Check,
} from 'lucide-react';
import { PersonalPlaylist, VideoItem } from '../types';
import { formatCompactNumber } from '../data';

interface PersonalPlaylistViewProps {
  playlists: PersonalPlaylist[];
  allVideos: VideoItem[];
  onCreatePlaylist: (name: string, description: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  onRemoveVideoFromPlaylist: (playlistId: string, videoId: string) => void;
  onPlayVideo: (video: VideoItem) => void;
}

export const PersonalPlaylistView: React.FC<PersonalPlaylistViewProps> = ({
  playlists,
  allVideos,
  onCreatePlaylist,
  onDeletePlaylist,
  onRemoveVideoFromPlaylist,
  onPlayVideo,
}) => {
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(
    playlists[0]?.id || ''
  );
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exportedFlag, setExportedFlag] = useState(false);

  const activePlaylist =
    playlists.find((pl) => pl.id === selectedPlaylistId) || playlists[0];

  const playlistVideos = activePlaylist
    ? activePlaylist.videoIds
        .map((id) => allVideos.find((v) => v.id === id))
        .filter((v): v is VideoItem => Boolean(v))
    : [];

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreatePlaylist(
      name.trim(),
      description.trim() || 'Danh sách phát lưu cục bộ trên Android PWA'
    );
    setName('');
    setDescription('');
  };

  const handleExportM3U = () => {
    if (!activePlaylist) return;
    const lines = ['#EXTM3U', `#PLAYLIST:${activePlaylist.name}`];
    playlistVideos.forEach((v) => {
      lines.push(`#EXTINF:${v.durationMinutes * 60},${v.title} - ${v.episode}`);
      lines.push(v.sourceUrl);
    });
    const blob = new Blob([lines.join('\n')], { type: 'audio/x-mpegurl' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activePlaylist.id}.m3u8`;
    a.click();
    URL.revokeObjectURL(url);
    setExportedFlag(true);
    setTimeout(() => setExportedFlag(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 4 columns: Playlists List & Create Form */}
      <div className="lg:col-span-4 space-y-5">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Danh Sách Phát Của Tôi
              </h2>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {playlists.length} danh sách
            </span>
          </div>

          <div className="space-y-2">
            {playlists.map((pl) => {
              const isSelected = activePlaylist?.id === pl.id;
              return (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylistId(pl.id)}
                  className={`p-3.5 rounded-xl border transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500'
                      : 'bg-slate-50/70 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {pl.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {pl.description}
                    </p>
                    <div className="text-[11px] font-mono tabular-nums text-slate-500 mt-1">
                      {pl.videoIds.length} tập phim · Cập nhật {pl.updatedAt}
                    </div>
                  </div>

                  {playlists.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlaylist(pl.id);
                      }}
                      className="min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                      title="Xóa danh sách phát"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Create New Personal Playlist Card */}
        <form
          onSubmit={handleCreate}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-3.5"
        >
          <div className="flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Tạo Danh Sách Phát Mới
            </h3>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Tên danh sách phát
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Top Sci-Fi Uncensored 4K..."
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
              Ghi chú mô tả
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú chủ đề hoặc tag yêu thích..."
              className="w-full min-h-[42px] px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
          </div>

          <button
            type="submit"
            className="w-full min-h-[44px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Lưu Danh Sách Phát Mới
          </button>
        </form>
      </div>

      {/* Right 8 columns: Active Personal Playlist Contents */}
      <div className="lg:col-span-8">
        {activePlaylist ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activePlaylist.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {activePlaylist.description} ·{' '}
                  <span className="font-mono tabular-nums">
                    {playlistVideos.length} video đã lưu
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {playlistVideos.length > 0 && (
                  <button
                    onClick={() => onPlayVideo(playlistVideos[0])}
                    className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Phát Tất Cả</span>
                  </button>
                )}
                <button
                  onClick={handleExportM3U}
                  className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {exportedFlag ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Đã tải M3U8</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Xuất M3U8</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {playlistVideos.length === 0 ? (
              <div className="py-12 text-center space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <p>Danh sách phát này hiện chưa có tập phim nào.</p>
                <p>Nhấn biểu tượng Lưu trên bất kỳ video nào để thêm vào đây.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
                {playlistVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-950/40 px-2 rounded-xl transition-colors"
                  >
                    <div
                      onClick={() => onPlayVideo(video)}
                      className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
                    >
                      <span className="text-xs font-mono tabular-nums text-slate-400 w-5 shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        referrerPolicy="no-referrer"
                        className="w-28 aspect-video rounded-lg object-cover bg-slate-800 shrink-0"
                      />

                      <div className="min-w-0 flex-1 space-y-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                          {video.title}
                        </h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {video.studio} · {video.episode} ·{' '}
                          <span className="font-mono tabular-nums">{video.duration}</span>
                        </div>
                        <div className="text-[11px] font-mono tabular-nums text-slate-500">
                          {formatCompactNumber(video.views)} lượt xem · Phổ biến{' '}
                          {video.popularityScore}% · ★ {video.rating.toFixed(1)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onPlayVideo(video)}
                        className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Phát</span>
                      </button>
                      <button
                        onClick={() =>
                          onRemoveVideoFromPlaylist(activePlaylist.id, video.id)
                        }
                        className="min-h-[40px] min-w-[40px] rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Gỡ khỏi danh sách phát"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
