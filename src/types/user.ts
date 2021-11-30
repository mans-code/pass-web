import { Age, Datetime } from "./";

export enum Policies {
  CAN_OVERRIDE_CROSSING_DATETIME = "CAN_OVERRIDE_CROSSING_DATETIME",
  CAN_OVERRIDE_CROSSING_TERMINAL = "CAN_OVERRIDE_CROSSING_TERMINAL",
  SHOW_MENU_MOBILE_QR_CODE = "SHOW_MENU_MOBILE_QR_CODE",
  SHOW_MENU_DEPARTURE_FOR_NATIONAL_ID_CARD_HOLDER = "SHOW_MENU_DEPARTURE_FOR_NATIONAL_ID_CARD_HOLDER",
  SHOW_MENU_ARRIVAL_FOR_NATIONAL_ID_CARD_HOLDER = "SHOW_MENU_ARRIVAL_FOR_NATIONAL_ID_CARD_HOLDER",
  SHOW_MENU_DEPARTURE_FOR_SAUDI_PASSPORT_HOLDER = "SHOW_MENU_DEPARTURE_FOR_SAUDI_PASSPORT_HOLDER",
  SHOW_MENU_ARRIVAL_FOR_SAUDI_PASSPORT_HOLDER = "SHOW_MENU_ARRIVAL_FOR_SAUDI_PASSPORT_HOLDER",
  SHOW_MENU_ADMIN_POLICY_EDITOR = "SHOW_MENU_ADMIN_POLICY_EDITOR",
}

export type AccountInfo = {
  roles: string[];
  disabled_account?: boolean;
  locked_out_account?: boolean;
  account_lockout_timestamp?: Datetime;
  account_never_expire?: boolean;
  account_expiration_timestamp?: Datetime;
  expired_account?: boolean;
  last_incorrect_password_entry_timestamp?: Datetime;
  incorrect_password_entry_count?: number;
  first_name?: string;
  last_name?: string;
  last_login_timestamp?: Datetime;
  successful_login_count?: number;
  last_password_set_timestamp?: Datetime;
  password_must_change_at_next_login?: boolean;
  password_never_expire?: boolean;
  expired_password?: boolean;
  username?: string;
  account_creation_timestamp?: Datetime;
  account_update_timestamp?: Datetime;
  allowed_location_ids?: string[];
  employee_id?: string;
  email?: string;
  telephone_number?: string;
  mobile_number?: string;
};

export type PersonInfo = {
  sequence_number: number;
  person_id: string;
  dependant_sequence_number: number;
  arabic_first_name?: string;
  arabic_father_name?: string;
  arabic_grandfather_name?: string;
  arabic_family_name?: string;
  arabic_tribe_name?: string;
  arabic_sub_tribe_name?: string;
  english_first_name?: string;
  english_father_name?: string;
  english_grandfather_name?: string;
  english_family_name?: string;
  english_tribe_name?: string;
  english_sub_tribe_name?: string;
  gender: "MALE" | "FEMALE";
  religion_code?: number;
  religion_arabic_title?: string;
  religion_english_title?: string;
  marital_status_code?: number;
  marital_status_arabic_title?: string;
  marital_status_english_title?: string;
  birth_date?: Datetime;
  age?: Age;
  dependant: boolean;
  father_id?: string;
  father_info?: PersonInfo;
  mother_id?: string;
  mother_info?: PersonInfo;
  guardian_id?: string;
  guardian_info?: PersonInfo;
  guardian_relationship_code?: number;
  guardian_relationship_arabic_title?: string;
  alive: boolean;
  suspended: boolean;
  out_of_kingdom: boolean;
  arabic_composite_name: string;
  english_composite_name: string;
};

export type User = {
  account_info: AccountInfo;
  operator_info: PersonInfo;
  applied_policies: (keyof typeof Policies)[];
  access_token_lifetime_minutes: number;
  session_lifetime_minutes: number;
  access_token: string;
  face_photo_base64?: string;
};
