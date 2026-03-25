"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  end: number;
  prefix?: string;
  suffix?: string;
  format?: boolean;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function StatNumber({
  end,
  prefix = "",
  suffix = "",
  format = false,
  duration = 2000,
  className,
  style,
}: Props) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId: number;

    const runAnimation = () => {
      if (hasStarted.current) return;
      hasStarted.current = true;
      let startTime: number | null = null;

      const step = (now: number) => {
        if (startTime === null) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.round(eased * end));
        if (progress < 1) rafId = requestAnimationFrame(step);
      };

      rafId = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          runAnimation();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [end, duration]);

  const display = format ? count.toLocaleString("en-IN") : String(count);

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}{display}{suffix}
    </span>
  );
}
