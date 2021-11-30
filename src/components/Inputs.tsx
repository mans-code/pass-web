import React from "react";
import {
  createStyles,
  makeStyles,
  Theme,
  fade,
} from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import InputBase, { InputBaseProps } from "@material-ui/core/InputBase";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import Autocomplete from "@material-ui/lab/Autocomplete";
import { OutlinedInputProps } from "@material-ui/core/OutlinedInput";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    margin: {
      margin: theme.spacing(1),
    },
    textInput: {
      root: {
        overflow: "hidden",
        borderRadius: 4,
        backgroundColor: "#fbfbfb",
        transition: theme.transitions.create(["border-color", "box-shadow"]),
        "&:hover": {
          backgroundColor: "#fafafa",
        },
        "&$focused": {
          backgroundColor: "#fafafa",
          borderColor: theme.palette.primary.main,
        },
      },
    },
  })
);

export function BaseInput({ value, onChange, ...props }: InputBaseProps) {
  const classes = useStyles();

  return (
    <InputBase
      className={classes.margin}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
}

export function TextInput({ color, ...props }: TextFieldProps) {
  const classes = useStyles();

  return (
    <TextField
      InputProps={
        { classes: classes.textInput, disableUnderline: true } as Partial<
          OutlinedInputProps
        >
      }
      color={color || "primary"}
      {...props}
    />
  );
}
