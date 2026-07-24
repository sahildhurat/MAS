export default function Header() {
  return (
    <>
      {/* TopAppBar (Web) */}
      <header className="hidden md:flex fixed top-0 w-full z-50 justify-between items-center px-margin-desktop py-4 backdrop-blur-md bg-surface/70">
        <div className="font-display-lg text-display-lg text-primary tracking-tighter">LuxeTravel AI</div>
        <nav className="flex gap-8">
          <a href="#explore" className="font-label-md text-label-md text-primary font-bold hover:text-primary-container transition-colors transform active:scale-95 duration-150 flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>explore</span>
            Explore
          </a>
          <a href="#itinerary" className="font-label-md text-label-md text-on-surface-variant hover:text-primary-container transition-colors transform active:scale-95 duration-150 flex items-center gap-2">
            <span className="material-symbols-outlined">event_note</span>
            Itinerary
          </a>
          <a href="#budget" className="font-label-md text-label-md text-on-surface-variant hover:text-primary-container transition-colors transform active:scale-95 duration-150 flex items-center gap-2">
            <span className="material-symbols-outlined">account_balance_wallet</span>
            Budget
          </a>
          <a href="#concierge" className="font-label-md text-label-md text-on-surface-variant hover:text-primary-container transition-colors transform active:scale-95 duration-150 flex items-center gap-2">
            <span className="material-symbols-outlined">smart_toy</span>
            Concierge
          </a>
        </nav>
        <div className="flex gap-4 text-primary">
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">settings</span></button>
        </div>
      </header>
      
      {/* TopAppBar (Mobile) */}
      <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center px-margin-mobile py-4 backdrop-blur-md bg-surface/70">
        <div className="font-display-lg-mobile text-display-lg-mobile text-primary tracking-tighter">LuxeTravel AI</div>
        <div className="flex gap-4 text-primary">
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">account_circle</span></button>
          <button className="hover:text-primary-container transition-colors"><span className="material-symbols-outlined">settings</span></button>
        </div>
      </header>
    </>
  );
}
