import { ArtistPiece } from "./ArtistPiece";


export interface GalleryImage extends ArtistPiece {
  id: string;
  title: string;
  description?: string;
  price: number;
  type?: string;
  imageUrls?: string[];
}