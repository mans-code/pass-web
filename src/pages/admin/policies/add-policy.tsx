import React from "react";
import { useTranslation } from "react-i18next";
import { queryCache } from "react-query";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import IconButton from "@material-ui/core/IconButton";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import InputBase from "@material-ui/core/InputBase";
import Alert from "@material-ui/lab/Alert";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Autocomplete from "@material-ui/lab/Autocomplete";
import useAutocomplete from "@material-ui/lab/useAutocomplete";
import TextField from "@material-ui/core/TextField";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import AddIcon from "@material-ui/icons/Add";
import RemoveCircleIcon from "@material-ui/icons/RemoveCircle";
import { capitalize } from "../../../utils";
import {
  usePolicies,
  useAttributes,
  useAggregationOperators,
  useComparisonOperators,
} from "./hooks";
import {
  Policy,
  Attribute,
  AggregationOperator,
  ComparisonOperator,
  NewCaseState,
  NewCaseActions,
  caseActions,
  comparisonOperatorEligibility,
  INewPolicyProps,
  BooleanCondition,
  ValuesCondition,
} from "./types";
import { CircularProgress } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      overflow: "hidden",
      borderRadius: "8px",
      backgroundColor: "#fefefe",
    },
    policySelectLabel: {
      display: "block",
    },
    policySelectInput: {
      display: "block",
      width: "100%",
      border: "none",
      backgroundColor: "#fefefe",
    },
    policySelectListbox: {},
    policySelectListItem: {
      cursor: "pointer",
      transition: "all .25s ease-out",
      borderRadius: "5px",
      "&:hover": {
        backgroundColor: "#fafafa",
      },
    },
    policyItem: {
      padding: 0,
      "& span": {
        fontSize: "1rem",
        color: "#333",
      },
    },

    header: {
      position: "relative",
      "& .listbox": {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        maxHeight: "400px",
        borderRadius: "4px",
        backgroundColor: "#fafafa",
        boxShadow: "0 4px 8px rgba(0,0,0,0.12)",
        overflow: "auto",
        zIndex: 10,
      },
    },
    body: {
      backgroundColor: "#fcfcfc",
      borderRadius: "8px",
    },
    conditions: {
      position: "relative",
      "& .connection-line": {
        position: "absolute",
        top: 0,
        bottom: 0,
        borderRight: "2px solid #888",
      },
    },
    condition: {
      backgroundColor: "#f9f9f9",
      border: "1px solid #f1f1f1",
      borderRadius: "8px",
      padding: "8px 1rem 1rem",
      "& .title": {
        color: "#777",
        fontWeight: 600,
      },
    },
    formControl: {
      width: "100%",
    },
    select: {
      "& ul": {
        direction: "ltr",
      },
    },
    addIcon: {
      border: "1px solid #888",
      borderRadius: "50%",
    },
  })
);

const useConditionData = () => {
  const {
    data: attributes = [],
    error: attrError,
    isError: attrIsError,
    isLoading: attrIsLoading,
  } = useAttributes();
  const {
    data: aggregation_operators = [],
    error: aggrError,
    isError: aggrIsError,
    isLoading: aggrIsLoading,
  } = useAggregationOperators();
  const {
    data: comparison_operators = [],
    error: compError,
    isError: compIsError,
    isLoading: compIsLoading,
  } = useComparisonOperators();

  const error = attrError || aggrError || compError;
  const isError = attrIsError || aggrIsError || compIsError;
  const isLoading = attrIsLoading || aggrIsLoading || compIsLoading;

  return {
    attributes,
    aggregation_operators,
    comparison_operators,
    isLoading,
    isError,
    error,
  };
};

