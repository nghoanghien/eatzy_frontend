# Home Feature

A sophisticated category browser page for the Eatzy customer app, featuring smooth animations and an immersive browsing experience.

## 📁 Structure

```
home/
├── components/
│   ├── CategoryScroller.tsx      # Horizontal category text scroller
│   ├── RestaurantSlider.tsx      # 3-item restaurant carousel
│   ├── HomeHeader.tsx            # Top navigation bar
│   ├── BackgroundTransition.tsx  # Animated background transitions
│   └── index.ts                  # Component exports
├── data/
│   └── mockRestaurants.ts        # Mock restaurant data & helpers
├── hooks/
│   └── useHomePage.ts            # Home page state management hook
├── index.ts                      # Feature exports
└── README.md                     # This file
```

## 🎨 Design Features

### 1. Category Scroller
- **Large condensed text** (Anton font, 60-110px)
- **Horizontal drag/scroll** with snap-to-center
- **Active state**: Full opacity, sharp, large
- **Inactive state**: Reduced opacity (35%), blur (2px), smaller scale (75%)
- **Smooth transitions**: Spring animations with cubic-bezier easing

### 2. Restaurant Slider
- **3 visible items**: Previous, current (center), next
- **Center item**: Full size (400px), full opacity
- **Side items**: Slightly smaller (350px), reduced opacity (60%)
- **Navigation**: Drag, arrow buttons, or click side items
- **Info display**: Name, description, "Discover Recipe" button

### 3. Background Transition
- **Dynamic backgrounds** that change per category
- **Crossfade animation** (500ms) between transitions
- **Dark overlay** (60-70% black) for text readability
- **Vignette effect** for depth

### 4. Header
- **Logo** with hamburger menu
- **Layout toggle** (grid/list view)
- **My Cookbook** button with icon
- **Search** button
- **Profile** avatar
- **Filter dropdown** (All recipes, My favorites, etc.)

## 🛠 Technical Stack

- **Framework**: Next.js 14 (App Router)
- **Animations**: Framer Motion
- **Fonts**: Anton (category text), Inter (UI text)
- **Styling**: TailwindCSS
- **Type Safety**: TypeScript with shared models

## 🎯 Key Interactions

### Category Navigation
```typescript
// Drag horizontally
<motion.div drag="x" onDragEnd={handleDragEnd} />

// Click category text
onClick={() => handleCategoryClick(index)}

// Keyboard (future)
// Left/Right arrows to navigate
```

### Restaurant Navigation
```typescript
// Swipe on slider
<motion.div drag="x" onDragEnd={handleRestaurantDragEnd} />

// Click arrows
<button onClick={handleNext} />

// Click side items
onClick={() => !isCenter && onRestaurantChange(index)}
```

## 📊 Data Flow

```
mockRestaurants.ts
  ↓
getUniqueCategories() → Extract unique categories
  ↓
getRestaurantsByCategory(categoryId) → Filter restaurants
  ↓
getCategoryBackgroundImage(slug) → Get background URL
  ↓
useHomePage() → State management
  ↓
HomePage → Main component
  ↓
[CategoryScroller, RestaurantSlider, BackgroundTransition]
```

## 🎭 Animation Specifications

### Category Transition
- **Duration**: 300-450ms
- **Easing**: cubic-bezier(0.25, 1, 0.5, 1)
- **Properties**: scale, opacity, filter (blur), x-position

### Restaurant Transition
- **Duration**: 300ms
- **Easing**: Spring (stiffness: 300, damping: 30)
- **Properties**: scale, opacity, x-position

### Background Transition
- **Duration**: 500ms
- **Easing**: cubic-bezier(0.25, 0.1, 0.25, 1)
- **Properties**: opacity (crossfade)

## 🚀 Usage

### Basic Implementation
```tsx
import HomePage from '@/app/(protected)/home/page';

// In your route
export default function HomeRoute() {
  return <HomePage />;
}
```

### Using the Hook
```tsx
import { useHomePage } from '@/features/home/hooks/useHomePage';

function CustomHomePage() {
  const {
    categories,
    activeCategoryIndex,
    restaurantsInCategory,
    handleCategoryChange,
    handleRestaurantChange,
  } = useHomePage();

  return (
    // Your custom implementation
  );
}
```

### Accessing Mock Data
```tsx
import { 
  MOCK_RESTAURANTS, 
  getUniqueCategories,
  getRestaurantsByCategory 
} from '@/features/home/data/mockRestaurants';

const categories = getUniqueCategories();
const seafoodRestaurants = getRestaurantsByCategory('cat-001');
```

## 📦 Models

Defined in `@repo/models`:

```typescript
interface Restaurant {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contactPhone: string;
  category: RestaurantCategory;
  status: RestaurantStatus;
  imageUrl?: string;
  description?: string;
  rating?: number;
}

interface RestaurantCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

enum RestaurantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
}
```

## 🎨 Customization

### Change Category Font
Edit `CategoryScroller.tsx`:
```tsx
className="font-anton" // or font-bebas, font-oswald
```

### Adjust Animation Speed
Edit spring config in components:
```tsx
transition={{
  type: 'spring',
  stiffness: 300,  // Higher = faster
  damping: 30,     // Higher = less bounce
}}
```

### Modify Background Overlay
Edit `BackgroundTransition.tsx`:
```tsx
<div className="absolute inset-0 bg-gradient-to-b from-black/60..." />
// Adjust opacity values (e.g., /60 → /80 for darker)
```

## 🔄 State Management

The `useHomePage` hook provides:
- Category navigation state
- Restaurant navigation state
- Filter state
- Navigation helpers (next/previous)
- Status flags (can go next/previous)

## 📱 Responsive Design

- **Mobile**: Single item view, smaller text (60-80px)
- **Tablet**: 2-3 items visible, medium text (80-100px)
- **Desktop**: 3 items visible, large text (100-110px)

## 🎯 Future Enhancements

- [ ] Add keyboard navigation (arrow keys)
- [ ] Implement search functionality
- [ ] Connect to real API endpoints
- [ ] Add favorites/bookmark system
- [ ] Implement filter logic (My favorites, Recent, Popular)
- [ ] Add restaurant detail view
- [ ] Implement "Discover Recipe" action
- [ ] Add loading states for images
- [ ] Add error boundaries
- [ ] Optimize performance with React.memo

## 📝 Notes

- All restaurants include mock images from Unsplash
- Categories are automatically extracted from restaurant data
- Background images are mapped by category slug
- Authentication is handled at the route level via `(protected)` group
- Login redirect automatically navigates to `/home` after success

