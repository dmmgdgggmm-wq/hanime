import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  CheckCheck,
  RefreshCw,
  Play,
  Sparkles,
} from 'lucide-react';
import { VideoNotification, VideoItem } from '../types';
import { ALL_TAGS } from '../data';

interface NotificationCenterViewProps {
  notifications: VideoNotification[];
  subscribedTags: string[];
  onToggleSubscribedTag: (tag: string) => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
  onTriggerSyncCheck: () => Promise<void>;
  onSelectVideoById: (videoId: string) => void;
  isSyncing: boolean;
  allVideos: VideoItem[];
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({
  notifications,
  subscribedTags,
  onToggleSubscribedTag,
  onMarkAllRead,
  onMarkRead,
  onTriggerSyncCheck,
  onSelectVideoById,
  isSyncing,
}) => {
  const [browserPerm, setBrowserPerm] = useState<string>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const requestAndroidNotificationPermission = async () => {
    if (typeof Notification === 'undefined') return;
    try {
      const result = await Notification.requestPermission();
      setBrowserPerm(result);
    } catch {
      // Ignore in sandboxed iframe if blocked
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 5 cols: Tag Subscription Rules & Sync Trigger */}
      <div className="lg:col-span-5 space-y-5">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Cài Đặt Thông Báo Tập Mới
              </h2>
            </div>
            <span className="text-xs font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
              Playlist #1712
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Chọn các Tag hoặc Studio bạn muốn theo dõi. Khi nguồn{' '}
            <code className="font-mono text-rose-500">hanime1.me/playlist?list=1712</code>{' '}
            cập nhật video mới khớp với Tag đã đăng ký, hệ thống sẽ gửi thông báo tức thì.
          </p>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tag nhận thông báo tự động ({subscribedTags.length} đang bật):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {ALL_TAGS.slice(0, 14).map((tag) => {
                const active = subscribedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => onToggleSubscribedTag(tag)}
                    className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      active
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {active ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-2">
            <button
              onClick={onTriggerSyncCheck}
              disabled={isSyncing}
              className="flex-1 min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Đang quét nguồn #1712...' : 'Quét Video Mới Ngay'}</span>
            </button>

            {browserPerm !== 'granted' && (
              <button
                onClick={requestAndroidNotificationPermission}
                className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                Bật Push Android
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right 7 cols: Notification Feed */}
      <div className="lg:col-span-7">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Hộp Thư Thông Báo Video Mới
              </h2>
              {unreadCount > 0 && (
                <span className="text-xs font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
                  ({unreadCount} chưa đọc)
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="min-h-[36px] px-3 py-1 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 text-emerald-500" />
                <span>Đánh dấu đã đọc tất cả</span>
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  onMarkRead(notif.id);
                  onSelectVideoById(notif.videoId);
                }}
                className={`py-3.5 px-3 rounded-xl flex items-start justify-between gap-3.5 transition-colors cursor-pointer ${
                  !notif.isRead
                    ? 'bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <img
                  src={notif.thumbnail}
                  alt={notif.title}
                  referrerPolicy="no-referrer"
                  className="w-24 aspect-video rounded-lg object-cover bg-slate-800 shrink-0 mt-0.5"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      {notif.studio}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{notif.timestamp}</span>
                    {!notif.isRead && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          Mới
                        </span>
                      </>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {notif.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {notif.episode} ·{' '}
                    <span className="text-slate-500">Khớp bộ lọc: {notif.tagMatched}</span>
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMarkRead(notif.id);
                    onSelectVideoById(notif.videoId);
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Xem</span>
                </button>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>
              Tự động đồng bộ hóa danh sách phát từ nguồn hanime1.me/playlist?list=1712
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
