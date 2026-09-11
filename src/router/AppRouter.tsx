import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "../components/ProtectedRoute";
import { MainLayout } from "../layouts/MainLayout";

import { LoginPage } from "../pages/Login/LoginPage";
import { RegisterPage } from "../pages/Register/RegisterPage";
import { ForgotPasswordPage } from "../pages/ForgotPassword/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/ResetPassword/ResetPasswordPage";
import { HomePage } from "../pages/Home/HomePage";
import { CollectionPage } from "../pages/Collection/CollectionPage";
import { CardDetailsPage } from "../pages/CardDetails/CardDetailsPage";
import { SearchPage } from "../pages/Search/SearchPage";
import { WishlistPage } from "../pages/Wishlist/WishlistPage";
import { CollectionDetailsPage } from "../pages/CollectionDetails/CollectionDetailsPage";
import { ProfilePage } from "../pages/Profile/ProfilePage";
import { HistoryPage } from "../pages/History/HistoryPage";
import { CollectionsPage } from "../pages/Collections/CollectionsPage";
import { PublicSharePage } from "../pages/PublicShare/PublicSharePage";
import { PublicShareChecklistPage } from "../pages/PublicShare/PublicShareChecklistPage";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/share/:token" element={<PublicSharePage />} />

        <Route
          path="/share/:token/collections/:collectionId"
          element={<PublicShareChecklistPage />}
        />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/collection/:id" element={<CardDetailsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/history" element={<HistoryPage />} />

          <Route
            path="/collections/:collectionId"
            element={<CollectionDetailsPage />}
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
