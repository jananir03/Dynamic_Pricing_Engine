import { useEffect, useMemo, useState } from "react";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import ShoppingBagRoundedIcon from "@mui/icons-material/ShoppingBagRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { getCustomers } from "../services/customerService";
import { getProducts } from "../services/productService";
import {
  calculatePrice,
  type PricingCalculation,
} from "../services/pricingCalculationService";

interface ProductOption {
  id: number;
  name: string;
  sku: string;
  base_price: string | number;
}

interface CustomerOption {
  id: number;
  name: string;
  email: string;
  customer_type: string;
}

interface CalculationItemState {
  productId: number | "";
  quantity: number;
}

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

function getApiErrorMessage(
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

  return "Unable to calculate the dynamic price.";
}

function PricingCalculatorPage() {
  const [products, setProducts] =
    useState<ProductOption[]>([]);

  const [customers, setCustomers] =
    useState<CustomerOption[]>([]);

  const [customerId, setCustomerId] =
    useState<number | "">("");

  const [items, setItems] =
    useState<CalculationItemState[]>([
      {
        productId: "",
        quantity: 1,
      },
    ]);

  const [promotionCode, setPromotionCode] =
    useState("");

  const [calculation, setCalculation] =
    useState<PricingCalculation | null>(
      null,
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [isCalculating, setIsCalculating] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      try {
        setIsLoading(true);
        setError("");

        const [
          productResponse,
          customerResponse,
        ] = await Promise.all([
          getProducts({
            page: 1,
            page_size: 100,
            is_active: true,
            sort_by: "name",
            sort_order: "asc",
          }),

          getCustomers({
            page: 1,
            page_size: 100,
            is_active: true,
            sort_by: "name",
            sort_order: "asc",
          }),
        ]);

        if (!mounted) {
          return;
        }

        setProducts(
          productResponse.items.map(
            (product) => ({
              id: product.id,
              name: product.name,
              sku: product.sku,
              base_price:
                product.base_price,
            }),
          ),
        );

        setCustomers(
          customerResponse.items.map(
            (customer) => ({
              id: customer.id,
              name: customer.name,
              email: customer.email,
              customer_type:
                customer.customer_type,
            }),
          ),
        );
      } catch (loadError) {
        if (mounted) {
          setError(
            getApiErrorMessage(
              loadError,
            ),
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedProductIds =
    useMemo(
      () =>
        new Set(
          items
            .map(
              (item) =>
                item.productId,
            )
            .filter(
              (
                id,
              ): id is number =>
                typeof id ===
                "number",
            ),
        ),
      [items],
    );

  const selectedCustomer =
    customers.find(
      (customer) =>
        customer.id ===
        customerId,
    );

  const draftSubtotal =
    items.reduce(
      (total, item) => {
        if (
          item.productId === ""
        ) {
          return total;
        }

        const product =
          products.find(
            (option) =>
              option.id ===
              item.productId,
          );

        if (!product) {
          return total;
        }

        return (
          total +
          Number(
            product.base_price,
          ) *
            item.quantity
        );
      },
      0,
    );

  const updateItem = (
    index: number,
    patch: Partial<CalculationItemState>,
  ) => {
    setItems(
      (current) =>
        current.map(
          (
            item,
            itemIndex,
          ) =>
            itemIndex === index
              ? {
                  ...item,
                  ...patch,
                }
              : item,
        ),
    );

    setCalculation(null);
    setError("");
  };

  const addItem = () => {
    const nextProduct =
      products.find(
        (product) =>
          !selectedProductIds.has(
            product.id,
          ),
      );

    if (!nextProduct) {
      return;
    }

    setItems(
      (current) => [
        ...current,
        {
          productId:
            nextProduct.id,
          quantity: 1,
        },
      ],
    );

    setCalculation(null);
  };

  const removeItem = (
    index: number,
  ) => {
    if (items.length === 1) {
      return;
    }

    setItems(
      (current) =>
        current.filter(
          (_, itemIndex) =>
            itemIndex !== index,
        ),
    );

    setCalculation(null);
  };

  const changeQuantity = (
    index: number,
    delta: number,
  ) => {
    const currentQuantity =
      items[index]?.quantity ??
      1;

    const nextQuantity =
      Math.max(
        1,
        currentQuantity +
          delta,
      );

    updateItem(
      index,
      {
        quantity:
          nextQuantity,
      },
    );
  };

  const handleCalculate =
    async () => {
      if (customerId === "") {
        setError(
          "Please select a customer.",
        );
        return;
      }

      if (
        items.some(
          (item) =>
            item.productId === "",
        )
      ) {
        setError(
          "Please select a product for every item.",
        );
        return;
      }

      const requestItems =
        items.map(
          (item) => ({
            product_id:
              Number(
                item.productId,
              ),
            quantity:
              item.quantity,
          }),
        );

      try {
        setIsCalculating(true);
        setError("");

        const result =
          await calculatePrice({
            customer_id:
              Number(
                customerId,
              ),
            items:
              requestItems,
            promotion_code:
              promotionCode.trim()
                ? promotionCode
                    .trim()
                    .toUpperCase()
                : null,
          });

        setCalculation(
          result,
        );
      } catch (
        calculationError
      ) {
        setCalculation(null);

        setError(
          getApiErrorMessage(
            calculationError,
          ),
        );
      } finally {
        setIsCalculating(
          false,
        );
      }
    };

  const availableToAdd =
    products.some(
      (product) =>
        !selectedProductIds.has(
          product.id,
        ),
    );

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
            DYNAMIC PRICING
          </Typography>

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
            Price Calculator
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
            Build a complete
            transaction with
            multiple products.
            The pricing engine
            evaluates active
            business rules for
            every item and then
            applies the optional
            promotion.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Card>
            <CardContent
              sx={{
                minHeight: 360,
                display: "grid",
                placeItems:
                  "center",
              }}
            >
              <CircularProgress />
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                {
                  xs: "1fr",
                  lg: "minmax(0, 1.45fr) minmax(330px, 0.75fr)",
                },
              gap: 2.25,
              alignItems:
                "start",
            }}
          >
            <Card>
              <CardContent
                sx={{
                  p: {
                    xs: 2,
                    sm: 3,
                  },
                }}
              >
                <Stack spacing={2.25}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 46,
                        height: 46,
                        borderRadius:
                          "14px",
                        display: "grid",
                        placeItems:
                          "center",
                        backgroundColor:
                          "#EEE4DD",
                        color:
                          "#765E50",
                      }}
                    >
                      <ShoppingBagRoundedIcon />
                    </Box>

                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight:
                            800,
                        }}
                      >
                        Calculation
                        inputs
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Add one or
                        more products
                        to the same
                        transaction.
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        mb: 1.25,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight:
                            800,
                        }}
                      >
                        Items (
                        {
                          items.length
                        }
                        )
                      </Typography>

                      <Chip
                        size="small"
                        label={`Draft subtotal ₹${formatMoney(
                          draftSubtotal,
                        )}`}
                        sx={{
                          backgroundColor:
                            "#F2EAE5",
                          color:
                            "#755E51",
                          fontWeight:
                            700,
                        }}
                      />
                    </Stack>

                    <Stack spacing={1.25}>
                      {items.map(
                        (
                          item,
                          index,
                        ) => {
                          const selectedProduct =
                            products.find(
                              (
                                product,
                              ) =>
                                product.id ===
                                item.productId,
                            );

                          return (
                            <Box
                              key={`${index}-${item.productId}`}
                              sx={{
                                p: 1.5,
                                borderRadius:
                                  "16px",
                                backgroundColor:
                                  "#FCFAF8",
                                border:
                                  "1px solid #E9DFD9",
                              }}
                            >
                              <Stack
                                direction={{
                                  xs: "column",
                                  sm: "row",
                                }}
                                spacing={1.25}
                                alignItems={{
                                  xs: "stretch",
                                  sm: "center",
                                }}
                              >
                                <Box
                                  sx={{
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <Select<number | "">
                                    fullWidth
                                    size="small"
                                    displayEmpty
                                    value={
                                      item.productId
                                    }
                                    onChange={(
                                      event,
                                    ) => {
                                      const value =
                                        event
                                          .target
                                          .value;

                                      updateItem(
                                        index,
                                        {
                                          productId:
                                            value ===
                                            ""
                                              ? ""
                                              : Number(
                                                  value,
                                                ),
                                        },
                                      );
                                    }}
                                    renderValue={(
                                      value,
                                    ) => {
                                      if (
                                        value ===
                                        ""
                                      ) {
                                        return (
                                          <Typography color="text.secondary">
                                            Select product
                                          </Typography>
                                        );
                                      }

                                      const product =
                                        products.find(
                                          (
                                            option,
                                          ) =>
                                            option.id ===
                                            Number(
                                              value,
                                            ),
                                        );

                                      return product
                                        ? `${product.name} — ₹${formatMoney(
                                            product.base_price,
                                          )}`
                                        : "Select product";
                                    }}
                                  >
                                    <MenuItem value="">
                                      Select product
                                    </MenuItem>

                                    {products.map(
                                      (
                                        product,
                                      ) => {
                                        const usedByAnotherRow =
                                          selectedProductIds.has(
                                            product.id,
                                          ) &&
                                          product.id !==
                                            item.productId;

                                        return (
                                          <MenuItem
                                            key={
                                              product.id
                                            }
                                            value={
                                              product.id
                                            }
                                            disabled={
                                              usedByAnotherRow
                                            }
                                          >
                                            {
                                              product.name
                                            }{" "}
                                            — ₹
                                            {formatMoney(
                                              product.base_price,
                                            )}
                                          </MenuItem>
                                        );
                                      },
                                    )}
                                  </Select>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                      ml: 1.25,
                                    }}
                                  >
                                    {selectedProduct?.sku ??
                                      "Choose a product"}
                                  </Typography>
                                </Box>

                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  sx={{
                                    border:
                                      "1px solid #E5D9D1",
                                    borderRadius:
                                      "11px",
                                    width: {
                                      xs: "100%",
                                      sm: 140,
                                    },
                                    justifyContent:
                                      "space-between",
                                    backgroundColor:
                                      "#FFFFFF",
                                  }}
                                >
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      changeQuantity(
                                        index,
                                        -1,
                                      )
                                    }
                                    disabled={
                                      item.quantity <=
                                      1
                                    }
                                  >
                                    <RemoveRoundedIcon fontSize="small" />
                                  </IconButton>

                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight:
                                        800,
                                    }}
                                  >
                                    Qty{" "}
                                    {
                                      item.quantity
                                    }
                                  </Typography>

                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      changeQuantity(
                                        index,
                                        1,
                                      )
                                    }
                                  >
                                    <AddRoundedIcon fontSize="small" />
                                  </IconButton>
                                </Stack>

                                <Typography
                                  variant="body2"
                                  sx={{
                                    minWidth: {
                                      sm: 100,
                                    },
                                    textAlign: {
                                      xs: "left",
                                      sm: "right",
                                    },
                                    fontWeight:
                                      800,
                                  }}
                                >
                                  ₹
                                  {selectedProduct
                                    ? formatMoney(
                                        Number(
                                          selectedProduct.base_price,
                                        ) *
                                          item.quantity,
                                      )
                                    : "0.00"}
                                </Typography>

                                <IconButton
                                  color="error"
                                  onClick={() =>
                                    removeItem(
                                      index,
                                    )
                                  }
                                  disabled={
                                    items.length ===
                                    1
                                  }
                                >
                                  <DeleteOutlineRoundedIcon />
                                </IconButton>
                              </Stack>
                            </Box>
                          );
                        },
                      )}
                    </Stack>
                  </Box>

                  <Button
                    variant="outlined"
                    startIcon={
                      <AddRoundedIcon />
                    }
                    onClick={addItem}
                    disabled={
                      !availableToAdd
                    }
                    sx={{
                      alignSelf:
                        "flex-start",
                      borderColor:
                        "#D9C7BC",
                      color:
                        "#765E50",
                      backgroundColor:
                        "#FFFDFC",
                      fontWeight:
                        750,
                    }}
                  >
                    Add another
                    product
                  </Button>

                  <Divider />

                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 800,
                        mb: 1.25,
                      }}
                    >
                      Customer
                    </Typography>

                    <Select<number | "">
                      fullWidth
                      displayEmpty
                      value={
                        customerId
                      }
                      onChange={(
                        event,
                      ) => {
                        const value =
                          event
                            .target
                            .value;

                        setCustomerId(
                          value ===
                            ""
                            ? ""
                            : Number(
                                value,
                              ),
                        );

                        setCalculation(
                          null,
                        );

                        setError("");
                      }}
                      renderValue={(
                        value,
                      ) => {
                        if (
                          value ===
                          ""
                        ) {
                          return (
                            <Typography color="text.secondary">
                              Select customer
                            </Typography>
                          );
                        }

                        return selectedCustomer
                          ? `${selectedCustomer.name} — ${selectedCustomer.customer_type}`
                          : "Select customer";
                      }}
                    >
                      <MenuItem value="">
                        Select customer
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

                    {selectedCustomer && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display:
                            "block",
                          mt: 0.75,
                          ml: 1.25,
                        }}
                      >
                        {
                          selectedCustomer.customer_type
                        }{" "}
                        ·{" "}
                        {
                          selectedCustomer.email
                        }
                      </Typography>
                    )}
                  </Box>

                  <TextField
                    fullWidth
                    label="Promotion code"
                    value={
                      promotionCode
                    }
                    onChange={(
                      event,
                    ) => {
                      setPromotionCode(
                        event.target.value.toUpperCase(),
                      );

                      setCalculation(
                        null,
                      );

                      setError("");
                    }}
                    placeholder="Optional, e.g. BOOK25"
                    InputProps={{
                      startAdornment: (
                        <LocalOfferRoundedIcon
                          sx={{
                            mr: 1,
                          }}
                        />
                      ),
                    }}
                  />

                  <Box
                    sx={{
                      p: 1.75,
                      borderRadius:
                        "14px",
                      backgroundColor:
                        "#F3ECE7",
                      border:
                        "1px solid #E7DCD5",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.25}
                      alignItems="flex-start"
                    >
                      <AutoAwesomeRoundedIcon
                        sx={{
                          color:
                            "#8C7262",
                          mt: 0.15,
                        }}
                      />

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          lineHeight:
                            1.65,
                        }}
                      >
                        Every selected
                        product is
                        evaluated
                        separately
                        against the
                        active pricing
                        rules using
                        its own
                        quantity and
                        product
                        details.
                      </Typography>
                    </Stack>
                  </Box>

                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={
                      handleCalculate
                    }
                    disabled={
                      isCalculating ||
                      products.length ===
                        0
                    }
                    startIcon={
                      isCalculating ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : (
                        <CalculateRoundedIcon />
                      )
                    }
                    sx={{
                      minHeight: 52,
                      fontWeight: 800,
                    }}
                  >
                    {isCalculating
                      ? "Calculating..."
                      : "Calculate Dynamic Price"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                position: {
                  lg: "sticky",
                },
                top: {
                  lg: 20,
                },
                background:
                  "linear-gradient(145deg, #F4ECE7 0%, #F1ECF3 100%)",
                borderColor:
                  "#E2D8E0",
              }}
            >
              <CardContent
                sx={{
                  p: {
                    xs: 2.25,
                    sm: 3,
                  },
                }}
              >
                <Stack spacing={2}>
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
                          "rgba(255,255,255,0.72)",
                        color:
                          "#765E50",
                      }}
                    >
                      <ReceiptLongRoundedIcon />
                    </Box>

                    <Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight:
                            800,
                        }}
                      >
                        Price summary
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Every discount is
                        shown separately
                        for clarity.
                      </Typography>
                    </Box>
                  </Stack>

                  <Divider />

                  {!calculation ? (
                    <Box
                      sx={{
                        minHeight: 330,
                        display: "grid",
                        placeItems:
                          "center",
                        textAlign:
                          "center",
                        px: 2,
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            width: 62,
                            height: 62,
                            mx: "auto",
                            borderRadius:
                              "18px",
                            display:
                              "grid",
                            placeItems:
                              "center",
                            backgroundColor:
                              "rgba(255,255,255,0.7)",
                            color:
                              "#8B7466",
                          }}
                        >
                          <ReceiptLongRoundedIcon fontSize="large" />
                        </Box>

                        <Typography
                          variant="body1"
                          sx={{
                            mt: 2,
                            fontWeight:
                              750,
                          }}
                        >
                          Your calculated
                          price appears
                          here
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.5,
                            lineHeight:
                              1.6,
                          }}
                        >
                          Select a
                          customer and
                          at least one
                          product, then
                          run the pricing
                          engine.
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Stack spacing={1.25}>
                      <SummaryRow
                        label="Subtotal"
                        value={`₹${formatMoney(
                          calculation.subtotal,
                        )}`}
                      />

                      {calculation
                        .rule_discounts
                        .length >
                      0 ? (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius:
                              "14px",
                            backgroundColor:
                              "rgba(255,255,255,0.58)",
                            border:
                              "1px solid rgba(139,111,97,0.13)",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              display:
                                "block",
                              fontWeight:
                                800,
                              color:
                                "#756158",
                              mb: 1,
                            }}
                          >
                            PRICING RULE
                            DISCOUNTS
                          </Typography>

                          <Stack spacing={0.8}>
                            {calculation.rule_discounts.map(
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
                                >
                                  <Box
                                    sx={{
                                      minWidth:
                                        0,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontWeight:
                                          700,
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
                                      Applied
                                      to{" "}
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
                                      flexShrink:
                                        0,
                                      fontWeight:
                                        800,
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
                            )}
                          </Stack>
                        </Box>
                      ) : (
                        <SummaryRow
                          label="Pricing rule discounts"
                          value="₹0.00"
                        />
                      )}

                      {Number(
                        calculation.promotion_discount,
                      ) > 0 && (
                        <SummaryRow
                          label={`Promotion ${
                            calculation.promotion_code ??
                            ""
                          }`}
                          value={`- ₹${formatMoney(
                            calculation.promotion_discount,
                          )}`}
                          valueColor="#8B5E54"
                        />
                      )}

                      <Divider />

                      <SummaryRow
                        label="Total discount"
                        value={`- ₹${formatMoney(
                          calculation.discount_amount,
                        )}`}
                        valueColor="#8B5E54"
                      />

                      <SummaryRow
                        label="Additional charge"
                        value={`₹${formatMoney(
                          calculation.additional_charge,
                        )}`}
                      />

                      <SummaryRow
                        label="Tax"
                        value={`₹${formatMoney(
                          calculation.tax_amount,
                        )}`}
                      />

                      <Box
                        sx={{
                          mt: 0.75,
                          p: 2,
                          borderRadius:
                            "16px",
                          backgroundColor:
                            "rgba(255,255,255,0.78)",
                        }}
                      >
                        <Typography
                          variant="overline"
                          sx={{
                            color:
                              "#806B60",
                            fontWeight:
                              800,
                          }}
                        >
                          FINAL PRICE
                        </Typography>

                        <Typography
                          variant="h3"
                          sx={{
                            mt: 0.2,
                            fontWeight:
                              900,
                            letterSpacing:
                              "-0.04em",
                            color:
                              "#644F46",
                            fontSize: {
                              xs: "2.4rem",
                              md: "2.8rem",
                            },
                          }}
                        >
                          ₹
                          {formatMoney(
                            calculation.final_price,
                          )}
                        </Typography>
                      </Box>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip
                          size="small"
                          icon={
                            <ShoppingBagRoundedIcon />
                          }
                          label={`${
                            calculation
                              .items
                              .length
                          } product${
                            calculation
                              .items
                              .length ===
                            1
                              ? ""
                              : "s"
                          }`}
                          sx={{
                            backgroundColor:
                              "rgba(255,255,255,0.72)",
                          }}
                        />

                        {calculation.promotion_code && (
                          <Chip
                            size="small"
                            icon={
                              <LocalOfferRoundedIcon />
                            }
                            label={`Promotion: ${calculation.promotion_code}`}
                            sx={{
                              backgroundColor:
                                "rgba(255,255,255,0.72)",
                            }}
                          />
                        )}
                      </Stack>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {calculation && (
          <Card>
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  sm: 3,
                },
              }}
            >
              <Stack spacing={1.5}>
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                >
                  <CalculateRoundedIcon color="primary" />

                  <Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight:
                          800,
                      }}
                    >
                      Calculation details
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      Item-level details
                      and rule discounts
                      used by the engine.
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
                        sm: "repeat(2, 1fr)",
                        lg: "repeat(3, 1fr)",
                      },
                    gap: 1.25,
                  }}
                >
                  {calculation.items.map(
                    (item) => (
                      <Box
                        key={
                          item.product_id
                        }
                        sx={{
                          p: 1.5,
                          borderRadius:
                            "14px",
                          backgroundColor:
                            "#FAF7F5",
                          border:
                            "1px solid #EAE0DA",
                        }}
                      >
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
                          }{" "}
                          · ₹
                          {formatMoney(
                            item.subtotal,
                          )}
                        </Typography>
                      </Box>
                    ),
                  )}
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    pt: 0.5,
                  }}
                >
                  Calculation #
                  {
                    calculation.id
                  }
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
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

export default PricingCalculatorPage;