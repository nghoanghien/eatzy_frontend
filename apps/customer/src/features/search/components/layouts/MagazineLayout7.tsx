import { motion } from '@repo/ui/motion';
import type { Restaurant, Dish, MenuCategory } from '@repo/types';
import Image from 'next/image';

export default function MagazineLayout7({ restaurant, dishes }: { restaurant: Restaurant; dishes: Dish[]; menuCategories: MenuCategory[]; }) {
  const cols = dishes.slice(0, 3);
  
  return (
    <motion.section 
      className="bg-[#F5F5F5] overflow-hidden shadow-sm mb-16 p-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="text-[11px] text-[#888] flex justify-between mb-3 uppercase tracking-wider">
        <span>menuboard</span>
        <span>Specialties</span>
      </div>
      
      {/* Main Title */}
      <h2 className="text-[40px] font-bold text-[#2C2C2C] text-center mb-2 tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
        {restaurant.name}
      </h2>
      <p className="text-[13px] text-[#666] text-center mb-10">
        {restaurant.description}
      </p>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {cols.map((dish, index) => (
          <motion.div
            key={dish.id}
            className="flex flex-col items-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            {/* Image Container - Vertical Rectangle */}
            <div className="w-full px-4 mb-4">
              <div className="relative overflow-hidden rounded-lg shadow-md" style={{ height: '380px' }}>
                <Image
                  src={dish.imageUrl}
                  alt={dish.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* Text Content on Beige Background */}
            <div 
              className="w-full px-6 py-8 text-center"
              style={{ backgroundColor: '#EAE0CC' }}
            >
              <h3 className="text-[18px] font-bold text-[#2C2C2C] mb-3 leading-tight">
                {dish.name}
              </h3>
              <p className="text-[13px] text-[#5A4A3A] leading-relaxed">
                {dish.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="text-[10px] text-[#999] text-right mt-8 uppercase tracking-wider">
        Gourmet Magazine · Page 36
      </div>
    </motion.section>
  );
}