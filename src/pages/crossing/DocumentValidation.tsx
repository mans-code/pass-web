import * as React from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FormGroup from "@material-ui/core/FormGroup";
import TextField from "@material-ui/core/TextField";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import { ActionType, CrossingContext } from "./store";
import { useBiokit } from "../../components/BioKitManager";
import {
  validateUserPolicy,
  localISOFormat,
  localDate,
  localDateTmp,
} from "../../utils";
import { useGet } from "../../hooks/useApi";
import { DateConversion } from "../../types";
import Lookup, { LookupItem } from "components/Lookup";
import { DocumentType, PersonType } from "./crossing.types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    section: {
      marginTop: "1.5rem",
    },
    h3: {
      fontSize: "1rem",
      marginBottom: "1rem",
      color: "#666",
      fontWeight: 600,
      "&.disabled": {
        color: "#999",
      },
    },
    radioButton: {
      color: "#777",
      borderColor: "#f1f1f1",
      borderWidth: "2px",
      fontWeight: 600,
      "&:firt-of-type": {
        marginRight: "0",
      },
      "&:hover": {
        backgroundColor: "#fefefe",
      },
      "&.selected": {
        borderColor: "#00acd7",
        color: "#00acd7",
      },
    },
    textInput: {
      borderColor: "#f1f1f1",
    },
    button: {
      padding: ".5rem 1.5rem",
      marginTop: theme.spacing(3),
    },
    radioGroup: {
      justifyContent: "center",
    },
    idVersionInput: {
      width: "120px",
    },
    overridesContainer: {
      marginTop: theme.spacing(3),
      marginBottom: theme.spacing(3),
      padding: theme.spacing(2),
    },
    overrideBox: {
      margin: theme.spacing(1),
      flexDirection: "column",
    },
    overrides: {
      width: "280px",
      marginTop: theme.spacing(1),
    },
  })
);

interface IProps {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
}

interface ICrossingOverride {
  overrideTerminal: boolean;
  overrideDatetime: boolean;
  terminal: string;
  dateTime: string;
  hijriDatetime: string;
}

const ConvertedDate = ({ date }: { date: string }) => {
  const { t } = useTranslation();
  const { isLoading, isError, data, error } = useGet<DateConversion>({
    key: "date-conversion",
    url: `/pass/api/lookups/date-conversion/v1?gregorian_date=${localDate(
      date
    )}`,
  });

  if (isError) return null;
  if (isLoading) return null;

  if (!data) return null;

  return (
    <Typography variant="body2">{`${t("Hijri Date")}: ${
      data.hijri_date
    }`}</Typography>
  );
};

