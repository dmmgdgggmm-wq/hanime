import React, { useMemo, useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  X,
  Ban,
  Layers,
  BookmarkPlus,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { FilterState, VideoItem, SavedTagCombo } from '../types';
import { ALL_TAGS, SMART_TAG_SYNONYMS, SMART_TAG_PRESETS } from '../data';

interface SmartTagCommandBarProps {
  filters: FilterState;
  onChangeFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  allVideos: VideoItem[];
  matchedVideos: VideoItem[];
  savedCombos: SavedTagCombo[];
  onSaveCombo: (name: string) => void;
  onDeleteCombo: (id: string) => void;
  onApplyCombo: (
    included: string[],
    excluded: string[],
    logic: 'AND' | 'OR',
    label?: string
  ) => void;
}

export const SmartTagCommandBar: React.FC<SmartTagCommandBarProps> = ({
  filters,
  onChangeFilters,
  allVideos,
  matchedVideos,
  savedCombos,
  onSaveCombo,
  onDeleteCombo,
  onApplyCombo,
}) => {
  const [tagInput, setTagInput] = useState('');
  const [comboNameInput, setComboNameInput] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  // 1. Parse natural language or prefix query (+tag, -tag, Vietnamese synonyms)
  const smartSuggestions = useMemo(() => {
    const raw = tagInput.trim().toLowerCase();
    if (!raw) return [];

    const cleanQuery = raw.replace(/^[+#-]/, '').trim();
    if (!cleanQuery) return [];

    return ALL_TAGS.filter((tag) => {
      const lowerTag = tag.toLowerCase();
      const synonyms = SMART_TAG_SYNONYMS[tag] || [];
      const matchesName = lowerTag.includes(cleanQuery);
      const matchesSynonym = synonyms.some((syn) => syn.includes(cleanQuery));
      return matchesName || matchesSynonym;
    }).map((tag) => {
      const matchedSynonym = (SMART_TAG_SYNONYMS[tag] || []).find((syn) =>
        syn.includes(cleanQuery)
      );
      const countInPool = matchedVideos.filter((v) => v.tags.includes(tag)).length;
      return {
        tag,
        matchedSynonym,
        countInPool,
        isExcludeIntent: raw.startsWith('-'),
      };
    });
  }, [tagInput, matchedVideos]);

  // 2. Smart Co-occurring Tags: Calculate which unselected tags appear most frequently
  // alongside the currently selected tags (or across the whole catalog if none selected)
  const coOccurringRecommendations = useMemo(() => {
    const sourceVideos =
      filters.includedTags.length > 0 || filters.excludedTags.length > 0
        ? matchedVideos
        : allVideos;

    const tagFrequency: Record<string, number> = {};
    sourceVideos.forEach((video) => {
      video.tags.forEach((t) => {
        if (
          !filters.includedTags.includes(t) &&
          !filters.excludedTags.includes(t)
        ) {
          tagFrequency[t] = (tagFrequency[t] || 0) + 1;
        }
      });
    });

    return Object.entries(tagFrequency)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag, count]) => ({ tag, count }));
  }, [filters.includedTags, filters.excludedTags, matchedVideos, allVideos]);

  const handleAddIncludedTag = (tag: string) => {
    onChangeFilters((prev) => ({
      ...prev,
      includedTags: prev.includedTags.includes(tag)
        ? prev.includedTags
        : [...prev.includedTags, tag],
      excludedTags: prev.excludedTags.filter((t) => t !== tag),
    }));
    setTagInput('');
  };

  const handleAddExcludedTag = (tag: string) => {
    onChangeFilters((prev) => ({
      ...prev,
      excludedTags: prev.excludedTags.includes(tag)
        ? prev.excludedTags
        : [...prev.excludedTags, tag],
      includedTags: prev.includedTags.filter((t) => t !== tag),
    }));
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    onChangeFilters((prev) => ({
      ...prev,
      includedTags: prev.includedTags.filter((t) => t !== tag),
      excludedTags: prev.excludedTags.filter((t) => t !== tag),
    }));
  };

  const handleFlipTagState = (tag: string) => {
    onChangeFilters((prev) => {
      if (prev.includedTags.includes(tag)) {
        return {
          ...prev,
          includedTags: prev.includedTags.filter((t) => t !== tag),
          excludedTags: [...prev.excludedTags, tag],
        };
      }
      if (prev.excludedTags.includes(tag)) {
        return {
          ...prev,
          excludedTags: prev.excludedTags.filter((t) => t !== tag),
          includedTags: [...prev.includedTags, tag],
        };
      }
      return prev;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      // Support multi-tag comma/plus input like "Sci-Fi + Uncensored -Mecha"
      const tokens = tagInput
        .split(/[,+]/)
        .map((s) => s.trim())
        .filter(Boolean);

      if (tokens.length > 1) {
        tokens.forEach((tok) => {
          const isEx = tok.startsWith('-');
          const clean = tok.replace(/^[+#-]/, '').trim().toLowerCase();
          const matchedTag = ALL_TAGS.find(
            (t) =>
              t.toLowerCase() === clean ||
              t.toLowerCase().includes(clean) ||
              (SMART_TAG_SYNONYMS[t] || []).some((syn) => syn.includes(clean))
          );
          if (matchedTag) {
            if (isEx) handleAddExcludedTag(matchedTag);
            else handleAddIncludedTag(matchedTag);
          }
        });
        setTagInput('');
        return;
      }

      if (smartSuggestions.length > 0) {
        const top = smartSuggestions[0];
        if (top.isExcludeIntent) {
          handleAddExcludedTag(top.tag);
        } else {
          handleAddIncludedTag(top.tag);
        }
      } else {
        // Fallback: apply as general search query
        onChangeFilters((prev) => ({ ...prev, searchQuery: tagInput.trim() }));
      }
    }
  };

  const handleSaveComboSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comboNameInput.trim()) return;
    onSaveCombo(comboNameInput.trim());
    setComboNameInput('');
    setShowSaveForm(false);
  };

  const hasActiveTags =
    filters.includedTags.length > 0 || filters.excludedTags.length > 0;

  return (
    <section className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-4 shadow-xs">
      {/* Header & Logic Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500 shrink-0" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Tổ Hợp Tag Thông Minh & Tìm Kiếm Đa Chiều
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Gõ tiếng Việt hoặc tiếng Anh (VD: <span className="font-mono">không che</span>,{' '}
            <span className="font-mono">hồ ly</span>, <span className="font-mono">-Mecha</span>) để kết hợp nhiều Tag cùng lúc
          </p>
        </div>

        {/* Multi-Tag Logic Operator (AND vs OR) */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Chế độ kết hợp:
          </span>
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => onChangeFilters((prev) => ({ ...prev, tagLogic: 'AND' }))}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.tagLogic === 'AND'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Video phải chứa TẤT CẢ các Tag đã chọn"
            >
              AND (Khớp tất cả)
            </button>
            <button
              onClick={() => onChangeFilters((prev) => ({ ...prev, tagLogic: 'OR' }))}
              className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.tagLogic === 'OR'
                  ? 'bg-rose-600 text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Video chứa BẤT KỲ Tag nào đã chọn"
            >
              OR (Khớp bất kỳ)
            </button>
          </div>
        </div>
      </div>

      {/* Smart Autocomplete Input Bar */}
      <div className="relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập Tag hoặc từ khóa thông minh: 'không che + tình cảm', 'tai thú', '-Mecha'..."
              className="w-full min-h-[44px] pl-10 pr-24 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
            />
            {tagInput && (
              <button
                onClick={() => setTagInput('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-rose-500" />
              <span>
                Khớp <strong>{matchedVideos.length}</strong>/{allVideos.length} video
              </span>
            </span>
          </div>
        </div>

        {/* Live Smart Tag Autocomplete Dropdown */}
        {smartSuggestions.length > 0 && (
          <div className="mt-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 space-y-1.5">
            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 px-1">
              Gợi ý Tag thông minh (Nhấn để gộp vào bộ lọc hiện tại):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {smartSuggestions.map((item) => (
                <div
                  key={item.tag}
                  className="inline-flex items-center rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                  <button
                    onClick={() => handleAddIncludedTag(item.tag)}
                    className="min-h-[36px] px-3 py-1.5 text-xs font-semibold text-slate-900 dark:text-slate-100 hover:bg-rose-600 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-rose-500" />
                    <span>#{item.tag}</span>
                    {item.matchedSynonym && (
                      <span className="text-[11px] font-normal opacity-75">
                        ({item.matchedSynonym})
                      </span>
                    )}
                    <span className="text-[11px] font-mono tabular-nums opacity-70">
                      · {item.countInPool} tập
                    </span>
                  </button>
                  <button
                    onClick={() => handleAddExcludedTag(item.tag)}
                    className="min-h-[36px] px-2.5 py-1.5 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-rose-500 border-l border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                    title={`Loại trừ Tag #${item.tag}`}
                  >
                    <Ban className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Active Multi-Tag Formula Builder (Shows current combined query) */}
      {hasActiveTags && (
        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/70 dark:border-rose-900/50 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Công thức tổ hợp đang lọc (Nhấn vào Tag để đảo chiều Chọn / Loại trừ):
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSaveForm((prev) => !prev)}
                className="min-h-[32px] px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-rose-500 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <BookmarkPlus className="w-3.5 h-3.5 text-rose-500" />
                <span>Lưu Tổ Hợp Tag</span>
              </button>

              <button
                onClick={() =>
                  onChangeFilters((prev) => ({
                    ...prev,
                    includedTags: [],
                    excludedTags: [],
                  }))
                }
                className="min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100/60 dark:hover:bg-rose-950/50 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa hết Tag</span>
              </button>
            </div>
          </div>

          {/* Visual Formula Stream */}
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.includedTags.map((tag, index) => (
              <React.Fragment key={`inc-${tag}`}>
                {index > 0 && (
                  <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 px-1">
                    {filters.tagLogic}
                  </span>
                )}
                <div className="inline-flex items-center rounded-lg bg-rose-600 text-white text-xs font-semibold overflow-hidden">
                  <button
                    onClick={() => handleFlipTagState(tag)}
                    className="px-2.5 py-1 hover:bg-rose-700 transition-colors cursor-pointer"
                    title="Nhấn để chuyển sang Loại trừ (NOT)"
                  >
                    +{tag}
                  </button>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="px-1.5 py-1 hover:bg-rose-800 border-l border-rose-500 transition-colors cursor-pointer"
                    aria-label={`Bỏ tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </React.Fragment>
            ))}

            {filters.excludedTags.map((tag) => (
              <React.Fragment key={`exc-${tag}`}>
                <span className="text-[11px] font-mono font-bold text-slate-500 px-1">
                  NOT
                </span>
                <div className="inline-flex items-center rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold overflow-hidden">
                  <button
                    onClick={() => handleFlipTagState(tag)}
                    className="px-2.5 py-1 line-through hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Nhấn để chuyển sang Chọn (+)"
                  >
                    -{tag}
                  </button>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="px-1.5 py-1 hover:bg-slate-700 border-l border-slate-700 transition-colors cursor-pointer"
                    aria-label={`Bỏ loại trừ tag ${tag}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>

          {/* Save Custom Tag Combination Form */}
          {showSaveForm && (
            <form
              onSubmit={handleSaveComboSubmit}
              className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40 flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={comboNameInput}
                onChange={(e) => setComboNameInput(e.target.value)}
                placeholder="Đặt tên tổ hợp Tag (VD: Sci-Fi Không Che 60fps)..."
                className="flex-1 min-h-[38px] px-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="min-h-[38px] px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Lưu Tổ Hợp Này
              </button>
            </form>
          )}
        </div>
      )}

      {/* Co-occurring Smart Tag Suggestions (Dynamic based on current result pool) */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {hasActiveTags
            ? 'Gợi ý Tag đi kèm thông minh (cùng xuất hiện trong các video đang khớp):'
            : 'Tag phổ biến có thể kết hợp nhanh:'}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {coOccurringRecommendations.length > 0 ? (
            coOccurringRecommendations.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => handleAddIncludedTag(tag)}
                className="min-h-[34px] px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3 h-3 text-rose-500" />
                <span>{tag}</span>
                <span className="text-[11px] font-mono tabular-nums opacity-70">
                  ({count})
                </span>
              </button>
            ))
          ) : (
            <span className="text-xs text-slate-400">
              Đã chọn toàn bộ các Tag liên quan trong nhóm kết quả này.
            </span>
          )}
        </div>
      </div>

      {/* Curated & User-Saved Multi-Tag Combos */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Bộ Tổ Hợp Nhiều Tag Tạo Sẵn & Đã Lưu (1 chạm để lọc đa Tag):
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {SMART_TAG_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() =>
                onApplyCombo(
                  preset.includedTags,
                  preset.excludedTags || [],
                  preset.tagLogic,
                  preset.label
                )
              }
              className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition-colors flex items-center gap-2 cursor-pointer"
              title={preset.description}
            >
              <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                {preset.label}
              </span>
              <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400">
                [{preset.includedTags.length} Tags]
              </span>
            </button>
          ))}

          {savedCombos.map((combo) => (
            <div
              key={combo.id}
              className="inline-flex items-center rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/70 overflow-hidden"
            >
              <button
                onClick={() =>
                  onApplyCombo(
                    combo.includedTags,
                    combo.excludedTags,
                    combo.tagLogic,
                    combo.name
                  )
                }
                className="min-h-[36px] px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors cursor-pointer"
              >
                ★ {combo.name} ({combo.includedTags.length} Tags)
              </button>
              <button
                onClick={() => onDeleteCombo(combo.id)}
                className="min-h-[36px] px-2 text-slate-400 hover:text-rose-600 border-l border-rose-200 dark:border-rose-800/70 transition-colors cursor-pointer"
                title="Xóa tổ hợp đã lưu"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
