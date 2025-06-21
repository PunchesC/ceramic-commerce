export interface OrderItem  {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    title: string;
    imageUrls?: string[];
  };
};