function caseReducer(
  state: NewCaseState,
  action: NewCaseActions
): NewCaseState {
  switch (action.type) {
    case caseActions.SET_ATTRIBUTES:
      if (!action.payload || (action.payload as Attribute[]).length == 0)
        return {
          ...state,
          attribute: null,
          attributes: null,
          aggregation_operator: null,
          comparison_operator: null,
          values: null,
          multiAttributes: false,
        };

      if (state.multiAttributes)
        return {
          ...state,
          attributes: action.payload as Attribute[] | null,
          aggregation_operator:
            (action.payload as Attribute[]).length == 0
              ? null
              : state.aggregation_operator,
        };
      return {
        ...state,
        attribute: action.payload as Attribute | null,
        aggregation_operator: null,
        comparison_operator: null,
        values: null,
      };
    case caseActions.SET_AGGREGATION_OPERATOR:
      const multiAttributes =
        !state.multiAttributes &&
        (action.payload ? !action.payload?.one_attribute_at_most : false);

      return {
        ...state,
        aggregation_operator: action.payload,
        attribute: !action.payload ? null : state.attribute,
        attributes: !action.payload
          ? null
          : multiAttributes && state.attribute
          ? [state.attribute]
          : state.attributes,
        multiAttributes,
      };
    case caseActions.SET_COMPARISON_OPERATOR:
      return {
        ...state,
        comparison_operator: action.payload,
        values: null,
      };
    case caseActions.SET_VALUES:
      return {
        ...state,
        values: action.payload as string[],
      };
    default:
      return state;
  }
}

const caseInitialState: NewCaseState = {
  attribute: null,
  attributes: null,
  aggregation_operator: null,
  comparison_operator: null,
  values: null,
  multiAttributes: false,
};

const isAttributeDisabled = (
  attribute: Attribute,
  allowedTypes: string[] | undefined
) => {
  if (!allowedTypes) return false;
  console.log(attribute.attribute_type);
  console.log(allowedTypes);

  if (allowedTypes.includes(attribute.attribute_type)) return false;

  return true;
};

const filterOperatorsOptions = (
  attribute: Attribute | null,
  operator: AggregationOperator | ComparisonOperator
) => {
  if (!attribute) return false;

  if (operator.valid_attribute_types.includes(attribute.attribute_type))
    return true;

  return false;
};

const validateOperatorEligibility = (
  arrayAttribute: boolean | undefined,
  operator: ComparisonOperator
) => {
  if (arrayAttribute === undefined) return false;
  switch (operator.eligibility) {
    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE__OR__ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES:
    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES__OR__ARRAY_ATTRIBUTE_AND_SINGLE_VALUE:
      return true;

    case comparisonOperatorEligibility.ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES:
    case comparisonOperatorEligibility.ARRAY_ATTRIBUTE_AND_SINGLE_VALUE:
      return arrayAttribute;
    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES:
    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE:
      return !arrayAttribute;
  }
};

const isMultipleValues = (
  arrayAttribute: boolean | undefined,
  operator: ComparisonOperator | null
) => {
  if (arrayAttribute === undefined || operator == null) return false;
  switch (operator.eligibility) {
    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE__OR__ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES:
    case comparisonOperatorEligibility.ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES:
      return arrayAttribute;

    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES__OR__ARRAY_ATTRIBUTE_AND_SINGLE_VALUE:
    case comparisonOperatorEligibility.ARRAY_ATTRIBUTE_AND_SINGLE_VALUE:
    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES:
      return !arrayAttribute;
    case comparisonOperatorEligibility.NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE:
      return false;
  }
};

