export enum DayOfWeek {
  SUNDAY = "SUNDAY",
  MONDAY = "MONDAY",
  TUESDAY = "TUESDAY",
  WEDNESDAY = "WEDNESDAY",
  THURSDAY = "THURSDAY",
  FRIDAY = "FRIDAY",
  SATURDAY = "SATURDAY",
}

export type Datetime = {
  gregorian_date: string;
  hijri_date: string;
  day_of_week: keyof typeof DayOfWeek;
  time: string;
};

export type Date = Omit<Datetime, "time">;

export type Age = {
  gregorian_years: number;
  gregorian_months: number;
  gregorian_days: number;
  hijri_years?: number;
  hijri_months?: number;
  hijri_days?: number;
};

export type ClientInfo = {
  version: string;
  index_file_hash: string;
  hash_algorithm: string;
};

export type DateConversion = {
  hijri_date: string;
  gregorian_date: string;
};

export * from "./terminal";
export * from "./user";
export * from "./lookups";
