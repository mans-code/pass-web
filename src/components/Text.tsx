import React, { ReactNode } from "react";
import {
  makeStyles,
  createStyles,
  Theme,
  fade,
} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import { OutlinedInputProps } from "@material-ui/core/OutlinedInput";

type ITextCard = {
  label: string;
  value: string;
  outlined?: boolean;
};

type IText = {
  children?: ReactNode;
  label: string;
  value?: string;
  transparent?: boolean;
  multiple?: boolean;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    textCardRoot: {
      height: "100%",
      padding: "2px 8px",
      display: "flex",
      flexDirection: "column",
    },
    textCardLabel: {
      fontWeight: "bold",
      color: "#777",
    },
    textCardValue: {
      color: "#333",
    },
  })
);

const useStyleTextInput = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
      border: "1px solid #d0d0d0",
      overflow: "hidden",
      borderRadius: 4,
      backgroundColor: "#fefefe",
      color: "#333",
      transition: theme.transitions.create(["border-color", "box-shadow"]),
      "&:hover": {
        backgroundColor: "#fefefe",
        borderColor: theme.palette.primary.main,
      },
      "&.Mui-focused": {
        borderColor: theme.palette.primary.main,
        backgroundColor: "#fefefe",
      },
    },
  })
);

const useTextStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: (transparent: boolean) => ({
      height: "100%",
      padding: "8px",
      display: " flex",
      flexDirection: "column",
      border: transparent ? "none" : "1px solid #d0d0d0",
      borderRadius: "5px",
      backgroundColor: transparent ? "" : "#fefefe",
      overflow: "auto",
      "& .label": {
        color: "#888",
        fontWeight: 600,
        fontSize: "11px",
        lineHeight: 1.5,
        textTransform: "capitalize",
      },
      "& .value": {
        color: "#444",
        fontSize: "14px",
        lineHeight: 1.5,
      },
    }),
  })
);

export const TextCard = ({ label, value = "-", outlined }: ITextCard) => {
  const classes = useStyles();

  return (
    <Paper
      elevation={0}
      variant={outlined ? "outlined" : "elevation"}
      className={classes.textCardRoot}
    >
      <Typography
        variant="overline"
        display="block"
        className={classes.textCardLabel}
      >
        {label}
      </Typography>
      <Typography variant="body1" className={classes.textCardValue}>
        {value}
      </Typography>
    </Paper>
  );
};

export const TextInput = (props: TextFieldProps) => {
  const classes = useStyleTextInput();

  return (
    <TextField
      variant="filled"
      fullWidth
      InputProps={
        {
          classes,
          disableUnderline: true,
          readOnly: props.onChange ? false : true,
        } as Partial<OutlinedInputProps>
      }
      {...props}
    />
  );
};

export const TextBox = ({
  children,
  label,
  value = "-",
  transparent = false,
  multiple = false,
}: IText) => {
  const classes = useTextStyles(transparent);

  return (
    <Box className={classes.root}>
      <Typography className="label" variant="overline">
        {label}
      </Typography>
      {multiple ? children : <Typography className="value">{value}</Typography>}
    </Box>
  );
};
