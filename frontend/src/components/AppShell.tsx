import {
  useState,
  type ReactNode,
} from "react";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: ReactNode;
}


function AppShell({
  children,
}: AppShellProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Box
      className="app-shell"
      sx={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: "background.default",
      }}
    >
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileClose={() =>
          setMobileOpen(false)
        }
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <Box
          component="header"
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 90,
            borderBottom: "1px solid",
            borderColor: "divider",
            backgroundColor:
              "rgba(255, 253, 252, 0.94)",
            backdropFilter: "blur(16px)",
          }}
        >
          <Toolbar
            disableGutters
            sx={{
              minHeight: 64,
              px: {
                xs: 2,
                sm: 3,
                lg: 4,
              },
              gap: 1.5,
            }}
          >
            {/* Mobile menu */}
            <IconButton
              onClick={() =>
                setMobileOpen(true)
              }
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
                color: "text.primary",
                backgroundColor: "#F2ECE8",
                borderRadius: "10px",
                "&:hover": {
                  backgroundColor: "#EDE3DD",
                },
              }}
              aria-label="Open navigation"
            >
              <MenuRoundedIcon />
            </IconButton>

            {/* Mobile brand */}
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                display: {
                  xs: "flex",
                  md: "none",
                },
                flex: 1,
              }}
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: "10px",
                  display: "grid",
                  placeItems: "center",
                  color: "#FFFFFF",
                  background:
                    "linear-gradient(135deg, #B89C8C 0%, #9A8FB8 100%)",
                }}
              >
                <AutoAwesomeRoundedIcon
                  sx={{
                    fontSize: 18,
                  }}
                />
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                }}
              >
                PriceFlow
              </Typography>
            </Stack>

            {/* Desktop page identity */}
            <Box
              sx={{
                display: {
                  xs: "none",
                  md: "block",
                },
                flex: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 750,
                }}
              >
                Pricing workspace
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Manage your pricing operations
              </Typography>
            </Box>

            <Chip
              icon={
                <CheckCircleOutlineRoundedIcon />
              }
              label="Online"
              size="small"
              sx={{
                display: {
                  xs: "none",
                  sm: "flex",
                },
                backgroundColor:
                  "success.light",
                color: "success.dark",
                "& .MuiChip-icon": {
                  color: "success.dark",
                },
              }}
            />

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
                  fontWeight: 750,
                  lineHeight: 1.15,
                }}
              >
                {user?.username ?? "User"}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {user?.role.name ?? "USER"}
              </Typography>
            </Box>

            <Button
              variant="outlined"
              size="small"
              startIcon={<LogoutRoundedIcon />}
              onClick={handleLogout}
              sx={{
                minHeight: 38,
                borderColor: "#DCCEC5",
                color: "primary.dark",
                backgroundColor:
                  "rgba(255, 253, 252, 0.7)",
                "&:hover": {
                  borderColor: "primary.light",
                  backgroundColor: "#F5EEEA",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: {
                    xs: "none",
                    sm: "inline",
                  },
                }}
              >
                Logout
              </Box>
            </Button>
          </Toolbar>
        </Box>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          {children}
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: {
              xs: 2,
              sm: 3,
              lg: 4,
            },
            borderTop: "1px solid",
            borderColor: "divider",
            backgroundColor:
              "rgba(255, 253, 252, 0.65)",
          }}
        >
          <Container
            maxWidth={false}
            disableGutters
          >
            <Typography
              variant="caption"
              color="text.secondary"
            >
              PriceFlow · Dynamic Pricing &
              Business Rules Engine
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}

export default AppShell;