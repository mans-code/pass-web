export enum TerminalType {
  AIR = "AIR",
  LAND = "LAND",
  SEA = "SEA",
  OTHER = "OTHER",
}

export type Terminal = {
  applied_policies: string[];
  terminal_info: {
    terminal_id: number;
    terminal_type: keyof typeof TerminalType;
    crossing_terminal: boolean;
    terminal_name?: string;
    terminal_arabic_name?: string;
    terminal_english_name?: string;
    city_arabic_name?: string;
    city_english_name?: string;
    province?: string;
    terminal_country_code?: number;
    terminal_country_arabic_name?: string;
    terminal_country_english_name?: string;
  };
};
