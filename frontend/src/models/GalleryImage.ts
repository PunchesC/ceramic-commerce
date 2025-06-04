import { ArtistPiece } from "./ArtistPiece";
import { ProductImage } from "./ProductImage";


export interface GalleryImage extends ArtistPiece {
  description?: string;
  price: number;
  type?: string;
  stock?: number;
  isActive?: boolean;
  images: ProductImage[]; 
}