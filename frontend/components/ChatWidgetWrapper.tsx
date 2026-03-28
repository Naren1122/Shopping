"use client";

import { ChatWidget, ChatFloatingButton } from "./ChatWidget";

export function ChatWidgetWrapper() {
  return (
    <>
      <ChatFloatingButton />
      <ChatWidget />
    </>
  );
}
