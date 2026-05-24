'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from '@repo/ui/motion';
import { useSwipeConfirmation } from '@repo/ui';
import { Dish, MenuCategory } from '@repo/types';
import { Search, Plus, Settings, X, CheckCircle2 } from '@repo/ui/icons';
import MobileDishDrawer from './MobileDishDrawer';
import CategoryManagerModal from './CategoryManagerModal';
import MobileDishCard from './MobileDishCard';

interface MobileMenuProps {
  dishes: Dish[];
  categories: MenuCategory[];
  restaurantId: string | null;
  createDish: (dish: Omit<Dish, 'id' | 'restaurantId'>) => Promise<Dish | null>;
  updateDish: (dish: Dish) => Promise<Dish | null>;
  deleteDish: (id: string) => Promise<boolean>;
  isSavingDish: boolean;
  createCategory: (category: Omit<MenuCategory, 'id' | 'restaurantId'>) => Promise<MenuCategory | null>;
  updateCategory: (category: MenuCategory) => Promise<MenuCategory | null>;
  deleteCategory: (id: string) => Promise<boolean>;
  updateAllCategories: (currentCategories: MenuCategory[], newCategories: MenuCategory[]) => Promise<void>;
  isCategoryWorking: boolean;
}

export default function MobileMenu({
  dishes,
  categories,
  restaurantId,
  createDish,
  updateDish,
  deleteDish,
  isSavingDish,
  createCategory,
  updateCategory,
  deleteCategory,
  updateAllCategories,
  isCategoryWorking
}: MobileMenuProps) {
  const { confirm } = useSwipeConfirmation();
  const [activeCategoryId, setActiveCategoryId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Drawer States
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [dishMode, setDishMode] = useState<'edit' | 'create'>('edit');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // References for scrolling
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Set active category when categories load
  useEffect(() => {
    if (categories.length > 0 && !activeCategoryId) {
      setActiveCategoryId(categories[0].id);
    }
  }, [categories, activeCategoryId]);

  const handleCreateDish = () => {
    const newDish: Dish = {
      id: `dish-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      imageUrl: '',
      restaurantId: '',
      menuCategoryId: activeCategoryId || categories[0]?.id || '',
      availableQuantity: 0,
      isAvailable: true,
      optionGroups: []
    };
    setDishMode('create');
    setSelectedDish(newDish);
    setDrawerOpen(true);
  };

  const handleEditDish = (dish: Dish) => {
    setDishMode('edit');
    setSelectedDish(dish);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setTimeout(() => setSelectedDish(null), 300);
  };

  const handleDishUpdate = async (updatedDish: Dish) => {
    if (dishMode === 'create') {
      const { id, restaurantId: rId, ...dishData } = updatedDish;
      await createDish(dishData);
    } else {
      await updateDish(updatedDish);
    }
    handleCloseDrawer();
  };

  const handleDeleteDish = (e: React.MouseEvent, dishId: string) => {
    e.stopPropagation();
    confirm({
      title: 'Xóa món ăn?',
      description: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?',
      confirmText: 'Xóa món',
      type: 'danger',
      onConfirm: async () => {
        await deleteDish(dishId);
      }
    });
  };

  const handleUpdateStock = async (dish: Dish, delta: number) => {
    const current = dish.availableQuantity || 0;
    const newStock = Math.max(0, current + delta);
    if (newStock === current) return;
    await updateDish({
      ...dish,
      availableQuantity: newStock
    });
  };

  const handleUpdateCategories = async (newCategories: MenuCategory[]) => {
    await updateAllCategories(categories, newCategories);
  };

  // IntersectionObserver to auto-select tabs when user scrolls
  useEffect(() => {
    const mainEl = mainScrollRef.current;
    if (!mainEl || categories.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter(e => e.isIntersecting);
      if (visible.length > 0) {
        const topMost = visible.reduce((prev, curr) =>
          Math.abs(curr.boundingClientRect.top) < Math.abs(prev.boundingClientRect.top) ? curr : prev
        );
        const id = topMost.target.getAttribute('data-id');
        if (id) {
          setActiveCategoryId(id);
          // Center the active tab button inside the horizontal scroll
          const activeTabBtn = tabButtonRefs.current[id];
          const tabsScrollContainer = tabsScrollRef.current;
          if (activeTabBtn && tabsScrollContainer) {
            const containerWidth = tabsScrollContainer.clientWidth;
            const tabLeft = activeTabBtn.offsetLeft;
            const tabWidth = activeTabBtn.clientWidth;
            tabsScrollContainer.scrollTo({
              left: tabLeft - (containerWidth / 2) + (tabWidth / 2),
              behavior: 'smooth'
            });
          }
        }
      }
    }, { root: mainEl, rootMargin: '-10% 0px -70% 0px', threshold: 0 });

    categories.forEach(c => {
      const el = sectionRefs.current[c.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (id: string) => {
    setActiveCategoryId(id);
    const el = sectionRefs.current[id];
    if (el && mainScrollRef.current) {
      const containerTop = mainScrollRef.current.getBoundingClientRect().top;
      const elTop = el.getBoundingClientRect().top;
      const offset = elTop - containerTop + mainScrollRef.current.scrollTop - 10; // offset slightly for aesthetic

      mainScrollRef.current.scrollTo({ top: offset, behavior: 'smooth' });
    }
  };

  // Filter dishes globally based on search query
  const filteredDishes = useMemo(() => {
    if (!searchQuery) return dishes;
    return dishes.filter(d =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [dishes, searchQuery]);

  return (
    <div className="h-screen flex flex-col md:hidden overflow-hidden bg-[#F7F7F7]">
      {/* Sticky Header & Categories Wrapper */}
      <div className="absolute top-0 left-0 right-0 z-30 bg-[#F7F7F7]/85 backdrop-blur-md pb-6 max-md:[mask-image:linear-gradient(to_bottom,black_88%,transparent)]">
        {/* Header - Styled like Mobile Orders header */}
        <div className="px-3 pt-4 pb-4">
          <div className="flex items-center justify-between mb-4 px-2">
            <div>
              <h1 className="text-2xl font-anton font-bold text-gray-900 uppercase tracking-tight leading-none">
                MENU & STOCK
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategoryManager(true)}
                className="w-10 h-10 rounded-2xl bg-gray-200/70 border-2 border-gray-200 flex items-center justify-center text-gray-400 shadow-md"
                title="Categories Manager"
              >
                <Settings size={20} strokeWidth={2.8} />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateDish}
                className="w-10 h-10 rounded-2xl bg-primary/90 text-white flex items-center justify-center shadow-md shadow-[var(--primary)]/20"
                title="Thêm món mới"
              >
                <Plus size={20} strokeWidth={3} />
              </motion.button>
            </div>
          </div>

          {/* Search Bar - Styled exactly like driver history search bar */}
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[var(--primary)] transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border-2 border-white focus:border-[var(--primary)]/20 rounded-3xl py-4 pl-14 pr-12 text-base font-bold font-anton text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-4 focus:ring-[var(--primary)]/5 transition-all shadow-[inset_0_0_20px_rgba(0,0,0,0.09)]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl bg-gray-200/50 hover:bg-gray-200 text-gray-500 hover:text-gray-700 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category horizontal scrolling index selector tabs */}
        <div
          ref={tabsScrollRef}
          className="px-3 py-3 pt-0.5 border-t border-gray-50 overflow-x-auto no-scrollbar scroll-smooth flex gap-2"
        >
          {categories.map(cat => {
            const active = activeCategoryId === cat.id;
            const count = dishes.filter(d => d.menuCategoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                ref={el => { tabButtonRefs.current[cat.id] = el; }}
                onClick={() => scrollToCategory(cat.id)}
                className={`px-2 py-2 rounded-2xl text-xs font-bold whitespace-nowrap border transition-all flex items-center gap-1.5 ${active
                  ? 'bg-[#1A1A1A] border-transparent text-white shadow-md'
                  : 'bg-white border-2 border-gray-200 text-gray-500'
                  }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-lg font-black ${active ? 'bg-primary text-black' : 'bg-gray-100 text-gray-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main index scroll list - Renders all sections sequentially */}
      <div
        ref={mainScrollRef}
        className="flex-1 p-4 pt-[208px] pb-24 space-y-10 overflow-y-auto no-scrollbar scroll-smooth"
      >
        {categories.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-base font-bold uppercase tracking-wider">Chưa có danh mục nào</h3>
            <p className="text-xs text-gray-400 mt-1 font-medium text-center">
              Vui lòng bấm nút cấu hình danh mục để khởi tạo.
            </p>
          </div>
        ) : (
          categories.map(cat => {
            const catDishes = filteredDishes.filter(d => d.menuCategoryId === cat.id);
            if (searchQuery && catDishes.length === 0) return null;

            return (
              <section
                key={cat.id}
                ref={el => { sectionRefs.current[cat.id] = el; }}
                data-id={cat.id}
                className="space-y-4 pt-2"
              >
                {/* Index Section Header */}
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-anton font-bold text-[#1A1A1A] tracking-tight">{cat.name.toUpperCase()}</h2>
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
                    {catDishes.length} items
                  </span>
                </div>

                {/* Dish cards list - Styled like Cart Overlay List */}
                <div className="space-y-3">
                  {catDishes.map((dish) => (
                    <MobileDishCard
                      key={dish.id}
                      dish={dish}
                      onEdit={handleEditDish}
                      onDelete={handleDeleteDish}
                      onUpdateStock={(delta) => handleUpdateStock(dish, delta)}
                    />
                  ))}
                  {catDishes.length === 0 && (
                    <div className="py-8 text-center text-xs font-semibold text-gray-350 bg-white/50 border-2 border-dashed border-gray-150 rounded-3xl my-2">
                      Không có món ăn nào trong danh mục này
                    </div>
                  )}
                </div>
              </section>
            );
          })
        )}
        {filteredDishes.length > 0 && (
          <div className="pb-12 pt-6 flex items-center justify-center gap-4 opacity-40">
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
            <div className="flex flex-col items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-gray-400" />
              <span className="text-[14px] font-bold text-gray-400 uppercase font-anton tracking-wider">End of list</span>
            </div>
            <div className="h-[1px] bg-gradient-to-r from-transparent via-gray-300 to-transparent w-20" />
          </div>
        )}
        <div className="h-32 shrink-0"></div>
      </div>

      {/* MOBILE DRAWER */}
      <MobileDishDrawer
        open={drawerOpen}
        dish={selectedDish}
        categories={categories}
        isSaving={isSavingDish}
        mode={dishMode}
        onClose={handleCloseDrawer}
        onUpdate={handleDishUpdate}
      />

      {/* CATEGORY MANAGER MODAL */}
      <AnimatePresence>
        {showCategoryManager && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCategoryManager(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <CategoryManagerModal
                categories={categories}
                onUpdate={handleUpdateCategories}
                onClose={() => setShowCategoryManager(false)}
                isSaving={isCategoryWorking}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
