"use client";

import React, { useEffect, useRef } from "react";
import { useSocket, ChatMessageNotification } from "@repo/socket";
import { useQuery } from "@tanstack/react-query";
import { orderApi } from "@repo/api";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { sileo } from "@/components/DynamicIslandToast";

const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Pleasant warm dual-tone notification sound
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

  // Fetch active driver orders
  const { data: ordersData } = useQuery({
    queryKey: ["orders", "driver", "active"],
    queryFn: async () => {
      const ACTIVE_STATUSES = ["PREPARING", "DRIVER_ASSIGNED", "READY", "PICKED_UP", "ARRIVED"];
      const statusFilter = ACTIVE_STATUSES.map((s) => `orderStatus~'${s}'`).join(" or ");
      const response = await orderApi.getMyDriverOrders({
        filter: statusFilter,
      });
      return response.data;
    },
    enabled: connected,
    refetchInterval: 10000, // 10s background polling
  });

  const orders = ordersData?.result || [];

  // Track active subscriptions to avoid duplicates
  const subscribedDestinationsRef = useRef<Set<string>>(new Set());
  // Store orders in ref so the socket callback always has access to latest list of orders
  const ordersRef = useRef(orders);
  ordersRef.current = orders;

  // Track pathname and search params in refs for the callback
  const routeRef = useRef({ pathname, orderIdParam: searchParams?.get("orderId") || null });
  routeRef.current = { pathname, orderIdParam: searchParams?.get("orderId") || null };

  useEffect(() => {
    if (!connected) {
      subscribedDestinationsRef.current.clear();
      return;
    }

    const currentOrderIds = new Set(orders.map((o) => o.id));
    const subscribedDestinations = subscribedDestinationsRef.current;

    // 1. Unsubscribe from completed or removed orders
    subscribedDestinations.forEach((dest) => {
      const match = dest.match(/\/user\/queue\/chat\/order\/(\d+)/);
      if (match) {
        const orderId = parseInt(match[1], 10);
        if (!currentOrderIds.has(orderId)) {
          unsubscribe(dest);
          subscribedDestinations.delete(dest);
          console.log(`🔌 GlobalMessageSubscriber (Driver): Unsubscribed from order chat ${orderId}`);
        }
      }
    });

    // 2. Subscribe to new active orders
    orders.forEach((order) => {
      const destination = `/user/queue/chat/order/${order.id}`;
      
      if (!subscribedDestinations.has(destination)) {
        subscribe(destination, (data: any) => {
          const msg = data as ChatMessageNotification;
          
          // Only trigger for incoming messages from CUSTOMERS (not driver's own messages)
          if (msg && msg.senderType === "CUSTOMER") {
            const currentRoute = routeRef.current;
            const isViewingThisChat = 
              currentRoute.pathname === "/messages" && 
              currentRoute.orderIdParam === msg.orderId.toString();

            // If the driver is not actively viewing this chat, show toast notification & sound
            if (!isViewingThisChat) {
              playNotificationSound();

              // Look up customer avatar from our cached orders list
              const matchedOrder = ordersRef.current.find((o) => o.id === msg.orderId);
              const customer = matchedOrder?.customer as any;
              const avatarUrl = customer?.avatarUrl || customer?.avatar || undefined;

              sileo.success({
                actionType: "chat_message",
                title: msg.senderName || "Khách hàng",
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
        console.log(`🔌 GlobalMessageSubscriber (Driver): Subscribed to order chat ${order.id}`);
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
