'use client';

import { useState, useEffect } from 'react';
import { useLoading, RestaurantMenuShimmer, MobileMenuShimmer } from '@repo/ui';
import { useMyRestaurantMenu, useMenuCategories } from '@/features/menu/hooks/useMenu';
import DesktopMenu from '@/features/menu/components/DesktopMenu';
import MobileMenu from '@/features/menu/components/MobileMenu';

export default function MenuPage() {
  const { hide } = useLoading();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ======== API Data Hook ========
  const {
    dishes,
    categories,
    restaurantId,
    isLoading,
    isError,
    createDish,
    updateDish,
    deleteDish,
    isCreatingDish,
    isUpdatingDish,
  } = useMyRestaurantMenu();

  const isSavingDish = isCreatingDish || isUpdatingDish;

  const {
    createCategory,
    updateCategory,
    deleteCategory,
    updateAllCategories,
    isCreatingCategory,
    isUpdatingCategory,
    isDeletingCategory,
    isUpdatingAll
  } = useMenuCategories(restaurantId);

  const isCategoryWorking = isCreatingCategory || isUpdatingCategory || isDeletingCategory || isUpdatingAll;

  // Responsive detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hide loading screen when data is loaded
  useEffect(() => {
    if (!isLoading) {
      hide();
    }
  }, [hide, isLoading]);

  if (!mounted) return null;

  if (isLoading) {
    if (isMobile) {
      return <MobileMenuShimmer />;
    }
    return <RestaurantMenuShimmer />;
  }

  if (isError) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F7F7F7]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không thể tải thực đơn</h2>
          <p className="text-gray-500">Vui lòng thử lại sau</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileMenu
        dishes={dishes}
        categories={categories}
        restaurantId={restaurantId}
        createDish={createDish}
        updateDish={updateDish}
        deleteDish={deleteDish}
        isSavingDish={isSavingDish}
        createCategory={createCategory}
        updateCategory={updateCategory}
        deleteCategory={deleteCategory}
        updateAllCategories={updateAllCategories}
        isCategoryWorking={isCategoryWorking}
      />
    );
  }

  return (
    <DesktopMenu
      dishes={dishes}
      categories={categories}
      restaurantId={restaurantId}
      createDish={createDish}
      updateDish={updateDish}
      deleteDish={deleteDish}
      isSavingDish={isSavingDish}
      createCategory={createCategory}
      updateCategory={updateCategory}
      deleteCategory={deleteCategory}
      updateAllCategories={updateAllCategories}
      isCategoryWorking={isCategoryWorking}
    />
  );
}
