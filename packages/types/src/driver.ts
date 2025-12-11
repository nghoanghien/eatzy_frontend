import { PaymentMethod } from './common';

export type DriverOrderPhase = 'PICKUP' | 'DELIVERY';

export type DriverEarningsSummary = {
  orderId: string;
  driverId?: string;
  orderSubtotal: number;
  deliveryFee: number;
  driverCommissionRate?: number;
  driverCommissionAmount?: number;
  driverNetEarning: number;
  restaurantNetEarning?: number;
  platformTotalEarning?: number;
};

export type DriverOrderOffer = {
  id: string;
  netEarning: number; // driver_net_earning
  orderValue: number; // total_amount
  paymentMethod: PaymentMethod;
  distanceKm: number;
  pickup: { name: string; address: string; lng: number; lat: number };
  dropoff: { name?: string; address: string; lng: number; lat: number };
  expireSeconds: number; // 30s countdown
};

export type DriverActiveOrder = {
  id: string;
  phase: DriverOrderPhase; // PICKUP or DELIVERY
  pickup: { name: string; address: string; lng: number; lat: number };
  dropoff: { name?: string; address: string; lng: number; lat: number };
  driverLocation: { lng: number; lat: number };
  earnings: DriverEarningsSummary;
  paymentMethod: PaymentMethod;
  distanceKm?: number;
};
