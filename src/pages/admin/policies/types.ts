import { type } from "os";
import { Datetime } from "types";

export type Condition = {
  id: number;
  condition: string | BooleanCondition[] | ValuesCondition[];
  creation_datetime: Datetime;
  deletion_datetime?: Datetime;
};

export type Policy = {
  policy_name: string;
  conditions: Condition[];
};

export type BooleanCondition = {
  compiled_value: boolean;
};

export type ValuesCondition = {
  attributes: string[];
  aggregation_operator?: string;
  comparison_operator: string;
  values: string[];
};

export type Case = BooleanCondition | ValuesCondition;

export interface PolicyProps {
  policy: Policy;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export interface INewPolicyResponse {
  id: number;
  creation_timestamp: Datetime;
  creation_trace_id: string;
}

export interface INewPolicyProps {
  onClose: () => void;
  onSuccess: (data: INewPolicyResponse) => void;
}

export interface ConditionProps {
  condition: Condition;
  index: number;
}

export interface CaseProps {
  case: Case;
  noTopGutter?: boolean;
  noBottomGutter?: boolean;
}

export enum comparisonOperatorEligibility {
  NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE__OR__ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES = "NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE__OR__ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES",
  NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES__OR__ARRAY_ATTRIBUTE_AND_SINGLE_VALUE = "NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES__OR__ARRAY_ATTRIBUTE_AND_SINGLE_VALUE",
  NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE = "NON_ARRAY_ATTRIBUTE_AND_SINGLE_VALUE",
  NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES = "NON_ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES",
  ARRAY_ATTRIBUTE_AND_SINGLE_VALUE = "ARRAY_ATTRIBUTE_AND_SINGLE_VALUE",
  ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES = "ARRAY_ATTRIBUTE_AND_MULTIPLE_VALUES",
}

export type Policies = {
  policy_name: string;
  context_attributes: string[];
};

export type Attribute = {
  attribute_name: string;
  attribute_type: string;
  array_type: boolean;
  lookup_key?: string;
  maximum_characters?: number;
  possible_values?: string[];
};

export type AggregationOperator = {
  operator_name: string;
  valid_attribute_types: string[];
  one_attribute_at_most: boolean;
};

export type ComparisonOperator = {
  operator_name: string;
  valid_attribute_types: string[];
  eligibility: keyof typeof comparisonOperatorEligibility;
};

export type NewCaseState = {
  attribute: Attribute | null;
  attributes: Attribute[] | null;
  aggregation_operator: AggregationOperator | null;
  comparison_operator: ComparisonOperator | null;
  values: string[] | null;
  multiAttributes: boolean;
};

export enum caseActions {
  SET_ATTRIBUTES = "SET_ATTRIBUTES",
  SET_AGGREGATION_OPERATOR = "SET_AGGREGATION_OPERATOR",
  SET_COMPARISON_OPERATOR = "SET_COMPARISON_OPERATOR",
  SET_VALUES = "SET_VALUES",
}

export type NewCaseActions =
  | {
      type: caseActions.SET_ATTRIBUTES;
      payload: Attribute | Attribute[] | null;
    }
  | {
      type: caseActions.SET_AGGREGATION_OPERATOR;
      payload: AggregationOperator | null;
    }
  | {
      type: caseActions.SET_COMPARISON_OPERATOR;
      payload: ComparisonOperator | null;
    }
  | {
      type: caseActions.SET_VALUES;
      payload: string | string[];
    };
