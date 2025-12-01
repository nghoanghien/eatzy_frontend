'use client';

import { useEffect } from 'react';
import { useLoading } from '@repo/ui';

export default function OrdersPage() {
  const { hide } = useLoading();

  useEffect(() => {
    // Hide loading after 1.5s when page mounts
    const timer = setTimeout(() => {
      hide();
    }, 1500);

    return () => clearTimeout(timer);
  }, [hide]);

  return <div>Trang Đơn hàng</div>;
}
