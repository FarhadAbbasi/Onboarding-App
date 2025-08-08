import React from 'react';

interface ProgressDotsProps {
  total: number;
  current: number;
  color?: string;
}

export function ProgressDots({ total, current, color = '#3B82F6' }: ProgressDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, index) => (
        <div
          key={index}
          className={`transition-all duration-300 ${
            index === current
              ? 'w-8 h-2 rounded-full'
              : 'w-2 h-2 rounded-full'
          }`}
          style={{
            backgroundColor: index === current ? color : index < current ? color : '#E5E7EB',
            opacity: index === current ? 1 : index < current ? 0.5 : 0.3
          }}
        />
      ))}
    </div>
  );
}