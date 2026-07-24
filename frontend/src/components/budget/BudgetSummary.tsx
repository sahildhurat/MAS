import React, { useState } from 'react';

export interface BudgetCategory {
  name: string;
  icon: string;
  allocated: number;
  estimated: number;
  notes: string;
}

export interface BudgetSummaryProps {
  totalAllocated: number;
  totalEstimated: number;
  categories: BudgetCategory[];
  warnings: string[];
  suggestions: string[];
  withinBudget: boolean;
  destination: string;
  onBudgetUpdate?: (category: string, newAmount: number) => void;
}

export default function BudgetSummary({ totalAllocated, totalEstimated, categories, warnings, suggestions, withinBudget, destination, onBudgetUpdate }: BudgetSummaryProps) {
  const [ledgerOpen, setLedgerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const handleEditStart = (categoryName: string, currentValue: number) => {
    setEditingCategory(categoryName);
    setEditValue(currentValue);
  };

  const handleEditSubmit = (categoryName: string) => {
    if (onBudgetUpdate) {
      if (!isNaN(editValue)) {
        onBudgetUpdate(categoryName, editValue);
      }
    }
    setEditingCategory(null);
  };

  return (
    <aside className="lg:col-span-4 flex flex-col gap-lg mt-lg lg:mt-0">
      <div className="glass-panel rounded-xl p-lg relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-container/10 blur-[50px] rounded-full pointer-events-none"></div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center justify-between">
          Budget Pulse
          <span className={`material-symbols-outlined ${withinBudget ? 'text-primary' : 'text-error'}`}>
            {withinBudget ? 'check_circle' : 'warning'}
          </span>
        </h3>
        
        <div className="mb-8">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Budget</p>
          <div className="flex items-end gap-2">
            <span className="font-display-lg text-display-lg text-on-surface leading-none">₹{totalAllocated.toLocaleString('en-IN')}</span>
          </div>
          {totalEstimated > 0 && (
            <p className="font-body-md text-on-surface-variant mt-2">
              Estimated spend: <span className={`font-semibold ${totalEstimated > totalAllocated ? 'text-error' : 'text-primary'}`}>₹{totalEstimated.toLocaleString('en-IN')}</span>
            </p>
          )}
        </div>
        
        <div className="space-y-6">
          {categories.map((cat, idx) => {
            const percentage = cat.allocated > 0 ? Math.min((cat.estimated / cat.allocated) * 100, 100) : 0;
            const isOver = cat.estimated > cat.allocated;
            return (
              <div key={idx}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between text-sm mb-2 gap-1">
                  <span className="font-label-md text-label-md text-on-surface flex items-center gap-2 truncate">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0">{cat.icon}</span> 
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <div className={`font-body-md text-body-md flex items-center whitespace-nowrap gap-1 ${isOver ? 'text-error' : 'text-on-surface-variant'}`}>
                    <span>₹{cat.estimated.toLocaleString('en-IN')}</span>
                    <span className="text-outline-variant mx-1">/</span>
                    {editingCategory === cat.name ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="range"
                          min={Math.max(0, cat.estimated - 10000)}
                          max={Math.max(cat.allocated * 2, cat.estimated + 20000, 10000)}
                          step={500}
                          value={editValue}
                          onChange={(e) => setEditValue(parseInt(e.target.value))}
                          className="w-24 accent-primary"
                        />
                        <span className="text-on-surface font-semibold w-[4.5rem] text-right whitespace-nowrap">₹{editValue.toLocaleString('en-IN')}</span>
                        <button onClick={() => handleEditSubmit(cat.name)} className="material-symbols-outlined text-primary text-[18px] hover:scale-110 transition-transform cursor-pointer shrink-0" title="Apply">check_circle</button>
                        <button onClick={() => setEditingCategory(null)} className="material-symbols-outlined text-error text-[18px] hover:scale-110 transition-transform cursor-pointer shrink-0" title="Cancel">cancel</button>
                      </div>
                    ) : (
                      <span 
                        onClick={() => { if (onBudgetUpdate) handleEditStart(cat.name, cat.allocated); }} 
                        className={`flex items-center gap-1 ${onBudgetUpdate ? 'cursor-pointer hover:text-primary transition-colors group' : ''}`}
                        title={onBudgetUpdate ? "Click to adjust budget" : ""}
                      >
                        <span>₹{cat.allocated.toLocaleString('en-IN')}</span>
                        {onBudgetUpdate && (
                           <span className="material-symbols-outlined text-[14px] opacity-0 group-hover:opacity-100 transition-opacity">edit</span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-2 w-full bg-[#1A1A1C] rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${isOver ? 'bg-error' : 'neon-gradient'}`} style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Expandable Detailed Ledger */}
        <button 
          onClick={() => setLedgerOpen(!ledgerOpen)}
          className="w-full mt-8 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors font-label-md text-label-md text-on-surface flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">{ledgerOpen ? 'expand_less' : 'receipt_long'}</span> 
          {ledgerOpen ? 'Hide Ledger' : 'View Detailed Ledger'}
        </button>

        {ledgerOpen && (
          <div className="mt-4 pt-4 border-t border-outline-variant/30 space-y-4 animate-in fade-in slide-in-from-top-2">
            {/* Per-category notes */}
            {categories.filter(c => c.notes).length > 0 && (
              <div>
                <p className="font-label-sm text-primary uppercase tracking-wider mb-2">Category Notes</p>
                <div className="space-y-2">
                  {categories.filter(c => c.notes).map((cat, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface-variant/20">
                      <span className="material-symbols-outlined text-[14px] text-primary mt-0.5">{cat.icon}</span>
                      <div>
                        <p className="font-label-sm text-on-surface font-semibold">{cat.name}</p>
                        <p className="font-body-md text-on-surface-variant text-xs">{cat.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div>
                <p className="font-label-sm text-error uppercase tracking-wider mb-2">⚠ Warnings</p>
                <div className="space-y-1.5">
                  {warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-error/5 border border-error/20">
                      <span className="material-symbols-outlined text-error text-[14px] mt-0.5">warning</span>
                      <p className="font-body-md text-on-surface-variant text-xs">{w}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div>
                <p className="font-label-sm text-primary uppercase tracking-wider mb-2">💡 Suggestions</p>
                <div className="space-y-1.5">
                  {suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
                      <span className="material-symbols-outlined text-primary text-[14px] mt-0.5">lightbulb</span>
                      <p className="font-body-md text-on-surface-variant text-xs">{s}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Dynamic Map Card */}
      <a 
        href={destination ? `https://www.google.com/maps/search/${encodeURIComponent(destination)}` : '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-panel rounded-xl h-48 relative overflow-hidden group cursor-pointer block"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center w-full h-full opacity-60 group-hover:opacity-80 transition-opacity" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZAn6nEsdcZy_gqbTq3uDWFG-OqN3lBP3ZWmS77Kijcb3P9WzR-j6Ccdd64uBIpjfVU5CAEPHJ2St89VRx8_Aa6XulRUdeIAxHQHUSSc2mhkPMa0QOfEsDaeFfQZEJm_7Oyn0WdfAaVJPQ5WhfEu_7oC3cOHW3jVA3PWkx3MhKjdJPmpgxh8VxL_xA5bvymdD5_dx5btGfQQIqdvedI19hJ8Q1FiIeaNj1qRuLoxDpCxfL9zpc9pkyCnwO_BJ4kXvyQ1xXaen18So')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/90 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-1">Navigation</p>
            <p className="font-headline-md text-headline-md text-on-surface">{destination || 'Explore'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface/50 backdrop-blur border border-white/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
            <span className="material-symbols-outlined">open_in_new</span>
          </div>
        </div>
      </a>
    </aside>
  );
}
