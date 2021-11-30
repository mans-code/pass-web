import * as React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";
import Snackbar from "@material-ui/core/Snackbar";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import CardContent from "@material-ui/core/CardContent";
import CardActions from "@material-ui/core/CardActions";
import Button from "@material-ui/core/Button";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import { CrossingProvider, CrossingContext, ActionType } from "./store";
import DocumentValidation from "./DocumentValidation";
import TravellerInfo from "./TravellerInfo";
import FingerprintVerification from "./FingerprintVerification";
import CWL from "./CWL";
import { useBiokit } from "components/BioKitManager";
import { capitalize } from "utils";
import { useAppStore } from "store/root-store";
import { TravelDirection } from "./crossing.types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    header: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      marginBottom: "1rem",
      [theme.breakpoints.up("md")]: {
        flexDirection: "row",
        alignItems: "center",
      },
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "#444",
      flexGrow: 1,
      [theme.breakpoints.up("md")]: {
        textAlign: "left",
        "&.center": {
          textAlign: "center",
        },
      },
    },
    stepper: {
      backgroundColor: "#fafafa",
      padding: theme.spacing(1),
      flexGrow: 2,
      [theme.breakpoints.up("md")]: {
        padding: theme.spacing(2),
      },
    },
    button: {
      marginRight: theme.spacing(2),
    },
    instructions: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    stepButtons: {
      display: "flex",
      justifyContent: "center",
      marginTop: theme.spacing(4),
    },
    successIcon: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(4),
      fontSize: 80,
    },
    loader: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
    },
    alert: {
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(1),
    },
    cardRoot: {
      display: "flex",
    },
    cardMedia: {
      width: "60px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#2cb980",
      "& > *": { color: "#fff" },
    },
    cardContent: {
      padding: "8px 16px",
      "& h5": {
        color: "#444",
        fontSize: "1.1rem",
      },
      "& p": {
        color: "#666",
        marginTop: "4px",
      },
    },
    cardActions: {
      justifyContent: "flex-end",
      padding: "0 8px 4px",
    },
  })
);

