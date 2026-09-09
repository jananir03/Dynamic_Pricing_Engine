import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ChangeEvent,
  ReactNode,
} from "react";

import axios from "axios";

import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalculateRoundedIcon from "@mui/icons-material/CalculateRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import FilterAltOutlinedIcon from "@mui/icons-material/FilterAltOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PauseRoundedIcon from "@mui/icons-material/PauseRounded";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import RuleRoundedIcon from "@mui/icons-material/RuleRounded";
import ScheduleRoundedIcon from "@mui/icons-material/ScheduleRounded";
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
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useAuth } from "../context/AuthContext";

import {
  type ConditionOperator,
  type PricingRule,
  type PricingRuleCreateRequest,
  type PricingRuleListParams,
  type PricingRuleUpdateRequest,
  type RuleActionRequest,
  type RuleActionType,
  type RuleCombinationType,
  type RuleConditionRequest,
  createPricingRule,
  deletePricingRule,
  getPricingRules,
  updatePricingRule,
  updatePricingRuleStatus,
} from "../services/pricingRuleService";

const CONDITION_FIELDS = [
  {
    value: "product_id",
    label: "Product ID",
    inputType: "number",
  },
  {
    value: "product_name",
    label: "Product Name",
    inputType: "text",
  },
  {
    value: "product_sku",
    label: "Product SKU",
    inputType: "text",
  },
  {
    value: "category_id",
    label: "Category ID",
    inputType: "number",
  },
  {
    value: "base_price",
    label: "Base Price",
    inputType: "number",
  },
  {
    value: "customer_id",
    label: "Customer ID",
    inputType: "number",
  },
  {
    value: "customer_name",
    label: "Customer Name",
    inputType: "text",
  },
  {
    value: "customer_email",
    label: "Customer Email",
    inputType: "text",
  },
  {
    value: "customer_type",
    label: "Customer Type",
    inputType: "text",
  },
  {
    value: "customer_category",
    label: "Customer Category",
    inputType: "text",
  },
  {
    value: "location",
    label: "Customer Location",
    inputType: "text",
  },
  {
    value: "quantity",
    label: "Quantity",
    inputType: "number",
  },
  {
    value: "subtotal",
    label: "Subtotal",
    inputType: "number",
  },
] as const;

const CONDITION_OPERATORS: Array<{
  value: ConditionOperator;
  label: string;
}> = [
  {
    value: "EQUALS",
    label: "Equals",
  },
  {
    value: "NOT_EQUALS",
    label: "Not equals",
  },
  {
    value: "GREATER_THAN",
    label: "Greater than",
  },
  {
    value: "GREATER_THAN_OR_EQUAL",
    label: "Greater than or equal",
  },
  {
    value: "LESS_THAN",
    label: "Less than",
  },
  {
    value: "LESS_THAN_OR_EQUAL",
    label: "Less than or equal",
  },
  {
    value: "CONTAINS",
    label: "Contains",
  },
  {
    value: "NOT_CONTAINS",
    label: "Does not contain",
  },
  {
    value: "IN",
    label: "In list",
  },
  {
    value: "NOT_IN",
    label: "Not in list",
  },
];

const ACTION_TYPES: Array<{
  value: RuleActionType;
  label: string;
  suffix: string;
}> = [
  {
    value: "PERCENTAGE_DISCOUNT",
    label: "Percentage Discount",
    suffix: "%",
  },
  {
    value: "FIXED_DISCOUNT",
    label: "Fixed Discount",
    suffix: "₹",
  },
  {
    value: "ADDITIONAL_CHARGE",
    label: "Additional Charge",
    suffix: "₹",
  },
  {
    value: "TAX",
    label: "Tax",
    suffix: "%",
  },
];

const COMBINATION_TYPES: Array<{
  value: RuleCombinationType;
  label: string;
  description: string;
}> = [
  {
    value: "COMBINE",
    label: "Combine",
    description:
      "Continue applying other matching rules.",
  },
  {
    value: "OVERRIDE",
    label: "Override",
    description:
      "Replace the effects of earlier rules.",
  },
  {
    value: "STOP",
    label: "Stop",
    description:
      "Apply this rule and stop further rule processing.",
  },
];

interface ConditionForm {
  field: string;
  operator: ConditionOperator;
  value: string;
  condition_group: string;
}

interface ActionForm {
  action_type: RuleActionType;
  value: string;
  execution_order: string;
}

interface RuleForm {
  name: string;
  description: string;
  priority: string;
  combination_type: RuleCombinationType;
  max_discount: string;
  start_date: string;
  end_date: string;
  conditions: ConditionForm[];
  actions: ActionForm[];
}

interface ConfirmDialogState {
  open: boolean;
  type: "status" | "delete";
  rule: PricingRule | null;
}

function createEmptyCondition(): ConditionForm {
  return {
    field: "customer_type",
    operator: "EQUALS",
    value: "PREMIUM",
    condition_group: "0",
  };
}

function createEmptyAction(): ActionForm {
  return {
    action_type: "PERCENTAGE_DISCOUNT",
    value: "10",
    execution_order: "0",
  };
}

function createEmptyRuleForm(): RuleForm {
  return {
    name: "",
    description: "",
    priority: "10",
    combination_type: "COMBINE",
    max_discount: "",
    start_date: "",
    end_date: "",
    conditions: [
      createEmptyCondition(),
    ],
    actions: [
      createEmptyAction(),
    ],
  };
}

function formatCombination(
  value: RuleCombinationType,
): string {
  if (value === "OVERRIDE") {
    return "Override";
  }

  if (value === "STOP") {
    return "Stop";
  }

  return "Combine";
}

function formatActionType(
  value: RuleActionType,
): string {
  if (value === "PERCENTAGE_DISCOUNT") {
    return "Percentage Discount";
  }

  if (value === "FIXED_DISCOUNT") {
    return "Fixed Discount";
  }

  if (value === "ADDITIONAL_CHARGE") {
    return "Additional Charge";
  }

  return "Tax";
}

function formatOperator(
  value: ConditionOperator,
): string {
  const operator =
    CONDITION_OPERATORS.find(
      (item) => item.value === value,
    );

  return operator?.label ?? value;
}

