import { apiClient } from "../api/apiClient";
import type { CardHistoryPage } from "../../types/cardHistory";

export async function findCardHistory(
  page = 0,
  size = 20,
): Promise<CardHistoryPage> {
  const response = await apiClient.get<CardHistoryPage>(
    "/card-history",
    {
      params: {
        page,
        size,
      },
    },
  );

  return response.data;
}