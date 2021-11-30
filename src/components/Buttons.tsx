import React from "react";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import MuiButton, { ButtonProps } from "@material-ui/core/Button";

const useButtonStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {},
  })
);

interface IStyleProps {
  color: string;
}

export const Button = (props: ButtonProps) => {
  const classes = useButtonStyles();

  return (
    <MuiButton classes={classes} color={props.color ?? "inherit"} {...props}>
      {props.children}
    </MuiButton>
  );
};