const FirstStepCitizenCrossing = ({ setActiveStep }: IProps) => {
  const classes = useStyles();
  const history = useHistory();
  const { state, dispatch } = React.useContext(CrossingContext);
  const [loading, setLoading] = React.useState(false);
  const [formError, setFormError] = React.useState(""); // TODO: this is temporal solution, we should use a local state and update the crossing state after validation is successful
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorCode, setErrorCode] = React.useState("");
  const { t } = useTranslation("errors");
  const biokit = useBiokit();
  const [crossingOverride, setCrossingOverride] =
    React.useState<ICrossingOverride>({
      overrideTerminal: false,
      overrideDatetime: false,
      terminal: "",
      dateTime: "",
      hijriDatetime: "",
    });

  const canChangeCrossingTerminal = validateUserPolicy(
    "OVERRIDE_CROSSING_TERMINAL"
  );
  const canChangeCrossingDatetime = validateUserPolicy(
    "OVERRIDE_CROSSING_DATETIME"
  );

  const handleCrossingTerminalChange = (
    event: React.ChangeEvent<{ value: unknown }>,
    selectedItem: any,
    reason: string
  ) => {
    let value: any;
    if (reason === "clear") {
      value = "";
    } else value = selectedItem.code;

    setCrossingOverride((prev: ICrossingOverride) => ({
      ...prev,
      terminal: value,
    }));
  };

  const handleCrossingDatetimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCrossingOverride((prev: ICrossingOverride) => ({
      ...prev,
      dateTime: localISOFormat(event.target.value),
    }));
  };

  const handleOverrideCheck = (index: number) =>
    index === 1
      ? setCrossingOverride((prev: ICrossingOverride) => ({
          ...prev,
          overrideTerminal: !prev.overrideTerminal,
          terminal: prev.overrideTerminal ? "" : prev.terminal,
        }))
      : setCrossingOverride((prev: ICrossingOverride) => ({
          ...prev,
          overrideDatetime: !prev.overrideDatetime,
          dateTime: prev.overrideDatetime ? "" : prev.dateTime,
        }));

  React.useEffect(() => {
    biokit.handlePassportCapture();

    return () => {
      biokit.handleCancelPassportCapture();
    };
  }, [biokit.handlePassportCapture, biokit.handleCancelPassportCapture]);

  React.useEffect(() => {
    if (biokit.passportNumber.length > 0) {
      dispatch({
        type: ActionType.setDocumentType,
        payload: DocumentType.PASSPORT,
      });
      dispatch({
        type: ActionType.setDocumentNumber,
        payload: biokit.passportNumber,
      });
    }
  }, [biokit.passportNumber, dispatch]);

  // Clear nationality for CITIZEN & VISA documents
  React.useEffect(() => {
    if (
      state.documentType === DocumentType.VISA ||
      state.personType === PersonType.CITIZEN
    ) {
      dispatch({
        type: ActionType.setNationality,
        payload: "",
      });
    } else {
      if (!state.passportType)
        dispatch({
          type: ActionType.setPassportType,
          payload: "1",
        });
    }
  }, [state.personType, state.documentType]);

  const handleDocumentType = (payload: keyof typeof DocumentType) => {
    dispatch({
      type: ActionType.setDocumentType,
      payload,
    });

    if (payload === DocumentType.ID)
      dispatch({
        type: ActionType.setPersonType,
        payload: PersonType.CITIZEN,
      });
    else if (
      payload === DocumentType.VISA ||
      payload === DocumentType.GCC_ID_CARD
    )
      dispatch({
        type: ActionType.setPersonType,
        payload: PersonType.PILGRIM,
      });
  };

  const handlePersonType = (payload: keyof typeof PersonType) => {
    dispatch({
      type: ActionType.setPersonType,
      payload,
    });
  };

  const handleDocuemntNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = (event.target as HTMLInputElement).value;
    formError && setFormError(t(""));

    dispatch({
      type: ActionType.setDocumentNumber,
      payload: value.toUpperCase(),
    });

    // TODO: auto select other fields based on document number
  };

  const handleDocuemntVersionChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({
      type: ActionType.setDocumentVersion,
      payload: (event.target as HTMLInputElement).value,
    });
  };

  const handleBirthdate = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: ActionType.setBirthdate,
      payload: localDateTmp(event.target.value),
    });
  };

  const handleNationality = (
    event: React.ChangeEvent<{ value: unknown }>,
    selectedItem: LookupItem
  ) => {
    if (selectedItem)
      dispatch({
        type: ActionType.setNationality,
        payload: selectedItem.code,
      });
  };

  const handlePassportType = (
    event: React.ChangeEvent<{ value: unknown }>,
    selectedItem: LookupItem
  ) => {
    dispatch({
      type: ActionType.setPassportType,
      payload: selectedItem.code,
    });
  };

  const handleCrewMember = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    dispatch({
      type: ActionType.setCrewMember,
      payload: checked,
    });
  };

  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: Validate document type, document number, person type, document version, birthdate, nationality, passport type
    if (state.documentType === DocumentType.ID) {
      // validate person type === CITIZEN
      // validate document number is not empty
      // validate document version is not empty
    } else if (state.documentType === DocumentType.PASSPORT) {
      // validate person type should be selected
      // validate document number is not empty
      // validate nationality is not empty if person type !== CITIZEN
      // validate passport type is not empty if person type !== CITIZEN
    } else if (state.documentType === DocumentType.GCC_ID_CARD) {
      // validate person type is either VISITOR || PILGRIM
      // validate document number is not empty
      // validate nationality is not empty && must be GCC
    } else if (state.documentType === DocumentType.VISA) {
      // validate person type is either VISITOR || PILGRIM
      // validate document number is not empty
      // validate birthdate is not empty
      // validate nationality is not empty
      // validate passport type is not empty
    }

    if (!state.documentNumber) {
      setFormError(t("Document number must not be empty"));
      return;
    }

    try {
      setErrorText("");
      setErrorCode("");
      setError(false);
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/document/validation/v1`,
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
            travel_direction: state.travelDirection,
            document_type: state.documentType,
            person_type: state.personType,
            document_number: state.documentNumber.trim(),
            document_version: state.documentVersion.trim() || undefined,
            document_nationality_code: state.nationality || undefined,
            non_saudi_passport_type_code: state.passportType || undefined,
            crew_member: state.crewMember,
            birth_date: state.birthdate || undefined,
            overridden_terminal_id: crossingOverride.terminal || undefined,
            overridden_crossing_datetime:
              crossingOverride.dateTime || undefined,
          }),
        }
      );

      if (response.ok) {
        setError(false);
        setErrorText("");
        setErrorCode("");

        const data = await response.json();

        dispatch({
          type: ActionType.setDocumentValidationResponse,
          payload: data,
        });
        dispatch({
          type: ActionType.setDocumentValidationResponseSignature,
          payload: response.headers.get("x-signature") ?? null,
        });

        // Move to visitor info list page if person type === VISITOR & document response has multiple results
        if (data.person_type === PersonType.VISITOR) {
          // TODO: show info list dialog
        } else {
          // Set document business warnings
          let businessWarnings: any[] = [];

          if (data.person_type === PersonType.CITIZEN) {
            businessWarnings = data.business_warnings;
          } else if (data.person_type === PersonType.VISITOR) {
            businessWarnings = data.business_warnings;
          } else if (data.person_type === PersonType.PILGRIM) {
            businessWarnings =
              data.pilgrim_travel_document_validation_response
                .pilgrim_visa_record.business_warnings;
          }

          if (businessWarnings && businessWarnings.length) {
            businessWarnings.forEach(
              (warning: any) => (warning.skipped = false)
            );

            dispatch({
              type: ActionType.setWarningsCount,
              payload: state.warningsCount + businessWarnings.length,
            });
            dispatch({
              type: ActionType.setDocumentValidationWarnings,
              payload: [
                ...state.documentValidationWarnings,
                ...businessWarnings,
              ],
            });
          }
        }

        /** Get expected flights & their warnings */
        let expectedFlights: any[] = data.expected_flights || [];
        if (expectedFlights.length) {
          let warnings: any[] = expectedFlights
            .map((flight) => {
              if (
                flight.carrier_validation_response.business_warnings?.length
              ) {
                return flight.carrier_validation_response.business_warnings.map(
                  (fw: any) => ({
                    type: "expected",
                    skipped: false,
                    flightSeq: fw.sequence,
                  })
                );
              } else return false;
            })
            .filter(Boolean)
            .flat();

          if (warnings.length)
            dispatch({
              type: ActionType.setCarrierValidationWarnings,
              payload: [...state.carrierValidationWarnings, ...warnings],
            });
        }

        setLoading(false);

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
        setErrorText(t(`errors:${json.reason}`));
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

  const documentTypes = [
    {
      name: "ID",
      show:
        validateUserPolicy("NATIONAL_ID_CARD_HOLDER") &&
        validateUserPolicy(state.travelDirection),
    },
    {
      name: "PASSPORT",
      // TODO: add validations based on passport type (citizen or visitor)
      show:
        (validateUserPolicy("SAUDI_PASSPORT_HOLDER") ||
          validateUserPolicy("VISITOR_PASSPORT_HOLDER")) &&
        validateUserPolicy(state.travelDirection),
    },
    {
      name: "GCC_ID_CARD",
      show:
        validateUserPolicy("GCC_ID_CARD_HOLDER") &&
        validateUserPolicy(state.travelDirection),
    },
    {
      name: "VISA",
      show:
        validateUserPolicy("VISITOR_VISA_NUMBER") &&
        validateUserPolicy(state.travelDirection),
    },
  ];

  const personTypes = [
    {
      value: "CITIZEN",
      disabled: state.documentType !== "PASSPORT",
    },
    {
      value: "RESIDENT",
      // disabled: state.documentType !== "PASSPORT",
      disabled: true,
    },
    {
      value: "VISITOR",
      // disabled: state.documentType === "ID",
      disabled: true,
    },
    {
      value: "PILGRIM",
      disabled: state.documentType === "ID",
    },
  ];

  const now: Date = new Date(Date.now());

  const showIDVersion: boolean =
    state.documentType === documentTypes[0].name && documentTypes[0].show;

  const nowDatetime = `${now.getFullYear()}-${
    now.getMonth() > 8 ? now.getMonth() + 1 : `0${now.getMonth() + 1}`
  }-${now.getDate()}T${
    now.getHours() > 9 ? now.getHours() : `0${now.getHours()}`
  }:${now.getMinutes() > 9 ? now.getMinutes() : `0${now.getMinutes()}`}`;

  return (
    <form onSubmit={(e) => handleNext(e)}>
      <Box display="flex" alignItems="flex-start" flexDirection="column">
        {/** Error Messages */}
        {error && (
          <Typography variant="body2" align="center" color="error">
            {errorCode?.length > 0 ? `${errorText} (${errorCode})` : errorText}
          </Typography>
        )}

        {/** Select Document Type */}
        <Box className={classes.section}>
          <Typography variant="h3" gutterBottom className={classes.h3}>
            {t("Select Document Type")}
          </Typography>
          <Box display="flex">
            {documentTypes.map(
              ({ name, show }) =>
                show && (
                  <Box key={name} px={1}>
                    <Button
                      onClick={() =>
                        handleDocumentType(name as keyof typeof DocumentType)
                      }
                      variant="outlined"
                      className={`${classes.radioButton} ${
                        state.documentType === name ? "selected" : ""
                      }`}
                    >
                      {t(`enums:DocumentType.${name}`)}
                    </Button>
                  </Box>
                )
            )}
          </Box>
        </Box>

        {/** Document Number & ID Version & Birthdate */}
        <Box className={classes.section} display="flex" flexWrap="wrap">
          <Box>
            <Typography variant="h3" gutterBottom className={classes.h3}>
              {t("Document Number")}
            </Typography>
            <TextField
              label={t("Document Number")}
              size="small"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              value={state.documentNumber}
              onChange={handleDocuemntNumberChange}
              className={classes.textInput}
            />
          </Box>
          <Box mx={2}>
            <Typography
              variant="h3"
              gutterBottom
              className={`${classes.h3} ${!showIDVersion ? "disabled" : ""}`}
            >
              {t("Document Version")}
            </Typography>
            <TextField
              label={t("Document Version")}
              size="small"
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
              value={state.documentVersion}
              onChange={handleDocuemntVersionChange}
              className={`${classes.textInput} ${classes.idVersionInput}`}
              inputProps={{ maxLength: "2", pattern: "^[0-9]*$" }}
              disabled={!showIDVersion}
            />
          </Box>
          <Box mx={2}>
            <Typography
              variant="h3"
              gutterBottom
              className={`${classes.h3} ${
                state.documentType !== "VISA" ? "disabled" : ""
              }`}
            >
              {t("Birthdate")}
            </Typography>
            <TextField
              size="small"
              variant="outlined"
              id="date"
              defaultValue={nowDatetime}
              label={t("Birthdate")}
              type="date"
              onChange={handleBirthdate}
              // className={classes.textField}
              disabled={state.documentType !== "VISA"}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Box>
        </Box>

        {/** Select Person Type */}
        <Box className={classes.section}>
          <Typography variant="h3" gutterBottom className={classes.h3}>
            {t("Select Person Type")}
          </Typography>
          <Box display="flex">
            {personTypes.map(({ value, disabled }) => (
              <Box key={value} px={1}>
                <Button
                  onClick={() =>
                    handlePersonType(value as keyof typeof PersonType)
                  }
                  variant="outlined"
                  className={`${classes.radioButton} ${
                    state.personType === value ? "selected" : ""
                  }`}
                  disabled={disabled}
                >
                  {t(`enums:PersonType.${value}`)}
                </Button>
              </Box>
            ))}
          </Box>
        </Box>

        {/** Select Nationality & Passport Type */}
        <Box className={classes.section} display="flex" flexWrap="wrap">
          <Box width="280px">
            <Typography variant="h3" gutterBottom className={classes.h3}>
              {t("Select Nationality")}
            </Typography>
            <Lookup
              lookupKey={
                state.documentType === DocumentType.GCC_ID_CARD
                  ? "gcc_nationalities"
                  : "non_saudi_nationalities"
              }
              label={t("Nationality")}
              onChange={handleNationality}
              disabled={
                state.personType === PersonType.CITIZEN ||
                state.documentType === DocumentType.VISA
              }
              value={state.nationality}
            />
          </Box>
          <Box mx={2} width="150px">
            <Typography variant="h3" gutterBottom className={classes.h3}>
              {t("Select Passport Type")}
            </Typography>
            <Lookup
              lookupKey="non_saudi_passport_types"
              label={t("Passport Type")}
              onChange={handlePassportType}
              disabled={
                state.personType === PersonType.CITIZEN ||
                state.documentType !== DocumentType.PASSPORT
              }
              value={state.passportType}
            />
          </Box>
        </Box>

        {/** Crew member checkbox */}
        <Box className={classes.section}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={state.crewMember}
                onChange={handleCrewMember}
                name="crew-member"
              />
            }
            label={t("Check here if the traveller is a crew member")}
          />
        </Box>

        {/** Terminal & Crossing Date-time Overrides */}
        <Box
          display="flex"
          justifyContent="center"
          flexWrap="wrap"
          className={classes.overridesContainer}
        >
          {canChangeCrossingTerminal ? (
            <FormGroup row className={classes.overrideBox}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={crossingOverride.overrideTerminal}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                      checked: boolean
                    ) => handleOverrideCheck(1)}
                    name="override-terminal"
                  />
                }
                label="اضغط هنا لتغيير محطة العبور"
              />
              <div className={classes.overrides}>
                <Lookup
                  lookupKey="crossing_terminals"
                  label="تغيير محطة العبور" // TODO: add to translation
                  onChange={handleCrossingTerminalChange}
                  disabled={!crossingOverride.overrideTerminal}
                  value={crossingOverride.terminal}
                />
              </div>
            </FormGroup>
          ) : null}
          {canChangeCrossingDatetime && (
            <FormGroup row className={classes.overrideBox}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={crossingOverride.overrideDatetime}
                    onChange={(
                      event: React.ChangeEvent<HTMLInputElement>,
                      checked: boolean
                    ) => handleOverrideCheck(2)}
                    name="override-datetime"
                  />
                }
                label="اضغط هنا لتغيير تاريخ ووقت العبور" // TODO: translate
              />
              <FormControl variant="outlined" className={classes.overrides}>
                <TextField
                  size="small"
                  label={t("common->changeCrossingDatetime")}
                  type="datetime-local"
                  defaultValue={nowDatetime}
                  variant="outlined"
                  disabled={!crossingOverride.overrideDatetime}
                  onChange={handleCrossingDatetimeChange}
                  // helperText={
                  //   crossingOverride.overrideDatetime &&
                  //   crossingOverride.hijriDatetime
                  //     ? `${t("Hijri Date")}: ${crossingOverride.hijriDatetime}`
                  //     : ""
                  // }
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                {crossingOverride.dateTime ? (
                  <ConvertedDate date={crossingOverride.dateTime} />
                ) : null}
              </FormControl>
            </FormGroup>
          )}
        </Box>

        {/** Actions Button */}
        <Box display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            className={classes.button}
            disabled={loading ? true : false}
            type="submit"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("common->next")
            )}
          </Button>
        </Box>
      </Box>
    </form>
  );
};

export default FirstStepCitizenCrossing;
