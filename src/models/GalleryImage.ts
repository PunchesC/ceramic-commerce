import { ArtistPiece } from "./ArtistPiece";


export interface GalleryImage extends ArtistPiece {
  description?: string;
  imageUrl: string;
  price: number;
  type?: string;
}