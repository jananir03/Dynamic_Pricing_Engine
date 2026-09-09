import React from "react";

import axios from "axios";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useAuth } from "../context/AuthContext";

import {
  createPromotion,
  deletePromotion,
  getPromotions,
  updatePromotion,
  updatePromotionStatus,
  type DiscountType,
  type Promotion,
  type PromotionCreateRequest,
} from "../services/promotionService";

const PAGE_SIZE_OPTIONS = [
  5,
  10,
  25,
  50,
];

interface PromotionForm {
  code: string;
  discount_type: DiscountType;
  discount_value: string;
  minimum_purchase: string;
  maximum_discount: string;
  start_date: string;
  expiry_date: string;
  usage_limit: string;
}

const EMPTY_FORM: PromotionForm = {
  code: "",
  discount_type: "PERCENTAGE",
  discount_value: "",
  minimum_purchase: "0",
  maximum_discount: "",
  start_date: "",
  expiry_date: "",
  usage_limit: "",
};

function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data
      ?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      return detail
        .map(
          (item: {
            msg?: string;
          }) => item.msg ?? "Invalid value.",
        )
        .join(" ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function formatMoney(
  value: string | number | null,
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "—";
  }

  const numberValue =
    Number(value);

  if (Number.isNaN(numberValue)) {
    return "—";
  }

  return `₹${numberValue.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  )}`;
}

