import { motion } from "@repo/ui/motion";
import { MapPin, Edit2 } from "@repo/ui/icons";
import StoreLocationMap from "./StoreLocationMap";

interface StoreLocationProps {
  store: { address: string; coords: { lat: number; lng: number };[key: string]: unknown };
  onEdit: () => void;
  layoutId?: string;
  isMobile?: boolean;
}

export default function StoreLocation({ store, onEdit, layoutId, isMobile }: StoreLocationProps) {
  if (isMobile) {
    return (
      <motion.div
        layoutId={layoutId}
        className="bg-gray-200/60 rounded-[32px] p-5 border-none shadow-none flex flex-col h-full relative group gap-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#1A1A1A] flex items-center gap-2 tracking-tight">
            <div className="w-8 h-8 rounded-full bg-[#1A1A1A] text-white flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            Location & Address
          </h2>

          <motion.button
            onClick={onEdit}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-white text-[#1A1A1A] font-bold text-sm flex items-center justify-center transition-all shadow-sm border border-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </motion.button>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Address</label>
            <div className="text-sm font-bold text-[#1A1A1A] leading-relaxed">{store.address}</div>
          </div>

          <div className="h-[220px] w-full relative rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm">
            <StoreLocationMap
              coords={store.coords}
              isEditing={false}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layoutId={layoutId}
      className="bg-white rounded-[28px] sm:rounded-[32px] p-4 sm:p-8 shadow-sm border-2 border-gray-200 flex flex-col h-full relative group"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-2xl font-anton font-bold text-[#1A1A1A] flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          LOCATION & ADDRESS
        </h2>

        <motion.button
          onClick={onEdit}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 sm:p-4 rounded-full bg-gray-100 text-gray-400 font-bold text-sm flex items-center gap-2 hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
        >
          <Edit2 className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Address</label>
          <div className="text-base font-medium text-[#1A1A1A] leading-relaxed">{store.address}</div>
        </div>

        <div className="h-[220px] sm:h-[400px] w-full relative rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
          <StoreLocationMap
            coords={store.coords}
            isEditing={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
