# Bazar Homepage Redesign - Comprehensive Design Plan

## Executive Summary

This design plan outlines a complete redesign of the Bazar e-commerce homepage to create a premium, trustworthy, and conversion-focused user experience. The design leverages modern e-commerce best practices while utilizing existing APIs and components.

---

## 1. Design Analysis & Color System

### Current Color Palette (Already Implemented)

| Color Role             | Light Mode           | Dark Mode            | Usage              |
| ---------------------- | -------------------- | -------------------- | ------------------ |
| Primary (Deep Teal)    | oklch(0.21 0.13 262) | oklch(0.85 0.08 262) | CTAs, Logo, Links  |
| Secondary (Warm Amber) | oklch(0.55 0.18 45)  | oklch(0.7 0.15 45)   | Highlights, Badges |
| Success                | oklch(0.72 0.18 145) | oklch(0.72 0.16 145) | Success states     |
| Warning                | oklch(0.85 0.16 85)  | oklch(0.65 0.14 85)  | Alerts             |
| Background             | oklch(0.99 0.01 240) | oklch(0.12 0.02 240) | Page background    |
| Card                   | oklch(1 0 0)         | oklch(0.18 0.02 240) | Card surfaces      |
| Border                 | oklch(0.88 0.01 240) | oklch(1 0 0 / 15%)   | Borders, dividers  |

### Typography

- **Primary Font:** Geist Sans (Next.js default)
- **Monospace:** Geist Mono
- **Scale:**
  - H1: 3rem (48px) - Hero headlines
  - H2: 2rem (32px) - Section titles
  - H3: 1.5rem (24px) - Subsection titles
  - Body: 1rem (16px) - Regular text
  - Small: 0.875rem (14px) - Captions, metadata

### Spacing System

Using Tailwind's default spacing scale:

- Section padding: py-16 to py-24 (64px - 96px)
- Component gaps: gap-4 to gap-8 (16px - 32px)
- Card padding: p-4 to p-6 (16px - 24px)

---

## 2. Page Structure & Component Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                    NAVIGATION BAR                    │
│  [Logo]  [Search Bar]  [Categories]  [User Menu]  │
├─────────────────────────────────────────────────────┤
│                                                      │
│                   HERO SECTION                       │
│  [Full-width banner with promotional content]       │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│              FEATURED PRODUCTS SLIDER                │
│  [Horizontal scrollable product cards]               │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│              CATEGORIES GRID                         │
│  [Visual category cards with icons]                 │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│           NEW ARRIVALS SECTION                       │
│  [Latest products grid]                             │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│            PROMO BANNER SECTION                     │
│  [Call-to-action promotional content]               │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│           CUSTOMER REVIEWS / TRUST BADGES            │
│  [Social proof elements]                            │
│                                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│                     FOOTER                           │
│  [Links, Newsletter, Contact, Social]              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 3. Section Specifications

### 3.1 Navigation Bar (Sticky)

**Layout:**

```
┌────────────────────────────────────────────────────────────┐
│  [Logo]  [Search Bar - expandable]  [Categories ▼]  [Icons] │
│  Bazar    🔍 Search products...        Shop    🛒👤⚙️     │
└────────────────────────────────────────────────────────────┘
```

**Components:**

- **Logo:** Left-aligned, clickable to home
- **Search Bar:** Expandable input with search icon
  - Focus state: Width expands to 400px
  - Shows search suggestions dropdown
  - API: `GET /api/products/search?q={query}`
- **Category Dropdown:** Mega menu on hover
- **Action Icons:** Cart (with badge), User menu, Settings (if logged in)

**States:**

- Default: Transparent background on hero, solid on scroll
- Scrolled: Adds shadow, solid background, reduced height

**Mobile:**

- Hamburger menu for categories
- Bottom sticky bar for cart and user

### 3.2 Hero Section

**Layout Options:**

**Option A - Split Layout (Recommended):**

```
┌────────────────────────────────────────────────────────────┐
│                          │                                 │
│     COMPELLING          │     HERO IMAGE                  │
│     HEADLINE            │     (Product showcase)           │
│     "Find Everything    │                                 │
│      You Need at        │     [Rotating product image]    │
│      Amazing Prices"    │                                 │
│                          │                                 │
│     [Shop Now Button]   │                                 │
│     [Browse Button]     │                                 │
│                          │                                 │
└────────────────────────────────────────────────────────────┘
```

**Option B - Full Banner:**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│          [Full-width background image]                    │
│                                                            │
│          CENTERED CONTENT:                                 │
│          "Welcome to Bazar"                               │
│          "Your One-Stop Shop for Everything"              │
│                                                            │
│          [Shop Now]  [Learn More]                          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Animations:**