function CrossingHeader({
  title,
  showBiokit,
  steps,
  activeStep,
}: {
  title: string;
  showBiokit: boolean;
  steps: string[];
  activeStep: number;
}) {
  const classes = useStyles();

  return (
    <div className={classes.header}>
      <Typography
        variant="h6"
        align="center"
        className={`${classes.title} ${showBiokit ? "center" : ""}`}
      >
        {title}
      </Typography>
      {!showBiokit && (
        <Stepper activeStep={activeStep} className={classes.stepper}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
    </div>
  );
}

interface IState {
  status: "INITIAL" | "SUCCESS" | "ERROR" | "LOADING";
  error: boolean;
  errorText: string;
  errorCode: string;
  pdfData: string;
  seq: string;
  snackBar: {
    open: boolean;
  };
}

function CitizenCrossing() {
  const classes = useStyles();
  const history = useHistory();
  const appStore = useAppStore();
  const biokit = useBiokit();
  const [activeStep, setActiveStep] = React.useState(0);
  const { state: crossingState, dispatch } = React.useContext(CrossingContext);
  const [state, setState] = React.useState<IState>({
    status: "INITIAL",
    error: false,
    errorText: "",
    errorCode: "",
    pdfData: "",
    seq: "",
    snackBar: {
      open: false,
    },
  });
  const { t } = useTranslation();

  const location = useLocation();
  const travelDirection = location.pathname.substring(1).toUpperCase();

  React.useEffect(() => {
    dispatch({
      type: ActionType.setTravelDirection,
      payload: travelDirection as keyof typeof TravelDirection,
    });
  }, []); // TODO: make sure travelDirection doen't change after component is mounted

  const steps = ["travelID", "travelInfo", "verification", "cwl"].map((i) =>
    t(`info->${i}`)
  );

  const getStepContent = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <DocumentValidation
            setActiveStep={setActiveStep}
          ></DocumentValidation>
        );
      case 1:
        return <TravellerInfo setActiveStep={setActiveStep}></TravellerInfo>;
      case 2:
        return (
          <FingerprintVerification
            setActiveStep={setActiveStep}
            doCrossing={doCrossing}
          ></FingerprintVerification>
        );
      case 3:
        return <CWL doCrossing={doCrossing} cancelCrossing={cancelCrossing} />;
      default:
        return "Unknown stepIndex";
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    dispatch({
      type: ActionType.resetState,
      payload: crossingState.travelDirection,
    });
    setState((prev) => ({
      ...prev,
      error: false,
      errorText: "",
      errorCode: "",
    }));
  };

  const handleSnackbarClose = () =>
    setState((prev) => ({
      ...prev,
      snackBar: {
        ...prev.snackBar,
        open: false,
      },
    }));

  const doCrossing = async () => {
    let reqBody: any;

    if (crossingState.expectedFlight) {
      reqBody = {
        document_validation_response: crossingState.documentValidationResponse,
        document_validation_response_signature:
          crossingState.documentValidationResponseSignature,
        operator_entry_validation_response:
          crossingState.operatorEntryValidationResponse,
        operator_entry_validation_response_signature:
          crossingState.operatorEntryValidationResponseSignature,
        traveler_identity_verification_response:
          crossingState.verificationResponse,
        traveler_identity_verification_response_signature:
          crossingState.verificationResponseSignature,
        selected_expected_flight_sequence: crossingState.expectedFlight,
      };
    } else {
      reqBody = {
        document_validation_response: crossingState.documentValidationResponse,
        document_validation_response_signature:
          crossingState.documentValidationResponseSignature,
        operator_entry_validation_response:
          crossingState.operatorEntryValidationResponse,
        operator_entry_validation_response_signature:
          crossingState.operatorEntryValidationResponseSignature,
        carrier_validation_response: crossingState.carrierValidationResponse,
        carrier_validation_response_signature:
          crossingState.carrierValidationResponseSignature,
        traveler_identity_verification_response:
          crossingState.verificationResponse,
        traveler_identity_verification_response_signature:
          crossingState.verificationResponseSignature,
      };
    }

    try {
      setState((prev) => ({
        ...prev,
        status: "LOADING",
      }));

      const response = await fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/crossing/v1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.token}`,
            "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP
              ? `${process.env.REACT_APP_TERMINAL_IP}`
              : "",
          },
          body: JSON.stringify(reqBody),
        }
      );

      if (response.ok) {
        const json = await response.json();

        setState((prev) => ({
          ...prev,
          status: "SUCCESS",
          pdfData: json.pdf_report_data,
          seq: json.crossing_sequence_number,
          snackBar: {
            open: true,
          },
        }));

        dispatch({ type: ActionType.setVerifyingAndCrossing, payload: false });

        handleReset();
      } else if (response.status === 401) {
        sessionStorage.clear();
        history.replace("/login");
      } else {
        const json = await response.json();

        setState((prev) => ({
          ...prev,
          status: "ERROR",
          error: true,
          errorText: t(
            `${json.reason ? `errors:${json.reason}` : "common->API_ERROR"}`
          ),
          errorCode: json.error_code ?? "",
        }));
      }

      dispatch({ type: ActionType.setVerifyingAndCrossing, payload: false });
    } catch (error) {
      console.log(error);

      setState((prev) => ({
        ...prev,
        status: "ERROR",
        error: true,
        errorText: t(`common->API_ERROR`),
        errorCode: "",
      }));

      dispatch({ type: ActionType.setVerifyingAndCrossing, payload: false });
    }
  };

  const cancelCrossing = async () => {
    // Post to crossing cancelation endpoint
    fetch(
      `${process.env.REACT_APP_API_URL ?? ""}/pass/api/crossing/cancellation/v1`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.token}`,
          "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP
            ? `${process.env.REACT_APP_TERMINAL_IP}`
            : "",
        },
        body: JSON.stringify({
          document_validation_response:
            crossingState.documentValidationResponse,
          document_validation_response_signature:
            crossingState.documentValidationResponseSignature,
          carrier_validation_response:
            crossingState.carrierValidationResponse ?? undefined,
          carrier_validation_response_signature:
            crossingState.carrierValidationResponseSignature ?? undefined,
          traveler_fingerprint_verification_response:
            crossingState.verificationResponse,
          traveler_fingerprint_verification_response_signature:
            crossingState.verificationResponseSignature,
          selected_expected_flight_sequence:
            crossingState.expectedFlight ?? undefined,
        }),
      }
    );

    // Reset state & steps
    handleReset();
  };

  const isLoading = state.status === "LOADING";
  const isSuccess = state.status === "SUCCESS";
  const isError = state.status === "ERROR";
  const { open } = state.snackBar;

  return (
    <div className={classes.root}>
      <CrossingHeader
        title={
          travelDirection === "DEPARTURE"
            ? t("travel->travellerDeparture")
            : t("travel->travellerArrival")
        }
        showBiokit={!biokit.connected && appStore.biokit.enabled}
        steps={steps}
        activeStep={activeStep}
      />
      {isError ? (
        <div>
          <Alert severity="error" className={classes.alert}>
            {state.errorText}{" "}
            {state.errorCode.length ? `(${state.errorCode})` : ""}
          </Alert>
        </div>
      ) : null}
      {isSuccess ? (
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          open={open}
          // autoHideDuration={10000}
          // onClose={handleSnackbarClose}
          key={state.seq}
        >
          <Card className={classes.cardRoot}>
            <CardMedia className={classes.cardMedia}>
              <DoneAllIcon />
            </CardMedia>
            <div>
              <CardContent className={classes.cardContent}>
                <Typography variant="h5">
                  {t(`Traveller crossing is completed successfully`, {
                    direction: t(capitalize(travelDirection)),
                  })}
                </Typography>
                <Typography variant="body2">
                  {t(`Sequence number`)}: {state.seq}
                </Typography>
              </CardContent>
              <CardActions className={classes.cardActions}>
                <Button
                  color="primary"
                  target="_blank"
                  href={`${process.env.REACT_APP_API_URL ?? ""}/pass/api/report/crossing/pdf/v1?${new URLSearchParams({
                    data: state.pdfData,
                  })}`}
                >
                  {t(`Downalod report`)}
                </Button>
                <Button onClick={handleSnackbarClose}>{t(`Dismiss`)}</Button>
              </CardActions>
            </div>
          </Card>
        </Snackbar>
      ) : null}
      <div>
        {isLoading ? (
          <div className={classes.loader}>
            <CircularProgress />
            <Typography variant="body1">يرجى الانتظار..</Typography>
          </div>
        ) : (
          <div>{getStepContent(activeStep)}</div>
        )}
      </div>
    </div>
  );
}

export default () => (
  <CrossingProvider>
    <CitizenCrossing />
  </CrossingProvider>
);
