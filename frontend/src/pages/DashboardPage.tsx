import {
  useEffect,
  useState,
  type ReactNode,
} from "react";

import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import {
  getDashboardData,
  type DashboardData,
} from "../services/dashboardService";

function DashboardPage() {
  const [data, setData] =
    useState<DashboardData | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");

    try {
      const dashboardData =
        await getDashboardData();

      setData(dashboardData);
    } catch {
      setError(
        "We couldn't load the dashboard data. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "calc(100vh - 64px)",
        overflow: "hidden",
      }}
    >
      {/* Decorative background */}
      <Box
        sx={{
          position: "absolute",
          width: 420,
          height: 420,
          borderRadius: "50%",
          backgroundColor: "#EADFD8",
          opacity: 0.18,
          top: -250,
          right: -150,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 340,
          height: 340,
          borderRadius: "50%",
          backgroundColor: "#E5E0ED",
          opacity: 0.16,
          bottom: -210,
          left: -160,
          pointerEvents: "none",
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          px: {
            xs: 2,
            sm: 3,
            lg: 4,
          },
          py: {
            xs: 3,
            sm: 4,
            md: 4.5,
          },
        }}
      >
        <Stack spacing={3}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: {
                xs: "flex-start",
                sm: "center",
              },
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{
                  color: "primary.main",
                  fontWeight: 800,
                  letterSpacing: "0.13em",
                }}
              >
                OVERVIEW
              </Typography>

              <Typography
                variant="h3"
                sx={{
                  mt: 0.3,
                  fontSize: {
                    xs: "1.9rem",
                    sm: "2.35rem",
                    md: "2.7rem",
                  },
                  lineHeight: 1.1,
                }}
              >
                Dashboard
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                }}
              >
                A quick view of your pricing engine.
              </Typography>
            </Box>

            <IconButton
              onClick={() =>
                void loadDashboard()
              }
              disabled={isLoading}
              sx={{
                width: 42,
                height: 42,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor:
                  "rgba(255, 253, 252, 0.8)",
                "&:hover": {
                  backgroundColor: "#F3ECE8",
                },
              }}
              aria-label="Refresh dashboard"
            >
              <RefreshRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </IconButton>
          </Box>

          {error && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() =>
                    void loadDashboard()
                  }
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Stats */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                sm: "repeat(3, 1fr)",
                lg: "repeat(6, 1fr)",
              },
              gap: 1.75,
            }}
          >
            <StatCard
              title="Products"
              value={data?.stats.products}
              icon={<Inventory2RoundedIcon />}
              background="#F1E8E2"
            />

            <StatCard
              title="Categories"
              value={data?.stats.categories}
              icon={<CategoryRoundedIcon />}
              background="#EEEAF3"
            />

            <StatCard
              title="Customers"
              value={data?.stats.customers}
              icon={<GroupsRoundedIcon />}
              background="#E8F0EB"
            />

            <StatCard
              title="Pricing Rules"
              value={data?.stats.pricingRules}
              icon={<RuleRoundedIcon />}
              background="#F3EBDD"
            />

            <StatCard
              title="Promotions"
              value={data?.stats.promotions}
              icon={<LocalOfferRoundedIcon />}
              background="#EDE7F1"
            />

            <StatCard
              title="Calculations"
              value={data?.stats.calculations}
              icon={<CalculateRoundedIcon />}
              background="#E5EFEC"
            />
          </Box>

          {/* Recent calculations */}
          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  sm: 3,
                },
                "&:last-child": {
                  pb: {
                    xs: 2.5,
                    sm: 3,
                  },
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 750,
                    }}
                  >
                    Recent calculations
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.35,
                    }}
                  >
                    Latest pricing decisions from the engine.
                  </Typography>
                </Box>

                <Chip
                  label={
                    data
                      ? `${data.stats.calculations} total`
                      : "Loading"
                  }
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Stack>

              <Divider
                sx={{
                  my: 2.25,
                }}
              />

              {isLoading ? (
                <Box
                  sx={{
                    minHeight: 180,
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CircularProgress size={28} />
                </Box>
              ) : data &&
                data.recentCalculations.length > 0 ? (
                <Stack spacing={0}>
                  {data.recentCalculations.map(
                    (calculation, index) => (
                      <Box
                        key={calculation.id}
                        sx={{
                          py: 1.5,
                          borderBottom:
                            index <
                            data.recentCalculations.length - 1
                              ? "1px solid"
                              : "none",
                          borderColor: "divider",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              flexShrink: 0,
                              borderRadius: "11px",
                              display: "grid",
                              placeItems: "center",
                              backgroundColor: "#F0E9E4",
                              color: "primary.main",
                            }}
                          >
                            <TrendingUpRoundedIcon
                              sx={{
                                fontSize: 20,
                              }}
                            />
                          </Box>

                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 750,
                              }}
                            >
                              Calculation #
                              {calculation.id}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Product #
                              {
                                calculation.product_id
                              }{" "}
                              · Customer #
                              {
                                calculation.customer_id
                              }{" "}
                              · Qty{" "}
                              {
                                calculation.quantity
                              }
                            </Typography>
                          </Box>

                          <Box
                            sx={{
                              textAlign: "right",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 800,
                                color: "primary.dark",
                              }}
                            >
                              ₹
                              {formatMoney(
                                calculation.final_price,
                              )}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDate(
                                calculation.calculated_at,
                              )}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ),
                  )}
                </Stack>
              ) : (
                <Box
                  sx={{
                    minHeight: 160,
                    display: "grid",
                    placeItems: "center",
                    textAlign: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 700,
                      }}
                    >
                      No calculations yet
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Pricing calculations will appear here
                      once you start using the engine.
                    </Typography>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}

interface StatCardProps {
  title: string;
  value: number | undefined;
  icon: ReactNode;
  background: string;
}

function StatCard({
  title,
  value,
  icon,
  background,
}: StatCardProps) {
  return (
    <Card
      sx={{
        minWidth: 0,
        transition:
          "transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow:
            "0 12px 28px rgba(72, 56, 47, 0.09)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2,
          "&:last-child": {
            pb: 2,
          },
        }}
      >
        <Stack spacing={1.5}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "11px",
              display: "grid",
              placeItems: "center",
              backgroundColor: background,
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                mt: 0.25,
                fontWeight: 800,
              }}
            >
              {value ?? "—"}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function formatMoney(
  value: string,
): string {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return value;
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

export default DashboardPage;