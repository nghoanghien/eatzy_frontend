import React, { useState, useEffect, useLayoutEffect, useRef, useMemo, Fragment } from 'react';
import { motion, AnimatePresence } from '@repo/ui/motion';
import { ChatSession, ChatMessage } from '../data/mockMessages';
import { ChevronLeft, Send, BadgeCheck, Utensils, Info, Clock, ExternalLink, ArrowLeft, Store, ChevronRight, AlertCircle, MessageSquare } from '@repo/ui/icons';
import Image from 'next/image';
import { ImageWithFallback } from '@repo/ui';
import { formatVnd } from '@repo/lib';
import CurrentOrderCard from '@/features/orders/components/CurrentOrderCard';
import type { OrderResponse } from '@repo/types';
import { StickyOrderHeaderCard } from './StickyOrderHeaderCard';
import { mapToOrderResponse } from '../utils';
import MessageDetailShimmer from './MessageDetailShimmer';
import { useChatSession } from '../hooks/useChatSession';
import { EmptyState } from '@/components/ui/EmptyState';

import patternBg from '@repo/ui/assets/placeholders/background_pattern_light.jpg';

interface MessageDetailProps {
  chat: ChatSession;
  onBack: () => void;
  isMobile: boolean;
}

/**
 * MessageDetail Component
 * High-fidelity redesign mirrored 100% from the customer app.
 * Features Telegram-style bubbles, sticky order context, and smooth staggered animations.
 */
