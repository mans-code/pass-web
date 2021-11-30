export type LookupKey =
  | "pass_terminals"
  | "crossing_terminals"
  | "countries"
  | "nationalities"
  | "non_saudi_nationalities"
  | "gcc_nationalities"
  | "non_gcc_nationalities"
  | "religions"
  | "airlines"
  | "ship_companies"
  | "non_saudi_passport_types"
  | "visa_types"
  | "visa_issue_places"
  | "visitor_special_identities";

export type LookupItem = {
  code: string;
  arabic_label: string;
  english_label: string;
};

export type Props = {
  lookupKey: LookupKey;
  label: string;
  onChange: (event: any, newValue: any, reason: string) => void;
  disabled?: boolean;
  multiple?: boolean;
  size?: "medium" | "small";
  value: string | number;
};
