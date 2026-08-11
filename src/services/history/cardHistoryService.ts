import { apiClient } from "../api/apiClient";
import type {
  CardHistoryAction,
  CardHistoryPage,
} from "../../types/cardHistory";

export async function findCardHistory(
  page = 0,
  size = 20,
  action?: CardHistoryAction,
): Promise<CardHistoryPage> {
  const response = await apiClient.get<CardHistoryPage>(
    "/card-history",
    {
      params: {
        page,
        size,
        action: action || undefined,
      },
    },
  );

  return response.data;
}