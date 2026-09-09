import { Navigate, Outlet } from "react-router-dom";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;