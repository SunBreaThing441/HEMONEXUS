import React from 'react';

interface TelemetryGaugeProps {
  label: string;
  value: string | number;
  unit: string;
  min?: number;
  max?: number;
  status?: 'optimal' | 'warning' | 'alert';
  icon?: React.ReactNode;
}

export const TelemetryGauge: React.FC<TelemetryGaugeProps> = ({
  label,
  value,
  unit,
  status = 'optimal',
  icon,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'warning':
        return '#F59E0B';
      case 'alert':
        return '#E63946';
      default:
        return '#00E5FF';
    }
  };

  const color = getStatusColor();

  return (
    <div className="glass-card p-5 relative overflow-hidden group">
      {/* Subtle background glow */}
      <div 
        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-15 pointer-events-none transition-opacity group-hover:opacity-30"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-[#94A3B8] font-semibold flex items-center gap-2">
          {icon && <span style={{ color }}>{icon}</span>}
          {label}
        </span>
        <span 
          className="text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase"
          style={{ 
            borderColor: `${color}40`, 
            color: color, 
            backgroundColor: `${color}10` 
          }}
        >
          {status}
        </span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold font-mono tracking-tight text-[#F8FAFC]">
          {value}
        </span>
        <span className="text-xs font-mono text-[#64748B]">{unit}</span>
      </div>

      {/* Futuristic gauge baseline bar */}
      <div className="mt-4 h-1.5 w-full bg-[#0B1124] rounded-full overflow-hidden border border-white/5">
        <div 
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ 
            backgroundColor: color,
            width: '78%',
            boxShadow: `0 0 8px ${color}80`
          }}
        />
      </div>
    </div>
  );
};
