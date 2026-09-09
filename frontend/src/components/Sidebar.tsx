import type { ReactNode } from "react";

import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: ReactNode;
  available: boolean;
}

const DRAWER_WIDTH = 250;

function Sidebar({
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems: NavigationItem[] = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: <DashboardRoundedIcon />,
      available: true,
    },
    {
      label: "Categories",
      path: "/categories",
      icon: <CategoryRoundedIcon />,
      available: true,
    },
    {
      label: "Products",
      path: "/products",
      icon: <Inventory2RoundedIcon />,
      available: true,
    },
    {
      label: "Customers",
      path: "/customers",
      icon: <GroupsRoundedIcon />,
      available: true,
    },
    {
      label: "Pricing Rules",
      path: "/pricing-rules",
      icon: <RuleRoundedIcon />,
      available: true,
    },
    {
      label: "Promotions",
      path: "/promotions",
      icon: <LocalOfferRoundedIcon />,
      available: true,
    },
    {
      label: "Price Calculator",
      path: "/pricing-calculator",
      icon: <CalculateRoundedIcon />,
      available: true,
    },
    {
      label: "Calculation History",
      path: "/calculation-history",
      icon: <HistoryRoundedIcon />,
      available: true,
    },
  ];

  const visibleItems =
    navigationItems;

  const handleNavigation = (
    item: NavigationItem,
  ) => {
    if (!item.available) {
      return;
    }

    navigate(item.path);
    onMobileClose();
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#FFFDFC",
      }}
    >
      <Box
        sx={{
          px: 2.25,
          py: 2.25,
        }}
      >
        <Stack
          direction="row"
          spacing={1.25}
          alignItems="center"
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              flexShrink: 0,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              color: "#FFFFFF",
              background:
                "linear-gradient(135deg, #B89C8C 0%, #9A8FB8 100%)",
              boxShadow:
                "0 7px 18px rgba(105, 82, 72, 0.15)",
            }}
          >
            <DashboardRoundedIcon fontSize="small" />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 850,
                lineHeight: 1.1,
              }}
            >
              PriceFlow
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              Control Center
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      <Box
        sx={{
          px: 1.25,
          py: 1.75,
          flex: 1,
          overflowY: "auto",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            display: "block",
            px: 1.25,
            mb: 1,
            color: "#A49A94",
            fontWeight: 800,
            letterSpacing:
              "0.11em",
          }}
        >
          WORKSPACE
        </Typography>

        <List
          disablePadding
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.35,
          }}
        >
          {visibleItems.map(
            (item) => {
              const isActive =
                location.pathname ===
                item.path;

              return (
                <ListItemButton
                  key={item.path}
                  disabled={
                    !item.available
                  }
                  onClick={() =>
                    handleNavigation(
                      item,
                    )
                  }
                  sx={{
                    minHeight: 46,
                    px: 1.25,
                    borderRadius: "12px",
                    color: isActive
                      ? "#665047"
                      : "#756C67",
                    backgroundColor:
                      isActive
                        ? "#F0E6DF"
                        : "transparent",
                    opacity:
                      item.available
                        ? 1
                        : 0.52,
                    position:
                      "relative",
                    transition:
                      "all 150ms ease",
                    "&:hover": {
                      backgroundColor:
                        item.available
                          ? isActive
                            ? "#EEE1D9"
                            : "#F7F0EC"
                          : "transparent",
                    },
                    "&.Mui-disabled": {
                      opacity: 0.48,
                    },
                    ...(isActive && {
                      "&::before": {
                        content:
                          '""',
                        position:
                          "absolute",
                        left: 0,
                        top: 8,
                        bottom: 8,
                        width: 3,
                        borderRadius:
                          "0 4px 4px 0",
                        backgroundColor:
                          "#A58B7B",
                      },
                    }),
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 38,
                      color: isActive
                        ? "#8D7364"
                        : "#938983",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      item.label
                    }
                    primaryTypographyProps={{
                      fontSize:
                        "0.87rem",
                      fontWeight:
                        isActive
                          ? 800
                          : 600,
                    }}
                  />

                  {!item.available ? (
                    <Chip
                      label="Soon"
                      size="small"
                      sx={{
                        height: 21,
                        fontSize:
                          "0.62rem",
                        backgroundColor:
                          "#F2ECE8",
                        color:
                          "#9A908A",
                      }}
                    />
                  ) : (
                    <ChevronRightRoundedIcon
                      sx={{
                        fontSize: 17,
                        opacity:
                          isActive
                            ? 0.6
                            : 0.25,
                      }}
                    />
                  )}
                </ListItemButton>
              );
            },
          )}
        </List>
      </Box>

      <Box
        sx={{
          p: 1.75,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: "14px",
            background:
              "linear-gradient(135deg, #F4ECE7 0%, #F0ECF4 100%)",
            border:
              "1px solid #E7DDD8",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor:
                  "#739B82",
                boxShadow:
                  "0 0 0 4px rgba(115, 155, 130, 0.12)",
              }}
            />

            <Typography
              variant="caption"
              sx={{
                fontWeight: 750,
                color: "#557660",
              }}
            >
              Pricing engine online
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Box
        component="nav"
        sx={{
          display: {
            xs: "none",
            md: "block",
          },
          width: DRAWER_WIDTH,
          flexShrink: 0,
        }}
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            "& .MuiDrawer-paper": {
              width:
                DRAWER_WIDTH,
              boxSizing:
                "border-box",
              borderRight:
                "1px solid rgba(139, 111, 97, 0.12)",
              backgroundColor:
                "#FFFDFC",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: "block",
            md: "none",
          },
          "& .MuiDrawer-paper": {
            width:
              DRAWER_WIDTH,
            boxSizing:
              "border-box",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

export default Sidebar;