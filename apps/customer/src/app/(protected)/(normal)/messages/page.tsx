import React, { Suspense } from 'react';
import MessagesLayout from '@/features/messages/components/MessagesLayout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages - Eatzy',
  description: 'Your messages and notifications',
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <MessagesLayout />
    </Suspense>
  );
}