export default function MessageDetail({ chat, onBack, isMobile }: MessageDetailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const orderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTimeId, setShowTimeId] = useState<string | null>(null);

  const [stickyOrder, setStickyOrder] = useState<any>(null);
  const [inputText, setInputText] = useState("");

  const initialUnreadCount = useRef(chat.unreadCount || 0);
  const hasScrolledToUnread = useRef(false);
  const firstUnreadRef = useRef<HTMLDivElement | null>(null);
  const [showScrollDownBtn, setShowScrollDownBtn] = useState(false);
  const [unreadBelowCount, setUnreadBelowCount] = useState(0);

  const {
    localMessages,
    isLoading,
    isError,
    stickyOrder: apiStickyOrder,
    sendMessage,
    refetch,
    orderId,
    handleUserTyping,
    partnerIsTyping
  } = useChatSession({
    chatId: chat.id,
    initialMessages: chat.messages,
    isDriverApp: true
  });

  // Auto-resize textarea
  useLayoutEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(48, Math.min(scrollHeight, 120))}px`;
    }
  }, [inputText]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    handleImmediateScroll();
  };

  // Scroll to bottom helper
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // Immediate smooth scroll to bottom after state update (when sending)
  const handleImmediateScroll = () => {
    setTimeout(scrollToBottom, 100);
  };

  // Scroll to bottom on mount ONLY when there are no unread messages
  useLayoutEffect(() => {
    if (scrollRef.current && !isLoading && initialUnreadCount.current === 0) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages, isLoading]);

  // Scroll to first unread message such that it is positioned 2/3 of viewport from the top
  useEffect(() => {
    if (!isLoading && localMessages.length > 0 && initialUnreadCount.current > 0 && !hasScrolledToUnread.current) {
      hasScrolledToUnread.current = true;
      setTimeout(() => {
        const element = firstUnreadRef.current;
        const container = scrollRef.current;
        if (element && container) {
          const containerHeight = container.clientHeight;
          const elementOffsetTop = element.offsetTop;
          const targetScrollTop = elementOffsetTop - (containerHeight * 2 / 3);
          container.scrollTo({
            top: targetScrollTop,
            behavior: 'auto'
          });
        }
      }, 100);
    }
  }, [isLoading, localMessages]);

  // Track scroll position to show/hide floating down button and calculate unread count below viewport
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isFar = scrollHeight - scrollTop - clientHeight > 300;
      setShowScrollDownBtn(isFar);

      if (initialUnreadCount.current > 0) {
        let below = 0;
        const msgList = localMessages;
        const totalUnread = initialUnreadCount.current;
        const unreadStartIndex = msgList.length - totalUnread;

        for (let i = unreadStartIndex; i < msgList.length; i++) {
          const msg = msgList[i];
          const el = document.getElementById(`msg-container-${msg.id}`);
          if (el) {
            if (el.offsetTop > scrollTop + clientHeight - 40) {
              below++;
            }
          } else {
            below = totalUnread;
          }
        }
        setUnreadBelowCount(below);
      } else {
        setUnreadBelowCount(0);
      }
    };

    container.addEventListener('scroll', onScroll);
    setTimeout(onScroll, 200);

    return () => container.removeEventListener('scroll', onScroll);
  }, [localMessages, isLoading]);

  useEffect(() => {
    if (apiStickyOrder) {
      setStickyOrder(apiStickyOrder);
    } else {
      const lastMsgWithCard = [...localMessages].reverse().find(m => m.orderCard);
      if (lastMsgWithCard && lastMsgWithCard.orderCard) {
        setStickyOrder(lastMsgWithCard.orderCard);
      }
    }
  }, [apiStickyOrder, localMessages]);

  return (
    <div className="flex flex-col h-full bg-[#F8F9FA] overflow-hidden relative">
      {/* Header with Integrated Sticky Order */}
      <div className="absolute top-0 inset-x-0 z-30 bg-[#F7F7F7]/70 backdrop-blur-sm rounded-b-[36px] md:rounded-b-[36px] shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-300">
        {/* Main Header Row */}
        <div className="px-3 py-3 md:px-4 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            {isMobile && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onBack}
                className="w-10 h-10 rounded-full bg-white/60 shadow-sm border border-gray-100 flex items-center justify-center text-gray-700 font-bold shrink-0"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              </motion.button>
            )}

            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 rounded-[18px] overflow-hidden shrink-0 bg-gray-100 ring-2 ring-white shadow-sm">
                <ImageWithFallback
                  src={chat.partnerAvatar || ""}
                  alt={chat.partnerName}
                  fill
                  placeholderMode="horizontal"
                  className="object-cover"
                  sizes="44px"
                />
              </div>

              <div className="flex flex-col min-w-0">
                <h3 className="font-bold text-gray-700 text-lg truncate leading-tight tracking-tight">
                  {chat.partnerName}
                </h3>
                <div className="text-xs font-medium text-gray-500 mt-0.5 flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${chat.type === 'system' ? 'bg-blue-400' : 'bg-lime-500'}`} />
                  <p className="truncate shrink-0">{chat.type === 'system' ? 'Eatzy Official' : 'Assigned Driver'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0 ml-4 flex items-center gap-3">
            <AnimatePresence>
              {!isMobile && stickyOrder && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-[280px]"
                >
                  <StickyOrderHeaderCard order={stickyOrder} compact />
                </motion.div>
              )}
            </AnimatePresence>
            <button className="w-10 h-10 rounded-full bg-white/60 shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
              <Info className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sticky Order Slot inside Header (Mobile Only) */}
        <AnimatePresence>
          {isMobile && stickyOrder && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <StickyOrderHeaderCard order={stickyOrder} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Messages Area Container */}
      <div className="flex-1 relative overflow-hidden bg-[#F9FAFB]">
        {/* Subtle Pattern Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-[0.32] pointer-events-none"
          style={{
            backgroundImage: `url(${patternBg.src || patternBg})`,
            backgroundRepeat: 'repeat',
            backgroundSize: '360px',
            backgroundAttachment: 'fixed'
          }}
        />

        {/* Messages List Area */}
        <div
          ref={scrollRef}
          className={`h-full overflow-y-auto no-scrollbar px-3 relative z-10 transition-all duration-300 ${isMobile
            ? (stickyOrder ? 'pt-[175px]' : 'pt-20')
            : (stickyOrder ? 'pt-[105px]' : 'pt-24')
            } pb-20`}
        >
          <AnimatePresence mode="wait">
            {isError ? (
              <div key="error-state" className="flex flex-col items-center justify-center min-h-[350px] py-12 px-6">
                <EmptyState
                  icon={AlertCircle}
                  title="Failed to Load Chat"
                  description="We couldn't retrieve the message history for this order. Please check your connection and try again."
                  buttonText="Retry"
                  onButtonClick={refetch}
                />
              </div>
            ) : isLoading ? (
              <MessageDetailShimmer key="loading-shimmer" isMobile={isMobile} />
            ) : localMessages.length === 0 ? (
              <div key="empty-state" className="flex flex-col items-center justify-center min-h-[350px] py-12 px-6">
                <EmptyState
                  icon={MessageSquare}
                  title="No messages yet"
                  description="Start the conversation by sending a message to your customer."
                />
              </div>
            ) : (
              <div key="messages-list" className="contents">
                {localMessages.map((msg, idx) => {
                  const isSystemMsg = msg.senderId === 'system_auto' || msg.senderId === 'eatzy_system' || msg.senderId === 'eatzy_promos';

                  // Telegram Style Date Separator Logic
                  const currentDate = new Date(msg.timestamp);
                  const prevMsg = idx > 0 ? localMessages[idx - 1] : null;
                  const prevDate = prevMsg ? new Date(prevMsg.timestamp) : null;

                  const isNewDay = !prevDate ||
                    currentDate.getDate() !== prevDate.getDate() ||
                    currentDate.getMonth() !== prevDate.getMonth() ||
                    currentDate.getFullYear() !== prevDate.getFullYear();

                  const isSamePersonPrev = prevMsg?.senderId === msg.senderId;
                  const isWithinOneMinutePrev = prevDate && (currentDate.getTime() - prevDate.getTime() < 60000);
                  const isSameGroupPrev = isSamePersonPrev && isWithinOneMinutePrev && !isNewDay;

                  const nextMsg = idx < localMessages.length - 1 ? localMessages[idx + 1] : null;
                  const isSamePersonNext = nextMsg?.senderId === msg.senderId;
                  const nextDate = nextMsg ? new Date(nextMsg.timestamp) : null;
                  const isWithinOneMinuteNext = nextDate && (nextDate.getTime() - currentDate.getTime() < 60000);

                  // Check if next message would start a new day
                  const isNextNewDay = nextDate && (
                    nextDate.getDate() !== currentDate.getDate() ||
                    nextDate.getMonth() !== currentDate.getMonth() ||
                    nextDate.getFullYear() !== currentDate.getFullYear()
                  );

                  const isSameGroupNext = isSamePersonNext && isWithinOneMinuteNext && !isNextNewDay;
                  const isFirstUnread = initialUnreadCount.current > 0 && idx === localMessages.length - initialUnreadCount.current;

                  const getDateLabel = (date: Date) => {
                    const today = new Date();
                    const yesterday = new Date();
                    yesterday.setDate(today.getDate() - 1);

                    if (date.toDateString() === today.toDateString()) return 'Today';
                    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

                    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
                  };

                  return (
                    <div
                      key={msg.id}
                      id={`msg-container-${msg.id}`}
                      className={`flex flex-col gap-1 ${isSameGroupNext ? 'mb-1' : 'mb-5'}`}
                    >
                      <Fragment>
                        {isNewDay && (
                          <div className={`flex justify-center my-6 sticky z-20 transition-all duration-300 ${(stickyOrder && isMobile) ? 'top-[15px]' : 'top-[0px]'
                            }`}>
                            <div className="bg-gray-100/60 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)] border-2 border-white/40">
                              <span className="text-[13px] font-bold text-gray-500 tracking-tight">
                                {getDateLabel(currentDate)}
                              </span>
                            </div>
                          </div>
                        )}

                        {isFirstUnread && (
                          <div ref={firstUnreadRef} className="flex items-center justify-center my-6 sticky z-20">
                            <div className="bg-amber-100/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-amber-200 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span className="text-[12px] font-bold text-amber-800 tracking-tight uppercase">
                                Tin nhắn chưa đọc
                              </span>
                            </div>
                          </div>
                        )}


                        {/* Message Bubble (Telegram Style) */}
                        <div className={`flex items-end gap-3 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                          {/* Loading Status Left of Bubble */}
                          <AnimatePresence>
                            {msg.isMe && (msg as any).status === 'sending' && (
                              <motion.div
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex items-center gap-2 mb-1.5"
                              >
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
                                <span className="text-[14px] leading-snug tracking-tight font-semibold text-gray-400">Sending...</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.3, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 250,
                              damping: 25,
                              mass: 1,
                              delay: (localMessages.length - 1 - idx) * 0.08
                            }}
                            style={{ transformOrigin: msg.isMe ? 'bottom right' : 'bottom left' }}
                            onClick={() => setShowTimeId(showTimeId === msg.id ? null : msg.id)}
                            className={`relative px-3 py-2 cursor-pointer max-w-[76%] md:max-w-[72%] ${msg.isMe
                              ? `bg-primary/60 backdrop-blur-sm text-white rounded-[24px] shadow-[0_0_24px_rgba(0,0,0,0.18)] ${!isSameGroupPrev ? 'rounded-br-[8px]' : (!isSameGroupNext ? 'rounded-tr-[8px]' : 'rounded-r-[8px]')
                              }`
                              : `bg-white/50 backdrop-blur-sm text-gray-800 rounded-[24px] border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.12)] ${!isSameGroupPrev ? 'rounded-bl-[8px]' : (!isSameGroupNext ? 'rounded-tl-[8px]' : 'rounded-l-[8px]')
                              }`
                              }`}
                          >
                            <p className="text-[15px] leading-snug tracking-tight font-normal">
                              {msg.text}
                            </p>

                            <AnimatePresence>
                              {showTimeId === msg.id && (
                                <motion.div
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 5 }}
                                  transition={{ duration: 0.2 }}
                                  className={`flex items-center gap-1 mt-1 opacity-60 justify-end`}
                                >
                                  <span className={`text-[9px] font-bold tabular-nums ${msg.isMe ? 'text-white/80' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        </div>

                        {/* Official CurrentOrderCard Integrated 100% */}
                        {msg.orderCard && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.3, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 250,
                              damping: 25,
                              mass: 1,
                              delay: (localMessages.length - 1 - idx) * 0.05
                            }}
                            style={{ transformOrigin: msg.isMe ? 'bottom right' : 'bottom left' }}
                            ref={el => { orderRefs.current[msg.id] = el }}
                            className={`w-full flex ${msg.isMe ? 'justify-end' : 'justify-start'} mb-5`}
                          >
                            <div className="w-full md:max-w-[400px]">
                              <CurrentOrderCard
                                order={mapToOrderResponse(msg.orderCard)}
                                onClick={() => { }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </Fragment>
                    </div>
                  );
                })}
                {partnerIsTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.8 }}
                    className="flex items-center gap-2 mb-4 self-start bg-white/50 backdrop-blur-sm px-4 py-3 rounded-[24px] border-2 border-white shadow-[0_0_20px_rgba(0,0,0,0.12)] rounded-bl-[8px]"
                  >
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-[11px] font-bold text-gray-500 tracking-tight uppercase pt-0.5">
                      {chat.partnerName} đang soạn tin...
                    </span>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        layout
        initial={false}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 38,
          mass: 1
        }}
        className="absolute bottom-0 inset-x-0 z-20 p-3 bg-[#F7F7F7]/70 backdrop-blur-sm rounded-t-[36px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      >
        {chat.type === 'system' ? (
          <div className="flex items-center justify-center gap-3 p-4 bg-white/50 border-2 border-white rounded-[24px] text-gray-400 shadow-[inset_0_0_20px_rgba(0,0,0,0.06)]">
            <Info className="w-5 h-5 shrink-0" />
            <p className="text-[13px] font-bold uppercase tracking-tight leading-none pt-0.5">Official Eatzy Communication Channel</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto relative flex items-end px-0">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                handleUserTyping();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message here"
              className="w-full min-h-[48px] py-[13px] pl-4 pr-12 bg-white/60 border border-white rounded-[24px] shadow-[inset_0_0_18px_rgba(0,0,0,0.08)] outline-none focus:outline-none focus:ring-0 focus:border-white transition-colors text-[15px] leading-snug tracking-tight font-normal text-gray-800 resize-none overflow-y-auto no-scrollbar"
              rows={1}
            />
            <button
              onClick={handleSend}
              className="absolute right-5 bottom-3.5 text-gray-900 hover:scale-110 active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </motion.div>

      {/* Floating Scroll to Bottom / Unread Badge */}
      <AnimatePresence>
        {showScrollDownBtn && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            className="absolute bottom-24 right-6 z-30"
          >
            <button
              onClick={scrollToBottom}
              className="relative w-12 h-12 rounded-full bg-white text-gray-700 shadow-[0_4px_16px_rgba(0,0,0,0.15)] border border-gray-100 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all group"
            >
              {/* Chevron Down Icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 text-gray-600 group-hover:translate-y-0.5 transition-transform"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>

              {/* Unread badge count below scroll viewport */}
              {unreadBelowCount > 0 && (
                <span className="absolute -top-2 -left-2 min-w-[20px] h-[20px] px-1.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center border border-white shadow-sm animate-pulse">
                  {unreadBelowCount}
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
