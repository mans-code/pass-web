import React, { Dispatch } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  makeStyles,
  Theme,
  createStyles,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  CircularProgress,
} from "@material-ui/core";
import AsyncComboBox from "./AsyncComboBox";
import { ActionType, CrossingContext } from "pages/crossing/store";
import cloneDeep from "lodash/cloneDeep";
import { useHistory } from "react-router-dom";
import { DocumentType } from "pages/crossing/crossing.types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: "100%",
      maxWidth: "350px",
    },
    journyNumberField: {
      width: "100%",
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    otherField: {
      width: "100%",
      marginTop: theme.spacing(2),
    },
    transporterField: {
      width: "100%",
    },
    rtl: {
      direction: "ltr",
    },
    dialogContentRoot: {
      "&:first-child": {
        paddingTop: theme.spacing(1),
      },
    },
    error: {
      width: "100%",
      overflowWrap: "break-word",
    },
  })
);

type AddJournyDialogProps = {
  journyDialogOpen: boolean;
  setJournyDialogOpen: Dispatch<React.SetStateAction<boolean>>;
  type: "AIR" | "LAND" | "SEA" | "OTHER";
  flights: any[];
  setFlights: Dispatch<React.SetStateAction<any[]>>;
  setSeaCarrier: Dispatch<any>;
  setLandCarrier: Dispatch<any>;
  setFlight: React.Dispatch<any>;
  handleFlightClick: (value: any, index: number) => void;
  canAddPrivateFlight: boolean;
};

