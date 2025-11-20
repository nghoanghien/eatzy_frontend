'use client';

import { motion } from '@repo/ui/motion';
import { Menu, BookHeart, Search, User } from '@repo/ui/icons';
// import { useState } from 'react';

interface HomeHeaderProps {
  onMenuClick?: () => void;
  onFavoritesClick?: () => void;
  onSearchClick?: () => void;
  onProfileClick?: () => void;
  selectedFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export default function HomeHeader({
  onMenuClick,
  onFavoritesClick,
  onSearchClick,
  onProfileClick,
  selectedFilter = 'All recipes',
  onFilterChange,
}: HomeHeaderProps) {
  // const [layoutView, setLayoutView] = useState<'grid' | 'list'>('grid');

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6">
      <div className="flex items-start justify-between">
        {/* Left Section */}
        <div className="flex flex-col gap-4">
          {/* Logo and Menu */}
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Menu className="w-5 h-5 text-white" />
            </motion.button>
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h1 className="text-3xl font-bold text-white tracking-tight">
                my.<span className="text-white/90">Eatzy</span>
              </h1>
            </motion.div>
          </div>

          {/* Layout Toggle */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 ml-14"
          >
          </motion.div>
        </div>

        {/* Right Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-3"
        >
          {/* My Cookbook/Favorites */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onFavoritesClick}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-colors"
          >
            <BookHeart className="w-5 h-5 text-white" />
            <span className="text-white text-sm font-medium">MY COOKBOOK</span>
          </motion.button>

          {/* Search */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchClick}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <Search className="w-5 h-5 text-white" />
          </motion.button>

          {/* Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onProfileClick}
            className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-colors overflow-hidden"
          >
            <User className="w-5 h-5 text-white" />
          </motion.button>

          {/* Filter Dropdown */}
          <div className="relative">
            <motion.select
              whileHover={{ scale: 1.02 }}
              value={selectedFilter}
              onChange={(e) => onFilterChange?.(e.target.value)}
              className="appearance-none px-4 py-2 pr-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <option value="All recipes" className="bg-gray-900">All recipes</option>
              <option value="My favorites" className="bg-gray-900">My favorites</option>
              <option value="Recent" className="bg-gray-900">Recent</option>
              <option value="Popular" className="bg-gray-900">Popular</option>
            </motion.select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>
    </header>
  );
}

