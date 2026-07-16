---
name: Aetheris Dubai
colors:
  surface: '#131314'
  surface-dim: '#131314'
  surface-bright: '#3a393a'
  surface-container-lowest: '#0e0e0f'
  surface-container-low: '#1c1b1c'
  surface-container: '#201f20'
  surface-container-high: '#2a2a2b'
  surface-container-highest: '#353436'
  on-surface: '#e5e2e3'
  on-surface-variant: '#bbc9cf'
  inverse-surface: '#e5e2e3'
  inverse-on-surface: '#313031'
  outline: '#859399'
  outline-variant: '#3c494e'
  surface-tint: '#4cd6ff'
  primary: '#a4e6ff'
  on-primary: '#003543'
  primary-container: '#00d1ff'
  on-primary-container: '#00566a'
  inverse-primary: '#00677f'
  secondary: '#fff9ef'
  on-secondary: '#3a3000'
  secondary-container: '#ffdb3c'
  on-secondary-container: '#725f00'
  tertiary: '#ffd2c6'
  on-tertiary: '#5e1700'
  tertiary-container: '#ffac93'
  on-tertiary-container: '#922800'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#b7eaff'
  primary-fixed-dim: '#4cd6ff'
  on-primary-fixed: '#001f28'
  on-primary-fixed-variant: '#004e60'
  secondary-fixed: '#ffe16d'
  secondary-fixed-dim: '#e9c400'
  on-secondary-fixed: '#221b00'
  on-secondary-fixed-variant: '#544600'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#852400'
  background: '#131314'
  on-background: '#e5e2e3'
  surface-variant: '#353436'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  gutter: 20px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style
The design system embodies a premium, futuristic vision of luxury travel. It targets high-net-worth explorers seeking an AI-driven, bespoke experience in Dubai. The aesthetic is rooted in **Glassmorphism** and **Modern Minimalist Tech**, evoking a sense of intelligence and high-velocity sophistication.

The interface should feel like a high-end digital concierge—unobtrusive yet powerful. We use deep charcoal surfaces to represent the mystery of the desert night, punctuated by high-vibrancy "neon" accents that mirror the electric skyline of Dubai. Every interaction must feel immersive, utilizing background blurs and subtle translucency to create a multi-layered, holographic depth.

## Colors
This design system utilizes a high-contrast dark palette to emphasize luxury and focus.

- **Primary (Electric Blue):** Used for primary actions, active states, and AI-driven insights. It represents the "intelligence" layer of the product.
- **Secondary (Gold):** Reserved for "Premium" or "VIP" status indicators, luxury hotel tiers, and high-value rewards.
- **Tertiary (Sunset Orange):** Used for time-sensitive alerts, sunset tours, and vibrant call-to-actions that require immediate attention.
- **Neutrals:** The background hierarchy moves from `#0A0A0B` (Canvas) to `#121214` (Surface Layers).
- **Gradients:** Use linear gradients from `Primary` to `Secondary` for progress bars and special highlights to simulate the transition from day to night.

## Typography
We utilize **Outfit** for its geometric clarity and modern, tech-forward feel. 

- **Headlines:** Should be bold and impactful, using tighter letter spacing to maintain a "locked-in" architectural look.
- **Labels:** Use uppercase for functional labels (buttons, tabs) with increased letter spacing to enhance legibility against dark backgrounds.
- **Body:** Maintains generous line heights to ensure readability during long itinerary reviews.

## Layout & Spacing
The layout follows a **Fluid Grid** model to accommodate high-density travel data and immersive photography.

- **Desktop:** 12-column grid with a maximum container width of 1440px.
- **Mobile:** 4-column grid with 20px side margins. 
- **Rhythm:** Use an 8px base unit. Component internal padding should default to `md` (24px) to allow the "glass" background blurs enough surface area to be visible. 
- **Sections:** Deep vertical breathing room (`xl`) between major itinerary sections to prevent visual clutter.

## Elevation & Depth
Depth is achieved through **Glassmorphism** and **Tonal Layering** rather than traditional drop shadows.

- **Layer 0 (Canvas):** `#0A0A0B` (Solid).
- **Layer 1 (Cards/Panels):** Glass effect—Background: `rgba(18, 18, 20, 0.7)`, Backdrop Blur: `16px`, Border: `1px solid rgba(255, 255, 255, 0.1)`.
- **Layer 2 (Floating elements/Modals):** Background: `rgba(30, 30, 35, 0.8)`, Backdrop Blur: `32px`, Border: `1px solid rgba(255, 255, 255, 0.2)`.
- **Accent Glows:** Use low-opacity radial gradients (10-15%) of the Primary Blue or Gold behind key cards to create an "aura" effect, simulating light reflecting off glass.

## Shapes
The shape language is sophisticated and "Rounded." 

- **Primary UI Elements:** `0.5rem` (8px) for buttons and inputs.
- **Containers & Cards:** `1.5rem` (24px) to create a soft, premium feel that offsets the technicality of the dark mode.
- **Interactive States:** On hover, elements may slightly expand or increase their corner radius to signal responsiveness.

## Components
- **Floating Chat Input:** A pill-shaped (rounded-xl) glass element anchored to the bottom. It features a `1px` Electric Blue border when focused and a "glowing" send icon.
- **Itinerary Cards:** Utilize the Layer 1 glass style. Images should have a subtle dark-to-transparent gradient overlay to ensure white text is always legible.
- **Neon Progress Bars:** For budgeting or "trip completion." The track is a dark neutral (`#1A1A1C`), and the filler is a vibrant linear gradient from `#00D1FF` to `#FFD700`.
- **Chips/Badges:** Small, high-contrast pills. Use `Primary` for "AI Recommended" and `Secondary` for "Luxury/Gold" tier activities.
- **Buttons:**
    - *Primary:* Solid Electric Blue with black text.
    - *Secondary:* Ghost style with `1px` white-translucent border and glass blur.
- **Inputs:** Darker than the card background with a subtle inner glow on focus.