import React from 'react';

interface BloodBadgeProps {
  type: string;
  isUrgent?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BloodBadge: React.FC<BloodBadgeProps> = ({
  type,
  isUrgent = false,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1 font-bold',
    lg: 'text-lg px-4 py-2 font-extrabold',
  }[size];

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-md font-mono border transition-all duration-300 ${sizeClasses} ${
        isUrgent
          ? 'bg-[#E63946]/15 border-[#E63946] text-[#FF6B6B] shadow-[0_0_12px_rgba(230,57,70,0.35)]'
          : 'bg-[#0F172A] border-white/10 text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.15)]'
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-current opacity-80" />
      <span>{type}</span>
    </div>
  );
};
