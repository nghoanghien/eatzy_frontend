// Restaurant Status Enum
export enum RestaurantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  CLOSED = 'CLOSED',
  PENDING = 'PENDING',
}

// Restaurant Category Interface
export interface RestaurantCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Restaurant Interface - Main model for restaurant data
export interface Restaurant {
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



