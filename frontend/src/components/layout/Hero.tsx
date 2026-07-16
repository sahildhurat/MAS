export default function Hero() {
  return (
    <div className="lg:col-span-12 mb-lg glow-effect">
      <div className="glass-panel rounded-xl p-8 overflow-hidden relative min-h-[300px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            alt="City skyline"
            className="w-full h-full object-cover opacity-40" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUuwlzzJ1fdvDhe3eVSuRC-TfrRoSlwRdpbiKTFcN5wPDbvBvT5zrw-41OWA7ZfRuk168bIFIUHGaidt5zNB_E7QVaefFh_qW8PqHw_8Du8-n4_uaacWT-hpmKQWM6_7o0brvXVhqKL5l2ItkfOkA8rL0dnH9rTDCOjB7kQWxZAoc9-uAWqJxPyFg5az0gfiCohC70Vp29pG8szXMsLwSWJJTDQKQSVznB5zPmD8_evs3yVkFUFKpCHrL2ZXdK6aU0emlJp1QPcSo"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent"></div>
        </div>
        <div className="relative z-10 w-full">
          <p className="font-label-md text-label-md text-primary tracking-widest uppercase mb-2">Welcome Back, Alexander</p>
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-4">
            Your Bespoke Itinerary is Ready.
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            I've curated a bespoke experience blending modern luxury with exclusive tranquility, perfectly aligned with your preferences.
          </p>
        </div>
      </div>
    </div>
  );
}