- Headline: Fade in + slide up (0.6s delay 0.1s)
- Subheadline: Fade in + slide up (0.6s delay 0.3s)
- Buttons: Scale in (0.4s delay 0.5s)
- Hero image: Subtle float animation

### 3.3 Featured Products Slider

**Implementation:**

- Horizontal scrollable carousel
- Uses existing API: `GET /api/products/featured`
- Auto-scroll: 5 seconds per slide
- Navigation: Dots + arrows + swipe

**Card Design (Enhanced ProductCard):**

```
┌────────────────────────┐
│  ┌──────────────────┐  │
│  │                  │  │
│  │   PRODUCT IMAGE  │  │  ← Hover: scale 1.05
│  │                  │  │
│  │  [Badge: Sale]   │  │  ← Positioned top-left
│  └──────────────────┘  │
│                        │
│  CATEGORY              │  ← Text-xs, muted
│  Product Name Here    │  ← Font-semibold, line-clamp-2
│  ★★★★☆ (124)         │  ← Rating stars
│  Rs. 1,999            │  ← Primary color, bold
│  Rs. 2,499  -25%     │  ← Strikethrough, muted
│                        │
│  [+ Add to Cart]      │  ← Full width button
└────────────────────────┘
```

**Interactions:**

- Hover: Image zoom, quick-view button appears
- Click: Navigate to product detail
- Add to Cart: Mini cart opens with success toast

### 3.4 Categories Grid

**Categories from Products:**
Based on product data, extract unique categories:

- Electronics, Clothing, Books, Home & Garden, Sports, Toys, Beauty, Food, Other

**Design:**

```
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│    📱    │  │    👕    │  │    📚    │  │    🏠    │
│          │  │          │  │          │  │          │
│Electronics│ │Clothing │  │  Books   │  │Home & Gar.│
│ (45)     │  │  (32)    │  │  (28)    │  │  (19)    │
└──────────┘  └──────────┘  └──────────┘  └──────────┘
```

**Category Card Specs:**

- Size: 160px x 160px (desktop), responsive
- Background: Gradient or category-specific image
- Hover: Scale 1.05, shadow increase
- Click: Filter products by category

### 3.5 New Arrivals Section

**Grid Layout:**

- 4 columns on desktop, 2 on tablet, 1.5 on mobile
- Shows latest 8 products from `GET /api/products`
- "View All" link to products page

### 3.6 Promo Banner Section

**Design Options:**

**Option A - Split Promo:**

```
┌──────────────────────────────┐  ┌──────────────────────────────┐
│                              │  │                              │
│   LIMITED TIME OFFER         │  │   NEW ARRIVALS               │
│   Get 20% Off               │  │   Check Out the Latest       │
│   On Your First Order       │  │   Products in Store         │
│                              │  │                              │
│   [Use Code: FIRST20]       │  │   [Shop Now →]               │
│                              │  │                              │
└──────────────────────────────┘  └──────────────────────────────┘
```

**Option B - Single Large Banner:**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                  🔥 FLASH SALE 🔥                         │
│                                                            │
│           Up to 50% Off on Electronics                     │
│                                                            │
│              Offer ends in: 24:00:00                       │
│                                                            │
│                   [Shop Now]                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### 3.7 Trust Badges / Reviews Section

