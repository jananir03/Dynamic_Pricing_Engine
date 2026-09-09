import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "../components/AppLayout";
import CategoriesPage from "../pages/CategoriesPage";
import CalculationHistoryPage from "../pages/CalculationHistoryPage";
import CustomersPage from "../pages/CustomersPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import PricingCalculatorPage from "../pages/PricingCalculatorPage";
import PricingRulesPage from "../pages/PricingRulesPage";
import ProductsPage from "../pages/ProductsPage";
import PromotionsPage from "../pages/PromotionsPage";
import RegisterPage from "../pages/RegisterPage";

import ProtectedRoute from "./ProtectedRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={<LoginPage />}
      />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      {/* Protected application */}
      <Route
        element={<ProtectedRoute />}
      >
        <Route
          element={<AppLayout />}
        >
          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/categories"
            element={<CategoriesPage />}
          />

          <Route
            path="/products"
            element={<ProductsPage />}
          />

          <Route
            path="/customers"
            element={<CustomersPage />}
          />

          <Route
            path="/pricing-rules"
            element={<PricingRulesPage />}
          />

          <Route
            path="/promotions"
            element={<PromotionsPage />}
          />

          <Route
            path="/pricing-calculator"
            element={
              <PricingCalculatorPage />
            }
          />

          <Route
            path="/calculation-history"
            element={
              <CalculationHistoryPage />
            }
          />
        </Route>
      </Route>

      {/* Default */}
      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* Unknown route */}
      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />
    </Routes>
  );
}

export default AppRoutes;