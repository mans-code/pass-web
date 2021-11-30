import React from "react";
import { HotKeys } from "react-keyboard";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Box,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
} from "@material-ui/core";
import {
  createStyles,
  makeStyles,
  Theme,
  useTheme,
} from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import Alert from "@material-ui/lab/Alert";
import handsImg from "img/hands.webp";
import { ActionType, CrossingContext } from "./store";
import { useBiokit } from "components/BioKitManager";
import { encodeB64 } from "utils";
import { useAppStore } from "store/root-store";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    alert: {
      marginBottom: theme.spacing(1.5),
    },
    title: {
      marginBottom: theme.spacing(5),
      color: "#333",
    },
    paper: {
      backgroundColor: "#fff",
      padding: theme.spacing(2),
      borderRadius: "8px",
    },
    handsImage: {
      width: "250px",
      [theme.breakpoints.up("md")]: {
        width: "400px",
      },
    },
    imageContainer: {
      position: "relative",
    },
    fingerIndicator: {
      width: "1.5rem",
      height: "1.5rem",
      borderRadius: "50px",
      background: theme.palette.secondary.main,
      position: "absolute",
      [theme.breakpoints.up("md")]: {
        width: "2rem",
        height: "2rem",
      },
    },
    buttonsGrid: {
      marginTop: theme.spacing(2),
    },
    bypassBox: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
      padding: theme.spacing(1.5),
      color: "#444",
      backgroundColor: "#459ab32b",
      borderRadius: "8px",
      border: "1px solid #459ab345",
    },
    bypassBtn: {
      fontWeight: "bold",
      color: "#222",
    },
    loaderBox: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "1rem",
      minHeight: "280px",
    },
  })
);

type Props = {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  // handleCapture: () => void;
  // handleCancelCapture: () => void;
  // wsqImage: string;
  // biokitStatus: string;
  doCrossing: () => void;
};

interface Position {
  top: number;
  left: number;
}
interface Positions {
  [key: string]: Position;
}

const FINGERS = [
  "RIGHT_THUMB",
  "RIGHT_INDEX",
  "RIGHT_MIDDLE",
  "RIGHT_RING",
  "RIGHT_LITTLE",
  "LEFT_THUMB",
  "LEFT_INDEX",
  "LEFT_MIDDLE",
  "LEFT_RING",
  "LEFT_LITTLE",
];

