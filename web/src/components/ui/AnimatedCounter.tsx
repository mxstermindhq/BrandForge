'use client';

import { useEffect, useRef } from 'react';
import { useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  format?: (value: number) => string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  format = (v) => Math.round(v).toLocaleString(),
  className,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 50,
    stiffness: 100,
    duration: duration * 1000,
  });
  
  const displayValue = useTransform(springValue, (v) => format(v));

  useEffect(() => {
    if (inView) {
      motionValue.set(value);
    }
  }, [inView, value, motionValue]);

  return (
    <span ref={ref} className={className}>
      <AnimatedNumber value={displayValue} />
    </span>
  );
}

// Helper component to render the motion value
function AnimatedNumber({ value }: { value: ReturnType<typeof useTransform> }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = value.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = v as string;
      }
    });
    return unsubscribe;
  }, [value]);

  return <span ref={ref} />;
}
