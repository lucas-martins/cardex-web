export type CollectionGoalType =
  | "TOTAL_CARDS"
  | "COLLECTION_COMPLETION"
  | "LANGUAGE_CARDS";

export interface UserCollectionGoal {
  id: number;
  title: string;
  type: CollectionGoalType;
  targetValue: number | null;
  collectionId: string | null;
  collectionName: string | null;
  language: string | null;
  currentValue: number;
  goalValue: number;
  completionPercentage: number;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCollectionGoalRequest {
  title: string;
  type: CollectionGoalType;
  targetValue?: number | null;
  collectionId?: string | null;
  language?: string | null;
}

export interface UpdateCollectionGoalRequest {
  title: string;
  type: CollectionGoalType;
  targetValue?: number | null;
  collectionId?: string | null;
  language?: string | null;
}