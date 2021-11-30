import { createMuiTheme } from "@material-ui/core/styles";

const palette = {
  primary: {
    main: "#339AB3",
  },
  secondary: {
    main: "#B33333",
  },
  error: {
    main: "#B33333",
  },
};

export const arabicTheme = createMuiTheme({
  direction: "rtl",
  palette,
  typography: {
    fontFamily: ["Frutiger", "Roboto"].join(","),
    fontSize: 12,
  },
});

export const englishTheme = createMuiTheme({
  palette,
  typography: {
    fontFamily: ["Roboto"].join(","),
    fontSize: 12,
  },
});
