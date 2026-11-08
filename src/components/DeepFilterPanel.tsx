import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Search,
  Eye,
  Flame,
  Star,
  Check,
  Ban,
  X,
} from 'lucide-react';
import { FilterState, VideoItem } from '../types';
import { ALL_TAGS } from '../data';

interface DeepFilterPanelProps {
  filters: FilterState;
  onChangeFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onResetFilters: () => void;
  totalMatched: number;
  totalCatalog: number;
  matchedVideos: VideoItem[];
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const DeepFilterPanel: React.FC<DeepFilterPanelProps> = ({
  filters,
  onChangeFilters,
  onResetFilters,
  totalMatched,
  totalCatalog,
  matchedVideos,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Cycle tag state: Neutral -> Included (+) -> Excluded (-) -> Neutral
  const handleToggleTag = (tag: string) => {
    onChangeFilters((prev) => {
      const isIncluded = prev.includedTags.includes(tag);
      const isExcluded = prev.excludedTags.includes(tag);

      if (!isIncluded && !isExcluded) {
        return {
          ...prev,
          includedTags: [...prev.includedTags, tag],
        };
      }
      if (isIncluded) {
        return {
          ...prev,
          includedTags: prev.includedTags.filter((t) => t !== tag),
          excludedTags: [...prev.excludedTags, tag],
        };
      }
      return {
        ...prev,
        excludedTags: prev.excludedTags.filter((t) => t !== tag),
      };
    });
  };

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

  const filterContent = (
    <div className="space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-rose-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Bộ Lọc Chuyên Sâu
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            ({totalMatched}/{totalCatalog} video)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại ({activeFilterCount})</span>
            </button>
          )}
          {isOpenMobile && (
            <button
              onClick={onCloseMobile}
              className="xl:hidden min-h-[36px] min-w-[36px] rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              aria-label="Đóng bộ lọc"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Tìm kiếm tên phim / Studio / Mã tập
        </label>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) =>
              onChangeFilters((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            placeholder="Nhập tên anime, studio hoặc mã hn-1712..."
            className="w-full min-h-[42px] pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
          />
        </div>
      </div>

      {/* Sort By Selector */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Sắp xếp kết quả theo
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onChangeFilters((prev) => ({
              ...prev,
              sortBy: e.target.value as FilterState['sortBy'],
            }))
          }
          className="w-full min-h-[42px] px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 cursor-pointer"
        >
          <option value="popularity_desc">Độ phổ biến cao nhất (% Hot)</option>
          <option value="views_desc">Lượt xem nhiều nhất (Views)</option>
          <option value="date_desc">Mới phát hành gần đây nhất</option>
          <option value="rating_desc">Điểm đánh giá cao nhất (★)</option>
          <option value="likes_desc">Lượt yêu thích nhiều nhất</option>
        </select>
      </div>

      {/* Tag Matrix with AND / OR Mode & Include/Exclude */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Ma trận kết hợp Tag (1 chạm: +Gộp · 2 chạm: -Loại)
          </label>
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onChangeFilters((prev) => ({ ...prev, tagLogic: 'AND' }))}
              className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                filters.tagLogic === 'AND'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Phải khớp TẤT CẢ các tag đã chọn"
            >
              AND
            </button>
            <button
              onClick={() => onChangeFilters((prev) => ({ ...prev, tagLogic: 'OR' }))}
              className={`px-2 py-0.5 text-[11px] font-mono font-semibold rounded transition-colors cursor-pointer ${
                filters.tagLogic === 'OR'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Khớp BẤT KỲ tag nào đã chọn"
            >
              OR
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map((tag) => {
            const isIncluded = filters.includedTags.includes(tag);
            const isExcluded = filters.excludedTags.includes(tag);
            const liveCount = matchedVideos.filter((v) => v.tags.includes(tag)).length;

            return (
              <button
                key={tag}
                onClick={() => handleToggleTag(tag)}
                className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer border ${
                  isIncluded
                    ? 'bg-rose-600 text-white border-rose-600'
                    : isExcluded
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700 line-through'
                    : liveCount === 0 && filters.tagLogic === 'AND'
                    ? 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-400 dark:text-slate-600 border-slate-200/50 dark:border-slate-800/50'
                    : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                }`}
              >
                {isIncluded && <Check className="w-3 h-3 shrink-0" />}
                {isExcluded && <Ban className="w-3 h-3 shrink-0 text-rose-500" />}
                <span>{tag}</span>
                <span className="text-[10px] font-mono tabular-nums opacity-65">
                  ({liveCount})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimum Views Filter */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-rose-500" />
            <span>Ngưỡng Lượt Xem (Views tối thiểu)</span>
          </span>
          <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
            {filters.minViews === 0
              ? 'Tất cả'
              : `≥ ${(filters.minViews / 1_000_000).toFixed(1)}M views`}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: 'Mọi mức', val: 0 },
            { label: '≥ 800K', val: 800000 },
            { label: '≥ 1.2M', val: 1200000 },
            { label: '≥ 1.6M', val: 1600000 },
          ].map((opt) => (
            <button
              key={opt.val}
              onClick={() => onChangeFilters((prev) => ({ ...prev, minViews: opt.val }))}
              className={`min-h-[36px] px-2 py-1.5 rounded-lg text-xs font-mono tabular-nums font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.minViews === opt.val
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100'
                  : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Popularity Threshold Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>Độ Phổ Biến Tối Thiểu (Popularity Index)</span>
          </span>
          <span className="font-mono tabular-nums text-rose-600 dark:text-rose-400 font-semibold">
            {filters.minPopularity > 0 ? `≥ ${filters.minPopularity}%` : 'Mọi mức (0%+)'}
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={96}
          step={4}
          value={filters.minPopularity}
          onChange={(e) =>
            onChangeFilters((prev) => ({ ...prev, minPopularity: Number(e.target.value) }))
          }
          className="w-full accent-rose-600 cursor-pointer"
        />
        <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400">
          <span>0%</span>
          <span>85%</span>
          <span>90%</span>
          <span>96%+</span>
        </div>
      </div>

      {/* Rating & Resolution Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            <span>Điểm Đánh Giá</span>
          </label>
          <select
            value={filters.minRating}
            onChange={(e) =>
              onChangeFilters((prev) => ({ ...prev, minRating: Number(e.target.value) }))
            }
            className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums text-slate-900 dark:text-white cursor-pointer"
          >
            <option value={0}>Mọi mức ★</option>
            <option value={4.6}>★ 4.6 trở lên</option>
            <option value={4.8}>★ 4.8 trở lên</option>
            <option value={4.9}>★ 4.9 tuyệt đối</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Chất lượng Video
          </label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            {(['ALL', '4K', '1080p'] as const).map((res) => (
              <button
                key={res}
                onClick={() => onChangeFilters((prev) => ({ ...prev, resolution: res }))}
                className={`py-1 text-xs font-mono font-medium rounded-lg transition-colors cursor-pointer ${
                  filters.resolution === res
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {res === 'ALL' ? 'Tất cả' : res}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Duration & Release Year */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Thời lượng tập
          </label>
          <select
            value={filters.durationRange}
            onChange={(e) =>
              onChangeFilters((prev) => ({
                ...prev,
                durationRange: e.target.value as FilterState['durationRange'],
              }))
            }
            className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="ALL">Mọi thời lượng</option>
            <option value="SHORT">Ngắn (&lt; 25 phút)</option>
            <option value="MEDIUM">Tiêu chuẩn (25–28 phút)</option>
            <option value="LONG">OVA Dài (&gt; 28 phút)</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
            Năm phát hành
          </label>
          <select
            value={filters.releaseYear}
            onChange={(e) =>
              onChangeFilters((prev) => ({
                ...prev,
                releaseYear: e.target.value as FilterState['releaseYear'],
              }))
            }
            className="w-full min-h-[38px] px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="ALL">Tất cả năm</option>
            <option value="2026">2026 (Mới nhất)</option>
            <option value="2025">2025</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop XL Sticky Filter Sidebar (On Phone & Tablet, opens as a smooth Drawer so video grid gets full width) */}
      <aside className="hidden xl:block rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 h-fit sticky top-20">
        {filterContent}
      </aside>

      {/* Phone Bottom Sheet & Tablet Slide-Over Filter Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 xl:hidden flex flex-col sm:flex-row sm:justify-end justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full sm:w-[420px] max-h-[88vh] sm:max-h-full sm:h-full overflow-y-auto rounded-t-3xl sm:rounded-t-none sm:rounded-l-3xl bg-white dark:bg-slate-900 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 p-5 shadow-2xl">
            <div className="w-10 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />
            {filterContent}
            <div className="mt-6 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={onCloseMobile}
                className="w-full min-h-[44px] rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-500 transition-colors cursor-pointer"
              >
                Áp dụng bộ lọc ({totalMatched} kết quả)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

