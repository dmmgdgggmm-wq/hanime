import React, { useState } from 'react';
import { Download, Smartphone, CheckCircle2, X } from 'lucide-react';
import { usePWAInstall, useOnlineStatus } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleTrigger = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleTrigger}
        className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 active:scale-[0.98] rounded-xl transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
        title="Cài đặt ứng dụng Android / Màn hình chính"
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>Cài Đặt App</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Cài đặt HanimeFlow lên thiết bị
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
              {isIOS ? (
                <>
                  <p>Để cài đặt ứng dụng toàn màn hình trên iPhone / iPad:</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <li>Nhấn biểu tượng <strong>Chia sẻ (Share)</strong> dưới thanh công cụ Safari.</li>
                    <li>Cuộn xuống và chọn <strong>Thêm vào Màn hình chính (Add to Home Screen)</strong>.</li>
                    <li>Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải.</li>
                  </ol>
                </>
              ) : (
                <>
                  <p>Trải nghiệm ứng dụng Android PWA mượt mà không thanh địa chỉ:</p>
                  <ol className="list-decimal list-inside space-y-2 text-xs leading-relaxed bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <li>Mở menu trình duyệt Chrome / Android (biểu tượng <strong>⋮</strong> ở góc phải).</li>
                    <li>Chọn <strong>Cài đặt ứng dụng (Install app)</strong> hoặc <strong>Thêm vào màn hình chính</strong>.</li>
                    <li>Mở HanimeFlow trực tiếp từ màn hình chính Android của bạn.</li>
                  </ol>
                </>
              )}
              <div className="flex items-center gap-2 pt-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Hỗ trợ lưu danh sách phát ngoại tuyến & thông báo tập mới</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-5 w-full min-h-[44px] rounded-xl bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <span>Chế độ ngoại tuyến — Đang dùng danh sách phát đã lưu trong bộ nhớ</span>
    </div>
  );
};
