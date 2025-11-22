export type RestaurantStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';

export type RestaurantCategory = {
  id: string;
  name: string;
  slug?: string;
};

export type Restaurant = {
  id: string;
  name: string;
  categories: RestaurantCategory[];
  status: RestaurantStatus;
  rating?: number;
  address?: string;
  imageUrl?: string;
  description?: string;
  category?: RestaurantCategory | string;
};

// Menu category created by restaurant to organize dishes
export type MenuCategory = {
  id: string;
  name: string;
  restaurantId: string;
  displayOrder?: number;
};

// Individual dish/food item
export type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  restaurantId: string;
  menuCategoryId: string;
  availableQuantity: number;
  isAvailable?: boolean;
  rating?: number;
};

export {};