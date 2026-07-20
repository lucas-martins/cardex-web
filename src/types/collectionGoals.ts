export interface CollectionGoal {
  code: string;
  title: string;
  description: string;
  currentValue: number;
  targetValue: number;
  completed: boolean;
}

export interface CollectionGoals {
  completedGoals: number;
  totalGoals: number;
  goals: CollectionGoal[];
}