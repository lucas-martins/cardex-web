import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "../components/ProtectedRoute";
import { MainLayout } from "../layouts/MainLayout";

import { LoginPage } from "../pages/Login/LoginPage";
import { RegisterPage } from "../pages/Register/RegisterPage";
import { HomePage } from "../pages/Home/HomePage";
import { CollectionPage } from "../pages/Collection/CollectionPage";
import { CardDetailsPage } from "../pages/CardDetails/CardDetailsPage";
import { SearchPage } from "../pages/Search/SearchPage";
import { WishlistPage } from "../pages/Wishlist/WishlistPage";
import { CollectionDetailsPage } from "../pages/CollectionDetails/CollectionDetailsPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collection/:id" element={<CardDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route
            path="/collections/:collectionId"
            element={<CollectionDetailsPage />}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
