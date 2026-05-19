"use client";

import { Check } from "@repo/ui";
import { motion } from "@repo/ui/motion";
import { AlertCircle, Store, Bike, ChevronRight, Trash2, Wallet, User } from "lucide-react";
import { SileoOptions } from "sileo";

export type ToastActionType =
  | "order_cancel"
  | "order_place"
  | "profile_update_success"
  | "profile_update_error"
  | "wallet_deposit_success"
  | "wallet_withdraw_success"
  | "chat_message"
  | "error";

export interface ExtendedToastOptions extends SileoOptions {
  actionType?: ToastActionType;
  avatarUrl?: string;
  onViewOrder?: () => void;
  onReply?: () => void;
  dishOptions?: string[];
}

export function renderCustomDescription(opts: ExtendedToastOptions) {
  if (!opts.actionType) return null;

  switch (opts.actionType) {
    case "error":
    case "profile_update_error":
      return (
        <div className="flex items-start gap-4 py-1">
          <motion.div
            animate={{ x: [-4, 4, -4, 4, 0] }}
            transition={{ duration: 0.4 }}
            className="w-10 h-10 bg-danger/20 rounded-2xl flex items-center justify-center border border-danger/30 shrink-0"
          >
            <AlertCircle className="w-6 h-6 text-danger" />
          </motion.div>
          <div className="flex flex-col flex-1 text-left">
            <span className="font-bold text-[15px] leading-tight text-danger mb-0.5">
              Operation failed
            </span>
            <span className="text-white/40 text-[12px] leading-snug">
              {String(opts.description || opts.title)}
            </span>
          </div>
        </div>
      );

    case "order_place":
      return (
        <div className="flex flex-col w-full py-2 gap-5">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-[22px] overflow-hidden border-2 border-white/50 shrink-0"
            >
              <div className="w-full h-full bg-lime-500 flex items-center justify-center text-black">
                <Bike size={24} strokeWidth={3} />
              </div>
            </motion.div>

            <div className="flex-1 min-w-0">
              <h4 className="text-white font-anton font-bold text-[19px] leading-tight truncate uppercase">
                {opts.title || "New Order!"}
              </h4>
              <p className="text-white/60 text-[13px] mt-1 font-medium italic">
                Tap to view details now
              </p>
            </div>
          </div>
        </div>
      );

    case "wallet_deposit_success":
    case "wallet_withdraw_success":
      return (
        <div className="flex items-center gap-4 py-1">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-10 h-10 bg-lime-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-500/30 overflow-hidden"
          >
            <Wallet className="relative w-5 h-5 text-black fill-black" />
          </motion.div>
          <div className="flex flex-col text-left">
            <span className="text-white font-anton font-bold text-[17px] leading-tight uppercase tracking-wide">
              {opts.title}
            </span>
            <span className="text-white/40 text-[12px]">
              {String(opts.description)}
            </span>
          </div>
        </div>
      );

    case "profile_update_success":
      return (
        <div className="flex items-center gap-4 py-1">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-12 h-12 shrink-0 shadow-xl shadow-lime-500/20"
          >
            <div className="absolute inset-x-0 bottom-0 top-1/2 bg-lime-500/10 blur-xl rounded-full" />
            <img
              src={opts.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"}
              alt="Avatar"
              className="relative w-full h-full object-cover rounded-2xl border-2 border-white"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-lime-500 text-black rounded-full flex items-center justify-center border-2 border-slate-900 shadow-lg"
            >
              <Check size={10} strokeWidth={4} />
            </motion.div>
          </motion.div>
          <div className="flex flex-col text-left gap-1">
            <h4 className="text-white font-semibold text-[15px] leading-tight">
              {opts.title || "Updated Successfully"}
            </h4>
            <p className="text-white/50 text-[12px] font-medium leading-snug">
              {String(opts.description || "Your information has been saved")}
            </p>
          </div>
        </div>
      );

    case "chat_message":
      return (
        <div className="flex flex-col w-full py-2 gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 shrink-0 bg-white/10 flex items-center justify-center"
            >
              {opts.avatarUrl ? (
                <img
                  src={opts.avatarUrl}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </motion.div>

            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-bold text-[15px] leading-tight truncate">
                  {opts.title || "Khách hàng"}
                </h4>
                <span className="text-[10px] text-white/40 font-semibold bg-white/5 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Tin nhắn mới
                </span>
              </div>
              <p className="text-white/80 text-[13px] mt-1 font-medium line-clamp-2">
                {String(opts.description)}
              </p>
            </div>
          </div>

          <div className="flex gap-2 mt-1">
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                opts.onReply?.();
                // Close the toast
                const clearBtn = document.querySelector('[data-sileo-clear]');
                if (clearBtn) (clearBtn as HTMLElement).click();
              }}
              className="flex-1 py-2.5 rounded-xl bg-white/10 border border-white/5 text-white font-bold text-xs transition-all hover:bg-white/20"
            >
              Trả lời
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // Just dismiss
                const clearBtn = document.querySelector('[data-sileo-clear]');
                if (clearBtn) (clearBtn as HTMLElement).click();
              }}
              className="px-4 py-2.5 rounded-xl bg-transparent text-white/50 font-bold text-xs transition-all hover:text-white"
            >
              Bỏ qua
            </motion.button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
