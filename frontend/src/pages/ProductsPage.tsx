import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import Alert from "@mui/material/Alert";
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
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useAuth } from "../context/AuthContext";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
  updateProductStatus,
  type Product,
  type ProductCreateRequest,
} from "../services/productService";

import {
  getCategories,
  type Category,
} from "../services/categoryService";

interface ProductFormState {
  category_id: string;
  name: string;
  description: string;
  sku: string;
  base_price: string;
}

const INITIAL_FORM: ProductFormState = {
  category_id: "",
  name: "",
  description: "",
  sku: "",
  base_price: "",
};

function ProductsPage() {
  const { user } = useAuth();

  const isAdmin =
    user?.role.name?.toUpperCase() ===
    "ADMIN";

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [isLoadingCategories, setIsLoadingCategories] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [categoryError, setCategoryError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [categoryFilter, setCategoryFilter] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [minPrice, setMinPrice] =
    useState("");

  const [maxPrice, setMaxPrice] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [form, setForm] =
    useState<ProductFormState>(
      INITIAL_FORM,
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Product | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [statusTarget, setStatusTarget] =
    useState<Product | null>(null);

  const [isChangingStatus, setIsChangingStatus] =
    useState(false);

  const categoryMap = useMemo(() => {
    return new Map(
      categories.map((category) => [
        category.id,
        category,
      ]),
    );
  }, [categories]);

  const loadCategories =
    useCallback(async () => {
      setIsLoadingCategories(true);
      setCategoryError(null);

      try {
        const response =
          await getCategories({
            page: 1,
            page_size: 100,
            is_active: true,
            sort_by: "name",
            sort_order: "asc",
          });

        setCategories(response.items);
      } catch (loadError) {
        setCategoryError(
          getErrorMessage(
            loadError,
            "Unable to load categories.",
          ),
        );
      } finally {
        setIsLoadingCategories(false);
      }
    }, []);

  const loadProducts =
    useCallback(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response =
          await getProducts({
            page: page + 1,
            page_size: rowsPerPage,
            search:
              search.trim() || undefined,
            category_id:
              categoryFilter
                ? Number(categoryFilter)
                : undefined,
            is_active:
              statusFilter === "all"
                ? undefined
                : statusFilter ===
                    "active",
            min_price:
              minPrice.trim()
                ? Number(minPrice)
                : undefined,
            max_price:
              maxPrice.trim()
                ? Number(maxPrice)
                : undefined,
            sort_by: "created_at",
            sort_order: "desc",
          });

        setProducts(response.items);
        setTotal(response.total);

        if (
          response.total_pages > 0 &&
          page >= response.total_pages
        ) {
          setPage(
            response.total_pages - 1,
          );
        }
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            "Unable to load products.",
          ),
        );
      } finally {
        setIsLoading(false);
      }
    }, [
      page,
      rowsPerPage,
      search,
      categoryFilter,
      statusFilter,
      minPrice,
      maxPrice,
    ]);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const resetToFirstPage = () => {
    setPage(0);
  };

  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);
    resetToFirstPage();
  };

  const handleCategoryFilterChange = (
    value: string,
  ) => {
    setCategoryFilter(value);
    resetToFirstPage();
  };

  const handleStatusFilterChange = (
    value: string,
  ) => {
    setStatusFilter(value);
    resetToFirstPage();
  };

  const handleMinPriceChange = (
    value: string,
  ) => {
    setMinPrice(value);
    resetToFirstPage();
  };

  const handleMaxPriceChange = (
    value: string,
  ) => {
    setMaxPrice(value);
    resetToFirstPage();
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setFormError(null);
    setFormOpen(true);
  };

  const openEditDialog = (
    product: Product,
  ) => {
    setEditingProduct(product);

    setForm({
      category_id: String(
        product.category_id,
      ),
      name: product.name,
      description:
        product.description ?? "",
      sku: product.sku,
      base_price: String(
        product.base_price,
      ),
    });

    setFormError(null);
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (isSaving) {
      return;
    }

    setFormOpen(false);
    setEditingProduct(null);
    setForm(INITIAL_FORM);
    setFormError(null);
  };

  const handleFormSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setFormError(null);

    const name = form.name.trim();
    const sku = form.sku.trim();
    const description =
      form.description.trim();
    const categoryId =
      Number(form.category_id);
    const basePrice =
      Number(form.base_price);

    if (!categoryId || categoryId <= 0) {
      setFormError(
        "Please select a category.",
      );
      return;
    }

    if (!name) {
      setFormError(
        "Product name is required.",
      );
      return;
    }

    if (!sku) {
      setFormError(
        "SKU is required.",
      );
      return;
    }

    if (
      !form.base_price.trim() ||
      !Number.isFinite(basePrice) ||
      basePrice <= 0
    ) {
      setFormError(
        "Base price must be greater than 0.",
      );
      return;
    }

    const payload: ProductCreateRequest =
      {
        category_id: categoryId,
        name,
        description:
          description || null,
        sku,
        base_price: basePrice,
      };

    setIsSaving(true);

    try {
      if (editingProduct) {
        await updateProduct(
          editingProduct.id,
          payload,
        );
      } else {
        await createProduct(
          payload,
        );
      }

      closeFormDialog();
      await loadProducts();
    } catch (saveError) {
      setFormError(
        getErrorMessage(
          saveError,
          editingProduct
            ? "Unable to update the product."
            : "Unable to create the product.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const openStatusDialog = (
    product: Product,
  ) => {
    setStatusTarget(product);
  };

  const closeStatusDialog = () => {
    if (isChangingStatus) {
      return;
    }

    setStatusTarget(null);
  };

  const handleStatusChange = async () => {
    if (!statusTarget) {
      return;
    }

    setIsChangingStatus(true);

    try {
      await updateProductStatus(
        statusTarget.id,
        !statusTarget.is_active,
      );

      setStatusTarget(null);
      await loadProducts();
    } catch (statusError) {
      setError(
        getErrorMessage(
          statusError,
          "Unable to update product status.",
        ),
      );
    } finally {
      setIsChangingStatus(false);
    }
  };

  const openDeleteDialog = (
    product: Product,
  ) => {
    setDeleteTarget(product);
  };

  const closeDeleteDialog = () => {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteProduct(
        deleteTarget.id,
      );

      setDeleteTarget(null);

      if (
        products.length === 1 &&
        page > 0
      ) {
        setPage((currentPage) =>
          currentPage - 1,
        );
      } else {
        await loadProducts();
      }
    } catch (deleteError) {
      setError(
        getErrorMessage(
          deleteError,
          "Unable to delete the product.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter("");
    setStatusFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setPage(0);
  };

  const hasFilters =
    Boolean(search.trim()) ||
    Boolean(categoryFilter) ||
    statusFilter !== "all" ||
    Boolean(minPrice.trim()) ||
    Boolean(maxPrice.trim());

  const formatPrice = (
    value: string | number,
  ) => {
    const numericValue =
      Number(value);

    if (!Number.isFinite(numericValue)) {
      return "—";
    }

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
      },
    ).format(numericValue);
  };

  const formatDate = (
    value: string,
  ) => {
    const date =
      new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    ).format(date);
  };

  return (
    <Box
      sx={{
        minHeight: "100%",
        px: {
          xs: 1.5,
          sm: 2.5,
          md: 3,
          lg: 4,
        },
        py: {
          xs: 2,
          sm: 2.5,
          md: 3,
        },
      }}
    >
      <Stack
        spacing={{
          xs: 2,
          md: 2.5,
        }}
      >
        {/* Page header */}
        <Box
          sx={{
            display: "flex",
            alignItems: {
              xs: "flex-start",
              sm: "center",
            },
            justifyContent:
              "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              variant="overline"
              sx={{
                color: "primary.main",
                fontWeight: 800,
                letterSpacing:
                  "0.12em",
              }}
            >
              CATALOG
            </Typography>

            <Typography
              variant="h3"
              sx={{
                mt: 0.25,
                fontSize: {
                  xs: "1.75rem",
                  sm: "2.15rem",
                  md: "2.45rem",
                },
                lineHeight: 1.1,
              }}
            >
              Products
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.6,
                maxWidth: 620,
              }}
            >
              Manage the products that
              power your pricing engine.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
          >
            <Tooltip title="Refresh products">
              <IconButton
                onClick={() =>
                  void loadProducts()
                }
                disabled={isLoading}
                sx={{
                  width: 42,
                  height: 42,
                  border: "1px solid",
                  borderColor:
                    "divider",
                  backgroundColor:
                    "#FFFDFC",
                }}
                aria-label="Refresh products"
              >
                <RefreshRoundedIcon
                  sx={{
                    fontSize: 20,
                  }}
                />
              </IconButton>
            </Tooltip>

            {isAdmin && (
              <Button
                variant="contained"
                startIcon={
                  <AddRoundedIcon />
                }
                onClick={
                  openCreateDialog
                }
              >
                Add product
              </Button>
            )}
          </Stack>
        </Box>

        {/* Summary strip */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 1.5,
          }}
        >
          <SummaryCard
            label="Total products"
            value={total}
            icon={
              <Inventory2RoundedIcon />
            }
            background="#F1E8E2"
          />

          <SummaryCard
            label="Visible now"
            value={products.filter(
              (product) =>
                product.is_active,
            ).length}
            icon={
              <CheckCircleRoundedIcon />
            }
            background="#E5EFEC"
          />

          <SummaryCard
            label="Categories used"
            value={
              new Set(
                products.map(
                  (product) =>
                    product.category_id,
                ),
              ).size
            }
            icon={<TuneRoundedIcon />}
            background="#EEEAF3"
          />
        </Box>

        {/* Filters */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 2.5,
              },
              "&:last-child": {
                pb: {
                  xs: 2,
                  sm: 2.5,
                },
              },
            }}
          >
            <Stack
              spacing={1.75}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius:
                        "10px",
                      display: "grid",
                      placeItems:
                        "center",
                      backgroundColor:
                        "#F3ECE8",
                      color:
                        "primary.main",
                    }}
                  >
                    <SearchRoundedIcon
                      sx={{
                        fontSize: 19,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      Find products
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Search and narrow
                      down your catalog.
                    </Typography>
                  </Box>
                </Stack>

                {hasFilters && (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={
                      clearFilters
                    }
                  >
                    Clear filters
                  </Button>
                )}
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1.6fr 1fr 1fr",
                    lg: "1.6fr 1fr 1fr 0.8fr 0.8fr",
                  },
                  gap: 1.25,
                }}
              >
                <TextField
                  label="Search"
                  placeholder="Name, SKU or description"
                  value={search}
                  onChange={(event) =>
                    handleSearchChange(
                      event.target.value,
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon
                          sx={{
                            fontSize: 19,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl
                  size="small"
                  fullWidth
                >
                  <InputLabel>
                    Category
                  </InputLabel>

                  <Select
                    value={
                      categoryFilter
                    }
                    label="Category"
                    onChange={(event) =>
                      handleCategoryFilterChange(
                        event.target.value,
                      )
                    }
                  >
                    <MenuItem value="">
                      All categories
                    </MenuItem>

                    {categories.map(
                      (category) => (
                        <MenuItem
                          key={
                            category.id
                          }
                          value={String(
                            category.id,
                          )}
                        >
                          {category.name}
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>

                <FormControl
                  size="small"
                  fullWidth
                >
                  <InputLabel>
                    Status
                  </InputLabel>

                  <Select
                    value={
                      statusFilter
                    }
                    label="Status"
                    onChange={(event) =>
                      handleStatusFilterChange(
                        event.target.value,
                      )
                    }
                  >
                    <MenuItem value="all">
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

                <TextField
                  label="Min price"
                  type="number"
                  value={minPrice}
                  onChange={(event) =>
                    handleMinPriceChange(
                      event.target.value,
                    )
                  }
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Max price"
                  type="number"
                  value={maxPrice}
                  onChange={(event) =>
                    handleMaxPriceChange(
                      event.target.value,
                    )
                  }
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {categoryError && (
                <Alert
                  severity="warning"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() =>
                        void loadCategories()
                      }
                    >
                      Retry
                    </Button>
                  }
                >
                  {categoryError}
                </Alert>
              )}

              {isLoadingCategories && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <CircularProgress
                    size={15}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Loading categories...
                  </Typography>
                </Stack>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  void loadProducts()
                }
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Products table */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 0,
                sm: 0,
              },
              "&:last-child": {
                pb: 0,
              },
            }}
          >
            <Box
              sx={{
                px: {
                  xs: 2,
                  sm: 2.5,
                },
                py: 2,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                gap={2}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Product catalog
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.3,
                    }}
                  >
                    {total === 0
                      ? "No products found."
                      : `${total} product${total === 1 ? "" : "s"} in your catalog.`}
                  </Typography>
                </Box>

                {hasFilters && (
                  <Chip
                    label="Filtered"
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                )}
              </Stack>
            </Box>

            <Divider />

            {isLoading ? (
              <LoadingState />
            ) : products.length === 0 ? (
              <EmptyState
                hasFilters={
                  hasFilters
                }
                onCreate={
                  isAdmin
                    ? openCreateDialog
                    : undefined
                }
              />
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
                      <TableRow>
                        <TableCell>
                          Product
                        </TableCell>

                        <TableCell>
                          SKU
                        </TableCell>

                        <TableCell>
                          Category
                        </TableCell>

                        <TableCell align="right">
                          Base price
                        </TableCell>

                        <TableCell>
                          Status
                        </TableCell>

                        <TableCell>
                          Updated
                        </TableCell>

                        <TableCell align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {products.map(
                        (product) => {
                          const category =
                            categoryMap.get(
                              product.category_id,
                            );

                          return (
                            <TableRow
                              key={
                                product.id
                              }
                              hover
                            >
                              <TableCell>
                                <Stack
                                  direction="row"
                                  spacing={1.25}
                                  alignItems="center"
                                >
                                  <Box
                                    sx={{
                                      width: 38,
                                      height: 38,
                                      flexShrink: 0,
                                      borderRadius:
                                        "11px",
                                      display:
                                        "grid",
                                      placeItems:
                                        "center",
                                      backgroundColor:
                                        product.is_active
                                          ? "#F1E8E2"
                                          : "#F1EEEC",
                                      color:
                                        product.is_active
                                          ? "primary.main"
                                          : "text.disabled",
                                    }}
                                  >
                                    <Inventory2RoundedIcon
                                      sx={{
                                        fontSize: 19,
                                      }}
                                    />
                                  </Box>

                                  <Box
                                    sx={{
                                      minWidth: 0,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight: 750,
                                        maxWidth: 250,
                                        overflow:
                                          "hidden",
                                        textOverflow:
                                          "ellipsis",
                                        whiteSpace:
                                          "nowrap",
                                      }}
                                    >
                                      {
                                        product.name
                                      }
                                    </Typography>

                                    {product.description && (
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                          display:
                                            "block",
                                          maxWidth: 260,
                                          overflow:
                                            "hidden",
                                          textOverflow:
                                            "ellipsis",
                                          whiteSpace:
                                            "nowrap",
                                        }}
                                      >
                                        {
                                          product.description
                                        }
                                      </Typography>
                                    )}
                                  </Box>
                                </Stack>
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 650,
                                    fontFamily:
                                      "monospace",
                                    fontSize:
                                      "0.78rem",
                                  }}
                                >
                                  {
                                    product.sku
                                  }
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  label={
                                    category?.name ??
                                    `Category #${product.category_id}`
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      "#EEEAF3",
                                    color:
                                      "#6F668A",
                                  }}
                                />
                              </TableCell>

                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 800,
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {formatPrice(
                                    product.base_price,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell>
                                <Chip
                                  icon={
                                    product.is_active ? (
                                      <CheckCircleRoundedIcon />
                                    ) : undefined
                                  }
                                  label={
                                    product.is_active
                                      ? "Active"
                                      : "Inactive"
                                  }
                                  size="small"
                                  sx={{
                                    backgroundColor:
                                      product.is_active
                                        ? "#E5F0E9"
                                        : "#F0ECEA",
                                    color:
                                      product.is_active
                                        ? "#52745F"
                                        : "#817771",
                                    "& .MuiChip-icon":
                                      {
                                        color:
                                          "#52745F",
                                        fontSize:
                                          16,
                                      },
                                  }}
                                />
                              </TableCell>

                              <TableCell>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDate(
                                    product.updated_at,
                                  )}
                                </Typography>
                              </TableCell>

                              <TableCell align="right">
                                {isAdmin ? (
                                  <Stack
                                    direction="row"
                                    spacing={0.25}
                                    justifyContent="flex-end"
                                  >
                                    <Tooltip title="Edit">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          openEditDialog(
                                            product,
                                          )
                                        }
                                        aria-label={`Edit ${product.name}`}
                                      >
                                        <EditRoundedIcon
                                          sx={{
                                            fontSize: 19,
                                          }}
                                        />
                                      </IconButton>
                                    </Tooltip>

                                    <Tooltip
                                      title={
                                        product.is_active
                                          ? "Deactivate"
                                          : "Activate"
                                      }
                                    >
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          openStatusDialog(
                                            product,
                                          )
                                        }
                                        aria-label={
                                          product.is_active
                                            ? `Deactivate ${product.name}`
                                            : `Activate ${product.name}`
                                        }
                                      >
                                        {product.is_active ? (
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
                                    </Tooltip>

                                    <Tooltip title="Delete">
                                      <IconButton
                                        size="small"
                                        onClick={() =>
                                          openDeleteDialog(
                                            product,
                                          )
                                        }
                                        aria-label={`Delete ${product.name}`}
                                      >
                                        <DeleteOutlineRoundedIcon
                                          sx={{
                                            fontSize: 19,
                                          }}
                                        />
                                      </IconButton>
                                    </Tooltip>
                                  </Stack>
                                ) : (
                                  <MoreHorizRoundedIcon
                                    sx={{
                                      color:
                                        "text.disabled",
                                    }}
                                  />
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        },
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Divider />

                <TablePagination
                  component="div"
                  count={total}
                  page={page}
                  onPageChange={(
                    _event,
                    nextPage,
                  ) =>
                    setPage(nextPage)
                  }
                  rowsPerPage={
                    rowsPerPage
                  }
                  onRowsPerPageChange={(
                    event,
                  ) => {
                    setRowsPerPage(
                      Number(
                        event.target
                          .value,
                      ),
                    );
                    setPage(0);
                  }}
                  rowsPerPageOptions={[
                    5,
                    10,
                    25,
                    50,
                  ]}
                  labelRowsPerPage="Rows"
                />
              </>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* Create / Edit dialog */}
      <Dialog
        open={formOpen}
        onClose={closeFormDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "18px",
            backgroundColor:
              "#FFFDFC",
          },
        }}
      >
        <Box
          component="form"
          onSubmit={
            handleFormSubmit
          }
        >
          <DialogTitle
            sx={{
              pb: 1,
              fontWeight: 800,
            }}
          >
            {editingProduct
              ? "Edit product"
              : "Add product"}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.1}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {editingProduct
                  ? "Update the product details used by your pricing engine."
                  : "Add a product to your catalog so it can participate in pricing calculations."}
              </Typography>

              {formError && (
                <Alert severity="error">
                  {formError}
                </Alert>
              )}

              <FormControl
                fullWidth
                required
              >
                <InputLabel>
                  Category
                </InputLabel>

                <Select
                  value={
                    form.category_id
                  }
                  label="Category"
                  onChange={(event) =>
                    setForm({
                      ...form,
                      category_id:
                        event.target
                          .value,
                    })
                  }
                >
                  {categories.map(
                    (category) => (
                      <MenuItem
                        key={
                          category.id
                        }
                        value={String(
                          category.id,
                        )}
                      >
                        {category.name}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </FormControl>

              <TextField
                label="Product name"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target
                      .value,
                  })
                }
                fullWidth
                required
                autoFocus
                inputProps={{
                  maxLength: 200,
                }}
              />

              <TextField
                label="SKU"
                value={form.sku}
                onChange={(event) =>
                  setForm({
                    ...form,
                    sku: event.target
                      .value,
                  })
                }
                fullWidth
                required
                inputProps={{
                  maxLength: 100,
                }}
                helperText="SKU must be unique."
              />

              <TextField
                label="Base price"
                type="number"
                value={
                  form.base_price
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    base_price:
                      event.target
                        .value,
                  })
                }
                fullWidth
                required
                inputProps={{
                  min: 0.01,
                  step: "0.01",
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      ₹
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                label="Description"
                value={
                  form.description
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target
                        .value,
                  })
                }
                fullWidth
                multiline
                minRows={4}
                inputProps={{
                  maxLength: 1000,
                }}
                helperText={`${form.description.length}/1000`}
              />
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 2.5,
              gap: 1,
            }}
          >
            <Button
              onClick={
                closeFormDialog
              }
              disabled={isSaving}
              color="inherit"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={
                isSaving ||
                isLoadingCategories
              }
              startIcon={
                isSaving ? (
                  <CircularProgress
                    size={17}
                    color="inherit"
                  />
                ) : (
                  <CheckCircleRoundedIcon />
                )
              }
            >
              {isSaving
                ? "Saving..."
                : editingProduct
                  ? "Save changes"
                  : "Create product"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Status confirmation */}
      <Dialog
        open={Boolean(
          statusTarget,
        )}
        onClose={
          closeStatusDialog
        }
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
            backgroundColor:
              "#FFFDFC",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          {statusTarget?.is_active
            ? "Deactivate product?"
            : "Activate product?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {statusTarget?.is_active
              ? "This product will remain in the catalog but will no longer be active."
              : "This product will become active and can participate in the pricing engine."}
          </Typography>

          {statusTarget && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius:
                  "12px",
                backgroundColor:
                  "#F7F1ED",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 750,
                }}
              >
                {statusTarget.name}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {statusTarget.sku}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={
              closeStatusDialog
            }
            disabled={
              isChangingStatus
            }
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleStatusChange()
            }
            disabled={
              isChangingStatus
            }
            startIcon={
              isChangingStatus ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : statusTarget?.is_active ? (
                <ToggleOffRoundedIcon />
              ) : (
                <ToggleOnRoundedIcon />
              )
            }
          >
            {statusTarget?.is_active
              ? "Deactivate"
              : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog
        open={Boolean(
          deleteTarget,
        )}
        onClose={
          closeDeleteDialog
        }
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
            backgroundColor:
              "#FFFDFC",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Delete product?
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            You are about to permanently
            delete{" "}
            <strong>
              {deleteTarget?.name}
            </strong>
            .
          </Typography>

          <Alert
            severity="warning"
            sx={{
              mt: 2,
            }}
          >
            If this product is already
            referenced by pricing
            calculations, the backend
            may prevent deletion.
            Deactivating the product
            is safer in that situation.
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={
              closeDeleteDialog
            }
            disabled={isDeleting}
            color="inherit"
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() =>
              void handleDelete()
            }
            disabled={isDeleting}
            startIcon={
              isDeleting ? (
                <CircularProgress
                  size={17}
                  color="inherit"
                />
              ) : (
                <DeleteOutlineRoundedIcon />
              )
            }
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

