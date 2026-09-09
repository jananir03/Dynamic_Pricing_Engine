import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ToggleOffRoundedIcon from "@mui/icons-material/ToggleOffRounded";
import ToggleOnRoundedIcon from "@mui/icons-material/ToggleOnRounded";

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
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
  updateCategoryStatus,
  type Category,
} from "../services/categoryService";

interface CategoryForm {
  name: string;
  description: string;
}

function CategoriesPage() {
  const { user } = useAuth();

  const isAdmin =
    user?.role.name?.toUpperCase() === "ADMIN";

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [total, setTotal] =
    useState(0);

  const [page, setPage] =
    useState(0);

  const [rowsPerPage, setRowsPerPage] =
    useState(10);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">(
      "all",
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null);

  const [form, setForm] =
    useState<CategoryForm>({
      name: "",
      description: "",
    });

  const [formError, setFormError] =
    useState("");

  const [deleteTarget, setDeleteTarget] =
    useState<Category | null>(null);

  const [isDeleting, setIsDeleting] =
    useState(false);

  const [statusUpdatingId, setStatusUpdatingId] =
    useState<number | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response =
        await getCategories({
          page: page + 1,
          page_size: rowsPerPage,
          search: search.trim() || undefined,
          is_active:
            statusFilter === "all"
              ? undefined
              : statusFilter === "active",
          sort_by: "created_at",
          sort_order: "desc",
        });

      setCategories(response.items);
      setTotal(response.total);
    } catch {
      setError(
        "We couldn't load the categories. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadCategories();
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [
    page,
    rowsPerPage,
    search,
    statusFilter,
  ]);

  const openCreateDialog = () => {
    setEditingCategory(null);
    setForm({
      name: "",
      description: "",
    });
    setFormError("");
    setError("");
    setSuccessMessage("");
    setFormOpen(true);
  };

  const openEditDialog = (
    category: Category,
  ) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description:
        category.description ?? "",
    });
    setFormError("");
    setError("");
    setSuccessMessage("");
    setFormOpen(true);
  };

  const closeFormDialog = () => {
    if (isSaving) {
      return;
    }

    setFormOpen(false);
    setFormError("");
  };

  const handleFormSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const name = form.name.trim();
    const description =
      form.description.trim();

    if (!name) {
      setFormError(
        "Category name is required.",
      );
      return;
    }

    if (name.length > 100) {
      setFormError(
        "Category name must be 100 characters or less.",
      );
      return;
    }

    if (description.length > 500) {
      setFormError(
        "Description must be 500 characters or less.",
      );
      return;
    }

    setIsSaving(true);
    setFormError("");
    setError("");

    try {
      if (editingCategory) {
        await updateCategory(
          editingCategory.id,
          {
            name,
            description:
              description || null,
          },
        );

        setSuccessMessage(
          "Category updated successfully.",
        );
      } else {
        await createCategory({
          name,
          description:
            description || null,
        });

        setSuccessMessage(
          "Category created successfully.",
        );
      }

      setFormOpen(false);

      await loadCategories();
    } catch (error) {
      setFormError(
        getErrorMessage(
          error,
          editingCategory
            ? "We couldn't update this category."
            : "We couldn't create this category.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (
    category: Category,
  ) => {
    setStatusUpdatingId(category.id);
    setError("");
    setSuccessMessage("");

    try {
      await updateCategoryStatus(
        category.id,
        !category.is_active,
      );

      setSuccessMessage(
        category.is_active
          ? `"${category.name}" has been deactivated.`
          : `"${category.name}" has been activated.`,
      );

      await loadCategories();
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "We couldn't update the category status.",
        ),
      );
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      await deleteCategory(
        deleteTarget.id,
      );

      setDeleteTarget(null);

      if (
        categories.length === 1 &&
        page > 0
      ) {
        setPage((currentPage) =>
          currentPage - 1,
        );
      } else {
        await loadCategories();
      }

      setSuccessMessage(
        `"${deleteTarget.name}" was deleted successfully.`,
      );
    } catch (error) {
      setError(
        getErrorMessage(
          error,
          "We couldn't delete this category.",
        ),
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (
    _event: unknown,
    newPage: number,
  ) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(
      Number(event.target.value),
    );
    setPage(0);
  };

  return (
   <Box
        sx={{
            position: "relative",
            minHeight: "calc(100vh - 72px)",
            overflow: "hidden",
            width: "100%",
        }}
    >
      {/* Decorative background */}
      <Box
        sx={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          backgroundColor: "#EADFD8",
          opacity: 0.16,
          top: -230,
          right: -150,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          width: 300,
          height: 300,
          borderRadius: "50%",
          backgroundColor: "#E6E0EF",
          opacity: 0.14,
          bottom: -180,
          left: -150,
          pointerEvents: "none",
        }}
      />

     <Box
        sx={{
            position: "relative",
            width: "100%",
            px: {
                xs: 2,
                sm: 2.5,
                md: 3,
            },
            py: {
                xs: 2.5,
                sm: 3,
            },
        }}
      >
        <Stack spacing={2.5}>
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
                CATALOG
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
                Categories
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                }}
              >
                Organize the products used by your
                pricing engine.
              </Typography>
            </Box>

            {isAdmin && (
              <Button
                variant="contained"
                startIcon={
                  <AddRoundedIcon />
                }
                onClick={openCreateDialog}
                sx={{
                  flexShrink: 0,
                  borderRadius: "12px",
                  px: 2,
                }}
              >
                New category
              </Button>
            )}
          </Box>

          {/* Messages */}
          {error && (
            <Alert
              severity="error"
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
              {error}
            </Alert>
          )}

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

          {/* Main card */}
          <Card
            sx={{
              overflow: "hidden",
            }}
          >
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
              {/* Toolbar */}
              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={1.5}
                justifyContent="space-between"
              >
                <TextField
                  value={search}
                  onChange={(event) => {
                    setSearch(
                      event.target.value,
                    );
                    setPage(0);
                  }}
                  placeholder="Search categories..."
                  size="small"
                  sx={{
                    width: {
                      xs: "100%",
                      md: 360,
                    },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "11px",
                      backgroundColor:
                        "#FFFDFC",
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon
                            sx={{
                              color:
                                "text.secondary",
                              fontSize: 20,
                            }}
                          />
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <FormControl
                    size="small"
                    sx={{
                      minWidth: 135,
                    }}
                  >
                    <Select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(
                          event.target.value as
                            | "all"
                            | "active"
                            | "inactive",
                        );
                        setPage(0);
                      }}
                      displayEmpty
                      sx={{
                        borderRadius: "11px",
                        backgroundColor:
                          "#FFFDFC",
                      }}
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

                  <Tooltip title="Refresh">
                    <span>
                      <IconButton
                        onClick={() =>
                          void loadCategories()
                        }
                        disabled={isLoading}
                        sx={{
                          width: 40,
                          height: 40,
                          border: "1px solid",
                          borderColor:
                            "divider",
                          backgroundColor:
                            "#FFFDFC",
                        }}
                      >
                        <RefreshRoundedIcon
                          sx={{
                            fontSize: 20,
                          }}
                        />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </Stack>

              <Divider
                sx={{
                  my: 2,
                }}
              />

              {/* Table */}
              <TableContainer>
                <Table
                  sx={{
                    minWidth: 680,
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        Category
                      </TableCell>

                      <TableCell>
                        Description
                      </TableCell>

                      <TableCell>
                        Status
                      </TableCell>

                      <TableCell
                        align="right"
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                        >
                          <Box
                            sx={{
                              minHeight: 260,
                              display: "grid",
                              placeItems:
                                "center",
                            }}
                          >
                            <CircularProgress
                              size={30}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : categories.length ===
                      0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                        >
                          <EmptyState
                            hasSearch={
                              Boolean(
                                search.trim(),
                              )
                            }
                            onCreate={
                              isAdmin
                                ? openCreateDialog
                                : undefined
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map(
                        (category) => (
                          <TableRow
                            key={category.id}
                            hover
                            sx={{
                              "&:last-child td, &:last-child th":
                                {
                                  borderBottom:
                                    0,
                                },
                            }}
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
                                    borderRadius:
                                      "11px",
                                    display:
                                      "grid",
                                    placeItems:
                                      "center",
                                    flexShrink: 0,
                                    backgroundColor:
                                      category.is_active
                                        ? "#EEEAF3"
                                        : "#F1ECE8",
                                    color:
                                      "primary.main",
                                  }}
                                >
                                  <CategoryRoundedIcon
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
                                      fontWeight:
                                        750,
                                    }}
                                  >
                                    {
                                      category.name
                                    }
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    ID #
                                    {
                                      category.id
                                    }
                                  </Typography>
                                </Box>
                              </Stack>
                            </TableCell>

                            <TableCell>
                              <Typography
                                variant="body2"
                                color={
                                  category.description
                                    ? "text.primary"
                                    : "text.secondary"
                                }
                                sx={{
                                  maxWidth: 420,
                                  overflow:
                                    "hidden",
                                  textOverflow:
                                    "ellipsis",
                                  whiteSpace:
                                    "nowrap",
                                }}
                              >
                                {
                                  category.description ??
                                    "No description"
                                }
                              </Typography>
                            </TableCell>

                            <TableCell>
                              <Chip
                                size="small"
                                label={
                                  category.is_active
                                    ? "Active"
                                    : "Inactive"
                                }
                                sx={{
                                  fontWeight: 700,
                                  backgroundColor:
                                    category.is_active
                                      ? "#E5F0E9"
                                      : "#F0EBE8",
                                  color:
                                    category.is_active
                                      ? "success.dark"
                                      : "text.secondary",
                                }}
                              />
                            </TableCell>

                            <TableCell align="right">
                              {isAdmin ? (
                                <Stack
                                  direction="row"
                                  spacing={0.25}
                                  justifyContent="flex-end"
                                >
                                  <Tooltip
                                    title={
                                      category.is_active
                                        ? "Deactivate"
                                        : "Activate"
                                    }
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        void handleStatusChange(
                                          category,
                                        )
                                      }
                                      disabled={
                                        statusUpdatingId ===
                                        category.id
                                      }
                                    >
                                      {category.is_active ? (
                                        <ToggleOnRoundedIcon
                                          sx={{
                                            color:
                                              "success.main",
                                          }}
                                        />
                                      ) : (
                                        <ToggleOffRoundedIcon />
                                      )}
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Edit">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        openEditDialog(
                                          category,
                                        )
                                      }
                                    >
                                      <EditRoundedIcon
                                        sx={{
                                          fontSize: 19,
                                        }}
                                      />
                                    </IconButton>
                                  </Tooltip>

                                  <Tooltip title="Delete">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        setDeleteTarget(
                                          category,
                                        )
                                      }
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
                        ),
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={
                  handlePageChange
                }
                rowsPerPage={
                  rowsPerPage
                }
                onRowsPerPageChange={
                  handleRowsPerPageChange
                }
                rowsPerPageOptions={[
                  5,
                  10,
                  25,
                  50,
                ]}
                labelRowsPerPage="Rows"
              />
            </CardContent>
          </Card>
        </Stack>
      </Box>

      {/* Create / Edit Dialog */}
      <Dialog
        open={formOpen}
        onClose={closeFormDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: "18px",
            backgroundColor: "#FFFDFC",
          },
        }}
      >
        <Box
          component="form"
          onSubmit={handleFormSubmit}
        >
          <DialogTitle
            sx={{
              pb: 1,
              fontWeight: 800,
            }}
          >
            {editingCategory
              ? "Edit category"
              : "Create category"}
          </DialogTitle>

          <DialogContent>
            <Stack spacing={2.25}>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                {editingCategory
                  ? "Update the category details used by your product catalog."
                  : "Add a category to organize products in your pricing workspace."}
              </Typography>

              {formError && (
                <Alert severity="error">
                  {formError}
                </Alert>
              )}

              <TextField
                label="Category name"
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                fullWidth
                required
                autoFocus
                inputProps={{
                  maxLength: 100,
                }}
              />

              <TextField
                label="Description"
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description:
                      event.target.value,
                  })
                }
                fullWidth
                multiline
                minRows={4}
                inputProps={{
                  maxLength: 500,
                }}
                helperText={`${form.description.length}/500`}
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
              onClick={closeFormDialog}
              disabled={isSaving}
              color="inherit"
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={isSaving}
              startIcon={
                isSaving ? (
                  <CircularProgress
                    size={17}
                    color="inherit"
                  />
                ) : undefined
              }
            >
              {editingCategory
                ? "Save changes"
                : "Create category"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "18px",
            backgroundColor: "#FFFDFC",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
          }}
        >
          Delete category?
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            You are about to delete{" "}
            <strong>
              {deleteTarget?.name}
            </strong>
            . This action cannot be undone.
          </Typography>

          <Alert
            severity="info"
            sx={{
              mt: 2,
            }}
          >
            If products are still associated
            with this category, the backend will
            prevent deletion. You can deactivate
            it instead.
          </Alert>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button
            onClick={() =>
              setDeleteTarget(null)
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

interface EmptyStateProps {
  hasSearch: boolean;
  onCreate?: () => void;
}

function EmptyState({
  hasSearch,
  onCreate,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        minHeight: 260,
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Box>
        <Box
          sx={{
            width: 52,
            height: 52,
            mx: "auto",
            borderRadius: "15px",
            display: "grid",
            placeItems: "center",
            backgroundColor: "#EEEAF3",
            color: "primary.main",
          }}
        >
          <CategoryRoundedIcon />
        </Box>

        <Typography
          variant="h6"
          sx={{
            mt: 1.75,
            fontWeight: 800,
          }}
        >
          {hasSearch
            ? "No matching categories"
            : "No categories yet"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            maxWidth: 420,
          }}
        >
          {hasSearch
            ? "Try a different search term or change the status filter."
            : "Create your first category to start organizing products."}
        </Typography>

        {onCreate && !hasSearch && (
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
            Create category
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

    const detail = response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }
  }

  return fallback;
}

export default CategoriesPage;