export interface ShareStatus {
  enabled: boolean;
  shareToken: string | null;
  shareUrl: string | null;
}

export interface PublicShareCollection {
  id: string;
  name: string;
  series: string;
  printedTotal: number;
  total: number;
  ownedCards: number;
  completionPercentage: number;
}

export interface PublicShareResponse {
  ownerName: string;
  shareToken: string;
  collections: PublicShareCollection[];
}
