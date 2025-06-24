import { ArtistPiece } from "./ArtistPiece";
import { ProductImage } from "./ProductImage";


export interface GalleryImage extends ArtistPiece {
  id: number;
  title: string;
  description?: string;
  price: number;
  type?: string;
  imageUrls: string[];
}