interface SummaryCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  background: string;
}

function SummaryCard({
  label,
  value,
  icon,
  background,
}: SummaryCardProps) {
  return (
    <Card
      sx={{
        boxShadow:
          "0 8px 25px rgba(72, 56, 47, 0.045)",
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
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius:
                "12px",
              display: "grid",
              placeItems: "center",
              backgroundColor:
                background,
              color:
                "primary.main",
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
                fontWeight: 650,
              }}
            >
              {label}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                mt: 0.15,
                fontWeight: 850,
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

function LoadingState() {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Stack
        spacing={1.25}
        alignItems="center"
      >
        <CircularProgress
          size={30}
        />

        <Typography
          variant="body2"
          color="text.secondary"
        >
          Loading products...
        </Typography>
      </Stack>
    </Box>
  );
}

interface EmptyStateProps {
  hasFilters: boolean;
  onCreate?: () => void;
}

function EmptyState({
  hasFilters,
  onCreate,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box>
        <Box
          sx={{
            width: 56,
            height: 56,
            mx: "auto",
            borderRadius:
              "16px",
            display: "grid",
            placeItems: "center",
            backgroundColor:
              "#F1E8E2",
            color:
              "primary.main",
          }}
        >
          <Inventory2RoundedIcon />
        </Box>

        <Typography
          variant="h6"
          sx={{
            mt: 1.75,
            fontWeight: 800,
          }}
        >
          {hasFilters
            ? "No matching products"
            : "No products yet"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            maxWidth: 430,
          }}
        >
          {hasFilters
            ? "Try a different search term or clear some of the filters."
            : "Create your first product to start building your pricing catalog."}
        </Typography>

        {onCreate &&
          !hasFilters && (
            <Button
              variant="outlined"
              startIcon={
                <AddRoundedIcon />
              }
              onClick={onCreate}
              sx={{
                mt: 2,
              }}
            >
              Add product
            </Button>
          )}
      </Box>
    </Box>
  );
}

function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const response = (
      error as {
        response?: {
          data?: {
            detail?: unknown;
          };
        };
      }
    ).response;

    const detail =
      response?.data?.detail;

    if (
      typeof detail === "string"
    ) {
      return detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export default ProductsPage;