import { OrderItem } from "./OrderItem";

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled' | 'refunded';

export interface Order {
  id: number;
  userId?: number;
  items: OrderItem[];
  total: number;
  stripePaymentIntentId?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  guestName?: string;
  guestEmail?: string;
}