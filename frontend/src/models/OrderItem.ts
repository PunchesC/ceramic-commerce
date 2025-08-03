export interface OrderItem  {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
    imageUrls?: string[];
  };
};