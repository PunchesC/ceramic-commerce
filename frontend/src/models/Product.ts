export interface Product {
  id: string;
  title: string;
  description?: string;
  price: number;
  type?: string;
  stock?: number;
  isActive?: boolean;
  imageUrls?: string[];
}
