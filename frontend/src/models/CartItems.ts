import { ArtistPiece } from "./ArtistPiece";

export interface CartItem extends ArtistPiece {
  quantity: number;
  imageUrl?: string;
}