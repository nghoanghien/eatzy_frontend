"use client";

import React, { useEffect, useRef } from "react";
import { useSocket, ChatMessageNotification } from "@repo/socket";
import { useCurrentOrders } from "@/features/orders/hooks/useCurrentOrders";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { sileo } from "@/components/DynamicIslandToast";

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Pleasant warm dual-tone notification sound (synthesized to avoid 404/network errors)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc1.frequency.exponentialRampToValueAtTime(880.00, ctx.currentTime + 0.1); // A5
    
    gain1.gain.setValueAtTime(0.12, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.4);
    
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.05); // D6
    
    gain2.gain.setValueAtTime(0.06, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.05);
    osc2.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn("Failed to play synthesized sound:", err);
  }
};

export function GlobalMessageSubscriber() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { connected, subscribe, unsubscribe } = useSocket();
  const { orders } = useCurrentOrders();
  
  // Track active subscriptions to avoid duplicates
  const subscribedDestinationsRef = useRef<Set<string>>(new Set());
  // Store orders in ref so the socket callback always has access to the latest list of orders (avoiding effect re-subscription cycle)
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  // Track pathname and search params in refs for the callback
  const routeRef = useRef({ pathname, orderIdParam: searchParams?.get("orderId") || null });
  routeRef.current = { pathname, orderIdParam: searchParams?.get("orderId") || null };

  useEffect(() => {
    if (!connected) {
      // Clear tracking if socket disconnected
      subscribedDestinationsRef.current.clear();
      return;
    }

    const currentOrderIds = new Set(orders.map((o) => o.id));
    const subscribedDestinations = subscribedDestinationsRef.current;

    // 1. Unsubscribe from completed or removed orders
    subscribedDestinations.forEach((dest) => {
      // Destination format is "/user/queue/chat/order/{orderId}"
      const match = dest.match(/\/user\/queue\/chat\/order\/(\d+)/);
      if (match) {
        const orderId = parseInt(match[1], 10);
        if (!currentOrderIds.has(orderId)) {
          unsubscribe(dest);
          subscribedDestinations.delete(dest);
          console.log(`🔌 GlobalMessageSubscriber: Unsubscribed from order chat ${orderId}`);
        }
      }
    });

    // 2. Subscribe to new active orders
    orders.forEach((order) => {
      const destination = `/user/queue/chat/order/${order.id}`;
      
      if (!subscribedDestinations.has(destination)) {
        subscribe(destination, (data: any) => {
          const msg = data as ChatMessageNotification;
          
          // Only trigger for incoming messages from drivers (not our own messages)
          if (msg && msg.senderType === "DRIVER") {
            const currentRoute = routeRef.current;
            const isViewingThisChat = 
              currentRoute.pathname === "/messages" && 
              currentRoute.orderIdParam === msg.orderId.toString();

            // If the user is not actively viewing this chat, show toast notification & sound
            if (!isViewingThisChat) {
              playNotificationSound();

              // Look up driver avatar from our cached orders list
              const matchedOrder = ordersRef.current.find((o) => o.id === msg.orderId);
              const avatarUrl = matchedOrder?.driver?.avatarUrl || undefined;

              sileo.success({
                actionType: "chat_message",
                title: msg.senderName || "Tài xế",
                description: msg.message,
                avatarUrl: avatarUrl,
                duration: 6000,
                onReply: () => {
                  router.push(`/messages?orderId=${msg.orderId}`);
                }
              });
            }
          }
        });
        
        subscribedDestinations.add(destination);
        console.log(`🔌 GlobalMessageSubscriber: Subscribed to order chat ${order.id}`);
      }
    });

    // Cleanup function when component unmounts or connection changes
    return () => {
      if (!connected) {
        subscribedDestinations.forEach((dest) => {
          unsubscribe(dest);
        });
        subscribedDestinations.clear();
      }
    };
  }, [connected, orders, subscribe, unsubscribe, router]);

  return null;
}