function formatDate(
  value: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
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

function toDateTimeLocal(
  value: string | null,
): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (
    number: number,
  ): string =>
    String(number).padStart(2, "0");

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1,
  )}-${pad(
    date.getDate(),
  )}T${pad(
    date.getHours(),
  )}:${pad(
    date.getMinutes(),
  )}`;
}

function toISOStringFromLocal(
  value: string,
): string {
  return new Date(value).toISOString();
}

function formatDiscount(
  promotion: Promotion,
): string {
  if (
    promotion.discount_type ===
    "PERCENTAGE"
  ) {
    return `${Number(
      promotion.discount_value,
    )}%`;
  }

  return formatMoney(
    promotion.discount_value,
  );
}

function getStatusColor(
  promotion: Promotion,
):
  | "success"
  | "default" {
  return promotion.is_active
    ? "success"
    : "default";
}

function StatCard({
  title,
  value,
  icon,
  background,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  background: string;
}) {
  return (
    <Card
      sx={{
        height: "100%",
      }}
    >
      <CardContent>
        <Stack spacing={1.5}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              backgroundColor:
                background,
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
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
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function PromotionsPage() {
  const { user } = useAuth();

  const isAdmin =
    user?.role.name?.toUpperCase() ===
    "ADMIN";

  const [
    promotions,
    setPromotions,
  ] = React.useState<Promotion[]>([]);

  const [total, setTotal] =
    React.useState(0);

  const [totalPages, setTotalPages] =
    React.useState(0);

  const [page, setPage] =
    React.useState(1);

  const [
    pageSize,
    setPageSize,
  ] = React.useState(10);

  const [
    search,
    setSearch,
  ] = React.useState("");

  const [
    searchInput,
    setSearchInput,
  ] = React.useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = React.useState<
    "" | "active" | "inactive"
  >("");

  const [
    discountTypeFilter,
    setDiscountTypeFilter,
  ] = React.useState<
    "" | DiscountType
  >("");

  const [
    loading,
    setLoading,
  ] = React.useState(true);

  const [
    mutationLoading,
    setMutationLoading,
  ] = React.useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = React.useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = React.useState("");

  const [
    formOpen,
    setFormOpen,
  ] = React.useState(false);

  const [
    editingPromotion,
    setEditingPromotion,
  ] = React.useState<Promotion | null>(
    null,
  );

  const [
    form,
    setForm,
  ] = React.useState<PromotionForm>(
    EMPTY_FORM,
  );

  const [
    deleteTarget,
    setDeleteTarget,
  ] = React.useState<Promotion | null>(
    null,
  );

  const [
    statusTarget,
    setStatusTarget,
  ] = React.useState<Promotion | null>(
    null,
  );

  const loadPromotions =
    React.useCallback(
      async () => {
        try {
          setLoading(true);
          setErrorMessage("");

          const response =
            await getPromotions({
              page,
              page_size: pageSize,
              search:
                search.trim() || undefined,
              is_active:
                statusFilter ===
                ""
                  ? undefined
                  : statusFilter ===
                      "active",
              discount_type:
                discountTypeFilter ||
                undefined,
              sort_by:
                "created_at",
              sort_order:
                "desc",
            });

          setPromotions(
            response.items,
          );
          setTotal(
            response.total,
          );
          setTotalPages(
            response.total_pages,
          );
        } catch (error) {
          setErrorMessage(
            getErrorMessage(error),
          );
        } finally {
          setLoading(false);
        }
      },
      [
        page,
        pageSize,
        search,
        statusFilter,
        discountTypeFilter,
      ],
    );

  React.useEffect(() => {
    void loadPromotions();
  }, [loadPromotions]);

  React.useEffect(() => {
    const timer =
      window.setTimeout(() => {
        setPage(1);
        setSearch(
          searchInput,
        );
      }, 350);

    return () =>
      window.clearTimeout(
        timer,
      );
  }, [searchInput]);

  const activeCount =
    promotions.filter(
      (promotion) =>
        promotion.is_active,
    ).length;

  const percentageCount =
    promotions.filter(
      (promotion) =>
        promotion.discount_type ===
        "PERCENTAGE",
    ).length;

  const totalUsage =
    promotions.reduce(
      (
        sum,
        promotion,
      ) =>
        sum +
        promotion.usage_count,
      0,
    );

  const openCreateDialog =
    () => {
      setEditingPromotion(null);
      setForm({
        ...EMPTY_FORM,
      });
      setErrorMessage("");
      setSuccessMessage("");
      setFormOpen(true);
    };

  const openEditDialog = (
    promotion: Promotion,
  ) => {
    setEditingPromotion(
      promotion,
    );

    setForm({
      code: promotion.code,
      discount_type:
        promotion.discount_type,
      discount_value:
        promotion.discount_value,
      minimum_purchase:
        promotion.minimum_purchase,
      maximum_discount:
        promotion.maximum_discount ??
        "",
      start_date:
        toDateTimeLocal(
          promotion.start_date,
        ),
      expiry_date:
        toDateTimeLocal(
          promotion.expiry_date,
        ),
      usage_limit:
        promotion.usage_limit
          ?.toString() ?? "",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setFormOpen(true);
  };

  const updateForm = (
    field: keyof PromotionForm,
    value: string,
  ) => {
    setForm(
      (
        previous,
      ) => ({
        ...previous,
        [field]: value,
      }),
    );
  };

  const validateForm =
    (): string | null => {
      if (
        !form.code.trim()
      ) {
        return "Promotion code is required.";
      }

      const discount =
        Number(
          form.discount_value,
        );

      if (
        !form.discount_value ||
        Number.isNaN(discount) ||
        discount <= 0
      ) {
        return "Discount value must be greater than zero.";
      }

      if (
        form.discount_type ===
          "PERCENTAGE" &&
        discount > 100
      ) {
        return "Percentage discount cannot exceed 100%.";
      }

      const minimum =
        Number(
          form.minimum_purchase,
        );

      if (
        Number.isNaN(minimum) ||
        minimum < 0
      ) {
        return "Minimum purchase cannot be negative.";
      }

      if (
        form.maximum_discount
      ) {
        const maximum =
          Number(
            form.maximum_discount,
          );

        if (
          Number.isNaN(
            maximum,
          ) ||
          maximum <= 0
        ) {
          return "Maximum discount must be greater than zero.";
        }
      }

      if (
        !form.start_date ||
        !form.expiry_date
      ) {
        return "Start date and expiry date are required.";
      }

      const start =
        new Date(
          form.start_date,
        );

      const expiry =
        new Date(
          form.expiry_date,
        );

      if (
        expiry <= start
      ) {
        return "Expiry date must be later than start date.";
      }

      if (
        form.usage_limit
      ) {
        const usageLimit =
          Number(
            form.usage_limit,
          );

        if (
          !Number.isInteger(
            usageLimit,
          ) ||
          usageLimit < 1
        ) {
          return "Usage limit must be a positive whole number.";
        }
      }

      return null;
    };

  const handleSubmit =
    async () => {
      const validation =
        validateForm();

      if (validation) {
        setErrorMessage(
          validation,
        );
        return;
      }

      if (!isAdmin) {
        setErrorMessage(
          "Only administrators can manage promotions.",
        );
        return;
      }

      try {
        setMutationLoading(true);
        setErrorMessage("");

        const payload:
          PromotionCreateRequest =
          {
            code: form.code
              .trim()
              .toUpperCase(),
            discount_type:
              form.discount_type,
            discount_value:
              form.discount_value,
            minimum_purchase:
              form.minimum_purchase ||
              "0",
            maximum_discount:
              form.maximum_discount ||
              null,
            start_date:
              toISOStringFromLocal(
                form.start_date,
              ),
            expiry_date:
              toISOStringFromLocal(
                form.expiry_date,
              ),
            usage_limit:
              form.usage_limit
                ? Number(
                    form.usage_limit,
                  )
                : null,
          };

        if (
          editingPromotion
        ) {
          await updatePromotion(
            editingPromotion.id,
            payload,
          );

          setSuccessMessage(
            "Promotion updated successfully.",
          );
        } else {
          await createPromotion(
            payload,
          );

          setSuccessMessage(
            "Promotion created successfully.",
          );
        }

        setFormOpen(false);

        await loadPromotions();
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setMutationLoading(
          false,
        );
      }
    };

  const handleStatusChange =
    async () => {
      if (!statusTarget) {
        return;
      }

      try {
        setMutationLoading(true);
        setErrorMessage("");

        await updatePromotionStatus(
          statusTarget.id,
          !statusTarget.is_active,
        );

        setStatusTarget(null);

        setSuccessMessage(
          statusTarget.is_active
            ? "Promotion deactivated."
            : "Promotion activated.",
        );

        await loadPromotions();
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setMutationLoading(
          false,
        );
      }
    };

  const handleDelete =
    async () => {
      if (!deleteTarget) {
        return;
      }

      try {
        setMutationLoading(true);
        setErrorMessage("");

        await deletePromotion(
          deleteTarget.id,
        );

        setDeleteTarget(null);

        setSuccessMessage(
          "Promotion deleted successfully.",
        );

        if (
          promotions.length ===
            1 &&
          page > 1
        ) {
          setPage(
            page - 1,
          );
        } else {
          await loadPromotions();
        }
      } catch (error) {
        setErrorMessage(
          getErrorMessage(error),
        );
      } finally {
        setMutationLoading(
          false,
        );
      }
    };

  return (
    <Box
      sx={{
        minHeight:
          "calc(100vh - 72px)",
        backgroundColor:
          "#FAF7F4",
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        <Stack spacing={3}>
          {/* PAGE INTRO */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="overline"
                color="primary.main"
                sx={{
                  fontWeight: 800,
                  letterSpacing:
                    "0.12em",
                }}
              >
                PROMOTION MANAGEMENT
              </Typography>

              <Typography
                variant="h3"
                sx={{
                  mt: 0.5,
                  fontWeight: 800,
                  fontSize: {
                    xs: "2rem",
                    md: "2.6rem",
                  },
                }}
              >
                Promotions
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  maxWidth: 700,
                }}
              >
                Create discount campaigns and
                control how promotion codes are
                applied by the pricing engine.
              </Typography>
            </Box>

            {isAdmin && (
              <Button
                variant="contained"
                startIcon={
                  <AddRoundedIcon />
                }
                onClick={
                  openCreateDialog
                }
                sx={{
                  minWidth: 160,
                }}
              >
                Add Promotion
              </Button>
            )}
          </Stack>

          {/* MESSAGES */}

          {successMessage && (
            <Alert
              severity="success"
              onClose={() =>
                setSuccessMessage("")
              }
            >
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert
              severity="error"
              onClose={() =>
                setErrorMessage("")
              }
            >
              {errorMessage}
            </Alert>
          )}

          {/* STATS */}

          <Grid
            container
            spacing={2}
          >
            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <StatCard
                title="Total Promotions"
                value={total}
                icon={
                  <LocalOfferRoundedIcon />
                }
                background="#F1E6DF"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <StatCard
                title="Active on Page"
                value={activeCount}
                icon={
                  <ToggleOnRoundedIcon />
                }
                background="#E7F0E7"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <StatCard
                title="Percentage Offers"
                value={percentageCount}
                icon={
                  <LocalOfferRoundedIcon />
                }
                background="#EEE8F3"
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                md: 3,
              }}
            >
              <StatCard
                title="Usage on Page"
                value={totalUsage}
                icon={
                  <PeopleAltRoundedIcon />
                }
                background="#E8EEF1"
              />
            </Grid>
          </Grid>

          {/* FILTERS */}

          <Card>
            <CardContent>
              <Grid
                container
                spacing={2}
                alignItems="center"
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 5,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Search promotion code"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(
                        event.target
                          .value,
                      )
                    }
                    placeholder="Example: SAVE20"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3.5,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>
                      Discount type
                    </InputLabel>

                    <Select
                      label="Discount type"
                      value={
                        discountTypeFilter
                      }
                      onChange={(event) => {
                        setPage(1);
                        setDiscountTypeFilter(
                          event.target
                            .value as
                            | ""
                            | DiscountType,
                        );
                      }}
                    >
                      <MenuItem value="">
                        All types
                      </MenuItem>

                      <MenuItem value="PERCENTAGE">
                        Percentage
                      </MenuItem>

                      <MenuItem value="FIXED">
                        Fixed amount
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3.5,
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>
                      Status
                    </InputLabel>

                    <Select
                      label="Status"
                      value={
                        statusFilter
                      }
                      onChange={(event) => {
                        setPage(1);
                        setStatusFilter(
                          event.target
                            .value as
                            | ""
                            | "active"
                            | "inactive",
                        );
                      }}
                    >
                      <MenuItem value="">
                        All statuses
                      </MenuItem>

                      <MenuItem value="active">
                        Active
                      </MenuItem>

                      <MenuItem value="inactive">
                        Inactive
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* PROMOTION LIST */}

          <Card>
            <CardContent
              sx={{
                p: 0,
              }}
            >
              {loading ? (
                <Box
                  sx={{
                    minHeight: 300,
                    display: "grid",
                    placeItems:
                      "center",
                  }}
                >
                  <CircularProgress />
                </Box>
              ) : promotions.length ===
                0 ? (
                <Box
                  sx={{
                    minHeight: 300,
                    display: "grid",
                    placeItems:
                      "center",
                    textAlign: "center",
                    px: 3,
                  }}
                >
                  <Box>
                    <LocalOfferRoundedIcon
                      sx={{
                        fontSize: 48,
                        color:
                          "text.disabled",
                      }}
                    />

                    <Typography
                      variant="h6"
                      sx={{
                        mt: 1,
                        fontWeight: 800,
                      }}
                    >
                      No promotions found
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Create your first
                      promotion to use
                      discount codes in
                      the price calculator.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Stack>
                  {promotions.map(
                    (
                      promotion,
                      index,
                    ) => (
                      <Box
                        key={
                          promotion.id
                        }
                        sx={{
                          p: {
                            xs: 2,
                            md: 2.5,
                          },
                          borderBottom:
                            index ===
                            promotions.length -
                              1
                              ? "none"
                              : "1px solid #EAE1DC",
                        }}
                      >
                        <Stack
                          direction={{
                            xs: "column",
                            md: "row",
                          }}
                          spacing={2}
                          alignItems={{
                            xs: "flex-start",
                            md: "center",
                          }}
                        >
                          <Box
                            sx={{
                              width: 46,
                              height: 46,
                              flexShrink: 0,
                              borderRadius:
                                "13px",
                              display:
                                "grid",
                              placeItems:
                                "center",
                              backgroundColor:
                                "#F1E6DF",
                              color:
                                "primary.main",
                            }}
                          >
                            <LocalOfferRoundedIcon />
                          </Box>

                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              flexWrap="wrap"
                              alignItems="center"
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 800,
                                }}
                              >
                                {promotion.code}
                              </Typography>

                              <Chip
                                size="small"
                                label={
                                  promotion.is_active
                                    ? "Active"
                                    : "Inactive"
                                }
                                color={getStatusColor(
                                  promotion,
                                )}
                              />

                              <Chip
                                size="small"
                                variant="outlined"
                                label={
                                  promotion.discount_type ===
                                  "PERCENTAGE"
                                    ? "Percentage"
                                    : "Fixed"
                                }
                              />
                            </Stack>

                            <Stack
                              direction={{
                                xs: "column",
                                sm: "row",
                              }}
                              spacing={{
                                xs: 0.5,
                                sm: 2,
                              }}
                              sx={{
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 800,
                                  color:
                                    "primary.dark",
                                }}
                              >
                                {formatDiscount(
                                  promotion,
                                )}{" "}
                                discount
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Min. purchase{" "}
                                {formatMoney(
                                  promotion.minimum_purchase,
                                )}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                Used{" "}
                                {
                                  promotion.usage_count
                                }
                                {promotion.usage_limit
                                  ? ` / ${promotion.usage_limit}`
                                  : ""}
                              </Typography>
                            </Stack>

                            <Stack
                              direction={{
                                xs: "column",
                                sm: "row",
                              }}
                              spacing={{
                                xs: 0.5,
                                sm: 2,
                              }}
                              sx={{
                                mt: 0.75,
                              }}
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <CalendarMonthRoundedIcon
                                  sx={{
                                    fontSize: 16,
                                    color:
                                      "text.secondary",
                                  }}
                                />

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDate(
                                    promotion.start_date,
                                  )}{" "}
                                  →{" "}
                                  {formatDate(
                                    promotion.expiry_date,
                                  )}
                                </Typography>
                              </Stack>

                              {promotion.maximum_discount && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Max discount{" "}
                                  {formatMoney(
                                    promotion.maximum_discount,
                                  )}
                                </Typography>
                              )}
                            </Stack>
                          </Box>

                          {isAdmin && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                            >
                              <IconButton
                                onClick={() =>
                                  openEditDialog(
                                    promotion,
                                  )
                                }
                                aria-label="Edit promotion"
                              >
                                <EditRoundedIcon />
                              </IconButton>

                              <IconButton
                                onClick={() =>
                                  setStatusTarget(
                                    promotion,
                                  )
                                }
                                aria-label={
                                  promotion.is_active
                                    ? "Deactivate promotion"
                                    : "Activate promotion"
                                }
                              >
                                {promotion.is_active ? (
                                  <ToggleOffRoundedIcon />
                                ) : (
                                  <ToggleOnRoundedIcon />
                                )}
                              </IconButton>

                              <IconButton
                                onClick={() =>
                                  setDeleteTarget(
                                    promotion,
                                  )
                                }
                                aria-label="Delete promotion"
                              >
                                <DeleteOutlineRoundedIcon />
                              </IconButton>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    ),
                  )}
                </Stack>
              )}
            </CardContent>
          </Card>

          {/* PAGINATION */}

          {!loading &&
            total > 0 && (
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{
                  xs: "stretch",
                  sm: "center",
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  Showing{" "}
                  {(page - 1) *
                    pageSize +
                    1}
                  –
                  {Math.min(
                    page *
                      pageSize,
                    total,
                  )}{" "}
                  of {total} promotions
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent={{
                    xs: "space-between",
                    sm: "flex-end",
                  }}
                >
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: 100,
                    }}
                  >
                    <InputLabel>
                      Page size
                    </InputLabel>

                    <Select
                      label="Page size"
                      value={pageSize}
                      onChange={(event) => {
                        setPageSize(
                          Number(
                            event.target
                              .value,
                          ),
                        );
                        setPage(1);
                      }}
                    >
                      {PAGE_SIZE_OPTIONS.map(
                        (size) => (
                          <MenuItem
                            key={size}
                            value={size}
                          >
                            {size}
                          </MenuItem>
                        ),
                      )}
                    </Select>
                  </FormControl>

                  <Button
                    variant="outlined"
                    disabled={
                      page <= 1
                    }
                    onClick={() =>
                      setPage(
                        page - 1,
                      )
                    }
                  >
                    Previous
                  </Button>

                  <Chip
                    label={`${page} / ${Math.max(
                      totalPages,
                      1,
                    )}`}
                  />

                  <Button
                    variant="outlined"
                    disabled={
                      page >=
                      totalPages
                    }
                    onClick={() =>
                      setPage(
                        page + 1,
                      )
                    }
                  >
                    Next
                  </Button>
                </Stack>
              </Stack>
            )}
        </Stack>
      </Container>

      {/* CREATE / EDIT DIALOG */}

      <Dialog
        open={formOpen}
        onClose={() => {
          if (!mutationLoading) {
            setFormOpen(false);
          }
        }}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            pb: 1,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                }}
              >
                {editingPromotion
                  ? "Edit Promotion"
                  : "Create Promotion"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                Configure a discount code
                for the pricing engine.
              </Typography>
            </Box>

            <IconButton
              onClick={() =>
                setFormOpen(false)
              }
              disabled={
                mutationLoading
              }
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              label="Promotion code"
              value={form.code}
              onChange={(event) =>
                updateForm(
                  "code",
                  event.target.value
                    .toUpperCase(),
                )
              }
              placeholder="SAVE20"
              helperText="Customers enter this code during price calculation."
            />

            <Grid
              container
              spacing={2}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>
                    Discount type
                  </InputLabel>

                  <Select
                    label="Discount type"
                    value={
                      form.discount_type
                    }
                    onChange={(event) =>
                      updateForm(
                        "discount_type",
                        event.target
                          .value as DiscountType,
                      )
                    }
                  >
                    <MenuItem value="PERCENTAGE">
                      Percentage
                    </MenuItem>

                    <MenuItem value="FIXED">
                      Fixed amount
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label={
                    form.discount_type ===
                    "PERCENTAGE"
                      ? "Discount percentage"
                      : "Discount amount"
                  }
                  type="number"
                  value={
                    form.discount_value
                  }
                  onChange={(event) =>
                    updateForm(
                      "discount_value",
                      event.target.value,
                    )
                  }
                  InputProps={{
                    startAdornment:
                      form.discount_type ===
                      "PERCENTAGE" ? (
                        <InputAdornment position="start">
                          %
                        </InputAdornment>
                      ) : (
                        <InputAdornment position="start">
                          ₹
                        </InputAdornment>
                      ),
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Minimum purchase"
                  type="number"
                  value={
                    form.minimum_purchase
                  }
                  onChange={(event) =>
                    updateForm(
                      "minimum_purchase",
                      event.target.value,
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Maximum discount"
                  type="number"
                  value={
                    form.maximum_discount
                  }
                  onChange={(event) =>
                    updateForm(
                      "maximum_discount",
                      event.target.value,
                    )
                  }
                  helperText="Optional cap for the discount."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Start date"
                  type="datetime-local"
                  value={
                    form.start_date
                  }
                  onChange={(event) =>
                    updateForm(
                      "start_date",
                      event.target.value,
                    )
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <TextField
                  fullWidth
                  label="Expiry date"
                  type="datetime-local"
                  value={
                    form.expiry_date
                  }
                  onChange={(event) =>
                    updateForm(
                      "expiry_date",
                      event.target.value,
                    )
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                }}
              >
                <TextField
                  fullWidth
                  label="Usage limit"
                  type="number"
                  value={
                    form.usage_limit
                  }
                  onChange={(event) =>
                    updateForm(
                      "usage_limit",
                      event.target.value,
                    )
                  }
                  helperText="Optional. Leave empty for unlimited usage."
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2,
          }}
        >
          <Button
            onClick={() =>
              setFormOpen(false)
            }
            disabled={
              mutationLoading
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleSubmit
            }
            disabled={
              mutationLoading
            }
          >
            {mutationLoading ? (
              <CircularProgress
                size={22}
              />
            ) : editingPromotion ? (
              "Save Changes"
            ) : (
              "Create Promotion"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* STATUS CONFIRMATION */}

      <Dialog
        open={Boolean(
          statusTarget,
        )}
        onClose={() =>
          setStatusTarget(null)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {statusTarget?.is_active
            ? "Deactivate promotion?"
            : "Activate promotion?"}
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            {statusTarget?.is_active
              ? "This promotion will no longer be available for new price calculations."
              : "This promotion will become available for price calculations again."}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setStatusTarget(null)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              handleStatusChange
            }
            disabled={
              mutationLoading
            }
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION */}

      <Dialog
        open={Boolean(
          deleteTarget,
        )}
        onClose={() =>
          setDeleteTarget(null)
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Delete promotion?
        </DialogTitle>

        <DialogContent>
          <Typography color="text.secondary">
            This will permanently delete
            promotion{" "}
            <strong>
              {deleteTarget?.code}
            </strong>
            .
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setDeleteTarget(null)
            }
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={
              handleDelete
            }
            disabled={
              mutationLoading
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PromotionsPage;