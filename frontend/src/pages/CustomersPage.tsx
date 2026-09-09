import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import axios from "axios";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Pagination from "@mui/material/Pagination";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useAuth } from "../context/AuthContext";

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
  updateCustomerStatus,
  type Customer,
  type CustomerCreateRequest,
  type CustomerListResponse,
  type CustomerType,
} from "../services/customerService";

const CUSTOMER_TYPES: CustomerType[] = [
  "REGULAR",
  "PREMIUM",
  "BUSINESS",
  "WHOLESALE",
];

interface CustomerFormState {
  name: string;
  email: string;
  customer_type: CustomerType;
  customer_category: string;
  location: string;
}

const EMPTY_FORM: CustomerFormState = {
  name: "",
  email: "",
  customer_type: "REGULAR",
  customer_category: "",
  location: "",
};

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (
            item &&
            typeof item === "object" &&
            "msg" in item
          ) {
            return String(
              (item as { msg: unknown }).msg,
            );
          }

          return "";
        })
        .filter(Boolean);

      if (messages.length > 0) {
        return messages.join(", ");
      }
    }
  }

  return fallback;
}

function formatCustomerType(
  customerType: CustomerType,
): string {
  return (
    customerType.charAt(0) +
    customerType.slice(1).toLowerCase()
  );
}

function formatDate(value: string): string {
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

function getInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "CU";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0].charAt(0) +
    parts[parts.length - 1].charAt(0)
  ).toUpperCase();
}

