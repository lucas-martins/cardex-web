export interface WishlistCard {
  id: number;
  externalId: string;
  name: string;
  cardNumber: string | null;
  collectionId: string | null;
  collectionName: string | null;
  series: string | null;
  rarity: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}