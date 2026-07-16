import React from 'react';

export interface ActivityCardProps {
  time: string;
  icon: string;
  title: string;
  description: string;
  cost: number;
  crowdLevel: string;
  imageSrc: string;
}

export default function ActivityCard({
  time,
  icon,
  title,
  description,
  cost,
  crowdLevel,
  imageSrc
}: ActivityCardProps) {
  return (
    <div className="flex gap-md sm:gap-lg mb-lg relative z-10">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-surface-container flex items-center justify-center border-2 border-outline-variant text-on-surface-variant shrink-0 z-10 shadow-[0_0_15px_rgba(0,209,255,0.1)]">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="font-label-sm text-label-sm text-on-surface-variant mt-2 whitespace-nowrap">{time}</div>
      </div>
      
      <div className="flex-grow glass-panel rounded-xl p-md hover:bg-surface-variant/30 transition-colors group cursor-pointer">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex gap-4 w-full sm:w-auto">
            <img 
              alt={title}
              className="w-20 h-20 rounded-lg object-cover shrink-0" 
              src={imageSrc}
            />
            <div>
              <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">{title}</h3>
              <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mt-1">{description}</p>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/10 sm:border-0 gap-2">
            <span className="font-headline-md text-headline-md text-secondary-fixed">${cost}</span>
            <span className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
              crowdLevel.toLowerCase().includes('high') 
                ? 'bg-tertiary-container/20 text-tertiary-container border-tertiary-container/30 border' 
                : 'bg-surface text-on-surface-variant border-outline-variant border'
            }`}>
              <span className="material-symbols-outlined text-[14px]">groups</span>
              {crowdLevel}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