function formatField(
  value: string,
): string {
  const field =
    CONDITION_FIELDS.find(
      (item) => item.value === value,
    );

  return field?.label ?? value;
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
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

function convertToDateTimeInput(
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

function convertToApiDateTime(
  value: string,
): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const detail =
      error.response?.data?.detail;

    if (typeof detail === "string") {
      return detail;
    }

    if (Array.isArray(detail)) {
      const messages = detail
        .map((item) => {
          if (
            typeof item === "object" &&
            item !== null &&
            "msg" in item &&
            typeof item.msg === "string"
          ) {
            return item.msg;
          }

          return null;
        })
        .filter(
          (
            message,
          ): message is string =>
            Boolean(message),
        );

      if (messages.length > 0) {
        return messages.join(", ");
      }
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

function buildRuleForm(
  rule: PricingRule,
): RuleForm {
  return {
    name: rule.name,
    description:
      rule.description ?? "",
    priority: String(rule.priority),
    combination_type:
      rule.combination_type,
    max_discount:
      rule.max_discount ?? "",
    start_date:
      convertToDateTimeInput(
        rule.start_date,
      ),
    end_date:
      convertToDateTimeInput(
        rule.end_date,
      ),
    conditions:
      rule.conditions.length > 0
        ? rule.conditions.map(
            (condition) => ({
              field: condition.field,
              operator:
                condition.operator,
              value: condition.value,
              condition_group:
                String(
                  condition.condition_group,
                ),
            }),
          )
        : [
            createEmptyCondition(),
          ],
    actions:
      rule.actions.length > 0
        ? rule.actions.map(
            (action) => ({
              action_type:
                action.action_type,
              value: String(
                action.value,
              ),
              execution_order:
                String(
                  action.execution_order,
                ),
            }),
          )
        : [
            createEmptyAction(),
          ],
  };
}

function PricingRulesPage() {
  const { user } = useAuth();

  const isAdmin =
    user?.role.name?.toUpperCase() ===
    "ADMIN";

  const [rules, setRules] =
    useState<PricingRule[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<
      "all" | "active" | "inactive"
    >("all");

  const [
    combinationFilter,
    setCombinationFilter,
  ] = useState<
    "all" | RuleCombinationType
  >("all");

  const [page, setPage] =
    useState(1);

  const [pageSize, setPageSize] =
    useState(10);

  const [total, setTotal] =
    useState(0);

  const [totalPages, setTotalPages] =
    useState(0);

  const [formOpen, setFormOpen] =
    useState(false);

  const [editingRule, setEditingRule] =
    useState<PricingRule | null>(
      null,
    );

  const [form, setForm] =
    useState<RuleForm>(
      createEmptyRuleForm(),
    );

  const [formError, setFormError] =
    useState<string | null>(null);

  const [isSaving, setIsSaving] =
    useState(false);

  const [
    confirmDialog,
    setConfirmDialog,
  ] = useState<ConfirmDialogState>({
    open: false,
    type: "status",
    rule: null,
  });

  const loadRules = useCallback(
    async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: PricingRuleListParams =
          {
            page,
            page_size: pageSize,
            search:
              search.trim() || undefined,
            is_active:
              statusFilter === "all"
                ? undefined
                : statusFilter ===
                    "active",
            combination_type:
              combinationFilter ===
              "all"
                ? undefined
                : combinationFilter,
            sort_by: "priority",
            sort_order: "desc",
          };

        const response =
          await getPricingRules(
            params,
          );

        setRules(response.items);
        setTotal(response.total);
        setTotalPages(
          response.total_pages,
        );
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      page,
      pageSize,
      search,
      statusFilter,
      combinationFilter,
    ],
  );

  useEffect(() => {
    void loadRules();
  }, [loadRules]);

  const activeCount = useMemo(
    () =>
      rules.filter(
        (rule) => rule.is_active,
      ).length,
    [rules],
  );

  const inactiveCount = useMemo(
    () =>
      rules.filter(
        (rule) => !rule.is_active,
      ).length,
    [rules],
  );

  const visiblePageNumbers =
    useMemo(() => {
      if (totalPages <= 5) {
        return Array.from(
          {
            length: totalPages,
          },
          (_, index) =>
            index + 1,
        );
      }

      const start = Math.max(
        1,
        Math.min(
          page - 2,
          totalPages - 4,
        ),
      );

      return Array.from(
        {
          length: 5,
        },
        (_, index) =>
          start + index,
      );
    }, [page, totalPages]);

  const openCreateDialog =
    () => {
      setEditingRule(null);
      setForm(
        createEmptyRuleForm(),
      );
      setFormError(null);
      setFormOpen(true);
    };

  const openEditDialog = (
    rule: PricingRule,
  ) => {
    setEditingRule(rule);
    setForm(
      buildRuleForm(rule),
    );
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) {
      return;
    }

    setFormOpen(false);
    setEditingRule(null);
    setFormError(null);
  };

  const updateFormField = <
    K extends keyof RuleForm,
  >(
    field: K,
    value: RuleForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateCondition = (
    index: number,
    field: keyof ConditionForm,
    value: string,
  ) => {
    setForm((current) => {
      const conditions = [
        ...current.conditions,
      ];

      const existing =
        conditions[index];

      if (!existing) {
        return current;
      }

      conditions[index] = {
        ...existing,
        [field]: value,
      };

      return {
        ...current,
        conditions,
      };
    });
  };

  const updateAction = (
    index: number,
    field: keyof ActionForm,
    value: string,
  ) => {
    setForm((current) => {
      const actions = [
        ...current.actions,
      ];

      const existing =
        actions[index];

      if (!existing) {
        return current;
      }

      actions[index] = {
        ...existing,
        [field]: value,
      };

      return {
        ...current,
        actions,
      };
    });
  };

  const addCondition = () => {
    setForm((current) => {
      const lastCondition =
        current.conditions[
          current.conditions.length - 1
        ];

      return {
        ...current,
        conditions: [
          ...current.conditions,
          {
            ...createEmptyCondition(),
            condition_group:
              lastCondition
                ?.condition_group ??
              "0",
          },
        ],
      };
    });
  };

  const removeCondition = (
    index: number,
  ) => {
    setForm((current) => {
      if (
        current.conditions.length <=
        1
      ) {
        return current;
      }

      return {
        ...current,
        conditions:
          current.conditions.filter(
            (_, itemIndex) =>
              itemIndex !== index,
          ),
      };
    });
  };

  const addAction = () => {
    setForm((current) => ({
      ...current,
      actions: [
        ...current.actions,
        {
          ...createEmptyAction(),
          execution_order:
            String(
              current.actions.length,
            ),
        },
      ],
    }));
  };

  const removeAction = (
    index: number,
  ) => {
    setForm((current) => {
      if (
        current.actions.length <=
        1
      ) {
        return current;
      }

      const remaining =
        current.actions.filter(
          (_, itemIndex) =>
            itemIndex !== index,
        );

      return {
        ...current,
        actions:
          remaining.map(
            (
              action,
              actionIndex,
            ) => ({
              ...action,
              execution_order:
                String(
                  actionIndex,
                ),
            }),
          ),
      };
    });
  };

  const validateForm =
    (): string | null => {
      if (!form.name.trim()) {
        return "Rule name is required.";
      }

      const priority = Number(
        form.priority,
      );

      if (
        !Number.isInteger(
          priority,
        ) ||
        priority < 0
      ) {
        return "Priority must be a non-negative whole number.";
      }

      if (
        form.conditions.length ===
        0
      ) {
        return "At least one condition is required.";
      }

      if (
        form.actions.length ===
        0
      ) {
        return "At least one action is required.";
      }

      for (
        let index = 0;
        index <
        form.conditions.length;
        index += 1
      ) {
        const condition =
          form.conditions[index];

        if (!condition) {
          continue;
        }

        if (
          !condition.value.trim()
        ) {
          return `Condition ${
            index + 1
          } needs a value.`;
        }

        const group = Number(
          condition.condition_group,
        );

        if (
          !Number.isInteger(
            group,
          ) ||
          group < 0
        ) {
          return `Condition ${
            index + 1
          } has an invalid group.`;
        }
      }

      for (
        let index = 0;
        index <
        form.actions.length;
        index += 1
      ) {
        const action =
          form.actions[index];

        if (!action) {
          continue;
        }

        const value = Number(
          action.value,
        );

        if (
          action.value.trim() ===
            "" ||
          !Number.isFinite(value) ||
          value < 0
        ) {
          return `Action ${
            index + 1
          } needs a valid non-negative value.`;
        }

        if (
          action.action_type ===
            "PERCENTAGE_DISCOUNT" &&
          value > 100
        ) {
          return "Percentage discount cannot exceed 100%.";
        }

        if (
          action.action_type ===
            "TAX" &&
          value > 100
        ) {
          return "Tax percentage cannot exceed 100%.";
        }

        const executionOrder =
          Number(
            action.execution_order,
          );

        if (
          !Number.isInteger(
            executionOrder,
          ) ||
          executionOrder < 0
        ) {
          return `Action ${
            index + 1
          } has an invalid execution order.`;
        }
      }

      if (
        form.max_discount.trim()
      ) {
        const maxDiscount =
          Number(
            form.max_discount,
          );

        if (
          !Number.isFinite(
            maxDiscount,
          ) ||
          maxDiscount < 0
        ) {
          return "Maximum discount must be a non-negative number.";
        }
      }

      if (
        form.start_date &&
        form.end_date
      ) {
        const start =
          new Date(
            form.start_date,
          ).getTime();

        const end =
          new Date(
            form.end_date,
          ).getTime();

        if (
          Number.isFinite(
            start,
          ) &&
          Number.isFinite(end) &&
          start >= end
        ) {
          return "Start date must be earlier than end date.";
        }
      }

      return null;
    };

  const handleSave =
    async () => {
      const validationError =
        validateForm();

      if (validationError) {
        setFormError(
          validationError,
        );
        return;
      }

      try {
        setIsSaving(true);
        setFormError(null);

        const conditions:
          RuleConditionRequest[] =
          form.conditions.map(
            (condition) => ({
              field:
                condition.field,
              operator:
                condition.operator,
              value:
                condition.value.trim(),
              condition_group:
                Number(
                  condition.condition_group,
                ),
            }),
          );

        const actions:
          RuleActionRequest[] =
          form.actions.map(
            (
              action,
              index,
            ) => ({
              action_type:
                action.action_type,
              value:
                Number(
                  action.value,
                ).toFixed(2),
              execution_order:
                Number.isInteger(
                  Number(
                    action.execution_order,
                  ),
                )
                  ? Number(
                      action.execution_order,
                    )
                  : index,
            }),
          );

        const commonData = {
          name: form.name.trim(),
          description:
            form.description.trim()
              ? form.description.trim()
              : null,
          priority: Number(
            form.priority,
          ),
          combination_type:
            form.combination_type,
          max_discount:
            form.max_discount.trim()
              ? Number(
                  form.max_discount,
                ).toFixed(2)
              : null,
          start_date:
            convertToApiDateTime(
              form.start_date,
            ),
          end_date:
            convertToApiDateTime(
              form.end_date,
            ),
          conditions,
          actions,
        };

        if (editingRule) {
          const payload:
            PricingRuleUpdateRequest =
            commonData;

          await updatePricingRule(
            editingRule.id,
            payload,
          );
        } else {
          const payload:
            PricingRuleCreateRequest =
            commonData;

          await createPricingRule(
            payload,
          );
        }

        setFormOpen(false);
        setEditingRule(null);
        setPage(1);

        await loadRules();
      } catch (saveError) {
        setFormError(
          getErrorMessage(
            saveError,
          ),
        );
      } finally {
        setIsSaving(false);
      }
    };

  const handleConfirmAction =
    async () => {
      const rule =
        confirmDialog.rule;

      if (!rule) {
        return;
      }

      try {
        setIsSaving(true);
        setError(null);

        if (
          confirmDialog.type ===
          "status"
        ) {
          await updatePricingRuleStatus(
            rule.id,
            !rule.is_active,
          );
        } else {
          await deletePricingRule(
            rule.id,
          );
        }

        setConfirmDialog({
          open: false,
          type: "status",
          rule: null,
        });

        if (
          confirmDialog.type ===
            "delete" &&
          page > 1 &&
          rules.length === 1
        ) {
          setPage(
            (currentPage) =>
              Math.max(
                1,
                currentPage - 1,
              ),
          );
        } else {
          await loadRules();
        }
      } catch (actionError) {
        setError(
          getErrorMessage(
            actionError,
          ),
        );
      } finally {
        setIsSaving(false);
      }
    };

  const handleSearchChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    setSearch(
      event.target.value,
    );
    setPage(1);
  };

  const handlePageChange = (
    nextPage: number,
  ) => {
    if (
      nextPage < 1 ||
      (totalPages > 0 &&
        nextPage > totalPages)
    ) {
      return;
    }

    setPage(nextPage);
  };

  return (
    <Box
      sx={{
        px: {
          xs: 2,
          sm: 3,
          md: 4,
        },
        py: {
          xs: 2.5,
          md: 4,
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          maxWidth: 1440,
          mx: "auto",
        }}
      >
        {/* Header */}
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
                color:
                  "primary.main",
                fontWeight: 800,
                letterSpacing:
                  "0.13em",
              }}
            >
              BUSINESS LOGIC
            </Typography>

            <Typography
              variant="h3"
              sx={{
                mt: 0.25,
                fontSize: {
                  xs: "1.85rem",
                  sm: "2.3rem",
                  md: "2.6rem",
                },
                lineHeight: 1.1,
                fontWeight: 850,
              }}
            >
              Pricing Rules
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.8,
                maxWidth: 680,
                lineHeight: 1.65,
              }}
            >
              Create smart pricing rules
              that automatically apply
              discounts, charges, and taxes
              based on your business logic.
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
                px: 2.2,
                borderRadius:
                  "12px",
                textTransform:
                  "none",
                fontWeight: 800,
                boxShadow:
                  "0 8px 20px rgba(141, 115, 100, 0.18)",
              }}
            >
              Add Pricing Rule
            </Button>
          )}
        </Box>

        {/* Statistics */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(3, 1fr)",
            },
            gap: 1.75,
          }}
        >
          <RuleStatCard
            title="Total Rules"
            value={total}
            icon={
              <RuleRoundedIcon />
            }
            background="#F1E8E2"
          />

          <RuleStatCard
            title="Active on page"
            value={activeCount}
            icon={
              <CheckCircleRoundedIcon />
            }
            background="#E8F0EB"
          />

          <RuleStatCard
            title="Inactive on page"
            value={inactiveCount}
            icon={
              <PauseRoundedIcon />
            }
            background="#EEEAF3"
          />
        </Box>

        {/* Engine information */}
        <Card
          sx={{
            background:
              "linear-gradient(135deg, #F4ECE7 0%, #F1EDF4 100%)",
            borderColor:
              "#E4DAD6",
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.25,
                md: 2.75,
              },
              "&:last-child": {
                pb: {
                  xs: 2.25,
                  md: 2.75,
                },
              },
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
                  width: 44,
                  height: 44,
                  borderRadius:
                    "12px",
                  display: "grid",
                  placeItems:
                    "center",
                  flexShrink: 0,
                  backgroundColor:
                    "rgba(255,255,255,0.62)",
                  color:
                    "primary.main",
                }}
              >
                <TuneRoundedIcon />
              </Box>

              <Box
                sx={{
                  flex: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  How pricing rules work
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.45,
                    lineHeight: 1.65,
                  }}
                >
                  Rules are evaluated by
                  priority. Conditions in the
                  same group use AND logic,
                  while different groups create
                  OR alternatives.
                </Typography>
              </Box>

              <Chip
                icon={
                  <InfoOutlinedIcon />
                }
                label="Priority controls order"
                size="small"
                sx={{
                  backgroundColor:
                    "rgba(255,255,255,0.68)",
                  fontWeight: 700,
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardContent
            sx={{
              p: {
                xs: 2,
                md: 2.5,
              },
              "&:last-child": {
                pb: {
                  xs: 2,
                  md: 2.5,
                },
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 2,
              }}
            >
              <FilterAltOutlinedIcon
                sx={{
                  color:
                    "primary.main",
                }}
              />

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                }}
              >
                Find pricing rules
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1.6fr 1fr 1fr",
                },
                gap: 1.5,
              }}
            >
              <TextField
                size="small"
                label="Search"
                value={search}
                onChange={
                  handleSearchChange
                }
                placeholder="Search by rule name or description"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <RuleRoundedIcon
                        sx={{
                          fontSize: 19,
                          color:
                            "text.secondary",
                        }}
                      />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl
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
                  onChange={(
                    event,
                  ) => {
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

              <FormControl
                size="small"
              >
                <InputLabel>
                  Combination
                </InputLabel>

                <Select
                  value={
                    combinationFilter
                  }
                  label="Combination"
                  onChange={(
                    event,
                  ) => {
                    setCombinationFilter(
                      event.target
                        .value as
                        | "all"
                        | RuleCombinationType,
                    );
                    setPage(1);
                  }}
                >
                  <MenuItem value="all">
                    All combinations
                  </MenuItem>

                  <MenuItem value="COMBINE">
                    Combine
                  </MenuItem>

                  <MenuItem value="OVERRIDE">
                    Override
                  </MenuItem>

                  <MenuItem value="STOP">
                    Stop
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
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
                  void loadRules()
                }
              >
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* Rules list */}
        <Card>
          <CardContent
            sx={{
              p: 0,
              "&:last-child": {
                pb: 0,
              },
            }}
          >
            <Box
              sx={{
                px: {
                  xs: 2,
                  md: 2.5,
                },
                py: 2.25,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "space-between",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Configured rules
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.35,
                  }}
                >
                  Your pricing rules are
                  evaluated according to their
                  priority.
                </Typography>
              </Box>

              <Chip
                label={`${total} total`}
                size="small"
                variant="outlined"
              />
            </Box>

            <Divider />

            {isLoading ? (
              <Box
                sx={{
                  minHeight: 260,
                  display: "grid",
                  placeItems:
                    "center",
                }}
              >
                <Stack
                  alignItems="center"
                  spacing={1.5}
                >
                  <CircularProgress
                    size={30}
                  />

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Loading pricing rules...
                  </Typography>
                </Stack>
              </Box>
            ) : rules.length === 0 ? (
              <EmptyRulesState
                isAdmin={isAdmin}
                onCreate={
                  openCreateDialog
                }
              />
            ) : (
              <Stack
                divider={
                  <Divider />
                }
              >
                {rules.map(
                  (rule) => (
                    <RuleRow
                      key={rule.id}
                      rule={rule}
                      isAdmin={
                        isAdmin
                      }
                      onEdit={
                        openEditDialog
                      }
                      onToggleStatus={(
                        selectedRule,
                      ) =>
                        setConfirmDialog({
                          open: true,
                          type: "status",
                          rule:
                            selectedRule,
                        })
                      }
                      onDelete={(
                        selectedRule,
                      ) =>
                        setConfirmDialog({
                          open: true,
                          type: "delete",
                          rule:
                            selectedRule,
                        })
                      }
                    />
                  ),
                )}
              </Stack>
            )}

            {!isLoading &&
              rules.length > 0 && (
                <>
                  <Divider />

                  <Box
                    sx={{
                      px: {
                        xs: 2,
                        md: 2.5,
                      },
                      py: 1.75,
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "space-between",
                      gap: 2,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Rows per page
                      </Typography>

                      <Select
                        size="small"
                        value={
                          pageSize
                        }
                        onChange={(
                          event,
                        ) => {
                          setPageSize(
                            Number(
                              event
                                .target
                                .value,
                            ),
                          );
                          setPage(1);
                        }}
                        sx={{
                          minWidth: 78,
                        }}
                      >
                        <MenuItem
                          value={5}
                        >
                          5
                        </MenuItem>

                        <MenuItem
                          value={10}
                        >
                          10
                        </MenuItem>

                        <MenuItem
                          value={25}
                        >
                          25
                        </MenuItem>

                        <MenuItem
                          value={50}
                        >
                          50
                        </MenuItem>
                      </Select>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                    >
                      <Button
                        size="small"
                        disabled={
                          page <= 1
                        }
                        onClick={() =>
                          handlePageChange(
                            page - 1,
                          )
                        }
                        sx={{
                          textTransform:
                            "none",
                        }}
                      >
                        Previous
                      </Button>

                      {visiblePageNumbers.map(
                        (
                          pageNumber,
                        ) => (
                          <Button
                            key={
                              pageNumber
                            }
                            size="small"
                            variant={
                              pageNumber ===
                              page
                                ? "contained"
                                : "text"
                            }
                            onClick={() =>
                              handlePageChange(
                                pageNumber,
                              )
                            }
                            sx={{
                              minWidth: 34,
                              textTransform:
                                "none",
                              borderRadius:
                                "9px",
                            }}
                          >
                            {
                              pageNumber
                            }
                          </Button>
                        ),
                      )}

                      <Button
                        size="small"
                        disabled={
                          totalPages ===
                            0 ||
                          page >=
                            totalPages
                        }
                        onClick={() =>
                          handlePageChange(
                            page + 1,
                          )
                        }
                        sx={{
                          textTransform:
                            "none",
                        }}
                      >
                        Next
                      </Button>
                    </Stack>
                  </Box>
                </>
              )}
          </CardContent>
        </Card>
      </Stack>

      {/* =========================
          CREATE / EDIT DIALOG
      ========================== */}

      <Dialog
        open={formOpen}
        onClose={closeForm}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius:
              "18px",
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            px: {
              xs: 2.5,
              md: 3.5,
            },
            py: 2.5,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius:
                  "12px",
                display: "grid",
                placeItems:
                  "center",
                backgroundColor:
                  "#F1E7E1",
                color:
                  "primary.main",
              }}
            >
              <RuleRoundedIcon />
            </Box>

            <Box
              sx={{
                flex: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 850,
                }}
              >
                {editingRule
                  ? "Edit Pricing Rule"
                  : "Create Pricing Rule"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                }}
              >
                Define the conditions and
                pricing actions for this rule.
              </Typography>
            </Box>

            <IconButton
              onClick={closeForm}
              disabled={isSaving}
            >
              <CloseRoundedIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent
          sx={{
            px: {
              xs: 2,
              md: 3.5,
            },
            py: 3,
            backgroundColor:
              "#FFFCFA",
          }}
        >
          {formError && (
            <Alert
              severity="error"
              sx={{
                mb: 2.5,
                borderRadius:
                  "12px",
              }}
            >
              {formError}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Basic information */}

            <BuilderSection
              number="01"
              title="Basic information"
              description="Give your rule a clear identity and decide how it interacts with other rules."
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    {
                      xs: "1fr",
                      md: "2fr 1fr",
                    },
                  gap: 2,
                }}
              >
                <TextField
                  label="Rule name"
                  value={
                    form.name
                  }
                  onChange={(
                    event,
                  ) =>
                    updateFormField(
                      "name",
                      event.target
                        .value,
                    )
                  }
                  required
                  fullWidth
                  placeholder="Example: Premium Customer Discount"
                />

                <TextField
                  label="Priority"
                  type="number"
                  value={
                    form.priority
                  }
                  onChange={(
                    event,
                  ) =>
                    updateFormField(
                      "priority",
                      event.target
                        .value,
                    )
                  }
                  inputProps={{
                    min: 0,
                    step: 1,
                  }}
                  helperText="Higher values run first."
                  fullWidth
                />

                <TextField
                  label="Description"
                  value={
                    form.description
                  }
                  onChange={(
                    event,
                  ) =>
                    updateFormField(
                      "description",
                      event.target
                        .value,
                    )
                  }
                  multiline
                  minRows={3}
                  fullWidth
                  placeholder="Describe why this pricing rule exists."
                  sx={{
                    gridColumn:
                      {
                        xs: "auto",
                        md: "1 / -1",
                      },
                  }}
                />

                <FormControl
                  fullWidth
                >
                  <InputLabel>
                    Combination type
                  </InputLabel>

                  <Select
                    value={
                      form.combination_type
                    }
                    label="Combination type"
                    onChange={(
                      event,
                    ) =>
                      updateFormField(
                        "combination_type",
                        event.target
                          .value as RuleCombinationType,
                      )
                    }
                  >
                    {COMBINATION_TYPES.map(
                      (
                        combination,
                      ) => (
                        <MenuItem
                          key={
                            combination.value
                          }
                          value={
                            combination.value
                          }
                        >
                          {
                            combination.label
                          }
                        </MenuItem>
                      ),
                    )}
                  </Select>

                  <FormHelperText>
                    {
                      COMBINATION_TYPES.find(
                        (
                          item,
                        ) =>
                          item.value ===
                          form.combination_type,
                      )?.description
                    }
                  </FormHelperText>
                </FormControl>

                <TextField
                  label="Maximum discount"
                  type="number"
                  value={
                    form.max_discount
                  }
                  onChange={(
                    event,
                  ) =>
                    updateFormField(
                      "max_discount",
                      event.target
                        .value,
                    )
                  }
                  inputProps={{
                    min: 0,
                    step: 0.01,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        ₹
                      </InputAdornment>
                    ),
                  }}
                  helperText="Optional maximum discount amount."
                  fullWidth
                />
              </Box>
            </BuilderSection>

            {/* Conditions */}

            <BuilderSection
              number="02"
              title="Conditions"
              description="Tell the engine when this rule should match."
            >
              <Stack spacing={1.5}>
                {form.conditions.map(
                  (
                    condition,
                    index,
                  ) => (
                    <ConditionBuilderRow
                      key={`${index}-${condition.field}`}
                      condition={
                        condition
                      }
                      index={index}
                      canRemove={
                        form.conditions
                          .length >
                        1
                      }
                      onChange={
                        updateCondition
                      }
                      onRemove={
                        removeCondition
                      }
                    />
                  ),
                )}

                <Button
                  variant="outlined"
                  startIcon={
                    <AddRoundedIcon />
                  }
                  onClick={
                    addCondition
                  }
                  sx={{
                    alignSelf:
                      "flex-start",
                    textTransform:
                      "none",
                    borderRadius:
                      "10px",
                    fontWeight: 750,
                  }}
                >
                  Add condition
                </Button>

                <Alert
                  severity="info"
                  icon={
                    <InfoOutlinedIcon />
                  }
                  sx={{
                    borderRadius:
                      "11px",
                  }}
                >
                  Same group = AND.
                  Different groups = OR.
                </Alert>
              </Stack>
            </BuilderSection>

            {/* Actions */}

            <BuilderSection
              number="03"
              title="Actions"
              description="Choose what pricing change should happen when the conditions match."
            >
              <Stack spacing={1.5}>
                {form.actions.map(
                  (
                    action,
                    index,
                  ) => (
                    <ActionBuilderRow
                      key={`${index}-${action.action_type}`}
                      action={action}
                      index={index}
                      canRemove={
                        form.actions
                          .length >
                        1
                      }
                      onChange={
                        updateAction
                      }
                      onRemove={
                        removeAction
                      }
                    />
                  ),
                )}

                <Button
                  variant="outlined"
                  startIcon={
                    <AddRoundedIcon />
                  }
                  onClick={addAction}
                  sx={{
                    alignSelf:
                      "flex-start",
                    textTransform:
                      "none",
                    borderRadius:
                      "10px",
                    fontWeight: 750,
                  }}
                >
                  Add action
                </Button>
              </Stack>
            </BuilderSection>

            {/* Schedule */}

            <BuilderSection
              number="04"
              title="Schedule"
              description="Optionally define when this rule starts and expires."
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns:
                    {
                      xs: "1fr",
                      sm: "1fr 1fr",
                    },
                  gap: 2,
                }}
              >
                <TextField
                  label="Start date"
                  type="datetime-local"
                  value={
                    form.start_date
                  }
                  onChange={(
                    event,
                  ) =>
                    updateFormField(
                      "start_date",
                      event.target
                        .value,
                    )
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Empty means immediately available."
                />

                <TextField
                  label="End date"
                  type="datetime-local"
                  value={
                    form.end_date
                  }
                  onChange={(
                    event,
                  ) =>
                    updateFormField(
                      "end_date",
                      event.target
                        .value,
                    )
                  }
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Empty means no expiry."
                />
              </Box>
            </BuilderSection>

            {/* Preview */}

            <RulePreview
              form={form}
            />
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            px: {
              xs: 2,
              md: 3.5,
            },
            py: 2,
            backgroundColor:
              "#FFFCFA",
          }}
        >
          <Button
            onClick={closeForm}
            disabled={isSaving}
            sx={{
              textTransform:
                "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() =>
              void handleSave()
            }
            disabled={isSaving}
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
            sx={{
              minWidth: 145,
              textTransform:
                "none",
              fontWeight: 800,
              borderRadius:
                "10px",
            }}
          >
            {isSaving
              ? "Saving..."
              : editingRule
                ? "Save Changes"
                : "Create Rule"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation */}

      <Dialog
        open={
          confirmDialog.open
        }
        onClose={() => {
          if (!isSaving) {
            setConfirmDialog({
              open: false,
              type: "status",
              rule: null,
            });
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
          {confirmDialog.type ===
          "delete"
            ? "Delete pricing rule?"
            : confirmDialog.rule
                ?.is_active
              ? "Deactivate pricing rule?"
              : "Activate pricing rule?"}
        </DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {confirmDialog.type ===
            "delete"
              ? `This will permanently delete "${confirmDialog.rule?.name ?? "this rule"}".`
              : confirmDialog.rule
                    ?.is_active
                ? `The rule "${confirmDialog.rule?.name ?? "this rule"}" will no longer be used by the pricing engine.`
                : `The rule "${confirmDialog.rule?.name ?? "this rule"}" will become available to the pricing engine.`}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setConfirmDialog({
                open: false,
                type: "status",
                rule: null,
              })
            }
            disabled={isSaving}
            sx={{
              textTransform:
                "none",
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color={
              confirmDialog.type ===
              "delete"
                ? "error"
                : "primary"
            }
            onClick={() =>
              void handleConfirmAction()
            }
            disabled={isSaving}
            sx={{
              textTransform:
                "none",
              fontWeight: 800,
            }}
          >
            {isSaving
              ? "Processing..."
              : confirmDialog.type ===
                  "delete"
                ? "Delete"
                : confirmDialog.rule
                      ?.is_active
                  ? "Deactivate"
                  : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

interface RuleStatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  background: string;
}

function RuleStatCard({
  title,
  value,
  icon,
  background,
}: RuleStatCardProps) {
  return (
    <Card>
      <CardContent
        sx={{
          minHeight: 108,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 2.25,
          "&:last-child": {
            pb: 2.25,
          },
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius:
              "13px",
            display: "grid",
            placeItems:
              "center",
            backgroundColor:
              background,
            color:
              "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 850,
              lineHeight: 1,
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: "block",
              mt: 0.65,
            }}
          >
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

interface RuleRowProps {
  rule: PricingRule;
  isAdmin: boolean;
  onEdit: (
    rule: PricingRule,
  ) => void;
  onToggleStatus: (
    rule: PricingRule,
  ) => void;
  onDelete: (
    rule: PricingRule,
  ) => void;
}

function RuleRow({
  rule,
  isAdmin,
  onEdit,
  onToggleStatus,
  onDelete,
}: RuleRowProps) {
  return (
    <Box
      sx={{
        px: {
          xs: 2,
          md: 2.5,
        },
        py: 2.25,
        transition:
          "background-color 150ms ease",
        "&:hover": {
          backgroundColor:
            "#FFFAF7",
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          lg: "row",
        }}
        spacing={2}
        alignItems={{
          xs: "stretch",
          lg: "center",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 850,
              }}
            >
              {rule.name}
            </Typography>

            <Chip
              label={
                rule.is_active
                  ? "Active"
                  : "Inactive"
              }
              size="small"
              sx={{
                height: 24,
                backgroundColor:
                  rule.is_active
                    ? "#E7F1EA"
                    : "#F1ECEA",
                color:
                  rule.is_active
                    ? "#557660"
                    : "#8B817C",
                fontWeight: 800,
              }}
            />

            <Chip
              label={`Priority ${rule.priority}`}
              size="small"
              variant="outlined"
              sx={{
                height: 24,
                fontWeight: 700,
              }}
            />

            <Chip
              label={formatCombination(
                rule.combination_type,
              )}
              size="small"
              sx={{
                height: 24,
                backgroundColor:
                  rule.combination_type ===
                  "OVERRIDE"
                    ? "#EEEAF3"
                    : rule.combination_type ===
                        "STOP"
                      ? "#F4E9E2"
                      : "#EAF0ED",
                color:
                  rule.combination_type ===
                  "OVERRIDE"
                    ? "#665A7B"
                    : rule.combination_type ===
                        "STOP"
                      ? "#795B4B"
                      : "#527060",
                fontWeight: 800,
              }}
            />
          </Stack>

          {rule.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.7,
                lineHeight: 1.55,
              }}
            >
              {rule.description}
            </Typography>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns:
                {
                  xs: "1fr",
                  md: "1fr 1fr",
                },
              gap: 1.25,
              mt: 1.5,
            }}
          >
            <RuleSummaryBox
              title="Conditions"
              icon={
                <FilterAltOutlinedIcon />
              }
            >
              <Stack spacing={0.45}>
                {rule.conditions
                  .slice(0, 3)
                  .map(
                    (
                      condition,
                    ) => (
                      <Typography
                        key={
                          condition.id
                        }
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          lineHeight: 1.45,
                        }}
                      >
                        <strong>
                          G
                          {
                            condition.condition_group
                          }
                        </strong>{" "}
                        ·{" "}
                        {formatField(
                          condition.field,
                        )}{" "}
                        ·{" "}
                        {formatOperator(
                          condition.operator,
                        )}{" "}
                        ·{" "}
                        {
                          condition.value
                        }
                      </Typography>
                    ),
                  )}

                {rule.conditions
                  .length > 3 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "primary.main",
                      fontWeight: 750,
                    }}
                  >
                    +
                    {rule.conditions
                      .length -
                      3}{" "}
                    more conditions
                  </Typography>
                )}
              </Stack>
            </RuleSummaryBox>

            <RuleSummaryBox
              title="Actions"
              icon={
                <CalculateRoundedIcon />
              }
            >
              <Stack spacing={0.45}>
                {rule.actions
                  .slice(0, 3)
                  .map(
                    (action) => (
                      <Typography
                        key={
                          action.id
                        }
                        variant="caption"
                        color="text.secondary"
                      >
                        #
                        {
                          action.execution_order
                        }{" "}
                        ·{" "}
                        {formatActionType(
                          action.action_type,
                        )}{" "}
                        ·{" "}
                        {
                          action.value
                        }
                        {action.action_type ===
                          "PERCENTAGE_DISCOUNT" ||
                        action.action_type ===
                          "TAX"
                          ? "%"
                          : "₹"}
                      </Typography>
                    ),
                  )}

                {rule.actions
                  .length > 3 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color:
                        "primary.main",
                      fontWeight: 750,
                    }}
                  >
                    +
                    {rule.actions
                      .length -
                      3}{" "}
                    more actions
                  </Typography>
                )}
              </Stack>
            </RuleSummaryBox>
          </Box>

          {(rule.start_date ||
            rule.end_date ||
            rule.max_discount) && (
            <Stack
              direction="row"
              spacing={1.5}
              flexWrap="wrap"
              useFlexGap
              sx={{
                mt: 1.25,
              }}
            >
              {rule.start_date && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                >
                  <ScheduleRoundedIcon
                    sx={{
                      fontSize: 15,
                      color:
                        "text.secondary",
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    From{" "}
                    {formatDate(
                      rule.start_date,
                    )}
                  </Typography>
                </Stack>
              )}

              {rule.end_date && (
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                >
                  <HistoryRoundedIcon
                    sx={{
                      fontSize: 15,
                      color:
                        "text.secondary",
                    }}
                  />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Until{" "}
                    {formatDate(
                      rule.end_date,
                    )}
                  </Typography>
                </Stack>
              )}

              {rule.max_discount && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  Max discount ₹
                  {
                    rule.max_discount
                  }
                </Typography>
              )}
            </Stack>
          )}
        </Box>

        {isAdmin && (
          <Stack
            direction="row"
            spacing={0.75}
            justifyContent={{
              xs: "flex-start",
              lg: "flex-end",
            }}
          >
            <Tooltip title="Edit rule">
              <IconButton
                onClick={() =>
                  onEdit(rule)
                }
                sx={{
                  width: 38,
                  height: 38,
                  border:
                    "1px solid #E8DED9",
                  backgroundColor:
                    "#FFFDFC",
                }}
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
                rule.is_active
                  ? "Deactivate rule"
                  : "Activate rule"
              }
            >
              <IconButton
                onClick={() =>
                  onToggleStatus(
                    rule,
                  )
                }
                sx={{
                  width: 38,
                  height: 38,
                  border:
                    "1px solid #E8DED9",
                  backgroundColor:
                    "#FFFDFC",
                }}
              >
                {rule.is_active ? (
                  <PauseRoundedIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                ) : (
                  <PlayArrowRoundedIcon
                    sx={{
                      fontSize: 19,
                    }}
                  />
                )}
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete rule">
              <IconButton
                onClick={() =>
                  onDelete(rule)
                }
                sx={{
                  width: 38,
                  height: 38,
                  border:
                    "1px solid #EADDDD",
                  backgroundColor:
                    "#FFF9F8",
                  color:
                    "error.main",
                }}
              >
                <DeleteOutlineRoundedIcon
                  sx={{
                    fontSize: 19,
                  }}
                />
              </IconButton>
            </Tooltip>
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

interface RuleSummaryBoxProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

function RuleSummaryBox({
  title,
  icon,
  children,
}: RuleSummaryBoxProps) {
  return (
    <Box
      sx={{
        p: 1.35,
        borderRadius:
          "11px",
        backgroundColor:
          "#FAF6F3",
        border:
          "1px solid #EEE4DE",
      }}
    >
      <Stack
        direction="row"
        spacing={0.6}
        alignItems="center"
        sx={{
          mb: 0.75,
        }}
      >
        <Box
          sx={{
            color:
              "primary.main",
            display: "flex",
          }}
        >
          {icon}
        </Box>

        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: "#665A54",
          }}
        >
          {title}
        </Typography>
      </Stack>

      {children}
    </Box>
  );
}

