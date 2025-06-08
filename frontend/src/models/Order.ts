import { OrderItem } from "./OrderItem";

export interface Order {
    id: number;
  userId?: number;
  items: OrderItem[];
  total: number;
  stripePaymentIntentId: string;
  status: string;
  createdAt: string;
}
