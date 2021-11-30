import React, { SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  makeStyles,
  Theme,
  createStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { ActionType, CrossingContext } from "pages/crossing/store";

const isPassingNumberRequired = (reason: string) => {
  switch (reason) {
    case "SAUDI_PASSPORT_REPORTED_AS_LOST":
      return true;
    case "SAUDI_PASSPORT_REPORTED_AS_STOLEN":
      return true;
    case "SAUDI_PASSPORT_REPORTED_AS_STOLEN_WITH_ARREST_ACTION":
      return true;
    case "CITIZEN_ID_REPORTED_AS_LOST":
      return true;
    case "CITIZEN_ID_REPORTED_AS_STOLEN":
      return true;
    case "CITIZEN_ID_REPORTED_AS_STOLEN_WITH_ARREST_ACTION":
      return true;
    default:
      return false;
  }
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    rtl: {
      direction: "ltr",
    },
    textField: {
      width: 250,
    },
    error: {
      width: 250,
      overflowWrap: "break-word",
      marginBottom: theme.spacing(1.5),
    },
  })
);

type WarningDialogProps = {
  warningDialogOpen: boolean;
  setWarningDialogOpen: React.Dispatch<SetStateAction<boolean>>;
  selectedWarning: any;
  setSelectedWarning: React.Dispatch<any>;
};

export default function WarningDialog({
  warningDialogOpen,
  setWarningDialogOpen,
  selectedWarning,
  setSelectedWarning,
}: WarningDialogProps) {
  const classes = useStyles();
  const { state, dispatch } = React.useContext(CrossingContext);
  const [passingNumber, setPassingNumber] = React.useState("");
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const { t } = useTranslation("errors");

  React.useEffect(() => {
    if (typeof state.citizenOperatorEntry?.passingNumber === "string") {
      setPassingNumber(state.citizenOperatorEntry?.passingNumber);
    }
  }, [state.citizenOperatorEntry?.passingNumber]);

  const handlePassingNumberChange = (e: any) => {
    setPassingNumber(e.target.value);
  };

  const handleDialogAgreeBtnClick = (e: any) => {
    e.preventDefault();
    e.stopPropagation();

    if (
      isPassingNumberRequired(selectedWarning.reason) &&
      passingNumber.length === 0
    ) {
      setErrorText(t("forms->fillOverrideNumber"));
      setError(true);
      return;
    }

    state.documentValidationWarnings.forEach((w: any) => {
      if (w.error_code === selectedWarning.error_code) {
        w.skipped = true;
        dispatch({
          type: ActionType.setWarningsCount,
          payload: state.warningsCount - 1,
        });
      }
    });

    state.carrierValidationWarnings.forEach((w: any) => {
      if (w.type === "expected") {
        if (w.flightSeq === state.expectedFlight) {
          w.skipped = true;
        }
      } else {
        if (w.error_code === selectedWarning.error_code) {
          w.skipped = true;
        }
      }
    });

    setWarningDialogOpen(false);
    setSelectedWarning(null);
    setErrorText("");
    setError(false);
    dispatch({ type: ActionType.setPassingNumber, payload: passingNumber });
  };

  const handleDialogClose = () => {
    setWarningDialogOpen(false);
    setSelectedWarning(null);
    setErrorText("");
    setError(false);
  };

  return (
    <Dialog
      open={warningDialogOpen}
      onClose={handleDialogClose}
      className={classes.rtl}
    >
      <form onSubmit={(e) => handleDialogAgreeBtnClick(e)}>
        <DialogTitle>{t("forms->passingConfirm")}</DialogTitle>
        <DialogContent>
          {error && (
            <Typography
              color="error"
              align="center"
              variant="body1"
              className={classes.error}
            >
              {errorText}
            </Typography>
          )}
          <DialogContentText>
            {t(`errors:${selectedWarning?.reason}`)}
          </DialogContentText>
          {isPassingNumberRequired(selectedWarning?.reason) && (
            <TextField
              label={t("forms->passingNumber")}
              type="text"
              margin="dense"
              value={state.citizenOperatorEntry?.passingNumber}
              inputProps={{ maxLength: "100" }}
              variant="outlined"
              className={classes.textField}
              onChange={handlePassingNumberChange}
              autoFocus
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button type="submit" color="primary">
            {t("common->confirm")}
          </Button>
          <Button onClick={handleDialogClose} color="primary">
            {t("common->no")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
