import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { CollectionPage } from "../pages/Collection/CollectionPage";
import { HomePage } from "../pages/Home/HomePage";
import { SearchPage } from "../pages/Search/SearchPage";
import { CardDetailsPage } from "../pages/CardDetails/CardDetailsPage";
import { WishlistPage } from "../pages/Wishlist/WishlistPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:id" element={<CardDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}