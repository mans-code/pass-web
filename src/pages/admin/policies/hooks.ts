import { useGet } from "../../../hooks/useApi";
import {
  Policy,
  Attribute,
  AggregationOperator,
  ComparisonOperator,
  Condition,
} from "./types";

// TODO: move these api hooks to their components (easier and cleaner)

export const usePolicies = () =>
  useGet<Policy[]>({
    key: "policies",
    url: "/pass/api/lookups/policies/v1",
  });

export const useAttributes = () =>
  useGet<Attribute[]>({
    key: "attributes",
    url: "/pass/api/lookups/policy/attributes/v1",
  });

export const useAggregationOperators = () =>
  useGet<AggregationOperator[]>({
    key: "aggregation_operators",
    url: "/pass/api/lookups/policy/aggregation-operators/v1",
  });

export const useComparisonOperators = () =>
  useGet<ComparisonOperator[]>({
    key: "comparison_operators",
    url: "/pass/api/lookups/policy/comparison-operators/v1",
  });

export const useActivePolicies = () =>
  useGet<Condition[]>({
    key: "active_policies",
    url: "/pass/api/admin/policy/active-conditions/v1",
  });

export const useDeletedPolicies = () =>
  useGet<Condition[]>({
    key: "deleted_policies",
    url: "/pass/api/admin/policy/deleted-conditions/v1",
  });