export default ({ setActiveStep, doCrossing }: Props) => {
  const classes = useStyles();
  const history = useHistory();
  const appStore = useAppStore();
  const { state, dispatch } = React.useContext(CrossingContext);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorCode, setErrorCode] = React.useState("");
  const [finger, setFinger] = React.useState("RIGHT_INDEX");
  const { t } = useTranslation(["translation", "errors"]);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up("md"));
  const biokit = useBiokit();
  const fpPolicy =
    state.documentValidationResponse.identity_verification_method_availability
      .identity_verification_requirement;

  // Pass this step if policy `NOT_REQUIRED_AND_OPERATOR_MUST_BYPASS` is retured
  React.useEffect(() => {
    if (fpPolicy === "NOT_REQUIRED_AND_OPERATOR_MUST_BYPASS") {
      verifyFingerprint(true);
    }
  }, []);

  React.useEffect(() => {
    if (state.doCrossing) {
      doCrossing();
      dispatch({ type: ActionType.doCrossing, payload: false });
    }
  }, [state.doCrossing]);

  const canBypass =
    fpPolicy === "REQUIRED_BY_DEFAULT_BUT_OPERATOR_CAN_BYPASS" ||
    fpPolicy === "NOT_REQUIRED_BY_DEFAULT_BUT_OPERATOR_CAN_VERIFY";

  const { fingerprint_availability = FINGERS } =
    state.documentValidationResponse.identity_verification_method_availability;

  React.useEffect(() => {
    if (fingerprint_availability.includes("RIGHT_INDEX")) {
      setFinger("RIGHT_INDEX");
    }
  }, []);

  const verifyFingerprint = async (fpBypassed = false) => {
    try {
      setLoading(true);
      setError(false);
      setErrorText("");
      setErrorCode("");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/traveler/identity/verification/v1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.token}`,
            "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP
              ? `${process.env.REACT_APP_TERMINAL_IP}`
              : "",
          },
          // TODO: modify identity verification body
          body: JSON.stringify({
            document_validation_response: state.documentValidationResponse,
            document_validation_response_signature:
              state.documentValidationResponseSignature,
            operator_entry_validation_response:
              state.operatorEntryValidationResponse,
            operator_entry_validation_response_signature:
              state.operatorEntryValidationResponseSignature,
            bypass_identity_verification: fpBypassed,
            identity_verification_method: "BIOMETRICS_FINGERPRINT",
            fingerprint_wsq_base64_images: {
              [finger]: appStore.biokit.enabled
                ? encodeB64(biokit.wsqImage)
                : encodeB64(window.btoa("fingerprint")),
            },
          }),
        }
      );

      if (response.ok) {
        const json = await response.json();

        setLoading(false);

        if (json.verification_bypassed === false) {
          if (json.verified) {
            dispatch({
              type: ActionType.setVerificationResponse,
              payload: json,
            });
            dispatch({
              type: ActionType.setVerificationResponseSignature,
              payload: response.headers.get("x-signature") ?? null,
            });

            if (
              json.watch_list_check_result?.watch_list_by_id_records?.filter(
                (r: any) => r.operator_can_see
              ).length > 0 ||
              json.watch_list_check_result?.watch_list_by_phonetic_name_records?.filter(
                (r: any) => r.operator_can_see
              ).length > 0
            )
              setActiveStep((prev) => prev + 1);
            else {
              dispatch({ type: ActionType.doCrossing, payload: true });
            }
          } else {
            setError(true);
            setErrorText(t("fingerprint->noMatch"));
            dispatch({
              type: ActionType.setVerifyingAndCrossing,
              payload: false,
            });
          }
        } else {
          dispatch({
            type: ActionType.setVerificationResponse,
            payload: json,
          });
          dispatch({
            type: ActionType.setVerificationResponseSignature,
            payload: response.headers.get("x-signature") ?? null,
          });

          if (
            json.watch_list_check_result?.watch_list_by_id_records?.filter(
              (r: any) => r.operator_can_see
            ).length > 0 ||
            json.watch_list_check_result?.watch_list_by_phonetic_name_records?.filter(
              (r: any) => r.operator_can_see
            ).length > 0
          )
            setActiveStep((prev) => prev + 1);
          else {
            dispatch({ type: ActionType.doCrossing, payload: true });
          }
        }
      } else if (response.status === 401) {
        const json = await response.json();
        if (
          json?.reason === "EXPIRED_ACCESS_TOKEN" ||
          json?.reason === "EXPIRED_SESSION"
        ) {
          sessionStorage.clear();
          history.replace("/login");
        }
      } else {
        const json = await response.json();
        setLoading(false);
        setErrorText(
          t(
            `${
              json.reason?.length ? `errors:${json.reason}` : "common.API_ERROR"
            }`
          )
        );
        setErrorCode(json.error_code);
        setError(true);
        dispatch({ type: ActionType.setVerifyingAndCrossing, payload: false });
      }
    } catch (error) {
      console.log(error);
      setErrorText(t(`common->API_ERROR`));
      setError(true);
      setLoading(false);
      dispatch({ type: ActionType.setVerifyingAndCrossing, payload: false });
    }
  };

  const onBypass = () => {
    verifyFingerprint(true);
  };

  React.useEffect(() => {
    if (
      appStore.biokit.enabled &&
      !state.verifyingAndCrossing &&
      biokit.biokitStatus === "CAPTURED" &&
      biokit.wsqImage.length > 0
    ) {
      dispatch({ type: ActionType.setVerifyingAndCrossing, payload: true });
      verifyFingerprint();
    }

    if (biokit.biokitStatus === "DEVICE_NOT_FOUND_OR_UNPLUGGED") {
      setErrorText(t("fingerprint->noFingerprintReader"));
      setError(true);
      setLoading(false);
      // setVerifyingAndCrossing(false);
      dispatch({ type: ActionType.setVerifyingAndCrossing, payload: false });
    }

    if (biokit.biokitStatus === "CANCELLED") {
      setErrorText(t("fingerprint->selectFingerprintAgain"));
      setError(true);
      setLoading(false);
      // setVerifyingAndCrossing(false);
      dispatch({ type: ActionType.setVerifyingAndCrossing, payload: false });
    }
  }, [
    biokit.biokitStatus,
    biokit.wsqImage,
    // biokit.deviceName,
    // state,
    // finger,
    // setActiveStep,
    // verifyFingerprint,
    appStore.biokit.enabled,
  ]);

  const handleFingerChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement> | string) => {
      if (typeof event === "string") setFinger(event);
      else setFinger((event.target as HTMLInputElement).value);
    },
    []
  );

  const smFingersPositions: Positions = {
    RIGHT_THUMB: {
      top: 45,
      left: 125,
    },
    LEFT_THUMB: {
      top: 45,
      left: 100,
    },
    RIGHT_INDEX: {
      top: -10,
      left: 145,
    },
    LEFT_INDEX: {
      top: -10,
      left: 80,
    },
    RIGHT_MIDDLE: {
      top: -25,
      left: 175,
    },
    LEFT_MIDDLE: {
      top: -25,
      left: 50,
    },
    RIGHT_RING: {
      top: -13,
      left: 214,
    },
    LEFT_RING: {
      top: -13,
      left: 10,
    },
    RIGHT_LITTLE: {
      top: 10,
      left: 240,
    },
    LEFT_LITTLE: {
      top: 10,
      left: -12,
    },
  };

  const mdFingersPositions: Positions = {
    RIGHT_THUMB: {
      top: 78,
      left: 210,
    },
    LEFT_THUMB: {
      top: 78,
      left: 162,
    },
    RIGHT_INDEX: {
      top: -9,
      left: 230,
    },
    LEFT_INDEX: {
      top: -9,
      left: 141,
    },
    RIGHT_MIDDLE: {
      top: -34,
      left: 289,
    },
    LEFT_MIDDLE: {
      top: -34,
      left: 82,
    },
    RIGHT_RING: {
      top: -13,
      left: 352,
    },
    LEFT_RING: {
      top: -13,
      left: 17,
    },
    RIGHT_LITTLE: {
      top: 25,
      left: 390,
    },
    LEFT_LITTLE: {
      top: 25,
      left: -20,
    },
  };

  const handleNext = () => {
    if (appStore.biokit.enabled) {
      if (biokit.deviceName.length > 0) {
        setLoading(true);
        setError(false);
        setErrorText("");

        biokit.handleCapture();
      } else {
        setErrorText(t("fingerprint->noFingerprintReader"));
        setError(true);
      }
    } else {
      verifyFingerprint();
    }
  };

  const handleBack = () => {
    biokit.handleCancelCapture();

    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const keyMap = React.useMemo(
    () => ({
      ...Object.fromEntries(
        FINGERS.map((finger, index) => [
          finger,
          `alt+${index + 1 < 10 ? index + 1 : 0}`,
        ])
      ),
      NEXT: "enter",
      BACK: "backspace",
    }),
    []
  );

  const keyHandlers = React.useMemo(
    () => ({
      ...Object.fromEntries(
        FINGERS.map((finger) => [finger, () => handleFingerChange(finger)])
      ),
      NEXT: () => handleNext(),
      BACK: () => handleBack(),
    }),
    [handleFingerChange]
  );

  const isLoading =
    loading || fpPolicy === "NOT_REQUIRED_AND_OPERATOR_MUST_BYPASS";

  return isLoading ? (
    <Loader />
  ) : (
    <form>
      <HotKeys keyMap={keyMap} handlers={keyHandlers}>
        {error && (
          <Alert severity="error" className={classes.alert}>
            {errorCode.length > 0 ? `${errorText} (${errorCode})` : errorText}
          </Alert>
        )}
        {canBypass ? <Bypass onBypass={onBypass} /> : null}
        <Paper className={classes.paper} variant="outlined">
          <Typography align="center" variant="h6" className={classes.title}>
            {t("fingerprint->selectFingerprint")}
          </Typography>
          <Grid container justify="center" alignItems="center" spacing={5}>
            <Grid item sm={12} md={6}>
              <Grid container justify="center" spacing={5}>
                <Grid item>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      {t("fingerprint->rightHand")}
                    </FormLabel>
                    <RadioGroup value={finger} onChange={handleFingerChange}>
                      {FINGERS.slice(0, 5).map((finger) => (
                        <FormControlLabel
                          key={finger}
                          disabled={!fingerprint_availability.includes(finger)}
                          value={finger}
                          control={<Radio />}
                          label={t(finger)}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid item>
                  <FormControl component="fieldset">
                    <FormLabel component="legend">
                      {t("fingerprint->leftHand")}
                    </FormLabel>
                    <RadioGroup value={finger} onChange={handleFingerChange}>
                      {FINGERS.slice(5).map((finger) => (
                        <FormControlLabel
                          key={finger}
                          disabled={!fingerprint_availability.includes(finger)}
                          value={finger}
                          control={<Radio />}
                          label={t(finger)}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Grid>
              </Grid>
            </Grid>
            <Grid item sm={12} md={6}>
              <Box display="flex" justifyContent="center">
                <div className={classes.imageContainer}>
                  <img
                    className={classes.handsImage}
                    src={handsImg}
                    alt="hands"
                  />
                  <span
                    className={classes.fingerIndicator}
                    style={{
                      top: desktop
                        ? mdFingersPositions[finger].top
                        : smFingersPositions[finger].top,
                      left: desktop
                        ? mdFingersPositions[finger].left
                        : smFingersPositions[finger].left,
                    }}
                  ></span>
                </div>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        <Grid
          container
          direction="row"
          justify="center"
          alignItems="center"
          spacing={2}
          className={classes.buttonsGrid}
        >
          <Grid item style={{ order: 2 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={loading ? true : false}
              onClick={handleNext}
            >
              {loading ? (
                <CircularProgress size={22} color="inherit" />
              ) : (
                t("common->verify")
              )}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained" onClick={handleBack}>
              {t("common->back")}
            </Button>
          </Grid>
        </Grid>
      </HotKeys>
    </form>
  );
};

function Loader() {
  const classes = useStyles();
  return (
    <Box className={classes.loaderBox}>
      <CircularProgress size="3rem" />
      <Typography variant="body1">يتم التحقق من البصمة..</Typography>
    </Box>
  );
}

function Bypass({ onBypass }: { onBypass: () => void }) {
  const classes = useStyles();
  return (
    <Box className={classes.bypassBox}>
      <Typography>هل ترغب في تجاوز عملية التحقق من البصمة؟</Typography>
      <Button
        variant="outlined"
        className={classes.bypassBtn}
        color="primary"
        onClick={onBypass}
      >
        نعم تجاوز
      </Button>
    </Box>
  );
}
