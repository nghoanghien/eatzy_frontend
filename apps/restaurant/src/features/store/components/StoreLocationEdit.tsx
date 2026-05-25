import { useState, useEffect } from "react";
import { motion } from "@repo/ui/motion";
import { MapPin, X, Save, Navigation, Edit2 } from "@repo/ui/icons";
import { useSwipeConfirmation } from "@repo/ui";
import { sileo } from "@/components/DynamicIslandToast";
import StoreLocationMap from "./StoreLocationMap";

interface StoreLocationEditProps {
  store: { address: string; coords: { lat: number; lng: number };[key: string]: unknown };
  onSave: (updates: Partial<{ address: string; coords: { lat: number; lng: number } }>) => Promise<void>;
  onClose: () => void;
  layoutId?: string;
  isMobile?: boolean;
}

export default function StoreLocationEdit({ store, onSave, onClose, layoutId, isMobile = false }: StoreLocationEditProps) {
  const [address, setAddress] = useState(store.address);
  const [coords, setCoords] = useState(store.coords);
  const { confirm } = useSwipeConfirmation();

  const handleSave = () => {
    const updates: any = {};
    if (address !== store.address) updates.address = address;
    if (coords.lat !== store.coords.lat || coords.lng !== store.coords.lng) {
      updates.coords = coords;
    }

    if (Object.keys(updates).length === 0) {
      sileo.error({
        title: 'No changes made!',
        description: 'Check your changes and try again!',
      });
      return;
    }

    confirm({
      title: 'Update location',
      description: 'The store address and coordinates will be updated.',
      type: 'info',
      confirmText: 'Save changes',
      onConfirm: async () => {
        await onSave(updates);
      }
    });
  };

  const animProps = isMobile ? {
    initial: { y: "100%" },
    animate: { y: 0 },
    exit: { y: "100%" },
    transition: { type: "spring", damping: 20, stiffness: 120 }
  } : {
    initial: { opacity: 0, scale: 0.9, y: 30 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: 30 },
    transition: { type: "spring", damping: 25, stiffness: 200 }
  };

  return (
    <motion.div
      {...animProps}
      className={
        isMobile
          ? "bg-white w-full rounded-t-[32px] p-5 pb-10 shadow-2xl overflow-hidden flex flex-col h-[90vh] max-h-[90vh] fixed bottom-0 left-0 right-0 z-[210]"
          : "bg-white w-[800px] max-w-full rounded-[32px] p-8 shadow-2xl relative overflow-hidden flex flex-col h-[90vh]"
      }
    >
      <div className="flex items-center justify-between mb-4 sm:mb-6 shrink-0">
        <h2 className="text-xl sm:text-3xl font-anton font-bold text-[#1A1A1A] flex items-center gap-2 sm:gap-3">
          <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${isMobile ? 'bg-[#1A1A1A] text-white' : 'bg-emerald-50 text-emerald-600'}`}>
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          {isMobile ? 'Edit Location' : 'EDIT LOCATION'}
        </h2>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={handleSave}
            className="p-3 sm:p-4 rounded-full font-bold bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-[var(--primary)] hover:text-white transition-all shadow-sm"
          >
            <Save className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-3 sm:p-4 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col h-full gap-4 sm:gap-6 overflow-hidden">
        {/* Address Input */}
        <div className="shrink-0">
          <label className={isMobile ? "block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2" : "block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2"}>
            Address
          </label>
          <div className="relative">
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className={isMobile
                ? "w-full text-base font-bold text-[#1A1A1A] p-3.5 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 focus:border-[var(--primary)] focus:border-solid focus:bg-white outline-none transition-all"
                : "w-full text-base sm:text-lg font-medium p-3.5 sm:p-4 pr-12 bg-gray-50 rounded-2xl md:rounded-xl border-2 border-dashed border-gray-300 focus:border-[var(--primary)] focus:border-solid focus:bg-white outline-none transition-all"}
              placeholder="Enter full address..."
            />
            <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative rounded-3xl overflow-hidden border-2 border-gray-100">
          <StoreLocationMap
            coords={coords}
            isEditing={true}
            onCoordsChange={setCoords}
          />
          <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 bg-white/70 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl border border-white shadow-lg text-[11px] sm:text-sm font-semibold text-gray-700 flex items-center gap-2 z-10">
            <Navigation className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
            <span>Drag the pin on the map to update the exact coordinates.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
