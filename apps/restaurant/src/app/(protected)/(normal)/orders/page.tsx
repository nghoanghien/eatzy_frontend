'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from '@repo/ui/motion';
import { useLoading, OrderCardShimmer, HistoryCardShimmer, useSwipeConfirmation, useNotification } from '@repo/ui';
import { ClipboardList, ChefHat, Bike, Power, Loader2 } from '@repo/ui/icons';
import type { Order } from '@repo/types';
import { orderApi } from '@repo/api';
import OrderCard from '@/components/OrderCard';
import OrderDrawer from '@/components/OrderDrawer';
import MobileOrderDrawer from '@/components/MobileOrderDrawer';
import { EmptyState } from '@/components/ui/EmptyState';
import '@repo/ui/styles/scrollbar.css';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRestaurantOrders } from '@/features/orders/hooks/useRestaurantOrders';
import { useRestaurantStatus } from '@/features/store/hooks/useRestaurantStatus';

export default function OrdersPage() {
  const { user } = useAuth();
  const { confirm } = useSwipeConfirmation();
  const { showNotification } = useNotification();
  const { hide } = useLoading();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<'pending' | 'inprogress' | 'waiting'>('pending');
  const [isMobile, setIsMobile] = useState(false);

  // Restaurant status management
  const {
    isOpen: isAppActive,
    isLoading: isStatusLoading,
    isUpdating: isStatusUpdating,
    toggleStatus,
  } = useRestaurantStatus();

  // Fetch orders from API
  const {
    pendingOrders,
    inProgressOrders,
    waitingForDriverOrders,
    orders,
    isLoading,
    refetch,
    acceptOrder,
    rejectOrder,
    markAsReady,
    isActionLoading,
  } = useRestaurantOrders();

  // Sync selectedOrder with fresh data from orders list
  useEffect(() => {
    if (selectedOrder) {
      const freshOrder = orders.find(o => o.id === selectedOrder.id);
      if (freshOrder && JSON.stringify(freshOrder) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(freshOrder);
      }
    }
  }, [orders, selectedOrder]);

  useEffect(() => {
    hide();
  }, [hide]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleApp = () => {
    const newStatus = !isAppActive;
    confirm({
      title: newStatus ? 'Activate App' : 'Deactivate App',
      description: newStatus
        ? 'Activate the app to receive new orders from customers.'
        : 'Deactivating will stop receiving new orders. Are you sure?',
      confirmText: newStatus ? 'Activate' : 'Deactivate',
      onConfirm: async () => {
        await toggleStatus();
        // Refetch orders after status change
        await refetch();
      }
    });
  };

  const handleOpenOrder = (order: Order) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    // Don't clear selectedOrder immediately, let AnimatePresence handle exit
    setTimeout(() => setSelectedOrder(null), 300);
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      const response = await acceptOrder(orderId);

      if (response.statusCode === 200) {
        showNotification({
          message: 'Order confirmed!',
          type: 'success',
          autoHideDuration: 3000
        });
        handleCloseDrawer();
      } else {
        throw new Error(response.message || 'Failed to confirm order');
      }
    } catch (error: any) {
      showNotification({
        message: 'Order confirmation error',
        format: error?.message || 'Please check your connection or try again later.',
        type: 'error',
        autoHideDuration: 5000
      });
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    try {
      const response = await rejectOrder(orderId, reason);

      if (response.statusCode === 200) {
        showNotification({
          message: 'Order rejected!',
          type: 'success',
          autoHideDuration: 3000
        });
        handleCloseDrawer();
      } else {
        throw new Error(response.message || 'Failed to reject order');
      }
    } catch (error: any) {
      showNotification({
        message: 'Order rejection error',
        format: error?.message || 'Please check your connection or try again later.',
        type: 'error',
        autoHideDuration: 5000
      });
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    try {
      const response = await markAsReady(orderId);

      if (response.statusCode === 200) {
        showNotification({
          message: 'Order is ready for delivery!',
          type: 'success',
          autoHideDuration: 3000
        });
        handleCloseDrawer();
      } else {
        throw new Error(response.message || 'Failed to complete order');
      }
    } catch (error: any) {
      showNotification({
        message: 'Order status error',
        format: error?.message || 'Please check your connection or try again later.',
        type: 'error',
        autoHideDuration: 5000
      });
    }
  };

  // Combine loading states for shimmer display
  const showLoading = isLoading || isActionLoading;

  return (

    <>
      <div className="flex flex-col h-full bg-[#F7F7F7] md:bg-[#F8F9FA]">
        {/* Header - Premium Design */}
        <div className="px-6 pt-4 md:px-8 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="hidden md:flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-lg bg-lime-100 text-lime-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ClipboardList size={12} />
                  Live Orders
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-anton font-bold text-gray-900 uppercase tracking-tight">
                CURRENT ORDERS
              </h1>
            </div>
            <motion.button
              whileHover={isStatusUpdating || isStatusLoading ? {} : { scale: 1.02 }}
              whileTap={isStatusUpdating || isStatusLoading ? {} : { scale: 0.98 }}
              onClick={handleToggleApp}
              disabled={isStatusUpdating || isStatusLoading}
              className={`flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3.5 rounded-2xl font-bold transition-all duration-300 text-sm md:text-base ${isStatusUpdating || isStatusLoading
                ? 'bg-gray-100 text-gray-400 border-2 border-gray-200 cursor-not-allowed'
                : isAppActive
                  ? 'bg-primary text-white shadow-md md:shadow-xl md:shadow-primary/30'
                  : 'bg-gray-100 text-gray-500 border-2 border-gray-200'
                }`}
            >
              {isStatusUpdating || isStatusLoading ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 md:w-5 md:h-5" />
                  <span>{isAppActive ? 'Open' : 'Closed'}</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Tab Control */}
        <div className="md:hidden px-3 pb-2 pt-4 shrink-0">
          <div className="flex bg-slate-50 rounded-3xl p-1 border-2 border-white shadow-[inset_0_0_20px_rgba(0,0,0,0.09)] relative">
            <button
              onClick={() => setMobileTab('pending')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-2xl transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 ${mobileTab === 'pending' ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-gray-400 font-medium'
                }`}
            >
              <span>Pending</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-sans font-black ${mobileTab === 'pending' ? 'bg-yellow-400 text-black' : 'bg-gray-100 text-gray-500'
                }`}>{pendingOrders.length}
              </span>
            </button>
            <button
              onClick={() => setMobileTab('inprogress')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-2xl transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 ${mobileTab === 'inprogress' ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-gray-400 font-medium'
                }`}
            >
              <span>In Progress</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-sans font-black ${mobileTab === 'inprogress' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{inProgressOrders.length}</span>
            </button>
            <button
              onClick={() => setMobileTab('waiting')}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-2xl transition-all duration-300 relative z-10 flex items-center justify-center gap-1.5 ${mobileTab === 'waiting' ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-gray-400 font-medium'
                }`}
            >
              <span>Waiting</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-sans font-black ${mobileTab === 'waiting' ? 'bg-lime-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>{waitingForDriverOrders.length}</span>
            </button>
          </div>
        </div>

        {/* Desktop 3 Column Layout */}
        <div className="hidden md:grid grid-cols-3 gap-0 px-6 py-6 flex-1 min-h-0">
          {/* Column 1: Pending Confirmation */}
          <div className="flex flex-col h-full min-h-0 px-3">
            <div className="mb-5 flex items-center justify-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-2xl border-2 border-yellow-200 shadow-sm">
                <h3 className="text-base font-anton font-black text-[#1A1A1A]">
                  PENDING
                </h3>
                <div className="w-7 h-7 rounded-xl bg-yellow-500 flex items-center justify-center shadow-md shadow-yellow-500/30">
                  <span className="text-xs font-bold text-white">{pendingOrders.length}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="space-y-4 py-2 px-1">
                {showLoading ? (
                  <OrderCardShimmer cardCount={2} />
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {pendingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onClick={() => handleOpenOrder(order)}
                        />
                      ))}
                    </AnimatePresence>
                    {pendingOrders.length === 0 && (
                      <EmptyState
                        icon={ClipboardList}
                        title="No pending orders"
                        description="New orders from customers will appear here for confirmation."
                        className="py-16 md:py-24"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="flex flex-col h-full min-h-0 px-3">
            <div className="mb-5 flex items-center justify-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-2xl border-2 border-blue-200 shadow-sm">
                <h3 className="text-base font-anton font-bold text-[#1A1A1A]">
                  IN PROGRESS
                </h3>
                <div className="w-7 h-7 rounded-xl bg-blue-500 flex items-center justify-center shadow-md shadow-blue-500/30">
                  <span className="text-xs font-bold text-white">{showLoading ? '-' : inProgressOrders.length}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="space-y-4 py-2 px-1">
                {showLoading ? (
                  <OrderCardShimmer cardCount={2} />
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {inProgressOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onClick={() => handleOpenOrder(order)}
                        />
                      ))}
                    </AnimatePresence>
                    {inProgressOrders.length === 0 && (
                      <EmptyState
                        icon={ChefHat}
                        title="No orders in progress"
                        description="Orders you have confirmed and are currently preparing."
                        className="py-16 md:py-24"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Column 3: Waiting for Driver */}
          <div className="flex flex-col h-full min-h-0 px-3">
            <div className="mb-5 flex items-center justify-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 bg-white px-5 py-2.5 rounded-2xl border-2 border-lime-200 shadow-sm">
                <h3 className="text-base font-anton font-bold text-[#1A1A1A]">
                  WAITING FOR DRIVER
                </h3>
                <div className="w-7 h-7 rounded-xl bg-lime-500 flex items-center justify-center shadow-md shadow-lime-500/30">
                  <span className="text-xs font-bold text-white">{showLoading ? '-' : waitingForDriverOrders.length}</span>
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              <div className="space-y-4 py-2 px-1">
                {showLoading ? (
                  <OrderCardShimmer cardCount={2} />
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {waitingForDriverOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onClick={() => handleOpenOrder(order)}
                        />
                      ))}
                    </AnimatePresence>
                    {waitingForDriverOrders.length === 0 && (
                      <EmptyState
                        icon={Bike}
                        title="No orders waiting"
                        description="Orders prepared and waiting for driver pickup."
                        className="py-16 md:py-24"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Single Column Layout */}
        <div className="flex md:hidden flex-col flex-1 min-h-0 px-3 py-3 overflow-y-auto">
          {mobileTab === 'pending' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-grow space-y-4 py-2 px-1">
                {showLoading ? (
                  <HistoryCardShimmer cardCount={2} />
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {pendingOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onClick={() => handleOpenOrder(order)}
                        />
                      ))}
                    </AnimatePresence>
                    {pendingOrders.length === 0 && (
                      <EmptyState
                        icon={ClipboardList}
                        title="No pending orders"
                        description="New orders from customers will appear here for confirmation."
                        className="py-16"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {mobileTab === 'inprogress' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-grow space-y-4 py-2 px-1">
                {showLoading ? (
                  <HistoryCardShimmer cardCount={2} />
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {inProgressOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onClick={() => handleOpenOrder(order)}
                        />
                      ))}
                    </AnimatePresence>
                    {inProgressOrders.length === 0 && (
                      <EmptyState
                        icon={ChefHat}
                        title="No orders in progress"
                        description="Orders you have confirmed and are currently preparing."
                        className="py-16"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {mobileTab === 'waiting' && (
            <div className="flex flex-col h-full min-h-0">
              <div className="flex-grow space-y-4 py-2 px-1">
                {showLoading ? (
                  <HistoryCardShimmer cardCount={2} />
                ) : (
                  <>
                    <AnimatePresence mode="popLayout">
                      {waitingForDriverOrders.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          onClick={() => handleOpenOrder(order)}
                        />
                      ))}
                    </AnimatePresence>
                    {waitingForDriverOrders.length === 0 && (
                      <EmptyState
                        icon={Bike}
                        title="No orders waiting"
                        description="Orders prepared and waiting for driver pickup."
                        className="py-16"
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Drawer with AnimatePresence */}
      {isMobile ? (
        <MobileOrderDrawer
          open={drawerOpen}
          order={selectedOrder}
          onClose={handleCloseDrawer}
          onConfirm={handleConfirmOrder}
          onReject={handleRejectOrder}
          onComplete={handleCompleteOrder}
          loading={isActionLoading}
        />
      ) : (
        <OrderDrawer
          open={drawerOpen}
          order={selectedOrder}
          onClose={handleCloseDrawer}
          onConfirm={handleConfirmOrder}
          onReject={handleRejectOrder}
          onComplete={handleCompleteOrder}
          loading={isActionLoading}
        />
      )}
    </>
  );
}
