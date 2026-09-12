"use client";

import { useEffect, useState } from "react";

interface ConfettiProps {
  active: boolean;
  burstKey: number;
}

export function Confetti({ active, burstKey }: ConfettiProps) {
  if (!active) return null;
  return <ConfettiBurst key={burstKey} />;
}

function ConfettiBurst() {
  const [pieces] = useState(() => {
    const colors = ["#F59E0B", "#38BDF8", "#34D399", "#F472B6", "#A78BFA"];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.4,
      color: colors[i % colors.length],
    }));
  });
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden
    >
      {pieces.map((p) => (
        <span
          key={p.id}
          className="absolute top-0 h-3 w-3 animate-confetti rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
