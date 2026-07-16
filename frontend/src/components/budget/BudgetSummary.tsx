export interface BudgetCategory {
  name: string;
  icon: string;
  allocated: number;
  spent: number;
}

export interface BudgetSummaryProps {
  totalAllocated: number;
  categories: BudgetCategory[];
}

export default function BudgetSummary({ totalAllocated, categories }: BudgetSummaryProps) {
  return (
    <aside className="lg:col-span-4 flex flex-col gap-lg mt-lg lg:mt-0">
      <div className="glass-panel rounded-xl p-lg relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-container/10 blur-[50px] rounded-full pointer-events-none"></div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-6 flex items-center justify-between">
          Budget Pulse
          <span className="material-symbols-outlined text-primary">donut_large</span>
        </h3>
        
        <div className="mb-8">
          <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-1">Total Allocated</p>
          <div className="flex items-end gap-2">
            <span className="font-display-lg text-display-lg text-on-surface leading-none">${totalAllocated.toLocaleString()}</span>
            <span className="font-body-md text-body-md text-on-surface-variant mb-1">/ Trip</span>
          </div>
        </div>
        
        <div className="space-y-6">
          {categories.map((cat, idx) => {
            const percentage = Math.min((cat.spent / cat.allocated) * 100, 100);
            return (
              <div key={idx}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px] text-primary">{cat.icon}</span> 
                    {cat.name}
                  </span>
                  <span className="font-body-md text-body-md text-on-surface-variant">${cat.spent} / ${cat.allocated}</span>
                </div>
                <div className="h-2 w-full bg-[#1A1A1C] rounded-full overflow-hidden">
                  <div className="h-full neon-gradient rounded-full" style={{ width: `${percentage}%` }}></div>
                </div>
              </div>
            );
          })}
        </div>
        
        <button className="w-full mt-8 py-3 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 transition-colors font-label-md text-label-md text-on-surface flex items-center justify-center gap-2">
          <span className="material-symbols-outlined">receipt_long</span> View Detailed Ledger
        </button>
      </div>
      
      {/* Contextual Map Card */}
      <div className="glass-panel rounded-xl h-48 relative overflow-hidden group cursor-pointer">
        <div 
          className="absolute inset-0 bg-cover bg-center w-full h-full opacity-60 group-hover:opacity-80 transition-opacity" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZAn6nEsdcZy_gqbTq3uDWFG-OqN3lBP3ZWmS77Kijcb3P9WzR-j6Ccdd64uBIpjfVU5CAEPHJ2St89VRx8_Aa6XulRUdeIAxHQHUSSc2mhkPMa0QOfEsDaeFfQZEJm_7Oyn0WdfAaVJPQ5WhfEu_7oC3cOHW3jVA3PWkx3MhKjdJPmpgxh8VxL_xA5bvymdD5_dx5btGfQQIqdvedI19hJ8Q1FiIeaNj1qRuLoxDpCxfL9zpc9pkyCnwO_BJ4kXvyQ1xXaen18So')" }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/90 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <p className="font-label-sm text-label-sm text-primary uppercase tracking-widest mb-1">Navigation</p>
            <p className="font-headline-md text-headline-md text-on-surface">Downtown Sector</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface/50 backdrop-blur border border-white/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">arrow_forward</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
