'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from '@repo/ui/motion';
import { X, Plus, Trash2, GripVertical, Save, Camera, ChevronDown, ChevronUp, Check, Info } from '@repo/ui/icons';
import { Dish, MenuCategory, OptionGroup, OptionChoice } from '@repo/types';
import { ImageWithFallback, useSwipeConfirmation } from '@repo/ui';
import { formatVnd } from '@repo/lib';
import { useMobileBackHandler } from '@/hooks/useMobileBackHandler';
import { sileo } from '@/components/DynamicIslandToast';

interface MobileDishDrawerProps {
  open: boolean;
  dish: Dish | null;
  categories: MenuCategory[];
  isSaving: boolean;
  mode: 'edit' | 'create';
  onClose: () => void;
  onUpdate: (updatedDish: Dish) => void;
}

export default function MobileDishDrawer({
  open,
  dish,
  categories,
  isSaving,
  mode,
  onClose,
  onUpdate,
}: MobileDishDrawerProps) {
  const { confirm } = useSwipeConfirmation();
  const [activeTab, setActiveTab] = useState<'info' | 'options'>('info');
  const [draftDish, setDraftDish] = useState<Dish | null>(null);
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Sync state when drawer opens with deep copy
  useEffect(() => {
    if (dish && open) {
      setDraftDish(JSON.parse(JSON.stringify(dish)));
      setActiveTab('info');
      setExpandedGroups({});
    } else {
      setDraftDish(null);
    }
  }, [dish, open]);

  // Intercept mobile back button to close drawer
  useMobileBackHandler(open, onClose);

  if (!draftDish) return null;

  const updateDraft = (updates: Partial<Dish>) => {
    setDraftDish(prev => prev ? { ...prev, ...updates } : null);
  };

  const handleStockChange = (delta: number) => {
    const current = draftDish.availableQuantity || 0;
    const newStock = Math.max(0, current + delta);
    updateDraft({ availableQuantity: newStock });
  };

  // Option group handlers
  const optionGroups = draftDish.optionGroups || [];
  const updateGroups = (newGroups: OptionGroup[]) => {
    updateDraft({ optionGroups: newGroups });
  };

  const handleAddGroup = () => {
    const newGroup: OptionGroup = {
      id: `group-${Date.now()}`,
      title: 'Nhóm tùy chọn mới',
      minSelect: 0,
      maxSelect: 1,
      required: false,
      options: [],
      type: 'addon'
    };
    const newGroups = [...optionGroups, newGroup];
    updateGroups(newGroups);
    setExpandedGroups(prev => ({ ...prev, [newGroup.id]: true }));
  };

  const handleRemoveGroup = (groupId: string) => {
    const newGroups = optionGroups.filter(g => g.id !== groupId);
    updateGroups(newGroups);
  };

  const handleUpdateGroup = (groupId: string, updates: Partial<OptionGroup>) => {
    const newGroups = optionGroups.map(g => g.id === groupId ? { ...g, ...updates } : g);
    updateGroups(newGroups);
  };

  const handleSetVariant = (groupId: string) => {
    const targetGroup = optionGroups.find(g => g.id === groupId);
    const isCurrentlyVariant = targetGroup?.type === 'variant';

    const newGroups = optionGroups.map(g => {
      if (g.id === groupId) {
        if (!isCurrentlyVariant) {
          return { ...g, type: 'variant', minSelect: 1, maxSelect: 1 };
        } else {
          return { ...g, type: 'addon' };
        }
      } else {
        if (!isCurrentlyVariant) {
          return { ...g, type: 'addon' };
        }
        return g;
      }
    });
    updateGroups(newGroups);
  };

  const toggleExpand = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleAddChoice = (groupId: string) => {
    const newChoice: OptionChoice = {
      id: `opt-${Date.now()}`,
      name: 'Tùy chọn mới',
      price: 0
    };
    const newGroups = optionGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, options: [...(g.options || []), newChoice] };
      }
      return g;
    });
    updateGroups(newGroups);
  };

  const handleRemoveChoice = (groupId: string, choiceId: string) => {
    const newGroups = optionGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, options: (g.options || []).filter(o => o.id !== choiceId) };
      }
      return g;
    });
    updateGroups(newGroups);
  };

  const handleUpdateChoice = (groupId: string, choiceId: string, updates: Partial<OptionChoice>) => {
    const newGroups = optionGroups.map(g => {
      if (g.id === groupId) {
        const newOptions = (g.options || []).map(o => o.id === choiceId ? { ...o, ...updates } : o);
        return { ...g, options: newOptions };
      }
      return g;
    });
    updateGroups(newGroups);
  };

  const handleReorderChoices = (groupId: string, newOptions: OptionChoice[]) => {
    const newGroups = optionGroups.map(g => {
      if (g.id === groupId) {
        return { ...g, options: newOptions };
      }
      return g;
    });
    updateGroups(newGroups);
  };

  // Validation & Save
  const validate = () => {
    if (!draftDish.name || !draftDish.name.trim()) return 'Vui lòng nhập tên món ăn';
    if (!draftDish.description || !draftDish.description.trim()) return 'Vui lòng nhập mô tả món ăn';
    if (!draftDish.menuCategoryId) return 'Vui lòng chọn danh mục';
    if ((draftDish.price || 0) < 0) return 'Giá món ăn không hợp lệ';
    return null;
  };

  const hasChanges = () => {
    if (mode === 'create') return true;
    if (!dish) return false;
    return JSON.stringify(draftDish) !== JSON.stringify(dish);
  };

  const executeSave = () => {
    onUpdate(draftDish);
    onClose();
  };

  const handleSaveDetails = () => {
    const error = validate();
    if (error) {
      sileo.error({ title: error });
      return;
    }

    if (!hasChanges()) {
      sileo.error({ title: 'Không có thay đổi nào để lưu', description: "Kiểm tra lại thông tin và thử lại!" });
      return;
    }

    confirm({
      title: mode === 'create' ? 'Thêm món mới?' : 'Lưu thay đổi?',
      description: mode === 'create'
        ? 'Bạn có chắc chắn muốn thêm món ăn này vào thực đơn?'
        : 'Tất cả thay đổi về thông tin và tùy chọn món sẽ được lưu.',
      confirmText: mode === 'create' ? 'Thêm món' : 'Lưu thay đổi',
      type: 'info',
      onConfirm: executeSave,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] md:hidden"
          />

          {/* Bottom Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 18, stiffness: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-[#F8F9FA] rounded-t-[40px] overflow-hidden max-h-[94vh] flex flex-col shadow-2xl border-t border-white/20 md:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-2 border-b border-gray-100 bg-white">
              <div>
                <h2 className="text-2xl font-bold font-anton text-[#1A1A1A] uppercase tracking-wide">
                  {mode === 'create' ? 'THÊM MÓN ĂN MỚI' : 'CHỈNH SỬA MÓN ĂN'}
                </h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                  {draftDish.name || 'Tên món ăn'}
                </p>
              </div>
              <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Tab Selection */}
            <div className="flex bg-white px-5 py-2.5 border-b border-gray-100">
              <div className="flex bg-gray-100 rounded-2xl p-1 w-full relative">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 ${activeTab === 'info' ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-gray-400'
                    }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Thông tin</span>
                </button>
                <button
                  onClick={() => setActiveTab('options')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 ${activeTab === 'options' ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-gray-400'
                    }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tùy chọn ({optionGroups.length})</span>
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-5 pb-24">
              <AnimatePresence mode="wait">
                {activeTab === 'info' ? (
                  <motion.div
                    key="info-tab"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-5"
                  >
                    {/* Name Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Tên món</label>
                      <input
                        type="text"
                        value={draftDish.name}
                        onChange={(e) => updateDraft({ name: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base font-bold text-[#1A1A1A] focus:outline-none focus:border-[var(--primary)] shadow-sm"
                        placeholder="Nhập tên món ăn..."
                      />
                    </div>

                    {/* Category Selector */}
                    <div className="relative">
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Danh mục món</label>
                      <button
                        onClick={() => setIsCatOpen(!isCatOpen)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A1A] flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 shadow-sm"
                      >
                        <span>{categories.find(c => c.id === draftDish.menuCategoryId)?.name || 'Chọn danh mục...'}</span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isCatOpen ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {isCatOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 5, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95 }}
                            className="absolute z-30 left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-1 max-h-48 overflow-y-auto"
                          >
                            {categories.map(c => (
                              <button
                                key={c.id}
                                onClick={() => { updateDraft({ menuCategoryId: c.id }); setIsCatOpen(false); }}
                                className={`w-full text-left px-4 py-3 text-xs font-bold hover:bg-gray-50 flex items-center justify-between ${draftDish.menuCategoryId === c.id ? 'bg-[var(--primary)]/5 text-[var(--primary)]' : 'text-gray-600'}`}
                              >
                                <span>{c.name}</span>
                                {draftDish.menuCategoryId === c.id && <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]"></div>}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Price Input */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Giá gốc (VNĐ)</label>
                      <input
                        type="text"
                        value={draftDish.price === 0 ? '' : draftDish.price.toLocaleString('vi-VN')}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\./g, '');
                          if (/^\d*$/.test(rawValue)) {
                            updateDraft({ price: Number(rawValue) });
                          }
                        }}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-base font-bold text-[#1A1A1A] focus:outline-none focus:border-[var(--primary)] shadow-sm"
                        placeholder="0"
                      />
                    </div>

                    {/* Stock Management */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          Tồn kho hiện tại
                        </label>
                        <span className="text-lg font-bold text-[#1A1A1A]">{draftDish.availableQuantity}</span>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleStockChange(-10)} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-600 font-bold border border-gray-200 transition-all text-xs">-10</button>
                          <button onClick={() => handleStockChange(-1)} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-600 font-bold border border-gray-200 transition-all text-xs">-1</button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button onClick={() => handleStockChange(1)} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-600 font-bold border border-gray-200 transition-all text-xs">+1</button>
                          <button onClick={() => handleStockChange(10)} className="w-9 h-9 rounded-xl bg-gray-50 hover:bg-gray-100 active:scale-95 text-gray-600 font-bold border border-gray-200 transition-all text-xs">+10</button>
                        </div>
                      </div>
                    </div>

                    {/* Image Edit */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Hình ảnh món</label>
                      <div className="relative aspect-[16/10] bg-gray-100 rounded-2xl overflow-hidden group border border-gray-200 shadow-sm flex items-center justify-center">
                        {draftDish.imageUrl ? (
                          <ImageWithFallback src={draftDish.imageUrl} alt={draftDish.name} fill className="object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 gap-1">
                            <Camera className="w-8 h-8 opacity-40" />
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Chưa có ảnh</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 active:opacity-100 transition-opacity">
                          <button className="bg-white text-[#1A1A1A] px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                            {draftDish.imageUrl ? 'Đổi ảnh' : 'Thêm ảnh'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Description Edit */}
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mô tả</label>
                      <textarea
                        value={draftDish.description || ''}
                        onChange={(e) => updateDraft({ description: e.target.value })}
                        rows={3}
                        className="w-full bg-white rounded-xl border border-gray-200 p-4 text-sm font-medium text-[#555] focus:outline-none focus:border-[var(--primary)] resize-none shadow-sm transition-all"
                        placeholder="Mô tả chi tiết món ăn..."
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="options-tab"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Danh sách nhóm tùy chọn</span>
                      <button
                        onClick={handleAddGroup}
                        className="bg-[var(--primary)] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide shadow flex items-center gap-1 hover:scale-105 active:scale-95 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm nhóm</span>
                      </button>
                    </div>

                    {optionGroups.length === 0 ? (
                      <div className="py-12 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl bg-white">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Chưa có tùy chọn nào</p>
                        <p className="text-[10px] text-gray-400 mt-1 font-semibold">Bấm nút phía trên để tạo thêm nhóm lựa chọn</p>
                      </div>
                    ) : (
                      <Reorder.Group axis="y" values={optionGroups} onReorder={updateGroups} className="space-y-4">
                        {optionGroups.map((group) => {
                          const isVariant = group.type === 'variant';
                          return (
                            <Reorder.Item
                              key={group.id}
                              value={group}
                              className={`rounded-2xl overflow-hidden border ${isVariant ? 'bg-[var(--primary)]/5 border-[var(--primary)]/30' : 'bg-white border-gray-100 shadow-sm'}`}
                            >
                              {/* Group Header */}
                              <div className={`p-4 border-b ${isVariant ? 'bg-[var(--primary)]/10 border-[var(--primary)]/20' : 'bg-gray-50/50 border-gray-100'}`}>
                                <div className="flex items-start gap-2">
                                  <div className="text-gray-400 p-2 cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-2">
                                      {isVariant && (
                                        <span className="bg-[var(--primary)] text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm shrink-0">
                                          Variant
                                        </span>
                                      )}
                                      <input
                                        type="text"
                                        value={group.title}
                                        onChange={(e) => handleUpdateGroup(group.id, { title: e.target.value })}
                                        className={`flex-1 bg-transparent text-sm font-bold placeholder-gray-400 focus:outline-none border-b border-transparent py-0.5 ${isVariant ? 'text-[var(--primary)] focus:border-[var(--primary)]' : 'text-[#1A1A1A] focus:border-[var(--primary)]'}`}
                                        placeholder="Nhóm tùy chọn (VD: Size, Topping)"
                                      />
                                      <button onClick={() => handleRemoveGroup(group.id)} className="text-gray-400 hover:text-red-500 p-1">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => toggleExpand(group.id)} className="text-gray-400 hover:text-gray-600 p-1">
                                        {expandedGroups[group.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                      </button>
                                    </div>

                                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                                      <button
                                        onClick={() => handleSetVariant(group.id)}
                                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${isVariant
                                          ? 'bg-white text-[var(--primary)] border-[var(--primary)]/30'
                                          : 'bg-white text-gray-500 border-gray-200 hover:text-[var(--primary)] hover:border-[var(--primary)]'
                                          }`}
                                      >
                                        {isVariant ? '✓ Phân loại chính' : 'Đặt làm phân loại'}
                                      </button>

                                      <div className="flex items-center gap-3 text-xs">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-gray-400 text-[10px] font-bold uppercase">Min</span>
                                          <input
                                            type="number"
                                            min={0}
                                            value={group.minSelect || 0}
                                            onChange={(e) => handleUpdateGroup(group.id, { minSelect: parseInt(e.target.value) || 0 })}
                                            className="w-10 bg-white border border-gray-200 rounded-lg py-0.5 text-center font-bold text-xs"
                                            disabled={isVariant}
                                          />
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-gray-400 text-[10px] font-bold uppercase">Max</span>
                                          <input
                                            type="number"
                                            min={0}
                                            value={group.maxSelect || 0}
                                            onChange={(e) => handleUpdateGroup(group.id, { maxSelect: parseInt(e.target.value) || 0 })}
                                            className="w-10 bg-white border border-gray-200 rounded-lg py-0.5 text-center font-bold text-xs"
                                            disabled={isVariant}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Choices list inside group */}
                              <AnimatePresence initial={false}>
                                {expandedGroups[group.id] && (
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: "auto" }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden bg-gray-50/50"
                                  >
                                    <div className="p-4">
                                      <Reorder.Group
                                        axis="y"
                                        values={group.options || []}
                                        onReorder={(newOrder) => handleReorderChoices(group.id, newOrder)}
                                        className="space-y-2"
                                      >
                                        {(group.options || []).map((option) => (
                                          <Reorder.Item
                                            key={option.id}
                                            value={option}
                                            className="bg-white rounded-xl border border-gray-100 p-2 flex items-center gap-2 cursor-grab active:cursor-grabbing hover:border-gray-200 shadow-sm"
                                          >
                                            <GripVertical className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                                            <input
                                              type="text"
                                              value={option.name}
                                              onChange={(e) => handleUpdateChoice(group.id, option.id, { name: e.target.value })}
                                              className="flex-1 bg-transparent text-xs font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none"
                                              placeholder="Tên lựa chọn"
                                            />
                                            <div className="flex items-center gap-1 w-20 shrink-0">
                                              <span className="text-[10px] text-gray-400 font-bold">+</span>
                                              <input
                                                type="number"
                                                value={option.price || 0}
                                                onChange={(e) => handleUpdateChoice(group.id, option.id, { price: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 text-xs text-right font-bold text-gray-700 focus:outline-none focus:border-[var(--primary)]"
                                                placeholder="Giá"
                                              />
                                              <span className="text-[10px] text-gray-400 font-bold">đ</span>
                                            </div>
                                            <button
                                              onClick={() => handleRemoveChoice(group.id, option.id)}
                                              className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </Reorder.Item>
                                        ))}
                                      </Reorder.Group>

                                      <button
                                        onClick={() => handleAddChoice(group.id)}
                                        className="mt-3 w-full border border-dashed border-gray-200 rounded-xl py-2 flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Thêm lựa chọn</span>
                                      </button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Reorder.Item>
                          );
                        })}
                      </Reorder.Group>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shrink-0 z-20 flex gap-3">
              <button
                onClick={handleSaveDetails}
                disabled={isSaving || !hasChanges()}
                className={`flex-1 py-4 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${isSaving || !hasChanges()
                  ? 'bg-gray-300 shadow-none cursor-not-allowed opacity-75'
                  : 'bg-[var(--primary)] shadow-[var(--primary)]/30 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>
                  {isSaving ? 'ĐANG LƯU...' : mode === 'create' ? 'TẠO MÓN MỚI' : hasChanges() ? 'LƯU THAY ĐỔI' : 'ĐÃ LƯU'}
                </span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
