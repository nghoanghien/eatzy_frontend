'use client';

import { useState } from 'react';
import { Reorder, motion } from '@repo/ui/motion';
import { MenuCategory } from '@repo/types';
import { Plus, Trash2, GripVertical, Save, X, RotateCcw } from '@repo/ui/icons';
import { useSwipeConfirmation } from '@repo/ui';
import { sileo } from '@/components/DynamicIslandToast';

interface CategoryManagerModalProps {
  categories: MenuCategory[];
  onUpdate: (newCategories: MenuCategory[]) => void;
  onClose: () => void;
  isSaving?: boolean;
}

export default function CategoryManagerModal({ categories, onUpdate, onClose, isSaving }: CategoryManagerModalProps) {
  const { confirm } = useSwipeConfirmation();

  const [localCategories, setLocalCategories] = useState<MenuCategory[]>(categories);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleUpdateName = (id: string, name: string) => {
    setLocalCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleAddCategory = () => {
    const newId = `cat-${Date.now()}`;
    const newCat: MenuCategory = {
      id: newId,
      name: 'Danh mục mới',
      restaurantId: '', // Will be set by API hook when saving
      displayOrder: localCategories.length + 1
    };
    setLocalCategories([...localCategories, newCat]);
    setAddedIds(prev => new Set(prev).add(newId));
  };

  const handleRemoveCategory = (id: string) => {
    if (addedIds.has(id)) {
      setLocalCategories(prev => prev.filter(c => c.id !== id));
      setAddedIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } else {
      setDeletedIds(prev => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    }
  };

  const handleRestoreCategory = (id: string) => {
    setDeletedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const hasChanges = () => {
    if (deletedIds.size > 0 || addedIds.size > 0) return true;
    const currentIds = localCategories.map(c => c.id);
    const originalIds = categories.map(c => c.id);
    if (JSON.stringify(currentIds) !== JSON.stringify(originalIds)) return true;
    for (const cat of localCategories) {
      const original = categories.find(c => c.id === cat.id);
      if (original && original.name !== cat.name) return true;
    }
    return false;
  };

  const handleSave = () => {
    if (!hasChanges()) {
      sileo.error({ title: 'Không có thay đổi nào để lưu', description: "Kiểm tra lại thông tin và thử lại!" });
      return;
    }

    const hasDeletes = deletedIds.size > 0;

    confirm({
      title: hasDeletes ? 'Xóa danh mục?' : 'Lưu thay đổi?',
      description: hasDeletes
        ? 'Các món ăn trong các danh mục bị xóa cũng sẽ bị mất. Bạn có chắc chắn muốn tiếp tục?'
        : 'Bạn có chắc chắn muốn lưu các thay đổi danh mục không?',
      confirmText: hasDeletes ? 'Xác nhận xóa' : 'Lưu thay đổi',
      type: hasDeletes ? 'danger' : 'info',
      processingDuration: 1000,
      onConfirm: () => {
        const activeCategories = localCategories.filter(c => !deletedIds.has(c.id));
        const ordered = activeCategories.map((c, index) => ({
          ...c,
          displayOrder: index + 1
        }));

        onUpdate(ordered);
        onClose();
      }
    });
  };

  const getStatus = (cat: MenuCategory) => {
    if (deletedIds.has(cat.id)) return 'deleted';
    if (addedIds.has(cat.id)) return 'added';
    const original = categories.find(c => c.id === cat.id);
    if (original && original.name !== cat.name) return 'edited';
    return 'normal';
  };

  return (
    <div className="bg-white w-[500px] max-w-[90vw] rounded-[36px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <h2 className="text-xl font-anton font-bold text-[#1A1A1A]">CATEGORIES MANAGER</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Reorder.Group axis="y" values={localCategories} onReorder={setLocalCategories} className="space-y-3">
          {localCategories.map((cat) => {
            const status = getStatus(cat);
            let bgClass = "bg-gray-50 border-gray-100";
            let label = null;

            if (status === 'deleted') {
              bgClass = "bg-red-50 border-red-200 opacity-80";
              label = <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">XÓA</span>;
            } else if (status === 'added') {
              bgClass = "bg-[var(--primary)]/10 border-[var(--primary)]/30";
              label = <span className="absolute top-0 right-0 bg-[var(--primary)] text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">MỚI</span>;
            } else if (status === 'edited') {
              bgClass = "bg-blue-50 border-blue-200";
              label = <span className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold">SỬA</span>;
            }

            return (
              <Reorder.Item
                key={cat.id}
                value={cat}
                className={`${bgClass} rounded-3xl border p-3 flex items-center gap-3 cursor-grab active:cursor-grabbing hover:shadow-sm relative overflow-hidden`}
              >
                {label}
                <div className="text-gray-400 p-1 flex-shrink-0">
                  <GripVertical className="w-5 h-5" />
                </div>

                <input
                  type="text"
                  value={cat.name}
                  disabled={status === 'deleted'}
                  onChange={(e) => handleUpdateName(cat.id, e.target.value)}
                  className={`flex-1 min-w-0 bg-transparent text-sm font-bold text-[#1A1A1A] placeholder-gray-400 focus:outline-none py-1 border-b border-transparent focus:border-[var(--primary)] ${status === 'deleted' ? 'line-through text-gray-400' : ''}`}
                />

                {status === 'deleted' ? (
                  <button
                    onClick={() => handleRestoreCategory(cat.id)}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                    title="Khôi phục"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemoveCategory(cat.id)}
                    className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </Reorder.Item>
            );
          })}
        </Reorder.Group>

        <button
          onClick={handleAddCategory}
          className="mt-6 w-full border-2 border-dashed border-gray-200 rounded-3xl py-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 hover:bg-[var(--primary)]/5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm danh mục</span>
        </button>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100 bg-white rounded-b-3xl shrink-0">
        <motion.button
          whileTap={isSaving ? {} : { scale: 0.98 }}
          onClick={handleSave}
          disabled={isSaving}
          className={`w-full py-3.5 rounded-3xl font-bold text-base shadow-lg transition-all flex items-center justify-center gap-3 ${isSaving
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "bg-lime-500 text-white shadow-lime-500/30 hover:bg-lime-600"
            }`}
        >
          {isSaving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Save Changes</span>
              <Save className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
