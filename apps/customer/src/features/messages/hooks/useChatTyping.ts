import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '@repo/socket';

interface UseChatTypingProps {
  orderId: number | null;
  isDriverApp: boolean;
}

/**
 * Hook to manage typing status indicators for order-based chat messages.
 * Uses websocket subscriptions directly to prevent circular hook dependencies.
 */
export function useChatTyping({ orderId, isDriverApp }: UseChatTypingProps) {
  const [partnerIsTyping, setPartnerIsTyping] = useState(false);
  const { connected, subscribe, unsubscribe, publish } = useSocket();

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const partnerTypingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyTypingRef = useRef(false);

  // Send typing status via socket publishing
  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!connected || !orderId) return false;
    publish(`/app/typing/${orderId}`, {
      message: isTyping ? "TYPING" : "STOPPED"
    });
    return true;
  }, [connected, orderId, publish]);

  // Call this when the user types in the message input box
  const handleUserTyping = useCallback(() => {
    if (!orderId) return;

    if (!isCurrentlyTypingRef.current) {
      isCurrentlyTypingRef.current = true;
      sendTypingStatus(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isCurrentlyTypingRef.current = false;
      sendTypingStatus(false);
    }, 2000); // 2 seconds of inactivity triggers typing stopped indicator
  }, [orderId, sendTypingStatus]);

  // Subscribe to typing queue notifications
  useEffect(() => {
    if (!connected || !orderId) return;

    const typingDestination = `/user/queue/chat/order/${orderId}/typing`;
    const partnerType = isDriverApp ? "CUSTOMER" : "DRIVER";

    subscribe(typingDestination, (data: any) => {
      if (data && data.senderType === partnerType) {
        const isTyping = data.message === "TYPING";
        setPartnerIsTyping(isTyping);

        if (partnerTypingTimeoutRef.current) {
          clearTimeout(partnerTypingTimeoutRef.current);
        }

        // Safety fallback: auto-clear after 5s if partner disconnects
        if (isTyping) {
          partnerTypingTimeoutRef.current = setTimeout(() => {
            setPartnerIsTyping(false);
          }, 5000);
        }
      }
    });

    return () => {
      unsubscribe(typingDestination);
    };
  }, [connected, orderId, isDriverApp, subscribe, unsubscribe]);

  // Cleanup timers on destruction
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (partnerTypingTimeoutRef.current) clearTimeout(partnerTypingTimeoutRef.current);
    };
  }, []);

  return {
    partnerIsTyping,
    handleUserTyping
  };
}
