"use client";

import { SnakeGame } from '@/components/SnakeGame';

export default function HomePage() {
  return (
    <main className="w-full h-screen overflow-hidden">
      <SnakeGame />
    </main>
  );
}