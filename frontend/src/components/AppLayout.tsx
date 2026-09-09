import React from "react";

import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import { useAuth } from "../context/AuthContext";

const PAGE_TITLES: Record<
  string,
  string
> = {
  "/dashboard": "Dashboard",
  "/categories": "Categories",
  "/products": "Products",
  "/customers": "Customers",
  "/pricing-rules": "Pricing Rules",
  "/promotions": "Promotions",
  "/pricing-calculator": "Price Calculator",
  "/calculation-history":
    "Calculation History",
  "/admin/users": "User Management",
};

function AppLayout() {
  const location = useLocation();
  const { user } = useAuth();

  const [
    mobileOpen,
    setMobileOpen,
  ] = React.useState(false);

  const currentTitle =
    Object.entries(
      PAGE_TITLES,
    ).find(
      ([path]) =>
        location.pathname === path ||
        location.pathname.startsWith(
          `${path}/`,
        ),
    )?.[1] ?? "PriceFlow";

  const displayName: string =
    user?.email
      ? user.email.split("@")[0]
      : "User";

  const nameParts: string[] =
    displayName
      .split(/\s+/)
      .filter(
        (part: string) =>
          part.length > 0,
      )
      .slice(0, 2);

  const initials: string =
    nameParts
      .map(
        (part: string) =>
          part.charAt(0).toUpperCase(),
      )
      .join("") || "U";

  const roleName: string =
    typeof user?.role === "string"
      ? user.role
      : "USER";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor:
          "#FAF7F4",
      }}
    >
      {/* =========================
          SIDEBAR
      ========================== */}

      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() =>
          setMobileOpen(false)
        }
      />

      {/* =========================
          MAIN APPLICATION AREA
      ========================== */}

      <Box
        sx={{
          minHeight: "100vh",
          pl: {
            xs: 0,
            md: "250px",
          },
        }}
      >
        {/* =========================
            TOP HEADER
        ========================== */}

        <Box
          component="header"
          sx={{
            height: {
              xs: 64,
              md: 72,
            },
            px: {
              xs: 2,
              sm: 3,
              md: 4,
            },
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 2,
            position: "sticky",
            top: 0,
            zIndex: 1000,
            backgroundColor:
              "rgba(255, 253, 252, 0.93)",
            borderBottom:
              "1px solid #E9E0DB",
            backdropFilter:
              "blur(14px)",
          }}
        >
          {/* LEFT SIDE */}

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              minWidth: 0,
            }}
          >
            <IconButton
              onClick={() =>
                setMobileOpen(true)
              }
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
                width: 40,
                height: 40,
                border:
                  "1px solid #E5DBD6",
                backgroundColor:
                  "#FFFDFC",
              }}
              aria-label="Open navigation"
            >
              <MenuRoundedIcon />
            </IconButton>

            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color:
                    "primary.main",
                  fontWeight: 800,
                  letterSpacing:
                    "0.08em",
                  textTransform:
                    "uppercase",
                }}
              >
                PriceFlow
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.15,
                  whiteSpace:
                    "nowrap",
                  overflow:
                    "hidden",
                  textOverflow:
                    "ellipsis",
                }}
              >
                {currentTitle}
              </Typography>
            </Box>
          </Stack>

          {/* RIGHT SIDE */}

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <IconButton
              sx={{
                width: 40,
                height: 40,
                border:
                  "1px solid #E7DDD8",
                backgroundColor:
                  "#FFFDFC",
              }}
              aria-label="Notifications"
            >
              <NotificationsNoneRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </IconButton>

            <Box
              sx={{
                display: {
                  xs: "none",
                  sm: "block",
                },
                textAlign: "right",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.2,
                }}
              >
                {displayName}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {roleName}
              </Typography>
            </Box>

            <Avatar
              sx={{
                width: 40,
                height: 40,
                fontSize: 14,
                fontWeight: 800,
                background:
                  "linear-gradient(135deg, #B89C8C 0%, #9A8FB8 100%)",
              }}
            >
              {initials}
            </Avatar>
          </Stack>
        </Box>

        {/* =========================
            PAGE CONTENT
        ========================== */}

        <Box
          component="main"
          sx={{
            minHeight:
              "calc(100vh - 72px)",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default AppLayout;