const constructEnumKey = (key: string) =>
  key
    .split("_")
    .map((a) => capitalize(a))
    .join("");

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function ConditionValues({
  disabled,
  attribute,
  operator,
  multiValues,
  onChange: setConditionValues,
}: {
  disabled: boolean;
  attribute: Attribute | null;
  operator: string | undefined;
  multiValues: boolean | undefined;
  onChange: (values: string[]) => void;
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [textValue, setTextValue] = React.useState("");
  const [booleanValue, setBooleanValue] = React.useState("");
  const [datetimeValue, setDatetimeValue] = React.useState("");
  const [lookupValue, setLookupValue] = React.useState<string | string[]>("");
  const [enumValue, setEnumValue] = React.useState<string | string[]>("");
  const [lookupData, setLookupData] = React.useState([]);

  React.useEffect(() => {
    // Reset values when comparison operator change
    setTextValue("");
    setBooleanValue("");
    setDatetimeValue("");
    setLookupValue("");
    setEnumValue("");
  }, [operator]);

  React.useEffect(() => {
    if (attribute?.attribute_type === "lookup") {
      fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/lookups/values/v1/?key=${attribute?.lookup_key}`
      )
        .then((res) => {
          if (res.ok) return res.json();
          else throw new Error("lookup error");
        })
        .then((data) => setLookupData(data))
        .catch((e) => console.log(e));
    }
  }, [attribute?.attribute_type, attribute?.lookup_key]);

  const onTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextValue(event.target.value);
    setConditionValues(
      event.target.value
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean)
    );
  };

  const handleBooleanChange = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setBooleanValue(event.target.value as string);
    setConditionValues([event.target.value as string]);
  };

  const handleDatetimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDatetimeValue(event.target.value);
    setConditionValues([event.target.value as string]);
  };

  const handleLookupChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string | string[];
    setLookupValue(value);

    if (typeof value === "string") setConditionValues([value]);
    else setConditionValues(value);
  };

  const handleEnumChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string | string[];
    setEnumValue(value);

    if (typeof value === "string") setConditionValues([value]);
    else setConditionValues(value);
  };

  // types (date, time, datetime) return datepicker input (single value always)
  if (
    ["datetime", "date", "time"].includes(attribute?.attribute_type as string)
  ) {
    return (
      <TextField
        disabled={disabled}
        fullWidth
        label={t("Add Values")}
        variant="outlined"
        value={datetimeValue}
        onChange={handleDatetimeChange}
        type={
          attribute?.attribute_type === "datetime"
            ? "datetime-local"
            : attribute?.attribute_type
        }
      />
    );
  }

  // types (lookup) return lookup box input
  if (attribute?.attribute_type === "lookup") {
    return (
      <FormControl fullWidth variant="outlined" disabled={disabled}>
        <InputLabel id="lookup-select">{t("Add Values")}</InputLabel>
        <Select
          fullWidth
          MenuProps={{
            classes: {
              paper: classes.select,
            },
          }}
          multiple={multiValues}
          labelId="lookup-select"
          value={
            multiValues
              ? typeof lookupValue === "string"
                ? lookupValue
                  ? [lookupValue]
                  : []
                : lookupValue
              : typeof lookupValue === "object"
              ? lookupValue.length
                ? lookupValue[0]
                : ""
              : lookupValue
          }
          onChange={handleLookupChange}
          label={t("Add Values")}
        >
          {lookupData.map((item: any) => (
            <MenuItem key={item.code} value={item.code}>
              {`${item.code} - ${item.arabic_label}`}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // type (enum) return select input
  if (attribute?.attribute_type === "enum") {
    return (
      <FormControl fullWidth variant="outlined" disabled={disabled}>
        <InputLabel id="enum-select">{t("Add Values")}</InputLabel>
        <Select
          fullWidth
          MenuProps={{
            classes: {
              paper: classes.select,
            },
          }}
          multiple={multiValues}
          labelId="enum-select"
          value={
            multiValues
              ? typeof enumValue === "string"
                ? enumValue
                  ? [enumValue]
                  : []
                : enumValue
              : typeof enumValue === "object"
              ? enumValue.length
                ? enumValue[0]
                : ""
              : enumValue
          }
          onChange={handleEnumChange}
          label={t("Add Values")}
        >
          {attribute.possible_values?.map((value) => (
            <MenuItem key={value} value={value}>
              {t(
                `enums:${constructEnumKey(attribute.attribute_name)}.${value}`
              )}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    );
  }

  // type (boolean) return toggle input
  if (attribute?.attribute_type === "boolean") {
    return (
      <FormControl fullWidth variant="outlined" disabled={disabled}>
        <InputLabel id="boolean-select">{t("Add Values")}</InputLabel>
        <Select
          MenuProps={{
            classes: {
              paper: classes.select,
            },
          }}
          fullWidth
          labelId="boolean-select"
          value={booleanValue}
          onChange={handleBooleanChange}
          label={t("Add Values")}
        >
          <MenuItem value={"ture"}>{t("True")}</MenuItem>
          <MenuItem value={"false"}>{t("False")}</MenuItem>
        </Select>
      </FormControl>
    );
  }

  // types (text, number) return textInput
  return (
    <TextField
      fullWidth
      disabled={disabled}
      label={t("Add Values")}
      variant="outlined"
      multiline={multiValues}
      rowsMax={4}
      type={attribute?.attribute_type}
      value={textValue}
      onChange={onTextFieldChange}
    />
  );
}

function ConditionForm({
  disabled,
  allowedAttributes,
  onSelect,
  onDelete,
  index,
}: {
  disabled: boolean;
  allowedAttributes: string[];
  onSelect: (value: any) => void;
  onDelete: (value: any) => void;
  index: number;
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    attributes,
    aggregation_operators,
    comparison_operators,
    isLoading,
    isError,
    error,
  } = useConditionData();
  const [state, dispatch] = React.useReducer(caseReducer, caseInitialState);

  const handleAttributeChange = (value: Attribute | Attribute[] | null) => {
    dispatch({
      type: caseActions.SET_ATTRIBUTES,
      payload: value,
    });
  };

  const handleAggregationOperator = (value: AggregationOperator | null) =>
    dispatch({
      type: caseActions.SET_AGGREGATION_OPERATOR,
      payload: value,
    });

  const handleComparisonOperator = (value: ComparisonOperator | null) =>
    dispatch({
      type: caseActions.SET_COMPARISON_OPERATOR,
      payload: value,
    });

  const handleValues = (values: string[]) => {
    dispatch({
      type: caseActions.SET_VALUES,
      payload: values,
    });

    onSelect({
      attributes: state.multiAttributes
        ? state.attributes?.map((a) => a.attribute_name)
        : [state.attribute?.attribute_name],
      aggregation_operator: state.aggregation_operator?.operator_name,
      comparison_operator: state.comparison_operator?.operator_name,
      values: values,
    });
  };

  const attributesOptions = attributes.filter((item) =>
    allowedAttributes.includes(item.attribute_name)
  );

  const aggregationOperatorsOptions = React.useMemo(
    () =>
      aggregation_operators.filter((operator) =>
        filterOperatorsOptions(state.attribute, operator)
      ),
    [state.attribute]
  );

  const ComparisonOperatorsOptions = React.useMemo(
    () =>
      comparison_operators
        .filter((operator) => filterOperatorsOptions(state.attribute, operator))
        .filter((operator) =>
          validateOperatorEligibility(state.attribute?.array_type, operator)
        ),
    [state.attribute]
  );

  const multiValues = React.useMemo(
    () =>
      isMultipleValues(state.attribute?.array_type, state.comparison_operator),
    [state.comparison_operator]
  );

  return (
    <Box my={2}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4} lg={3}>
          {state.multiAttributes ? (
            <Box>
              <Autocomplete
                classes={{ paper: classes.select }}
                multiple
                disabled={disabled}
                fullWidth
                value={(state.attributes as Attribute[]) || []}
                onChange={(event, newValues) =>
                  handleAttributeChange(newValues)
                }
                options={attributesOptions}
                getOptionLabel={(option) =>
                  t(`enums:Attribute.${option.attribute_name}`)
                }
                getOptionDisabled={(option) =>
                  isAttributeDisabled(
                    option,
                    state.aggregation_operator?.valid_attribute_types
                  )
                }
                renderOption={(option, { selected }) => (
                  <React.Fragment>
                    <Checkbox
                      icon={icon}
                      checkedIcon={checkedIcon}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {t(`enums:Attribute.${option.attribute_name}`)}
                  </React.Fragment>
                )}
                // getOptionDisabled={(option) => false}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    placeholder={t("Select Attribute")}
                  />
                )}
              />
              {state.multiAttributes ? (
                <Typography variant="caption">
                  {t(
                    "You have to select multiple attributes for the aggregation to work"
                  )}
                </Typography>
              ) : null}
            </Box>
          ) : (
            <Autocomplete
              classes={{ paper: classes.select }}
              disabled={disabled}
              fullWidth
              value={state.attribute as Attribute}
              onChange={(event, newValues) => handleAttributeChange(newValues)}
              options={attributesOptions}
              getOptionLabel={(option) =>
                t(`enums:Attribute.${option.attribute_name}`)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder={t("Select Attribute")}
                />
              )}
            />
          )}
        </Grid>
        <Grid item xs={12} md={4} lg={2}>
          <Autocomplete
            classes={{ paper: classes.select }}
            disabled={!state.attribute || !aggregationOperatorsOptions.length}
            fullWidth
            value={state.aggregation_operator as AggregationOperator}
            onChange={(event, newValue) => handleAggregationOperator(newValue)}
            options={aggregationOperatorsOptions}
            getOptionLabel={(option) =>
              t(`enums:AggregationOperator.${option.operator_name}`)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={t("Select Aggregation Operator")}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={4} lg={2}>
          <Autocomplete
            classes={{ paper: classes.select }}
            disabled={!state.attribute}
            fullWidth
            value={state.comparison_operator as ComparisonOperator}
            onChange={(event, newValue) => handleComparisonOperator(newValue)}
            options={ComparisonOperatorsOptions}
            getOptionLabel={(option) =>
              t(`enums:ComparisonOperator.${option.operator_name}`)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder={t("Select Comparison Operator")}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={8} lg={4}>
          <ConditionValues
            disabled={!state.comparison_operator}
            attribute={state.attribute}
            operator={state.comparison_operator?.operator_name}
            multiValues={multiValues}
            onChange={handleValues}
          />
        </Grid>
        <Grid item xs={4} md={4} lg={1}>
          {index > 0 ? (
            <IconButton color="secondary" onClick={onDelete}>
              <RemoveCircleIcon />
            </IconButton>
          ) : null}
        </Grid>
      </Grid>
    </Box>
  );
}

function PolicySelect({
  value,
  onSelect,
}: {
  value: any;
  onSelect: (value: Policy) => void;
}) {
  const classes = useStyles();

  const { t } = useTranslation();
  const { data = [], error, isError, isLoading } = usePolicies();
  const [open, setOpen] = React.useState(false);

  const onChange = (event: React.ChangeEvent<{}>, value: any) => {
    setOpen((prev) => !prev);
    value && onSelect(value);
  };

  const {
    getRootProps,
    getInputLabelProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    focused,
  } = useAutocomplete({
    id: "policy-select",
    options: data as Policy[],
    getOptionLabel: (option: Policy) => t(`policies:${option.policy_name}`),
    open,
    value,
    onChange,
  });

  React.useEffect(() => (focused ? setOpen(true) : setOpen(false)), [focused]);

  return (
    <Box width="100%" py={1} px={2}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        {...getRootProps()}
      >
        <Box flexGrow={1}>
          <Typography
            variant="caption"
            className={classes.policySelectLabel}
            {...getInputLabelProps()}
          >
            {t("Policy Type")}
          </Typography>
          <input className={classes.policySelectInput} {...getInputProps()} />
        </Box>
        <Box display="flex">
          {isLoading ? <CircularProgress size="16px" color="primary" /> : null}
          <IconButton onClick={() => setOpen((prev) => !prev)}>
            <ExpandMoreIcon
              fontSize="small"
              style={{
                transform: open ? "rotate(180deg)" : "rotate(0)",
              }}
            />
          </IconButton>
        </Box>
      </Box>
      {groupedOptions.length > 0 ? (
        <List
          dense
          className={classes.policySelectListbox}
          {...getListboxProps()}
        >
          {groupedOptions.map((option, index) => (
            <ListItem
              key={option.policy_name}
              className={classes.policySelectListItem}
            >
              <ListItemText
                className={classes.policyItem}
                primary={t(`policies:${option.policy_name}`)}
                secondary={option.policy_name}
                {...getOptionProps({ option, index })}
              />
            </ListItem>
          ))}
        </List>
      ) : null}
    </Box>
  );
}

interface INewPolicy {
  policy: Policy | null;
  conditions: BooleanCondition | ValuesCondition[] | null;
}

const INITIAL_STATE = {
  policy: null,
  conditions: null,
};

export default function AddPolicy({ onClose, onSuccess }: INewPolicyProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [state, setState] = React.useState<INewPolicy>(INITIAL_STATE);

  const onPolicyChange = (value: Policy) => {
    setState((prev) => ({
      ...state,
      policy: value,
    }));

    // setState((prev) => ({
    //   ...prev,
    //   policy: selectedPolicy,
    // }));
    // setPolicyValidated([false, null]);
  };

  // const onConditionChange = (index: number) => (condition: any) => {
  //   setState((prev) => ({
  //     ...prev,
  //     conditions: prev.conditions.map((item: any, x: number) => {
  //       if (x === index) return condition;
  //       return item;
  //     }),
  //   }));
  //   setPolicyValidated([false, null]);
  // };

  // const handleAddCondition = () => {
  //   setState((prev) => ({
  //     ...prev,
  //     conditions: [
  //       ...prev.conditions,
  //       {
  //         attribute: [],
  //         aggregation_operator: null,
  //         comparison_operator: null,
  //         values: [],
  //       },
  //     ],
  //   }));
  // };

  // const handleDeleteCondition = (index: number) => {
  //   setState((prev) => ({
  //     ...prev,
  //     conditions: prev.conditions.filter((item: any, x: number) => x !== index),
  //   }));
  // };

  // const validateCondition = () => {
  //   const obj = JSON.stringify(state.conditions);
  //   fetch(
  //     `${
  //       window.location.hostname === "localhost"
  //         ? process.env.REACT_APP_API_URL
  //         : ""
  //     }/pass/api/admin/policy/condition/validation/v1`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${sessionStorage.token}`,
  //         "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP ?? "",
  //       },
  //       body: JSON.stringify({ condition: obj }),
  //     }
  //   ).then((res) => {
  //     if (res.status === 204) setPolicyValidated([true, ""]);
  //     else
  //       res.json().then((err) => {
  //         console.log(err);

  //         setPolicyValidated([false, err]);
  //       });
  //   });
  // };

  // const saveCondition = async () => {
  //   const obj = JSON.stringify(state.conditions);
  //   try {
  //     const res = await fetch(
  //       `${
  //         window.location.hostname === "localhost"
  //           ? process.env.REACT_APP_API_URL
  //           : ""
  //       }/pass/api/admin/policy/condition/v1`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //           Authorization: `Bearer ${sessionStorage.token}`,
  //           "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP ?? "",
  //         },
  //         body: JSON.stringify({
  //           policy_name: state.policy.policy_name,
  //           condition: obj,
  //         }),
  //       }
  //     );

  //     const resBody = await res.json();

  //     if (res.ok) {
  //       onSuccess(resBody);
  //       queryCache.invalidateQueries("active_policies");
  //     } else {
  //       setSaveResult([false, resBody]);
  //     }
  //   } catch (e) {
  //     console.log(e);
  //   }
  // };

  return (
    <Box display="flex" flexDirection="column" my={3}>
      <Paper className={classes.root} variant="outlined">
        <PolicySelect value={state.policy} onSelect={onPolicyChange} />
        {/* <Box py={4} px={3} className={classes.body}>
          <Box className={classes.condition}>
            <Typography className="title">{t("Condition Details")}</Typography>
            <Box className={classes.conditions}>
              {state.conditions.map((c, index: number) => (
                <ConditionForm
                  key={index}
                  disabled={state.policy.policy_name === null}
                  allowedAttributes={state.policy.context_attributes}
                  onSelect={onConditionChange(index)}
                  onDelete={() => handleDeleteCondition(index)}
                  index={index}
                />
              ))}
              <Box my={2}>
                <Button
                  onClick={handleAddCondition}
                  color="primary"
                  startIcon={<AddIcon className={classes.addIcon} />}
                >
                  {t("Add Condition")}
                </Button>
              </Box>
            </Box>
          </Box>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              {!policyValidated && validationError ? (
                <Alert severity="error">{`${t(
                  `errors:${validationError.reason}`
                )} - ${validationError.error_code ?? ""}`}</Alert>
              ) : null}
              {!saveSuccess && saveResult ? (
                <Alert severity="error">{`${t(
                  `errors:${saveResult.reason}`
                )} - ${saveResult.error_code ?? ""}`}</Alert>
              ) : null}
            </Box>
            <Box my={2} alignSelf="flex-end">
              <Button
                onClick={validateCondition}
                startIcon={
                  policyValidated ? (
                    <ThumbUpIcon />
                  ) : validationError ? (
                    <ThumbDownIcon />
                  ) : null
                }
                color={
                  policyValidated
                    ? "primary"
                    : validationError
                    ? "secondary"
                    : "default"
                }
              >
                {policyValidated
                  ? t("Validation Succeeded")
                  : validationError
                  ? t("Validation Failed")
                  : t("Validate Condition")}
              </Button>
              <Button disabled={!policyValidated} onClick={saveCondition}>
                {t("Save")}
              </Button>
              <Button onClick={onClose}>{t("Cancel")}</Button>
            </Box>
          </Box>
        </Box> */}
      </Paper>
    </Box>
  );
}
