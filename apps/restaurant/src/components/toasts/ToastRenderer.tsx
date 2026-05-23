"use client";

import { motion } from "@repo/ui/motion";
import { AlertCircle, ShoppingCart, CheckCircle, Store } from "@repo/ui/icons";
import { SileoOptions } from "sileo";

export type ToastActionType =
  | "order_incoming"
  | "order_confirm_success"
  | "order_reject_success"
  | "error";

export interface ExtendedToastOptions extends SileoOptions {
  actionType?: ToastActionType;
}

export function renderCustomDescription(opts: ExtendedToastOptions) {
  if (!opts.actionType) return null;

  switch (opts.actionType) {
    case "error":
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

    case "order_incoming":
      return (
        <div className="flex flex-col w-full py-2 gap-5">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-14 h-14 rounded-[22px] overflow-hidden border-2 border-white/50 shrink-0"
            >
              <div className="w-full h-full bg-lime-500 flex items-center justify-center text-black">
                <ShoppingCart size={24} strokeWidth={3} />
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

    case "order_confirm_success":
      return (
        <div className="flex items-center gap-4 py-1">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-10 h-10 bg-lime-500 rounded-2xl flex items-center justify-center shadow-lg shadow-lime-500/30 overflow-hidden"
          >
            <CheckCircle className="relative w-5 h-5 text-black" />
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

    case "order_reject_success":
      return (
        <div className="flex items-center gap-4 py-1">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-10 h-10 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 overflow-hidden"
          >
            <Store className="relative w-5 h-5 text-white" />
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

    default:
      return null;
  }
}