interface BuilderSectionProps {
  number: string;
  title: string;
  description: string;
  children: ReactNode;
}

function BuilderSection({
  number,
  title,
  description,
  children,
}: BuilderSectionProps) {
  return (
    <Box>
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="flex-start"
        sx={{
          mb: 1.75,
        }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius:
              "10px",
            display: "grid",
            placeItems:
              "center",
            flexShrink: 0,
            backgroundColor:
              "#F0E6DF",
            color:
              "#806A5D",
            fontSize:
              "0.72rem",
            fontWeight: 900,
          }}
        >
          {number}
        </Box>

        <Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 850,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
              lineHeight: 1.55,
            }}
          >
            {description}
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          pl: {
            xs: 0,
            sm: 5.25,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

interface ConditionBuilderRowProps {
  condition: ConditionForm;
  index: number;
  canRemove: boolean;
  onChange: (
    index: number,
    field: keyof ConditionForm,
    value: string,
  ) => void;
  onRemove: (
    index: number,
  ) => void;
}

function ConditionBuilderRow({
  condition,
  index,
  canRemove,
  onChange,
  onRemove,
}: ConditionBuilderRowProps) {
  return (
    <Box
      sx={{
        p: {
          xs: 1.5,
          md: 1.75,
        },
        borderRadius:
          "13px",
        border:
          "1px solid #E9DED8",
        backgroundColor:
          "#FFFFFF",
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1.25}
        alignItems={{
          xs: "stretch",
          md: "center",
        }}
      >
        <FormControl
          size="small"
          sx={{
            flex: 1,
          }}
        >
          <InputLabel>
            Field
          </InputLabel>

          <Select
            value={
              condition.field
            }
            label="Field"
            onChange={(
              event,
            ) =>
              onChange(
                index,
                "field",
                event.target.value,
              )
            }
          >
            {CONDITION_FIELDS.map(
              (field) => (
                <MenuItem
                  key={
                    field.value
                  }
                  value={
                    field.value
                  }
                >
                  {field.label}
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            flex: 1,
          }}
        >
          <InputLabel>
            Operator
          </InputLabel>

          <Select
            value={
              condition.operator
            }
            label="Operator"
            onChange={(
              event,
            ) =>
              onChange(
                index,
                "operator",
                event.target
                  .value as ConditionOperator,
              )
            }
          >
            {CONDITION_OPERATORS.map(
              (operator) => (
                <MenuItem
                  key={
                    operator.value
                  }
                  value={
                    operator.value
                  }
                >
                  {
                    operator.label
                  }
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label={
            condition.operator ===
                "IN" ||
            condition.operator ===
              "NOT_IN"
              ? "Value, comma separated"
              : "Value"
          }
          value={
            condition.value
          }
          onChange={(
            event,
          ) =>
            onChange(
              index,
              "value",
              event.target.value,
            )
          }
          sx={{
            flex: 1.15,
          }}
        />

        <TextField
          size="small"
          label="Group"
          type="number"
          value={
            condition.condition_group
          }
          onChange={(
            event,
          ) =>
            onChange(
              index,
              "condition_group",
              event.target.value,
            )
          }
          inputProps={{
            min: 0,
            step: 1,
          }}
          sx={{
            width: {
              xs: "100%",
              md: 90,
            },
          }}
        />

        <Tooltip
          title={
            canRemove
              ? "Remove condition"
              : "At least one condition is required"
          }
        >
          <span>
            <IconButton
              onClick={() =>
                onRemove(index)
              }
              disabled={
                !canRemove
              }
              sx={{
                color:
                  "error.main",
              }}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}

interface ActionBuilderRowProps {
  action: ActionForm;
  index: number;
  canRemove: boolean;
  onChange: (
    index: number,
    field: keyof ActionForm,
    value: string,
  ) => void;
  onRemove: (
    index: number,
  ) => void;
}

function ActionBuilderRow({
  action,
  index,
  canRemove,
  onChange,
  onRemove,
}: ActionBuilderRowProps) {
  const suffix =
    action.action_type ===
      "PERCENTAGE_DISCOUNT" ||
    action.action_type === "TAX"
      ? "%"
      : "₹";

  return (
    <Box
      sx={{
        p: {
          xs: 1.5,
          md: 1.75,
        },
        borderRadius:
          "13px",
        border:
          "1px solid #E9DED8",
        backgroundColor:
          "#FFFFFF",
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        spacing={1.25}
        alignItems={{
          xs: "stretch",
          md: "center",
        }}
      >
        <FormControl
          size="small"
          sx={{
            flex: 1.3,
          }}
        >
          <InputLabel>
            Action
          </InputLabel>

          <Select
            value={
              action.action_type
            }
            label="Action"
            onChange={(
              event,
            ) =>
              onChange(
                index,
                "action_type",
                event.target
                  .value as RuleActionType,
              )
            }
          >
            {ACTION_TYPES.map(
              (actionType) => (
                <MenuItem
                  key={
                    actionType.value
                  }
                  value={
                    actionType.value
                  }
                >
                  {
                    actionType.label
                  }
                </MenuItem>
              ),
            )}
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Value"
          type="number"
          value={
            action.value
          }
          onChange={(
            event,
          ) =>
            onChange(
              index,
              "value",
              event.target.value,
            )
          }
          inputProps={{
            min: 0,
            step: 0.01,
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                {suffix}
              </InputAdornment>
            ),
          }}
          sx={{
            flex: 0.75,
          }}
        />

        <TextField
          size="small"
          label="Execution order"
          type="number"
          value={
            action.execution_order
          }
          onChange={(
            event,
          ) =>
            onChange(
              index,
              "execution_order",
              event.target.value,
            )
          }
          inputProps={{
            min: 0,
            step: 1,
          }}
          sx={{
            flex: 0.75,
          }}
        />

        <Tooltip
          title={
            canRemove
              ? "Remove action"
              : "At least one action is required"
          }
        >
          <span>
            <IconButton
              onClick={() =>
                onRemove(index)
              }
              disabled={
                !canRemove
              }
              sx={{
                color:
                  "error.main",
              }}
            >
              <DeleteOutlineRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}

interface RulePreviewProps {
  form: RuleForm;
}

function RulePreview({
  form,
}: RulePreviewProps) {
  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 2.5,
        },
        borderRadius:
          "15px",
        background:
          "linear-gradient(135deg, #F1E9E4 0%, #EEEAF3 100%)",
        border:
          "1px solid #E3D9D5",
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          mb: 1.5,
        }}
      >
        <RuleRoundedIcon
          sx={{
            color:
              "primary.main",
          }}
        />

        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 850,
          }}
        >
          Rule preview
        </Typography>
      </Stack>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 800,
        }}
      >
        {form.name.trim() ||
          "Untitled pricing rule"}
      </Typography>

      <Stack
        spacing={1}
        sx={{
          mt: 1.5,
        }}
      >
        <PreviewLine
          label="Priority"
          value={
            form.priority ||
            "0"
          }
        />

        <PreviewLine
          label="Combination"
          value={formatCombination(
            form.combination_type,
          )}
        />

        <PreviewLine
          label="Conditions"
          value={`${form.conditions.length} condition${
            form.conditions.length ===
            1
              ? ""
              : "s"
          }`}
        />

        <PreviewLine
          label="Actions"
          value={`${form.actions.length} action${
            form.actions.length ===
            1
              ? ""
              : "s"
          }`}
        />

        {form.max_discount && (
          <PreviewLine
            label="Maximum discount"
            value={`₹${form.max_discount}`}
          />
        )}
      </Stack>
    </Box>
  );
}

interface PreviewLineProps {
  label: string;
  value: string;
}

function PreviewLine({
  label,
  value,
}: PreviewLineProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent="space-between"
      sx={{
        py: 0.55,
        borderBottom:
          "1px solid rgba(139, 111, 97, 0.1)",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="caption"
        sx={{
          fontWeight: 800,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

interface EmptyRulesStateProps {
  isAdmin: boolean;
  onCreate: () => void;
}

function EmptyRulesState({
  isAdmin,
  onCreate,
}: EmptyRulesStateProps) {
  return (
    <Box
      sx={{
        minHeight: 300,
        display: "grid",
        placeItems:
          "center",
        textAlign: "center",
        px: 3,
        py: 5,
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
            display: "grid",
            placeItems:
              "center",
            backgroundColor:
              "#F1E8E2",
            color:
              "primary.main",
          }}
        >
          <RuleRoundedIcon
            sx={{
              fontSize: 30,
            }}
          />
        </Box>

        <Typography
          variant="h6"
          sx={{
            mt: 2,
            fontWeight: 850,
          }}
        >
          No pricing rules yet
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
            maxWidth: 480,
            lineHeight: 1.65,
          }}
        >
          Create your first business
          rule to automatically apply
          discounts, charges, or taxes
          during price calculation.
        </Typography>

        {isAdmin && (
          <Button
            variant="contained"
            startIcon={
              <AddRoundedIcon />
            }
            onClick={onCreate}
            sx={{
              mt: 2.25,
              textTransform:
                "none",
              fontWeight: 800,
              borderRadius:
                "10px",
            }}
          >
            Create first rule
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default PricingRulesPage;