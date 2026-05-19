import React, { Suspense } from "react";
import MessagesLayout from "@/features/messages/components/MessagesLayout";

export const metadata = {
  title: "Messages | Eatzy Driver",
  description: "Chat with your customers and support",
};

export default function MessagesPage() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <MessagesLayout />
    </Suspense>
  );
}
