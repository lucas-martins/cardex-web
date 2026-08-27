import { apiClient } from "../api/apiClient";
import type {
  CreateCollectionGoalRequest,
  UpdateCollectionGoalRequest,
  UserCollectionGoal,
} from "../../types/userCollectionGoal";

export async function findCollectionGoals(): Promise<UserCollectionGoal[]> {
  const response = await apiClient.get<UserCollectionGoal[]>(
    "/collection-goals",
  );

  return response.data;
}

export async function createCollectionGoal(
  request: CreateCollectionGoalRequest,
): Promise<UserCollectionGoal> {
  const response = await apiClient.post<UserCollectionGoal>(
    "/collection-goals",
    request,
  );

  return response.data;
}

export async function updateCollectionGoal(
  id: number,
  request: UpdateCollectionGoalRequest,
): Promise<UserCollectionGoal> {
  const response = await apiClient.put<UserCollectionGoal>(
    `/collection-goals/${id}`,
    request,
  );

  return response.data;
}

export async function deleteCollectionGoal(
  id: number,
): Promise<void> {
  await apiClient.delete(
    `/collection-goals/${id}`,
  );
}