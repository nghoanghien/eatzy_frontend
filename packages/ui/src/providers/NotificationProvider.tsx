"use client";

import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from "react";
import ExportNotification, { ExportNotificationProps } from "../feedback/ExportNotification";

type NotificationOptions = Pick<ExportNotificationProps, 'message' | 'format' | 'type' | 'autoHideDuration'>;

type NotificationContextValue = {
  showNotification: (options?: NotificationOptions | string) => void;
  hideNotification: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [notificationProps, setNotificationProps] = useState<Omit<ExportNotificationProps, 'isVisible' | 'onClose'>>({
    message: 'Operation successful!',
    type: 'success',
    format: 'pdf',
    autoHideDuration: 5000
  });

  const showNotification = useCallback((options?: NotificationOptions | string) => {
    if (typeof options === 'string') {
      setNotificationProps(prev => ({ ...prev, message: options }));
    } else if (options) {
      setNotificationProps(prev => ({
        ...prev,
        ...options
      }));
    }
    setIsVisible(true);
  }, []);

  const hideNotification = useCallback(() => {
    setIsVisible(false);
  }, []);

  const value = useMemo<NotificationContextValue>(() => ({
    showNotification,
    hideNotification,
  }), [showNotification, hideNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <ExportNotification
        isVisible={isVisible}
        onClose={hideNotification}
        {...notificationProps}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
  return ctx;
}
