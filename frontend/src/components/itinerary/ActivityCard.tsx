import React from 'react';

export interface ActivityCardProps {
  time: string;
  icon: string;
  title: string;
  description: string;
  cost: number;
  crowdLevel: string;
  duration?: number;
  tips?: string[];
  location?: string;
  isMeal?: boolean;
}

export default function ActivityCard({
  time,
  icon,
  title,
  description,
  cost,
  crowdLevel,
  duration,
  tips,
  location,
  isMeal
}: ActivityCardProps) {
  const [showTips, setShowTips] = React.useState(false);

  return (
    <div className="flex gap-md sm:gap-lg mb-lg relative z-10">
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full flex items-center justify-center border-2 shrink-0 z-10 shadow-[0_0_15px_rgba(0,209,255,0.1)] ${
          isMeal 
            ? 'bg-tertiary-container/20 border-tertiary-container/50 text-tertiary-container' 
            : 'bg-surface-container border-outline-variant text-on-surface-variant'
        }`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="font-label-sm text-label-sm text-on-surface-variant mt-2 whitespace-nowrap">{time}</div>
      </div>
      
      <div className="flex-grow glass-panel rounded-xl p-md hover:bg-surface-variant/30 transition-colors group cursor-pointer" onClick={() => tips && tips.length > 0 && setShowTips(!showTips)}>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-grow">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-headline-md text-headline-md text-on-surface group-hover:text-primary transition-colors">{title}</h3>
              {isMeal && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary-container/20 text-tertiary-container border border-tertiary-container/30 uppercase tracking-wider">
                  Meal
                </span>
              )}
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 mt-1">{description}</p>
            
            {/* Location & duration info */}
            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {location && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">location_on</span>
                  {location}
                </span>
              )}
              {duration && duration > 0 && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  {duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60 > 0 ? `${duration % 60}m` : ''}` : `${duration}m`}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t border-white/10 sm:border-0 gap-2">
            <span className="font-headline-md text-headline-md text-secondary-fixed">₹{cost.toLocaleString('en-IN')}</span>
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

        {/* Expandable Tips */}
        {showTips && tips && tips.length > 0 && (
          <div className="mt-3 pt-3 border-t border-outline-variant/30">
            <div className="flex flex-col gap-1.5">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">check_circle</span>
                  <p className="font-body-md text-on-surface-variant text-xs">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
