import { useEffect, useState } from "react";

import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";

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
import Typography from "@mui/material/Typography";

import {
  getCustomers,
  type Customer,
} from "../services/customerService";

import {
  getPricingCalculation,
  getPricingCalculations,
  type PricingCalculation,
} from "../services/pricingCalculationService";

const PAGE_SIZE_OPTIONS = [5, 10, 25];

function formatMoney(
  value: string | number,
): string {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "0.00";
  }

  return amount.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  );
}

function formatDateTime(
  value: string,
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function getErrorMessage(
  error: unknown,
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
            detail?: string;
          };
        };
      }
    ).response;

    if (response?.data?.detail) {
      return response.data.detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unable to load calculation history.";
}

function getCustomerName(
  calculation: PricingCalculation,
  customers: Customer[],
): string {
  const inputName =
    calculation.input_parameters
      ?.customer_name;

  if (
    typeof inputName === "string" &&
    inputName.trim()
  ) {
    return inputName;
  }

  const customer =
    customers.find(
      (item) =>
        item.id ===
        calculation.customer_id,
    );

  return (
    customer?.name ??
    `Customer #${calculation.customer_id}`
  );
}

function CalculationHistoryPage() {
  const [
    calculations,
    setCalculations,
  ] = useState<PricingCalculation[]>(
    [],
  );

  const [
    customers,
    setCustomers,
  ] = useState<Customer[]>([]);

  const [
    selectedCustomerId,
    setSelectedCustomerId,
  ] = useState<number | "">("");

  const [
    promotionCode,
    setPromotionCode,
  ] = useState("");

  const [page, setPage] =
    useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState(10);

  const [total, setTotal] =
    useState(0);

  const [
    totalPages,
    setTotalPages,
  ] = useState(0);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [error, setError] =
    useState("");

  const [
    selectedCalculation,
    setSelectedCalculation,
  ] =
    useState<PricingCalculation | null>(
      null,
    );

  const [
    isDetailLoading,
    setIsDetailLoading,
  ] = useState(false);

  const loadCustomers =
    async () => {
      try {
        const response =
          await getCustomers({
            page: 1,
            page_size: 100,
            sort_by: "name",
            sort_order: "asc",
          });

        setCustomers(
          response.items,
        );
      } catch {
        setCustomers([]);
      }
    };

  const loadHistory =
    async () => {
      setIsLoading(true);
      setError("");

      try {
        const response =
          await getPricingCalculations({
            page,
            page_size:
              pageSize,

            customer_id:
              selectedCustomerId ===
              ""
                ? undefined
                : Number(
                    selectedCustomerId,
                  ),

            promotion_code:
              promotionCode.trim()
                ? promotionCode
                    .trim()
                    .toUpperCase()
                : undefined,
          });

        setCalculations(
          response.items,
        );

        setTotal(
          response.total,
        );

        setTotalPages(
          response.total_pages,
        );
      } catch (loadError) {
        setCalculations([]);
        setTotal(0);
        setTotalPages(0);

        setError(
          getErrorMessage(
            loadError,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void loadCustomers();
  }, []);

  useEffect(() => {
    void loadHistory();
  }, [
    page,
    pageSize,
    selectedCustomerId,
    promotionCode,
  ]);

  const handleCustomerChange =
    (value: string) => {
      setSelectedCustomerId(
        value === ""
          ? ""
          : Number(value),
      );

      setPage(1);
    };

  const handlePromotionChange =
    (value: string) => {
      setPromotionCode(value);
      setPage(1);
    };

  const handleClearFilters =
    () => {
      setSelectedCustomerId("");
      setPromotionCode("");
      setPage(1);
    };

  const handleViewDetails =
    async (
      calculationId: number,
    ) => {
      setIsDetailLoading(true);
      setError("");

      try {
        const calculation =
          await getPricingCalculation(
            calculationId,
          );

        setSelectedCalculation(
          calculation,
        );
      } catch (detailError) {
        setError(
          getErrorMessage(
            detailError,
          ),
        );
      } finally {
        setIsDetailLoading(
          false,
        );
      }
    };

  const hasFilters =
    selectedCustomerId !==
      "" ||
    promotionCode.trim() !==
      "";

  return (
    <Box
      sx={{
        minHeight: "100%",
        backgroundColor:
          "#FBF8F6",
        px: {
          xs: 2,
          sm: 3,
          lg: 4,
        },
        py: {
          xs: 2.5,
          sm: 3.5,
        },
      }}
    >
      <Stack spacing={2.5}>
        {/* PAGE HEADER */}
        <Box>
          <Typography
            variant="overline"
            sx={{
              color: "#987A69",
              fontWeight: 800,
              letterSpacing:
                "0.13em",
            }}
          >
            AUDIT & HISTORY
          </Typography>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "flex-end",
            }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="h3"
                sx={{
                  mt: 0.25,
                  fontWeight: 850,
                  letterSpacing:
                    "-0.035em",
                  fontSize: {
                    xs: "2rem",
                    md: "2.65rem",
                  },
                }}
              >
                Calculation History
              </Typography>

              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mt: 0.75,
                  maxWidth: 850,
                  lineHeight: 1.7,
                }}
              >
                Review previous dynamic
                pricing decisions, see
                which rules were applied,
                and inspect the final
                price returned by the
                engine.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={
                <RefreshRoundedIcon />
              }
              onClick={() =>
                void loadHistory()
              }
              disabled={isLoading}
              sx={{
                borderColor:
                  "#D9C7BC",
                color: "#765E50",
                backgroundColor:
                  "#FFFDFC",
                fontWeight: 750,
              }}
            >
              Refresh
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {/* FILTER CARD */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 2,
                sm: 2.5,
              },
            }}
          >
            <Stack spacing={1.75}>
              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius:
                      "13px",
                    display: "grid",
                    placeItems:
                      "center",
                    backgroundColor:
                      "#EEE4DD",
                    color:
                      "#765E50",
                  }}
                >
                  <HistoryRoundedIcon />
                </Box>

                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Calculation records
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {total} calculation
                    {total === 1
                      ? ""
                      : "s"}{" "}
                    recorded
                  </Typography>
                </Box>
              </Stack>

              <Divider />

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    {
                      xs: "1fr",
                      sm: "1fr 1fr auto",
                    },
                  gap: 1.25,
                  alignItems:
                    "center",
                }}
              >
                <FormControl
                  fullWidth
                  size="small"
                >
                  <InputLabel id="history-customer-label">
                    Customer
                  </InputLabel>

                  <Select
                    labelId="history-customer-label"
                    label="Customer"
                    value={
                      selectedCustomerId
                    }
                    onChange={(
                      event,
                    ) =>
                      handleCustomerChange(
                        String(
                          event.target
                            .value,
                        ),
                      )
                    }
                  >
                    <MenuItem value="">
                      All customers
                    </MenuItem>

                    {customers.map(
                      (
                        customer,
                      ) => (
                        <MenuItem
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                        >
                          {
                            customer.name
                          }{" "}
                          —{" "}
                          {
                            customer.customer_type
                          }
                        </MenuItem>
                      ),
                    )}
                  </Select>
                </FormControl>

                <Box
                  component="input"
                  value={
                    promotionCode
                  }
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ) =>
                    handlePromotionChange(
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="Filter by promotion code"
                  sx={{
                    width: "100%",
                    height: 40,
                    boxSizing:
                      "border-box",
                    px: 1.5,
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #CFC4BE",
                    backgroundColor:
                      "#FFFFFF",
                    color:
                      "#3F3732",
                    font: "inherit",
                    outline:
                      "none",
                    "&:focus": {
                      borderColor:
                        "#9C806F",
                      boxShadow:
                        "0 0 0 2px rgba(156,128,111,0.12)",
                    },
                  }}
                />

                <Button
                  variant="text"
                  onClick={
                    handleClearFilters
                  }
                  disabled={
                    !hasFilters
                  }
                  sx={{
                    color:
                      "#765E50",
                    fontWeight: 750,
                    minWidth: 110,
                  }}
                >
                  Clear filters
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* HISTORY TABLE */}
        <Card>
          <TableContainer>
            <Table
              sx={{
                minWidth: 900,
              }}
            >
              <TableHead>
                <TableRow
                  sx={{
                    backgroundColor:
                      "#F8F3F0",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Calculation
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Customer
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Items
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Subtotal
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Discount
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Final price
                  </TableCell>

                  <TableCell
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Date
                  </TableCell>

                  <TableCell
                    align="right"
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                    >
                      <Box
                        sx={{
                          minHeight: 260,
                          display: "grid",
                          placeItems:
                            "center",
                        }}
                      >
                        <CircularProgress />
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : calculations.length ===
                  0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                    >
                      <Box
                        sx={{
                          minHeight: 260,
                          display: "grid",
                          placeItems:
                            "center",
                          textAlign:
                            "center",
                          px: 2,
                        }}
                      >
                        <Box>
                          <HistoryRoundedIcon
                            sx={{
                              fontSize: 42,
                              color:
                                "#A08E83",
                            }}
                          />

                          <Typography
                            variant="h6"
                            sx={{
                              mt: 1,
                              fontWeight:
                                800,
                            }}
                          >
                            No calculations
                            found
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.5,
                            }}
                          >
                            Run a calculation
                            from the Price
                            Calculator and
                            it will appear
                            here.
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  calculations.map(
                    (
                      calculation,
                    ) => (
                      <TableRow
                        key={
                          calculation.id
                        }
                        hover
                        sx={{
                          "&:last-child td":
                            {
                              borderBottom: 0,
                            },
                        }}
                      >
                        {/* CALCULATION */}
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.1}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius:
                                  "10px",
                                display:
                                  "grid",
                                placeItems:
                                  "center",
                                backgroundColor:
                                  "#F0E8E2",
                                color:
                                  "#8B7466",
                              }}
                            >
                              <CalculateRoundedIcon fontSize="small" />
                            </Box>

                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    800,
                                }}
                              >
                                #
                                {
                                  calculation.id
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Customer #
                                {
                                  calculation.customer_id
                                }
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* CUSTOMER */}
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                700,
                            }}
                          >
                            {getCustomerName(
                              calculation,
                              customers,
                            )}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {calculation
                              .input_parameters
                              ?.customer_type
                              ? String(
                                  calculation
                                    .input_parameters
                                    .customer_type,
                                )
                              : "Customer"}
                          </Typography>
                        </TableCell>

                        {/* ITEMS */}
                        <TableCell>
                          <Stack
                            spacing={0.5}
                          >
                            {calculation
                              .items
                              .length >
                            0 ? (
                              <>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      700,
                                  }}
                                >
                                  {
                                    calculation
                                      .items
                                      .length
                                  }{" "}
                                  product
                                  {calculation
                                    .items
                                    .length ===
                                  1
                                    ? ""
                                    : "s"}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{
                                    maxWidth: 230,
                                    overflow:
                                      "hidden",
                                    textOverflow:
                                      "ellipsis",
                                    whiteSpace:
                                      "nowrap",
                                  }}
                                >
                                  {calculation.items
                                    .map(
                                      (
                                        item,
                                      ) =>
                                        `${item.product_name} × ${item.quantity}`,
                                    )
                                    .join(
                                      ", ",
                                    )}
                                </Typography>
                              </>
                            ) : (
                              <Typography
                                variant="body2"
                              >
                                Product #
                                {
                                  calculation.product_id
                                }{" "}
                                ×{" "}
                                {
                                  calculation.quantity
                                }
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        {/* SUBTOTAL */}
                        <TableCell align="right">
                          ₹
                          {formatMoney(
                            calculation.subtotal,
                          )}
                        </TableCell>

                        {/* DISCOUNT */}
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                800,
                              color:
                                "#8B5E54",
                            }}
                          >
                            - ₹
                            {formatMoney(
                              calculation.discount_amount,
                            )}
                          </Typography>
                        </TableCell>

                        {/* FINAL PRICE */}
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight:
                                850,
                              color:
                                "#644F46",
                            }}
                          >
                            ₹
                            {formatMoney(
                              calculation.final_price,
                            )}
                          </Typography>
                        </TableCell>

                        {/* DATE */}
                        <TableCell>
                          <Typography
                            variant="body2"
                          >
                            {formatDateTime(
                              calculation.calculated_at,
                            )}
                          </Typography>

                          {calculation.promotion_code && (
                            <Chip
                              size="small"
                              icon={
                                <LocalOfferRoundedIcon />
                              }
                              label={
                                calculation.promotion_code
                              }
                              sx={{
                                mt: 0.75,
                                height: 24,
                                backgroundColor:
                                  "#F2E9E4",
                                color:
                                  "#765E50",
                                fontWeight:
                                  700,
                              }}
                            />
                          )}
                        </TableCell>

                        {/* VIEW */}
                        <TableCell align="right">
                          <IconButton
                            onClick={() =>
                              void handleViewDetails(
                                calculation.id,
                              )
                            }
                            aria-label={`View calculation ${calculation.id}`}
                            sx={{
                              border:
                                "1px solid #E0D4CC",
                              color:
                                "#765E50",
                            }}
                          >
                            <VisibilityRoundedIcon fontSize="small" />
                          </IconButton>
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
            page={Math.max(
              page - 1,
              0,
            )}
            onPageChange={(
              _,
              newPage,
            ) => {
              setPage(
                newPage + 1,
              );
            }}
            rowsPerPage={
              pageSize
            }
            onRowsPerPageChange={(
              event,
            ) => {
              setPageSize(
                Number(
                  event.target
                    .value,
                ),
              );

              setPage(1);
            }}
            rowsPerPageOptions={
              PAGE_SIZE_OPTIONS
            }
          />
        </Card>

        {totalPages > 0 && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              textAlign: "right",
            }}
          >
            Page {page} of{" "}
            {totalPages}
          </Typography>
        )}
      </Stack>

      {/* DETAIL DIALOG */}
      <Dialog
        open={
          selectedCalculation !==
            null ||
          isDetailLoading
        }
        onClose={() => {
          if (
            !isDetailLoading
          ) {
            setSelectedCalculation(
              null,
            );
          }
        }}
        fullWidth
        maxWidth="md"
      >
        {isDetailLoading ? (
          <Box
            sx={{
              minHeight: 260,
              display: "grid",
              placeItems:
                "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : selectedCalculation ? (
          <>
            <DialogTitle
              sx={{
                pb: 1,
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color:
                        "#987A69",
                      fontWeight:
                        800,
                    }}
                  >
                    CALCULATION
                    DETAILS
                  </Typography>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight:
                        850,
                    }}
                  >
                    Calculation #
                    {
                      selectedCalculation.id
                    }
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.35,
                    }}
                  >
                    {formatDateTime(
                      selectedCalculation.calculated_at,
                    )}
                  </Typography>
                </Box>

                <IconButton
                  onClick={() =>
                    setSelectedCalculation(
                      null,
                    )
                  }
                  aria-label="Close details"
                >
                  <CloseRoundedIcon />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent
              dividers
            >
              <Stack spacing={2.25}>
                {/* BASIC INFO */}
                <Box
                  sx={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      {
                        xs: "1fr",
                        sm: "repeat(3, 1fr)",
                      },
                    gap: 1.25,
                  }}
                >
                  <DetailBox
                    label="Customer"
                    value={getCustomerName(
                      selectedCalculation,
                      customers,
                    )}
                  />

                  <DetailBox
                    label="Customer type"
                    value={
                      selectedCalculation
                        .input_parameters
                        ?.customer_type
                        ? String(
                            selectedCalculation
                              .input_parameters
                              .customer_type,
                          )
                        : "—"
                    }
                  />

                  <DetailBox
                    label="Promotion"
                    value={
                      selectedCalculation.promotion_code ??
                      "No promotion"
                    }
                  />
                </Box>

                {/* PRODUCTS */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight:
                        800,
                      mb: 1,
                    }}
                  >
                    Purchased
                    items
                  </Typography>

                  <Stack spacing={1}>
                    {selectedCalculation
                      .items
                      .length >
                    0 ? (
                      selectedCalculation.items.map(
                        (
                          item,
                        ) => (
                          <Box
                            key={
                              item.product_id
                            }
                            sx={{
                              p: 1.5,
                              borderRadius:
                                "12px",
                              backgroundColor:
                                "#FAF7F5",
                              border:
                                "1px solid #EAE0DA",
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={2}
                            >
                              <Box>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight:
                                      800,
                                  }}
                                >
                                  {
                                    item.product_name
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {
                                    item.product_sku
                                  }{" "}
                                  · Qty{" "}
                                  {
                                    item.quantity
                                  }
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    800,
                                }}
                              >
                                ₹
                                {formatMoney(
                                  item.subtotal,
                                )}
                              </Typography>
                            </Stack>
                          </Box>
                        ),
                      )
                    ) : (
                      <DetailBox
                        label="Product"
                        value={`Product #${selectedCalculation.product_id} × ${selectedCalculation.quantity}`}
                      />
                    )}
                  </Stack>
                </Box>

                {/* DISCOUNT BREAKDOWN */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight:
                        800,
                      mb: 1,
                    }}
                  >
                    Discount
                    breakdown
                  </Typography>

                  <Stack spacing={0.9}>
                    {selectedCalculation
                      .rule_discounts
                      .length >
                    0 ? (
                      selectedCalculation.rule_discounts.map(
                        (
                          rule,
                        ) => (
                          <Stack
                            key={
                              rule.rule_id
                            }
                            direction="row"
                            justifyContent="space-between"
                            spacing={2}
                            sx={{
                              p: 1.25,
                              borderRadius:
                                "10px",
                              backgroundColor:
                                "#FCF7F5",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight:
                                    750,
                                }}
                              >
                                {
                                  rule.rule_name
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Rule #
                                {
                                  rule.rule_id
                                }{" "}
                                ·{" "}
                                {
                                  rule.item_count
                                }{" "}
                                item
                                {rule.item_count ===
                                1
                                  ? ""
                                  : "s"}
                              </Typography>
                            </Box>

                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight:
                                  850,
                                color:
                                  "#8B5E54",
                              }}
                            >
                              - ₹
                              {formatMoney(
                                rule.discount_amount,
                              )}
                            </Typography>
                          </Stack>
                        ),
                      )
                    ) : (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        No pricing rule
                        discount was
                        applied.
                      </Typography>
                    )}

                    {Number(
                      selectedCalculation.promotion_discount,
                    ) > 0 && (
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        sx={{
                          p: 1.25,
                          borderRadius:
                            "10px",
                          backgroundColor:
                            "#F2EAF3",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              750,
                          }}
                        >
                          Promotion{" "}
                          {
                            selectedCalculation.promotion_code
                          }
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight:
                              850,
                            color:
                              "#765E50",
                          }}
                        >
                          - ₹
                          {formatMoney(
                            selectedCalculation.promotion_discount,
                          )}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>
                </Box>

                <Divider />

                {/* FINAL SUMMARY */}
                <Stack spacing={0.9}>
                  <SummaryRow
                    label="Subtotal"
                    value={`₹${formatMoney(
                      selectedCalculation.subtotal,
                    )}`}
                  />

                  <SummaryRow
                    label="Total discount"
                    value={`- ₹${formatMoney(
                      selectedCalculation.discount_amount,
                    )}`}
                    valueColor="#8B5E54"
                  />

                  <SummaryRow
                    label="Additional charge"
                    value={`₹${formatMoney(
                      selectedCalculation.additional_charge,
                    )}`}
                  />

                  <SummaryRow
                    label="Tax"
                    value={`₹${formatMoney(
                      selectedCalculation.tax_amount,
                    )}`}
                  />

                  <Box
                    sx={{
                      mt: 0.75,
                      p: 1.75,
                      borderRadius:
                        "14px",
                      backgroundColor:
                        "#F3ECE7",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      FINAL PRICE
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        mt: 0.2,
                        fontWeight:
                          900,
                        color:
                          "#644F46",
                      }}
                    >
                      ₹
                      {formatMoney(
                        selectedCalculation.final_price,
                      )}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                p: 2,
              }}
            >
              <Button
                onClick={() =>
                  setSelectedCalculation(
                    null,
                  )
                }
                variant="contained"
              >
                Close
              </Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
}

interface DetailBoxProps {
  label: string;
  value: string;
}

function DetailBox({
  label,
  value,
}: DetailBoxProps) {
  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius:
          "12px",
        backgroundColor:
          "#FAF7F5",
        border:
          "1px solid #EAE0DA",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          mt: 0.3,
          fontWeight: 800,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  valueColor?: string;
}

function SummaryRow({
  label,
  value,
  valueColor,
}: SummaryRowProps) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 800,
          color: valueColor,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

export default CalculationHistoryPage;