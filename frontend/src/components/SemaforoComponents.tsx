import React from 'react';

// 1. Card Component
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-[#171923] border border-[#2D3748] rounded-[12px] p-6 shadow-md transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// 2. Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, className = '', ...props }) => {
  let styleClass = '';
  if (variant === 'primary') {
    styleClass = 'bg-[#3B82F6] hover:bg-[#2563EB] text-[#F7FAFC] shadow-sm font-semibold';
  } else if (variant === 'secondary') {
    styleClass = 'bg-transparent border border-[#2D3748] text-[#F7FAFC] hover:bg-[#1A202C]/60 hover:text-white font-medium';
  } else if (variant === 'ghost') {
    styleClass = 'bg-transparent text-[#3B82F6] hover:underline px-0 py-0 flex items-center gap-1 font-semibold';
  }

  return (
    <button
      className={`min-h-[44px] px-6 py-2.5 rounded-xl text-[14px] transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${styleClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// 3. Badge Component
interface BadgeProps {
  status: 'ROJO' | 'AMARILLO' | 'VERDE' | string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const normStatus = status.toUpperCase();
  
  let dotColor = 'bg-[#E53E3E]';
  let textColor = 'text-[#E53E3E]';
  let bgColor = 'bg-[#E53E3E]/10';
  let borderClass = 'border-[#E53E3E]/20';
  let label = '🔴 Pendiente / Riesgo';

  if (normStatus === 'AMARILLO' || normStatus === 'YELLOW') {
    dotColor = 'bg-[#F6AD55]';
    textColor = 'text-[#F6AD55]';
    bgColor = 'bg-[#F6AD55]/10';
    borderClass = 'border-[#F6AD55]/20';
    label = '🟡 En Proceso';
  } else if (normStatus === 'VERDE' || normStatus === 'GREEN') {
    dotColor = 'bg-[#48BB78]';
    textColor = 'text-[#48BB78]';
    bgColor = 'bg-[#48BB78]/10';
    borderClass = 'border-[#48BB78]/20';
    label = '🟢 Verificado / Completo';
  }

  return (
    <span
      className={`inline-flex items-center gap-2 font-mono font-bold border rounded-full ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-[13px]'
      } ${bgColor} ${textColor} ${borderClass}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
};

export const SemaforoBadge = Badge;

// 4. Progress Component
interface SemaforoProgressProps {
  score: number;
  maxScore?: number;
  milestones?: Array<{ label: string; value: number }>;
}

export const SemaforoProgress: React.FC<SemaforoProgressProps> = ({ score, maxScore = 100, milestones }) => {
  const percentage = Math.min(Math.round((score / maxScore) * 100), 100);
  
  let barColor = 'bg-[#E53E3E] shadow-[0_0_10px_rgba(229,62,62,0.4)]';
  if (percentage >= 75) barColor = 'bg-[#48BB78] shadow-[0_0_10px_rgba(72,187,120,0.4)]';
  else if (percentage >= 40) barColor = 'bg-[#F6AD55] shadow-[0_0_10px_rgba(246,173,85,0.4)]';

  const defaultMilestones = milestones || [
    { label: 'Básico', value: 0 },
    { label: 'Verificado', value: 40 },
    { label: 'Formalizado', value: 75 },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2.5 text-xs text-[#A0AEC0] font-bold font-mono">
        <span className="uppercase tracking-wider">PROGRESO DE FORMALIZACIÓN</span>
        <span className="text-[14px] text-[#F7FAFC] font-black">{percentage}%</span>
      </div>
      <div className="relative w-full bg-[#1A202C] h-4 rounded-full border border-white/5 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
        
        {defaultMilestones.map((m, idx) => {
          const pos = (m.value / maxScore) * 100;
          const isActive = score >= m.value;
          return (
            <div
              key={idx}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-10"
              style={{ left: `${pos}%` }}
            >
              <div
                className={`w-3 h-3 rounded-full border border-[#171923] transition-colors duration-300 ${
                  isActive ? 'bg-[#3B82F6]' : 'bg-[#2D3748]'
                }`}
              />
              <span className="text-[10px] font-mono mt-5 absolute whitespace-nowrap text-[#A0AEC0]">
                {m.label} ({m.value})
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SemaforoProgressBar = ({ score, maxScore = 100 }: { score: number; maxScore: number }) => (
  <SemaforoProgress score={score} maxScore={maxScore} />
);

// 5. MetricCard Component
interface MetricCardProps {
  icon: string;
  value: string;
  label: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ icon, value, label }) => {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-6 bg-[#171923]">
      <span className="text-3xl block mb-2">{icon}</span>
      <span className="text-[32px] font-bold text-[#F7FAFC] font-mono leading-none">{value}</span>
      <span className="text-[13px] font-semibold text-[#A0AEC0] uppercase tracking-[0.05em] font-mono mt-2.5 text-center">
        {label}
      </span>
    </Card>
  );
};

// 6. RoleCard Component
interface RoleCardProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
  ctaText: string;
}

export const RoleCard: React.FC<RoleCardProps> = ({ icon, title, description, onClick, ctaText }) => {
  return (
    <Card
      onClick={onClick}
      className="flex flex-col justify-between h-[280px] bg-[#171923] border border-[#2D3748] cursor-pointer hover:border-[#3B82F6] hover:-translate-y-1 hover:shadow-lg transition-all duration-150"
    >
      <div>
        <div className="bg-[#1A202C] h-12 w-12 rounded-xl flex items-center justify-center text-2xl mb-4">
          {icon}
        </div>
        <h2 className="text-[24px] font-semibold text-[#F7FAFC] leading-[1.3] mb-2">
          {title}
        </h2>
        <p className="text-[16px] text-[#A0AEC0] leading-[1.6]">
          {description}
        </p>
      </div>
      <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onClick(); }} className="mt-4 shrink-0 self-start">
        {ctaText} &rarr;
      </Button>
    </Card>
  );
};

// 7. WorkerCard Component
interface WorkerCardProps {
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  avatarUrl?: string;
  status: 'ROJO' | 'AMARILLO' | 'VERDE' | string;
  price: number;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({ name, specialty, rating, distance, avatarUrl, status, price }) => {
  return (
    <Card className="flex items-center gap-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-150">
      <div className="relative">
        <img 
          src={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80"} 
          alt={name} 
          className="w-14 h-14 rounded-full object-cover border-2 border-[#3B82F6]" 
        />
        <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border border-[#171923] bg-[#48BB78]" />
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h4 className="font-bold text-[#F7FAFC] text-[16px] leading-tight">{name}</h4>
          <span className="text-[#F6AD55] font-bold text-xs flex items-center gap-1">★ {rating}</span>
        </div>
        <p className="text-xs text-[#3B82F6] font-semibold mt-0.5">{specialty}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-[11px] text-[#A0AEC0] font-medium">📍 {distance}</span>
          <Badge status={status} size="sm" />
        </div>
      </div>
      <div className="text-right pl-4 border-l border-[#2D3748] shrink-0">
        <span className="text-[11px] text-[#A0AEC0] block font-bold font-mono">TARIFA</span>
        <span className="text-[18px] font-bold text-[#F7FAFC] font-mono">S/. {price}</span>
      </div>
    </Card>
  );
};