**Elements:**

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   🚚        │  │   🔒        │  │   ⭐        │
│  Free       │  │   Secure    │  │   4.9/5     │
│  Shipping   │  │  Payments   │  │  Rating     │
│  On orders  │  │   256-bit   │  │  10k+      │
│  over Rs.500│  │   SSL       │  │  reviews    │
└─────────────┘  └─────────────┘  └─────────────┘
```

### 3.8 Footer

**Multi-Column Layout:**

| Column 1     | Column 2    | Column 3    | Column 4     |
| ------------ | ----------- | ----------- | ------------ |
| **Shop**     | **Support** | **Company** | **Connect**  |
| All Products | Help Center | About Us    | Newsletter   |
| Featured     | Shipping    | Contact     | Social Links |
| Categories   | Returns     | Careers     |              |
| New Arrivals | FAQ         | Press       |              |
|              |             |             |              |

**Newsletter Signup:**

```
┌─────────────────────────────────────────┐
│  Subscribe to our newsletter           │
│  Get latest updates on new products     │
│  ┌─────────────────┐  [Subscribe]     │
│  │ your@email.com  │                   │
│  └─────────────────┘                   │
└─────────────────────────────────────────┘
```

**Bottom Bar:**

- Copyright © 2026 Bazar
- Payment method icons
- Terms & Privacy links

---

## 4. API Integration Strategy

### Endpoints to Use:

| Endpoint                            | Purpose                  | Section        |
| ----------------------------------- | ------------------------ | -------------- |
| `GET /api/products/featured`        | Featured products slider | Hero/Promo     |
| `GET /api/products?page=1&limit=8`  | Latest products          | New Arrivals   |
| `GET /api/products/category/:cat`   | Category products        | Category click |
| `GET /api/products/search?q=`       | Search suggestions       | Nav search     |
| `GET /api/products/recommendations` | AI suggestions           | (Future)       |

### Loading States:

- **Skeleton Loaders:** Match card dimensions

  ```tsx
  <div className="animate-pulse">
    <div className="aspect-square bg-muted rounded-lg" />
    <div className="h-4 bg-muted rounded w-3/4 mt-4" />
    <div className="h-4 bg-muted rounded w-1/2 mt-2" />
  </div>
  ```

- **Shimmer Effect:** For horizontal sliders
  ```css
  .shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
  ```

### Empty States:

- No products: "No products available yet"
- No featured: Hide section or show "Coming Soon"
- No search results: "No products found for '{query}'"

### Error Handling:

- API failure: Show error message with retry button
- Network offline: Show cached data if available + offline banner

---

## 5. Responsive Breakpoints

| Breakpoint | Width   | Layout Changes            |
| ---------- | ------- | ------------------------- |
| xs         | < 640px | Single column, bottom nav |
| sm         | 640px   | 2-column grid             |
| md         | 768px   | Hero split layout         |
| lg         | 1024px  | 3-4 column grid           |
| xl         | 1280px  | Full layout               |
| 2xl        | 1536px  | Max-width container       |

---

## 6. Animation & Micro-interactions

### Page Load Sequence:

1. **0ms:** Navigation fades in
2. **100ms:** Hero content slides up
3. **300ms:** Hero image fades in
4. **500ms:** Featured products load
5. **700ms:** Other sections render

### Micro-interactions:

| Element      | Interaction              | Animation      |
| ------------ | ------------------------ | -------------- |
| Button hover | Background shift         | 150ms ease     |
| Card hover   | Lift + shadow            | 200ms ease-out |
| Image hover  | Scale 1.05               | 300ms ease     |
| Add to Cart  | Button pulse + checkmark | 400ms          |
| Search focus | Expand width             | 200ms ease     |
| Scroll       | Navbar background change | 100ms          |

### Scroll Animations:

- Sections fade in on scroll into view
- Parallax effect on hero image (optional)
- Smooth scroll to sections

---

## 7. Accessibility (WCAG 2.1 AA)

- **Color Contrast:** Minimum 4.5:1 for text
- **Focus States:** Visible focus rings on all interactive elements
- **Keyboard Navigation:** Full tab support
- **Screen Readers:** Proper ARIA labels
- **Reduced Motion:** Respect `prefers-reduced-motion`
- **Alt Text:** All images have descriptive alt text

---

## 8. Implementation Priority

### Phase 1 - Core (MVP):

1. ✅ Enhanced Navigation Bar
2. ✅ Hero Section
3. ✅ Featured Products Slider
4. ✅ Footer

### Phase 2 - Enhanced:

5. Categories Grid
6. New Arrivals Section
7. Promo Banners
8. Trust Badges

### Phase 3 - Polish:

9. Scroll animations
10. Advanced search
11. Newsletter signup
12. Customer reviews display

---

## 9. Component Checklist

| Component              | Status    | File                         |
| ---------------------- | --------- | ---------------------------- |
| Navbar                 | To create | components/Navbar.tsx        |
| SearchBar              | To create | components/SearchBar.tsx     |
| MegaMenu               | To create | components/MegaMenu.tsx      |
| HeroSection            | To create | components/HeroSection.tsx   |
| ProductSlider          | To create | components/ProductSlider.tsx |
| ProductCard (enhanced) | To update | components/ProductCard.tsx   |
| CategoryGrid           | To create | components/CategoryGrid.tsx  |
| PromoBanner            | To create | components/PromoBanner.tsx   |
| TrustBadges            | To create | components/TrustBadges.tsx   |
| Footer                 | To create | components/Footer.tsx        |
| Newsletter             | To create | components/Newsletter.tsx    |

---

## 10. Next Steps

1. **Approve this design plan** - Confirm layout and features
2. **Update Redux slice** - Add missing API thunks (categories, search)
3. **Create components** - Build each section incrementally
4. **Implement page** - Assemble in page.tsx
5. **Test & Polish** - Verify responsive behavior and animations