export default function AddJournyDialog({
  journyDialogOpen,
  setJournyDialogOpen,
  type,
  flights,
  setFlights,
  setSeaCarrier,
  setLandCarrier,
  setFlight,
  handleFlightClick,
  canAddPrivateFlight,
}: AddJournyDialogProps) {
  const classes = useStyles();
  const history = useHistory();
  const { dispatch, state } = React.useContext(CrossingContext);
  const [privateAirline, setPrivateAirline] = React.useState(false);
  const [transporter, setTransporter] = React.useState("");
  const [transporterName, setTransporterName] = React.useState("");
  const [journyNumber, setJournyNumber] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [destinationName, setDestinationName] = React.useState("");
  const [seaOtherCarrier, setSeaOtherCarrier] = React.useState("");
  const [selectedTransporter, setSelectedTransporter] = React.useState(null);
  const [selectedDestination, setSelectedDestination] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorCode, setErrorCode] = React.useState("");
  const { t } = useTranslation(["errors"]);

  const handlePrivateAirlineChange = () => {
    setTransporter("");
    setTransporterName("");
    setSelectedTransporter(null);
    setPrivateAirline(!privateAirline);
  };

  const handleTransportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTransporter(e.target.value);
  };

  const handleSeaOtherCarrierChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSeaOtherCarrier(e.target.value);
  };

  const handleJournyNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJournyNumber(e.target.value);
  };

  const handleAddSubmit = async (e: any) => {
    e.preventDefault();

    setLoading(true);

    if (type === "AIR" || type === "SEA") {
      if (
        transporter.length === 0 ||
        journyNumber.length === 0 ||
        destination.length === 0
      ) {
        if (transporter === "99" && seaOtherCarrier.length === 0) {
          setErrorText(t("forms->fillAllFields"));
          setErrorCode("");
          setError(true);
          setLoading(false);
          return;
        }

        setErrorText(t("forms->fillAllFields"));
        setErrorCode("");
        setError(true);
        setLoading(false);
        return;
      }
    } else if (type === "LAND") {
      if (transporter.length === 0) {
        setErrorText(t("forms->fillAllFields"));
        setErrorCode("");
        setError(true);
        setLoading(false);
        return;
      }
    } else if (type === "OTHER") {
      if (journyNumber.length === 0) {
        setErrorText(t("forms->fillAllFields"));
        setErrorCode("");
        setError(true);
        setLoading(false);
        return;
      }
    }

    let proccessingResponse = cloneDeep(state.documentValidationResponse);

    let reqBody: string;

    if (state.documentType === DocumentType.ID) {
      if (
        proccessingResponse?.national_id_card_processing_response
          ?.person_face_photo_base64?.length > 0
      ) {
        delete proccessingResponse.national_id_card_processing_response
          .person_face_photo_base64;
      }
    } else {
      if (
        proccessingResponse?.saudi_passport_processing_response
          ?.person_face_photo_base64?.length > 0
      ) {
        delete proccessingResponse.saudi_passport_processing_response
          .person_face_photo_base64;
      }
    }

    if (type === "AIR") {
      reqBody = JSON.stringify({
        document_validation_response: proccessingResponse,
        document_validation_response_signature:
          state.documentValidationResponseSignature,
        outside_country_code: destination,
        airline_code: `${transporter}`,
        private_airline: privateAirline,
        flight_number: journyNumber,
      });
    } else if (type === "SEA") {
      reqBody = JSON.stringify({
        document_validation_response: proccessingResponse,
        document_validation_response_signature:
          state.documentValidationResponseSignature,
        outside_country_code: destination,
        ship_company_code: transporter,
        sea_other_carrier: seaOtherCarrier,
      });
    } else if (type === "LAND") {
      reqBody = JSON.stringify({
        document_validation_response: proccessingResponse,
        document_validation_response_signature:
          state.documentValidationResponseSignature,
        // outside_country_code: destination,
        land_carrier: transporter,
      });
    } else {
      reqBody = JSON.stringify({
        document_validation_response: proccessingResponse,
        document_validation_response_signature:
          state.documentValidationResponseSignature,
        outside_country_code: destination,
      });
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/carrier/validation/v1`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.token}`,
            "x-overridden-client-ip": process.env.REACT_APP_TERMINAL_IP ?? "",
          },
          body: reqBody,
        }
      );

      if (response.ok) {
        setError(false);
        setErrorText("");
        setErrorCode("");

        if (type === "AIR") {
          setFlight(null);

          let flightsArray = flights;
          const newFlight = {
            airline_english_name: transporterName,
            airline_code: transporter,
            flight_number: journyNumber,
            airport_country_code: destination,
            airport_country_arabic_name: destinationName,
            private_airline: privateAirline,
            added: true,
          };

          if (flightsArray.length && flightsArray.reverse()[0].added) {
            flightsArray.pop();
          }

          setFlights([...flightsArray, newFlight]);

          handleFlightClick(newFlight, flightsArray.length);
        } else if (type === "SEA") {
          setSeaCarrier({
            name: transporter === "99" ? seaOtherCarrier : transporterName,
            code: transporter,
            destinationName: destinationName,
            destination: destination,
            journyNumber: journyNumber,
          });
        } else {
          setLandCarrier({
            transporter: transporter,
          });
        }

        const json = await response.json();

        dispatch({
          type: ActionType.setCarrierValidationResponse,
          payload: json,
        });
        dispatch({
          type: ActionType.setCarrierValidationResponseSignature,
          payload: response.headers.get("x-signature") ?? "",
        });

        if (json.business_warnings?.length) {
          dispatch({
            type: ActionType.setCarrierValidationWarnings,
            payload: [
              ...state.carrierValidationWarnings.filter(
                (w) => w.type !== "added"
              ),
              ...json.business_warnings.map((warning: any) => ({
                ...warning,
                type: "added",
                skipped: false,
              })),
            ],
          });
        }

        setLoading(false);

        setJournyDialogOpen(false);
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
        setErrorText(
          t(
            `${
              json.reason.length ? `errors:${json.reason}` : "common.API_ERROR"
            }`
          )
        );
        setErrorCode(json.error_code);
        setError(true);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setErrorText(t("common->API_ERROR"));
      setError(true);
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={journyDialogOpen}
      onClose={() => {
        setError(false);
        setErrorText("");
        setErrorCode("");
        setJournyDialogOpen(false);
      }}
      className={classes.rtl}
      PaperProps={{ className: classes.paper }}
    >
      <DialogTitle>{t("travel->newFlight")}</DialogTitle>
      <form onSubmit={handleAddSubmit}>
        <DialogContent classes={{ root: classes.dialogContentRoot }}>
          {error && (
            <Typography
              color="error"
              align="center"
              variant="body1"
              className={classes.error}
            >
              {errorCode.length > 0 ? `${errorText} (${errorCode})` : errorText}
            </Typography>
          )}
          {type === "AIR" && canAddPrivateFlight ? (
            <FormControlLabel
              control={
                <Checkbox
                  checked={privateAirline}
                  onChange={handlePrivateAirlineChange}
                  autoFocus
                />
              }
              label={t("travel->private")}
            />
          ) : null}
          {type === "LAND" && (
            <TextField
              label={t("travel->transporter")}
              className={classes.journyNumberField}
              type="text"
              margin="dense"
              variant="outlined"
              value={transporter}
              onChange={handleTransportChange}
              inputProps={{ maxLength: "100" }}
            />
          )}
          {(type === "AIR" || type === "SEA") &&
            (privateAirline ? (
              <TextField
                label={t("travel->transporter")}
                className={classes.transporterField}
                type="text"
                margin="dense"
                variant="outlined"
                value={transporter}
                onChange={handleTransportChange}
                inputProps={{ maxLength: "100" }}
              />
            ) : (
              <AsyncComboBox
                lookup={type === "AIR" ? "airlines" : "ship_companies"}
                setTransporter={setTransporter}
                setTransporterName={setTransporterName}
                setDestination={setDestination}
                setDestinationName={setDestinationName}
                selectedTransporter={selectedTransporter}
                setSelectedTransporter={setSelectedTransporter}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestination}
                travelDirection={state.travelDirection}
              ></AsyncComboBox>
            ))}
          {type === "SEA" && transporter === "99" && (
            <TextField
              label={t("common->other")}
              className={classes.otherField}
              type="text"
              margin="dense"
              variant="outlined"
              value={seaOtherCarrier}
              onChange={handleSeaOtherCarrierChange}
              inputProps={{ maxLength: "100" }}
            />
          )}
          {type !== "LAND" && (
            <>
              <TextField
                label={t("travel->tripNumber")}
                className={classes.journyNumberField}
                type="text"
                margin="dense"
                variant="outlined"
                value={journyNumber}
                onChange={handleJournyNumberChange}
                inputProps={{ maxLength: "100" }}
              />
              <AsyncComboBox
                lookup="countries"
                setTransporter={setTransporter}
                setTransporterName={setTransporterName}
                setDestination={setDestination}
                setDestinationName={setDestinationName}
                selectedTransporter={selectedTransporter}
                setSelectedTransporter={setSelectedTransporter}
                selectedDestination={selectedDestination}
                setSelectedDestination={setSelectedDestination}
                travelDirection={state.travelDirection}
              ></AsyncComboBox>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            type="submit"
            onClick={handleAddSubmit}
            color="primary"
            disabled={loading ? true : false}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              t("common->add")
            )}
          </Button>
          <Button
            onClick={() => {
              setError(false);
              setErrorText("");
              setErrorCode("");
              setJournyDialogOpen(false);
            }}
            color="primary"
            disabled={loading ? true : false}
          >
            {t("common->cancel")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
