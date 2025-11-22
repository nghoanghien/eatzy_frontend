import { useState, useEffect, useCallback } from 'react';
// import { RestaurantCategory } from '@repo/models';
import { 
  getUniqueCategories, 
  getRestaurantsByCategory,
  getCategoryBackgroundImage,
} from '../data/mockRestaurants';

export function useHomePage() {
  const categories = getUniqueCategories();
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeRestaurantIndex, setActiveRestaurantIndex] = useState(0);
  const [filter, setFilter] = useState('All recipes');

  const activeCategory = categories[activeCategoryIndex];
  const restaurantsInCategory = getRestaurantsByCategory(activeCategory?.id || '');
  const backgroundImage = getCategoryBackgroundImage(activeCategory?.slug || '');

  // Reset restaurant index when category changes
  useEffect(() => {
    setActiveRestaurantIndex(0);
  }, [activeCategoryIndex]);

  const handleCategoryChange = useCallback((index: number) => {
    if (index >= 0 && index < categories.length) {
      setActiveCategoryIndex(index);
    }
  }, [categories.length]);

  const handleRestaurantChange = useCallback((index: number) => {
    if (index >= 0 && index < restaurantsInCategory.length) {
      setActiveRestaurantIndex(index);
    }
  }, [restaurantsInCategory.length]);

  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter);
  }, []);

  // Navigation methods
  const goToNextCategory = useCallback(() => {
    if (activeCategoryIndex < categories.length - 1) {
      handleCategoryChange(activeCategoryIndex + 1);
    }
  }, [activeCategoryIndex, categories.length, handleCategoryChange]);

  const goToPreviousCategory = useCallback(() => {
    if (activeCategoryIndex > 0) {
      handleCategoryChange(activeCategoryIndex - 1);
    }
  }, [activeCategoryIndex, handleCategoryChange]);

  const goToNextRestaurant = useCallback(() => {
    if (activeRestaurantIndex < restaurantsInCategory.length - 1) {
      handleRestaurantChange(activeRestaurantIndex + 1);
    }
  }, [activeRestaurantIndex, restaurantsInCategory.length, handleRestaurantChange]);

  const goToPreviousRestaurant = useCallback(() => {
    if (activeRestaurantIndex > 0) {
      handleRestaurantChange(activeRestaurantIndex - 1);
    }
  }, [activeRestaurantIndex, handleRestaurantChange]);

  return {
    // State
    categories,
    activeCategoryIndex,
    activeCategory,
    restaurantsInCategory,
    activeRestaurantIndex,
    activeRestaurant: restaurantsInCategory[activeRestaurantIndex],
    backgroundImage,
    filter,
    
    // Handlers
    handleCategoryChange,
    handleRestaurantChange,
    handleFilterChange,
    
    // Navigation
    goToNextCategory,
    goToPreviousCategory,
    goToNextRestaurant,
    goToPreviousRestaurant,
    
    // Status
    canGoToNextCategory: activeCategoryIndex < categories.length - 1,
    canGoToPreviousCategory: activeCategoryIndex > 0,
    canGoToNextRestaurant: activeRestaurantIndex < restaurantsInCategory.length - 1,
    canGoToPreviousRestaurant: activeRestaurantIndex > 0,
  };
}