function getCustomerTypeStyles(
  customerType: CustomerType,
) {
  switch (customerType) {
    case "PREMIUM":
      return {
        backgroundColor: "#F4EBDD",
        color: "#856A35",
      };

    case "BUSINESS":
      return {
        backgroundColor: "#E8EEF5",
        color: "#526B86",
      };

    case "WHOLESALE":
      return {
        backgroundColor: "#EEE8F4",
        color: "#705B82",
      };

    default:
      return {
        backgroundColor: "#E9F0EA",
        color: "#58745F",
      };
  }
}

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: ReactNode;
  backgroundColor: string;
  iconColor: string;
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  backgroundColor,
  iconColor,
}: SummaryCardProps) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: "18px",
        border:
          "1px solid rgba(139, 111, 97, 0.12)",
        backgroundColor: "#FFFDFC",
      }}
    >
      <CardContent
        sx={{
          p: 2.25,
          "&:last-child": {
            pb: 2.25,
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1.5}
        >
          <Box>
            <Typography
              variant="body2"
              sx={{
                color: "text.secondary",
                fontWeight: 650,
                mb: 0.6,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontSize: "1.8rem",
                fontWeight: 850,
                color: "text.primary",
                lineHeight: 1.1,
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                mt: 0.65,
              }}
            >
              {subtitle}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "13px",
              display: "grid",
              placeItems: "center",
              backgroundColor,
              color: iconColor,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CustomersPage() {
  const { user } = useAuth();

  const isAdmin =
    user?.role.name?.toUpperCase() ===
    "ADMIN";

  const [customers, setCustomers] = useState<
    Customer[]
  >([]);

  const [listResponse, setListResponse] =
    useState<CustomerListResponse | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [mutationLoading, setMutationLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [customerType, setCustomerType] =
    useState<CustomerType | "">("");

  const [
    customerCategory,
    setCustomerCategory,
  ] = useState("");

  const [location, setLocation] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">(
      "all",
    );

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] =
    useState<CustomerFormState>(
      EMPTY_FORM,
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  const [deleteCustomerTarget, setDeleteCustomerTarget] =
    useState<Customer | null>(null);

  const [statusCustomerTarget, setStatusCustomerTarget] =
    useState<Customer | null>(null);

  const [filterOpen, setFilterOpen] =
    useState(false);

  const loadCustomers =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await getCustomers({
            page,
            page_size: pageSize,
            search:
              search.trim() || undefined,
            customer_type:
              customerType || undefined,
            customer_category:
              customerCategory.trim() ||
              undefined,
            location:
              location.trim() ||
              undefined,
            is_active:
              statusFilter === "all"
                ? undefined
                : statusFilter ===
                  "active",
            sort_by: "created_at",
            sort_order: "desc",
          });

        setCustomers(response.items);
        setListResponse(response);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Unable to load customers.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }, [
      page,
      pageSize,
      search,
      customerType,
      customerCategory,
      location,
      statusFilter,
    ]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        setSuccessMessage(null);
      },
      3500,
    );

    return () =>
      window.clearTimeout(timer);
  }, [successMessage]);

  const visibleCount =
    listResponse?.total ?? 0;

  const activeCount = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.is_active,
      ).length,
    [customers],
  );

  const premiumCount = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.customer_type ===
          "PREMIUM",
      ).length,
    [customers],
  );

  const businessCount = useMemo(
    () =>
      customers.filter(
        (customer) =>
          customer.customer_type ===
          "BUSINESS",
      ).length,
    [customers],
  );

  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setSearch("");
    setCustomerType("");
    setCustomerCategory("");
    setLocation("");
    setStatusFilter("all");
    setPage(1);
  };

  const hasFilters =
    Boolean(search) ||
    Boolean(customerType) ||
    Boolean(customerCategory) ||
    Boolean(location) ||
    statusFilter !== "all";

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditDialog = (
    customer: Customer,
  ) => {
    setEditingCustomer(customer);

    setForm({
      name: customer.name,
      email: customer.email,
      customer_type:
        customer.customer_type,
      customer_category:
        customer.customer_category ?? "",
      location:
        customer.location ?? "",
    });

    setFormError(null);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (mutationLoading) {
      return;
    }

    setFormOpen(false);
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleFormSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!isAdmin) {
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim();
    const customerCategory =
      form.customer_category.trim();
    const customerLocation =
      form.location.trim();

    if (!name) {
      setFormError(
        "Customer name is required.",
      );
      return;
    }

    if (!email) {
      setFormError(
        "Customer email is required.",
      );
      return;
    }

    if (!email.includes("@")) {
      setFormError(
        "Please enter a valid email address.",
      );
      return;
    }

    setMutationLoading(true);
    setFormError(null);
    setError(null);

    try {
      if (editingCustomer) {
        await updateCustomer(
          editingCustomer.id,
          {
            name,
            email,
            customer_type:
              form.customer_type,
            customer_category:
              customerCategory || null,
            location:
              customerLocation || null,
          },
        );

        setSuccessMessage(
          "Customer updated successfully.",
        );
      } else {
        const payload: CustomerCreateRequest =
          {
            name,
            email,
            customer_type:
              form.customer_type,
            customer_category:
              customerCategory || null,
            location:
              customerLocation || null,
          };

        await createCustomer(
          payload,
        );

        setSuccessMessage(
          "Customer created successfully.",
        );
      }

      setFormOpen(false);
      setEditingCustomer(null);
      setForm(EMPTY_FORM);

      await loadCustomers();
    } catch (requestError) {
      setFormError(
        getErrorMessage(
          requestError,
          editingCustomer
            ? "Unable to update customer."
            : "Unable to create customer.",
        ),
      );
    } finally {
      setMutationLoading(false);
    }
  };

  const handleStatusChange = async () => {
    if (
      !statusCustomerTarget ||
      !isAdmin
    ) {
      return;
    }

    const customer =
      statusCustomerTarget;

    setMutationLoading(true);
    setError(null);

    try {
      await updateCustomerStatus(
        customer.id,
        !customer.is_active,
      );

      setSuccessMessage(
        customer.is_active
          ? "Customer deactivated successfully."
          : "Customer activated successfully.",
      );

      setStatusCustomerTarget(null);

      await loadCustomers();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to update customer status.",
        ),
      );
    } finally {
      setMutationLoading(false);
    }
  };

  const handleDeleteCustomer = async () => {
    if (
      !deleteCustomerTarget ||
      !isAdmin
    ) {
      return;
    }

    const customer =
      deleteCustomerTarget;

    setMutationLoading(true);
    setError(null);

    try {
      await deleteCustomer(
        customer.id,
      );

      setSuccessMessage(
        "Customer deleted successfully.",
      );

      setDeleteCustomerTarget(null);

      if (
        customers.length === 1 &&
        page > 1
      ) {
        setPage(
          (currentPage) =>
            currentPage - 1,
        );
      } else {
        await loadCustomers();
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to delete customer.",
        ),
      );
    } finally {
      setMutationLoading(false);
    }
  };

  const totalPages =
    listResponse?.total_pages ?? 0;

  return (
    <Box
      sx={{
        px: {
          xs: 1.5,
          sm: 2.5,
          md: 3,
        },
        py: {
          xs: 2,
          md: 2.75,
        },
        maxWidth: 1600,
        mx: "auto",
        width: "100%",
      }}
    >
      {/* Page heading */}
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        sx={{
          mb: 2.25,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 850,
              letterSpacing: "-0.02em",
            }}
          >
            Customers
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage customer profiles and
            customer segments.
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
              minHeight: 44,
              px: 2,
              borderRadius: "12px",
              fontWeight: 800,
              boxShadow:
                "0 7px 18px rgba(139, 111, 97, 0.16)",
            }}
          >
            Add customer
          </Button>
        )}
      </Stack>

      {/* Alerts */}
      <Stack spacing={1.25} sx={{ mb: 2 }}>
        {successMessage && (
          <Alert
            severity="success"
            onClose={() =>
              setSuccessMessage(
                null,
              )
            }
            sx={{
              borderRadius: "12px",
            }}
          >
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError(null)
            }
            sx={{
              borderRadius: "12px",
            }}
          >
            {error}
          </Alert>
        )}
      </Stack>

      {/* Summary cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 1.75,
          mb: 2,
        }}
      >
        <SummaryCard
          title="Total customers"
          value={visibleCount}
          subtitle="Matching current filters"
          icon={
            <PeopleAltRoundedIcon />
          }
          backgroundColor="#F1E8E2"
          iconColor="#8A6F61"
        />

        <SummaryCard
          title="Active now"
          value={activeCount}
          subtitle="Active in this page"
          icon={
            <PersonAddAlt1RoundedIcon />
          }
          backgroundColor="#E6F0E9"
          iconColor="#5E7D68"
        />

        <SummaryCard
          title="Premium"
          value={premiumCount}
          subtitle="Premium customers shown"
          icon={
            <WorkspacePremiumRoundedIcon />
          }
          backgroundColor="#F4EBDD"
          iconColor="#927644"
        />

        <SummaryCard
          title="Business"
          value={businessCount}
          subtitle="Business customers shown"
          icon={
            <BusinessRoundedIcon />
          }
          backgroundColor="#E8EEF5"
          iconColor="#5D748E"
        />
      </Box>

      {/* Search and filters */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: "18px",
          border:
            "1px solid rgba(139, 111, 97, 0.12)",
          backgroundColor: "#FFFDFC",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 1.5,
              md: 2,
            },
            "&:last-child": {
              pb: {
                xs: 1.5,
                md: 2,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={1.25}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search name, email, category or location..."
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              onKeyDown={(event) => {
                if (
                  event.key === "Enter"
                ) {
                  handleSearch();
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon
                      sx={{
                        color:
                          "text.secondary",
                        fontSize: 21,
                      }}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{
                flex: 1,
              }}
            />

            <Button
              variant="outlined"
              onClick={
                handleSearch
              }
              sx={{
                minWidth: 100,
                borderRadius: "10px",
                fontWeight: 750,
              }}
            >
              Search
            </Button>

            <Button
              variant={
                filterOpen ||
                hasFilters
                  ? "contained"
                  : "outlined"
              }
              startIcon={
                <FilterAltOutlinedIcon />
              }
              onClick={() =>
                setFilterOpen(
                  (current) =>
                    !current,
                )
              }
              sx={{
                minWidth: 120,
                borderRadius: "10px",
                fontWeight: 750,
              }}
            >
              Filters
            </Button>

            <IconButton
              onClick={() =>
                void loadCustomers()
              }
              disabled={loading}
              sx={{
                border:
                  "1px solid rgba(139, 111, 97, 0.16)",
                borderRadius: "10px",
                width: 40,
                height: 40,
              }}
              aria-label="Refresh customers"
            >
              <RefreshRoundedIcon
                sx={{
                  fontSize: 20,
                }}
              />
            </IconButton>
          </Stack>

          {filterOpen && (
            <>
              <Divider
                sx={{
                  my: 1.75,
                }}
              />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 1.25,
                }}
              >
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel>
                    Customer type
                  </InputLabel>

                  <Select
                    value={
                      customerType
                    }
                    label="Customer type"
                    onChange={(event) => {
                      setCustomerType(
                        event.target
                          .value as
                          | CustomerType
                          | "",
                      );
                      setPage(1);
                    }}
                  >
                    <MenuItem value="">
                      All types
                    </MenuItem>

                    {CUSTOMER_TYPES.map(
                      (type) => (
                        <MenuItem
                          key={type}
                          value={type}
                        >
                          {formatCustomerType(
                            type,
                          )}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  size="small"
                  label="Customer category"
                  placeholder="Example: Retail"
                  value={
                    customerCategory
                  }
                  onChange={(event) => {
                    setCustomerCategory(
                      event.target
                        .value,
                    );
                    setPage(1);
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Location"
                  placeholder="Example: Chennai"
                  value={location}
                  onChange={(event) => {
                    setLocation(
                      event.target.value,
                    );
                    setPage(1);
                  }}
                />

                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel>
                    Status
                  </InputLabel>

                  <Select
                    value={
                      statusFilter
                    }
                    label="Status"
                    onChange={(event) => {
                      setStatusFilter(
                        event.target
                          .value as
                          | "all"
                          | "active"
                          | "inactive",
                      );
                      setPage(1);
                    }}
                  >
                    <MenuItem value="all">
                      All customers
                    </MenuItem>

                    <MenuItem value="active">
                      Active only
                    </MenuItem>

                    <MenuItem value="inactive">
                      Inactive only
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {hasFilters && (
                <Stack
                  direction="row"
                  justifyContent="flex-end"
                  sx={{
                    mt: 1.5,
                  }}
                >
                  <Button
                    size="small"
                    onClick={
                      handleClearFilters
                    }
                    startIcon={
                      <CloseRoundedIcon />
                    }
                    sx={{
                      fontWeight: 750,
                    }}
                  >
                    Clear filters
                  </Button>
                </Stack>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Customer table */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "18px",
          border:
            "1px solid rgba(139, 111, 97, 0.12)",
          backgroundColor: "#FFFDFC",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 1.5,
              md: 2,
            },
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 800,
              }}
            >
              Customer directory
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
            >
              {listResponse?.total ??
                0}{" "}
              customer
              {(listResponse?.total ??
                0) === 1
                ? ""
                : "s"}
              found
            </Typography>
          </Box>

          {hasFilters && (
            <Chip
              size="small"
              label="Filtered"
              sx={{
                backgroundColor:
                  "#F1E8E2",
                color: "#7B6255",
                fontWeight: 750,
              }}
            />
          )}
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              minHeight: 360,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Stack
              alignItems="center"
              spacing={1.25}
            >
              <CircularProgress
                size={30}
              />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Loading customers...
              </Typography>
            </Stack>
          </Box>
        ) : customers.length === 0 ? (
          <Box
            sx={{
              minHeight: 360,
              display: "grid",
              placeItems: "center",
              px: 3,
            }}
          >
            <Stack
              alignItems="center"
              spacing={1}
              textAlign="center"
            >
              <Avatar
                sx={{
                  width: 58,
                  height: 58,
                  backgroundColor:
                    "#F1E8E2",
                  color: "#8A6F61",
                }}
              >
                <PeopleAltRoundedIcon />
              </Avatar>

              <Typography
                sx={{
                  fontWeight: 800,
                  mt: 0.5,
                }}
              >
                No customers found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  maxWidth: 420,
                }}
              >
                Try changing your
                filters or add a new
                customer to the
                directory.
              </Typography>

              {hasFilters && (
                <Button
                  size="small"
                  onClick={
                    handleClearFilters
                  }
                  sx={{
                    mt: 0.5,
                    fontWeight: 750,
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Stack>
          </Box>
        ) : (
          <>
            <TableContainer
              sx={{
                overflowX: "auto",
              }}
            >
              <Table
                sx={{
                  minWidth: 900,
                }}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor:
                        "#FBF8F6",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color:
                          "text.secondary",
                        fontSize:
                          "0.76rem",
                      }}
                    >
                      Customer
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color:
                          "text.secondary",
                        fontSize:
                          "0.76rem",
                      }}
                    >
                      Type
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color:
                          "text.secondary",
                        fontSize:
                          "0.76rem",
                      }}
                    >
                      Category
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color:
                          "text.secondary",
                        fontSize:
                          "0.76rem",
                      }}
                    >
                      Location
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color:
                          "text.secondary",
                        fontSize:
                          "0.76rem",
                      }}
                    >
                      Status
                    </TableCell>

                    <TableCell
                      sx={{
                        fontWeight: 800,
                        color:
                          "text.secondary",
                        fontSize:
                          "0.76rem",
                      }}
                    >
                      Joined
                    </TableCell>

                    {isAdmin && (
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 800,
                          color:
                            "text.secondary",
                          fontSize:
                            "0.76rem",
                        }}
                      >
                        Actions
                      </TableCell>
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {customers.map(
                    (customer) => {
                      const typeStyles =
                        getCustomerTypeStyles(
                          customer.customer_type,
                        );

                      return (
                        <TableRow
                          key={
                            customer.id
                          }
                          hover
                          sx={{
                            "&:last-child td":
                              {
                                borderBottom: 0,
                              },
                          }}
                        >
                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={1.25}
                              alignItems="center"
                            >
                              <Avatar
                                sx={{
                                  width: 38,
                                  height: 38,
                                  fontSize: 13,
                                  fontWeight: 800,
                                  backgroundColor:
                                    "#EDE4DE",
                                  color:
                                    "#775F52",
                                }}
                              >
                                {getInitials(
                                  customer.name,
                                )}
                              </Avatar>

                              <Box
                                sx={{
                                  minWidth: 0,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 800,
                                    lineHeight:
                                      1.25,
                                  }}
                                >
                                  {
                                    customer.name
                                  }
                                </Typography>

                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                  sx={{
                                    mt: 0.3,
                                  }}
                                >
                                  <MailOutlineRoundedIcon
                                    sx={{
                                      fontSize: 14,
                                      color:
                                        "text.secondary",
                                    }}
                                  />

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      overflow:
                                        "hidden",
                                      textOverflow:
                                        "ellipsis",
                                      whiteSpace:
                                        "nowrap",
                                      maxWidth: 240,
                                    }}
                                  >
                                    {
                                      customer.email
                                    }
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={formatCustomerType(
                                customer.customer_type,
                              )}
                              sx={{
                                backgroundColor:
                                  typeStyles.backgroundColor,
                                color:
                                  typeStyles.color,
                                fontWeight: 750,
                                borderRadius:
                                  "8px",
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                color:
                                  customer.customer_category
                                    ? "text.primary"
                                    : "text.secondary",
                                fontWeight:
                                  customer.customer_category
                                    ? 650
                                    : 500,
                              }}
                            >
                              {customer.customer_category ||
                                "—"}
                            </Typography>
                          </TableCell>

                          <TableCell>
                            <Stack
                              direction="row"
                              spacing={0.6}
                              alignItems="center"
                            >
                              <LocationOnOutlinedIcon
                                sx={{
                                  fontSize: 17,
                                  color:
                                    "text.secondary",
                                }}
                              />

                              <Typography
                                variant="body2"
                                sx={{
                                  color:
                                    customer.location
                                      ? "text.primary"
                                      : "text.secondary",
                                }}
                              >
                                {customer.location ||
                                  "—"}
                              </Typography>
                            </Stack>
                          </TableCell>

                          <TableCell>
                            <Chip
                              size="small"
                              label={
                                customer.is_active
                                  ? "Active"
                                  : "Inactive"
                              }
                              sx={{
                                backgroundColor:
                                  customer.is_active
                                    ? "#E5F0E9"
                                    : "#F2ECE8",
                                color:
                                  customer.is_active
                                    ? "#557660"
                                    : "#8A7D76",
                                fontWeight: 750,
                                borderRadius:
                                  "8px",
                              }}
                            />
                          </TableCell>

                          <TableCell>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatDate(
                                customer.created_at,
                              )}
                            </Typography>
                          </TableCell>

                          {isAdmin && (
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                justifyContent="flex-end"
                                spacing={0.25}
                              >
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    openEditDialog(
                                      customer,
                                    )
                                  }
                                  sx={{
                                    color:
                                      "#786458",
                                    "&:hover":
                                      {
                                        backgroundColor:
                                          "#F2EBE6",
                                      },
                                  }}
                                  aria-label={`Edit ${customer.name}`}
                                >
                                  <EditRoundedIcon
                                    sx={{
                                      fontSize: 19,
                                    }}
                                  />
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setStatusCustomerTarget(
                                      customer,
                                    )
                                  }
                                  sx={{
                                    color:
                                      customer.is_active
                                        ? "#66836F"
                                        : "#8A7B73",
                                    "&:hover":
                                      {
                                        backgroundColor:
                                          "#F1ECE8",
                                      },
                                  }}
                                  aria-label={
                                    customer.is_active
                                      ? `Deactivate ${customer.name}`
                                      : `Activate ${customer.name}`
                                  }
                                >
                                  {customer.is_active ? (
                                    <ToggleOnRoundedIcon
                                      sx={{
                                        fontSize: 21,
                                      }}
                                    />
                                  ) : (
                                    <ToggleOffRoundedIcon
                                      sx={{
                                        fontSize: 21,
                                      }}
                                    />
                                  )}
                                </IconButton>

                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    setDeleteCustomerTarget(
                                      customer,
                                    )
                                  }
                                  sx={{
                                    color:
                                      "#A26F68",
                                    "&:hover":
                                      {
                                        backgroundColor:
                                          "#F8ECEA",
                                      },
                                  }}
                                  aria-label={`Delete ${customer.name}`}
                                >
                                  <DeleteOutlineRoundedIcon
                                    sx={{
                                      fontSize: 19,
                                    }}
                                  />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    },
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Divider />

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
              justifyContent="space-between"
              spacing={1.5}
              sx={{
                px: {
                  xs: 1.5,
                  md: 2,
                },
                py: 1.5,
              }}
            >
              <FormControl
                size="small"
                sx={{
                  minWidth: 120,
                }}
              >
                <InputLabel>
                  Per page
                </InputLabel>

                <Select
                  value={pageSize}
                  label="Per page"
                  onChange={(event) => {
                    setPageSize(
                      Number(
                        event.target.value,
                      ),
                    );
                    setPage(1);
                  }}
                >
                  <MenuItem value={5}>
                    5
                  </MenuItem>

                  <MenuItem value={10}>
                    10
                  </MenuItem>

                  <MenuItem value={25}>
                    25
                  </MenuItem>

                  <MenuItem value={50}>
                    50
                  </MenuItem>
                </Select>
              </FormControl>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Page {page}
                {totalPages > 0
                  ? ` of ${totalPages}`
                  : ""}
              </Typography>

              {totalPages > 1 && (
                <Pagination
                  page={page}
                  count={totalPages}
                  color="primary"
                  shape="rounded"
                  onChange={(
                    _event,
                    nextPage,
                  ) =>
                    setPage(nextPage)
                  }
                />
              )}
            </Stack>
          </>
        )}
      </Card>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onClose={closeFormDialog}
        fullWidth
        maxWidth="sm"
      >
        <form
          onSubmit={
            handleFormSubmit
          }
        >
          <DialogTitle
            sx={{
              pb: 1,
              fontWeight: 850,
            }}
          >
            {editingCustomer
              ? "Edit customer"
              : "Add customer"}
          </DialogTitle>

          <DialogContent>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
              }}
            >
              {editingCustomer
                ? "Update the customer's profile information."
                : "Create a new customer profile for the pricing engine."}
            </Typography>

            {formError && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: "10px",
                }}
              >
                {formError}
              </Alert>
            )}

            <Stack spacing={1.75}>
              <TextField
                fullWidth
                required
                label="Customer name"
                placeholder="Example: Priya Sharma"
                value={form.name}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      name: event.target
                        .value,
                    }),
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineRoundedIcon
                        sx={{
                          color:
                            "text.secondary",
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                required
                type="email"
                label="Email"
                placeholder="customer@example.com"
                value={form.email}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      email: event.target
                        .value,
                    }),
                  )
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailOutlineRoundedIcon
                        sx={{
                          color:
                            "text.secondary",
                          fontSize: 20,
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl
                fullWidth
                required
              >
                <InputLabel>
                  Customer type
                </InputLabel>

                <Select
                  value={
                    form.customer_type
                  }
                  label="Customer type"
                  onChange={(event) =>
                    setForm(
                      (current) => ({
                        ...current,
                        customer_type:
                          event.target
                            .value as CustomerType,
                      }),
                    )
                  }
                >
                  {CUSTOMER_TYPES.map(
                    (type) => (
                      <MenuItem
                        key={type}
                        value={type}
                      >
                        {formatCustomerType(
                          type,
                        )}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Customer category"
                placeholder="Example: Retail"
                value={
                  form.customer_category
                }
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      customer_category:
                        event.target
                          .value,
                    }),
                  )
                }
              />

              <TextField
                fullWidth
                label="Location"
                placeholder="Example: Chennai"
                value={form.location}
                onChange={(event) =>
                  setForm(
                    (current) => ({
                      ...current,
                      location:
                        event.target.value,
                    }),
                  )
                }
              />
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 2.5,
            }}
          >
            <Button
              onClick={
                closeFormDialog
              }
              disabled={
                mutationLoading
              }
              sx={{
                fontWeight: 750,
              }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                mutationLoading
              }
              startIcon={
                mutationLoading ? (
                  <CircularProgress
                    size={17}
                    color="inherit"
                  />
                ) : editingCustomer ? (
                  <EditRoundedIcon />
                ) : (
                  <AddRoundedIcon />
                )
              }
              sx={{
                minWidth: 130,
                borderRadius: "10px",
                fontWeight: 800,
              }}
            >
              {mutationLoading
                ? "Saving..."
                : editingCustomer
                  ? "Save changes"
                  : "Create customer"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Status confirmation */}
      <Dialog
        open={
          Boolean(
            statusCustomerTarget,
          )
        }
        onClose={() => {
          if (!mutationLoading) {
            setStatusCustomerTarget(
              null,
            );
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 850,
          }}
        >
          {statusCustomerTarget?.is_active
            ? "Deactivate customer?"
            : "Activate customer?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {statusCustomerTarget?.is_active
              ? `This will make ${statusCustomerTarget?.name} inactive.`
              : `This will make ${statusCustomerTarget?.name} active again.`}
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={() =>
              setStatusCustomerTarget(
                null,
              )
            }
            disabled={
              mutationLoading
            }
            sx={{
              fontWeight: 750,
            }}
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
            startIcon={
              mutationLoading ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : statusCustomerTarget?.is_active ? (
                <ToggleOffRoundedIcon />
              ) : (
                <ToggleOnRoundedIcon />
              )
            }
            sx={{
              borderRadius: "10px",
              fontWeight: 800,
            }}
          >
            {statusCustomerTarget?.is_active
              ? "Deactivate"
              : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={
          Boolean(
            deleteCustomerTarget,
          )
        }
        onClose={() => {
          if (!mutationLoading) {
            setDeleteCustomerTarget(
              null,
            );
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 850,
          }}
        >
          Delete customer?
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            You are about to permanently
            delete{" "}
            <strong>
              {
                deleteCustomerTarget?.name
              }
            </strong>
            . This action cannot be
            undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={() =>
              setDeleteCustomerTarget(
                null,
              )
            }
            disabled={
              mutationLoading
            }
            sx={{
              fontWeight: 750,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={
              handleDeleteCustomer
            }
            disabled={
              mutationLoading
            }
            startIcon={
              mutationLoading ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : (
                <DeleteOutlineRoundedIcon />
              )
            }
            sx={{
              borderRadius: "10px",
              fontWeight: 800,
            }}
          >
            {mutationLoading
              ? "Deleting..."
              : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CustomersPage;