import { Datetime } from "types";

export type Translation = {
  sequence_number: number;
  group_id: string;
  language: string;
  label_key: string;
  label_value: string;
  creation_timestamp: Datetime;
};
