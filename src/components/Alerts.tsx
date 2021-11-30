import * as React from "react";
import { Snackbar, IconButton } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { Close as CloseIcon } from "@material-ui/icons";

interface ToastProps {
  open: boolean;
  onClose: (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => void;
  text: string;
  severity?: "warning" | "success" | "info" | "error";
}

export const Toast = ({
  open,
  onClose,
  text,
  severity = "warning",
}: ToastProps) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      open={open}
      onClose={onClose}
      action={
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      }
    >
      <Alert onClose={onClose} severity={severity}>
        {text}
      </Alert>
    </Snackbar>
  );
};
