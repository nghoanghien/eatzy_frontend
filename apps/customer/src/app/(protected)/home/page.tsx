'use client';

import { motion, AnimatePresence } from '@repo/ui/motion';
import HomeHeader from '@/features/home/components/HomeHeader';
import CategoryScroller from '@/features/home/components/CategoryScroller';
import dynamic from 'next/dynamic';
const RestaurantSlider = dynamic(() => import('@/features/home/components/RestaurantSlider'), { ssr: false });
import BackgroundTransition from '@/features/home/components/BackgroundTransition';
import { useHomePage } from '@/features/home/hooks/useHomePage';

export default function HomePage() {
  const {
    categories,
    activeCategoryIndex,
    activeCategory,
    restaurantsInCategory,
    activeRestaurantIndex,
    backgroundImage,
    filter,
    handleCategoryChange,
    handleRestaurantChange,
    handleFilterChange,
  } = useHomePage();

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Animated Food Background - changes per category */}
      <BackgroundTransition
        imageUrl={backgroundImage}
        categoryName={activeCategory?.name || ''}
      />

      {/* Header - matching reference layout */}
      <HomeHeader
        selectedFilter={filter}
        onFilterChange={handleFilterChange}
        onMenuClick={() => console.log('Menu clicked')}
        onFavoritesClick={() => console.log('Favorites clicked')}
        onSearchClick={() => console.log('Search clicked')}
        onProfileClick={() => console.log('Profile clicked')}
      />

      {/* Main Content Layout - matching reference images */}
      <main className="relative z-10 flex flex-col h-full pt-20 overflow-hidden">
        {/* Category Scroller Section - Top 45% of screen */}
        <motion.section
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="flex items-center justify-center"
          style={{ height: '42vh' }}
        >
          <CategoryScroller
            categories={categories}
            activeIndex={activeCategoryIndex}
            onCategoryChange={handleCategoryChange}
          />
        </motion.section>

        {/* Restaurant Slider Section - Middle 45% of screen */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7 }}
          className="flex-1 flex items-start justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory?.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.08, ease: [0.33, 1, 0.68, 1] }}
              className="w-full"
            >
              <RestaurantSlider
                restaurants={restaurantsInCategory}
                activeIndex={activeRestaurantIndex}
                onRestaurantChange={handleRestaurantChange}
              />
            </motion.div>
          </AnimatePresence>
        </motion.section>
      </main>
    </div>
  );
}
