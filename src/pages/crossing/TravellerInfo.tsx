import * as React from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { arSA } from "date-fns/locale";
import {
  Paper,
  Typography,
  TextField,
  Grid,
  Avatar,
  Box,
  Radio,
  Button,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Snackbar,
  Tooltip,
  FormControlLabel,
  Checkbox,
  FormGroup,
  FormControl,
  FormLabel,
  RadioGroup,
  GridSize,
  CircularProgress,
  MenuItem,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import WarningDialog from "../../components/WarningDialog";
import AddJournyDialog from "../../components/AddJournyDialog";
import {
  CheckCircle,
  ExpandMore,
  AddCircle as AddIcon,
  Close as CloseIcon,
} from "@material-ui/icons";
import { ActionType, CrossingContext } from "./store";
import { TextCard, TextInput } from "../../components/Text";
import { decodeB64, concatStrings } from "../../utils";
import {
  DocumentType,
  OmrahAgent,
  PersonType,
  TravelDirection,
} from "./crossing.types";
import { useGet } from "hooks/useApi";
import { LookupItem } from "components/Lookup";
import { useHistory } from "react-router-dom";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      marginBottom: theme.spacing(1),
      borderRadius: "8px",
      [theme.breakpoints.up("sm")]: {
        padding: theme.spacing(3),
        marginBottom: theme.spacing(2),
      },
    },
    tableContainer: {
      overflow: "auto",
    },
    expansionPanel: {
      backgroundColor: "#fff",
      borderRadius: "8px",
      margin: "1rem auto",
      border: "1px solid rgba(0,0,0,0.15)",
      boxShadow: "none",
      "&->before": {
        display: "none",
      },
    },
    avatar: {
      order: -1,
      [theme.breakpoints.up("sm")]: { order: 0 },
    },
    faceImg: {
      width: "150px",
      height: "180px",
      "& img": {
        borderRadius: "4px",
        filter: (props: IStyleProps) =>
          props.photoBlured ? `blur(1rem)` : `blur(0px)`,
      },
    },
    alert: {
      marginBottom: theme.spacing(1.5),
    },
    formControl: {
      margin: theme.spacing(0.5),
      marginRight: theme.spacing(4.8),
      marginLeft: theme.spacing(4.8),
      marginTop: theme.spacing(2),
    },
    radioLabel: {
      width: "100%",
    },
    radioGroupLabel: {
      marginBottom: theme.spacing(1),
    },
    addJournyBtn: {
      marginBottom: theme.spacing(2),
    },
    AlertActionIcon: {
      marginRight: theme.spacing(2),
    },
    tableCellSizeSmall: {
      paddingLeft: 0,
    },
    title: {
      marginBottom: theme.spacing(2),
      color: "#333",
    },
    divider: {
      marginTop: theme.spacing(2),
      marginBottom: theme.spacing(1.6),
    },
    buttonsGrid: {
      marginTop: theme.spacing(1),
    },
    gridItem: {
      flexGrow: 1,
    },
    flightWithError: {
      color: theme.palette.error.main,
    },
  })
);

interface IStyleProps {
  photoBlured: boolean;
}

interface ITextProps {
  label: String;
  value: String;
}

const Text = ({ label, value }: ITextProps) => (
  <Grid item xs={12} sm={6} md={4} lg={3}>
    <TextField
      label={label}
      type="text"
      margin="dense"
      value={value}
      inputProps={{ maxLength: "100" }}
      InputProps={{ readOnly: true }}
      variant="outlined"
      fullWidth
    />
  </Grid>
);

type Props = {
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
};

const SecondStepCitizenCrossing = ({ setActiveStep }: Props) => {
  const radioBtnRefs = React.useRef<any[]>([]);
  const addFlightBtnRef = React.useRef<HTMLButtonElement>(null!);
  const nextBtnRef = React.useRef<HTMLButtonElement>(null!);
  const { state, dispatch } = React.useContext(CrossingContext);
  const [flight, setFlight] = React.useState<any>(null);
  const [flights, setFlights] = React.useState<any[]>([]);
  const [seaCarrier, setSeaCarrier] = React.useState<any>(null);
  const [landCarrier, setLandCarrier] = React.useState<any>(null);
  const [selectedWarning, setSelectedWarning] = React.useState<any>(null);
  const [warningDialogOpen, setWarningDialogOpen] = React.useState(false);
  const [journyDialogOpen, setJournyDialogOpen] = React.useState(false);
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarText, setSnackbarText] = React.useState("");
  const [passingNumber, setPassingNumber] = React.useState<string>("");
  const { t, i18n } = useTranslation("errors");
  const [loading, setLoading] = React.useState(false);
  const history = useHistory();
  // Get nationalities
  const { data: nationalities = [] } = useGet<LookupItem[]>({
    key: "non_saudi_nationalities",
    url: `/pass/api/lookups/values/v1/?key=non_saudi_nationalities`,
  });

  // Get Omrah Agents
  const { data: omrahAgents = [] } = useGet<OmrahAgent[]>({
    key: "omrah_agents",
    url: `/pass/api/lookups/omrah-agents/v1`,
  });

  // Get Pilgrim Membership Types
  const { data: pilgrimMemberships = [] } = useGet<LookupItem[]>({
    key: "pilgrim_memberships",
    url: `/pass/api/lookups/values/v1/?key=pilgrim_group_membership`,
  });

  // Get Passport Types Types
  const { data: nonSaudiPassportTypes = [] } = useGet<LookupItem[]>({
    key: "passport_types",
    url: `/pass/api/lookups/values/v1/?key=non_saudi_passport_types`,
  });

  // Get Pilgrim Visa Issue Places
  const { data: pilgrimVisaIssuePlaces = [] } = useGet<LookupItem[]>({
    key: "passport_types",
    url: `/pass/api/lookups/values/v1/?key=pilgrim-visa_issue_places`,
  });

  const [hajEntries, setHajEntries] = React.useState<any>({
    new_group_membership_type_code: 1
  });
  const [citizenEntries, setCitizenEntries] = React.useState<any>({});

  const handleHajEntries =
    (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setHajEntries(() => ({
        ...hajEntries,
        [key]: value,
      }));
    };

  const handleCrossWithSponsor = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setHajEntries(() => ({
      ...hajEntries,
      cross_with_sponsor: event.target.checked,
    }));
  };

  let travellerDocument: any;

  if (state.personType === PersonType.CITIZEN) {
    if (state.documentType === DocumentType.ID) {
      travellerDocument =
        state.documentValidationResponse.national_id_card_validation_response;
    } else if (state.documentType === DocumentType.PASSPORT) {
      travellerDocument =
        state.documentValidationResponse.saudi_passport_validation_response;
    }
  } else if (state.personType === PersonType.VISITOR) {
    travellerDocument =
      state.documentValidationResponse
        .visitor_travel_document_validation_response;
  } else if (state.personType === PersonType.PILGRIM) {
    travellerDocument =
      state.documentValidationResponse
        .pilgrim_travel_document_validation_response;
  }

  // verify if traveller photo shoub be blurred
  const photoBlured =
    state.documentValidationResponse.applied_policies.includes(
      "BLUR_FACE_PHOTO"
    ) && travellerDocument.person_info.gender.startsWith("F");

  // verify if operator can add pass number
  const canAddPassNumber =
    state.documentValidationResponse.applied_policies.includes(
      "CAN_ADD_ENTRY_PASS_NUMBER_FOR_CITIZEN_ON_ARRIVAL"
    );

  // verify if operator can add custom flight
  const canAddCustomFlight =
    state.documentValidationResponse.applied_policies.includes(
      "CAN_ADD_CUSTOM_FLIGHT_WITH_PUBLIC_AIRLINE"
    );
  // verify if operator can add custom private flight
  const canAddCustomPrivateFlight =
    state.documentValidationResponse.applied_policies.includes(
      "CAN_ADD_CUSTOM_FLIGHT_WITH_PUBLIC_OR_PRIVATE_AIRLINE"
    );

  const classes = useStyles({ photoBlured });

  const getPermitUsage = (usage: string) => t(`usage->${usage}`);

  React.useEffect(() => {
    if (state.selectedFlight) {
      setFlights((prev) => [...prev, state.selectedFlight]);
      setFlight(state.selectedFlight);
      nextBtnRef.current.focus();
    } else if (flights.length) {
      radioBtnRefs.current[0].focus();
    } else {
      addFlightBtnRef.current.focus();
    }

    return () => {
      setFlights([]);
    };
  }, []);

  React.useEffect(() => {
    if (
      state.documentValidationResponse.expected_flights?.length > 0 &&
      flights.length === 0
    ) {
      setFlights(state.documentValidationResponse.expected_flights);
    }
  }, [flights, state.documentValidationResponse]);

  React.useEffect(() => {
    if (typeof state.citizenOperatorEntry?.passingNumber === "string") {
      setPassingNumber(state.citizenOperatorEntry.passingNumber);
    }
  }, [state.citizenOperatorEntry?.passingNumber]);

  let personInfo: any;
  const photo = decodeB64(state.documentValidationResponse.face_photo_base64);
  const personType: keyof typeof PersonType =
    state.documentValidationResponse.person_type;
  const documentType: keyof typeof DocumentType =
    state.documentValidationResponse.document_type;
  const citizenInfo = travellerDocument.citizen_info;
  const residentInfo = travellerDocument.resident_info;
  const nationalIdCard = travellerDocument.national_id_card;
  const saudiPassport = travellerDocument.saudi_passport;
  const saudiVisa = travellerDocument.saudi_visa;
  const pilgrimInfo = travellerDocument.pilgrim_visa_record?.pilgrim_info;
  const pilgrimPassport =
    travellerDocument.pilgrim_visa_record?.pilgrim_passport_visa_info;
  const pilgrimVisaExtraInfo =
    travellerDocument.pilgrim_visa_record?.pilgrim_visa_extra_info;

  if (state.personType === PersonType.CITIZEN)
    personInfo = travellerDocument.person_info;
  else if (state.personType === PersonType.VISITOR)
    personInfo = travellerDocument.person_info;
  else if (state.personType === PersonType.PILGRIM) personInfo = pilgrimInfo;

  const arabicName = concatStrings(
    personInfo.arabic_first_name,
    personInfo.arabic_father_name,
    personInfo.arabic_grandfather_name,
    personInfo.arabic_family_name
  );

  const englishName = concatStrings(
    personInfo.english_first_name,
    personInfo.english_father_name,
    personInfo.english_grandfather_name,
    personInfo.english_family_name
  );

  // Get mother name for citizens
  const motherName = concatStrings(
    citizenInfo?.mother_first_name,
    citizenInfo?.mother_family_name
  );

  const travelPermitCategory = travellerDocument.travel_permit_category;
  const isDependant = personInfo.dependant;

  let militaryTravelPermit: any;
  let citizenTravelPermit: any;
  let employeeVacation: any;

  // FIXME: one category is missing !!
  if (travelPermitCategory === "MILITARY_OFFICER") {
    militaryTravelPermit = travellerDocument.military_travel_permit;
  } else if (travelPermitCategory === "OFFICIAL_EMPLOYEE_IN_VACATION") {
    employeeVacation = travellerDocument.latest_employee_vacation;
  } else if (
    travelPermitCategory === "DEPENDANT" ||
    travelPermitCategory === "NOT_SPECIFIED"
  ) {
    citizenTravelPermit = travellerDocument.citizen_travel_permit;
  }

  const getPermit = (type: string) => {
    let requesterName = "";

    if (type === "DEPENDANT" || type === "NOT_SPECIFIED") {
      let requesterInfo = citizenTravelPermit?.requester_info;
      requesterName = `${requesterInfo?.arabic_first_name} ${
        requesterInfo?.arabic_father_name ?? ""
      } ${requesterInfo?.arabic_grandfather_name ?? ""} ${
        requesterInfo?.arabic_family_name
      }`;
    }

    switch (type) {
      case "DIPLOMATIC_AND_SPECIAL_SAUDI_PASSPORT_HOLDER":
        return {
          name: t(`permitTypes->${type}`),
          data: saudiVisa,
          permitUsage: getPermitUsage(saudiVisa.visa_usage),
          permitType: "diplomat",
          requesterName: requesterName,
        };
      case "DEPENDANT":
        return {
          name: t(`permitTypes->${type}`),
          data: citizenTravelPermit,
          permitUsage: getPermitUsage(citizenTravelPermit.permit_usage),
          permitType: "citizen",
          requesterName: requesterName,
        };
      case "MILITARY_OFFICER":
        return {
          name: t(`permitTypes->${type}`),
          data: militaryTravelPermit,
          permitUsage: getPermitUsage(militaryTravelPermit.permit_usage),
          permitType: "military",
          requesterName: requesterName,
        };
      case "OFFICIAL_EMPLOYEE_IN_VACATION":
        return {
          name: t(`permitTypes->${type}`),
          data: employeeVacation,
          // permitUsage: getPermitUsage(militaryTravelPermit.permit_usage),
          permitType: "vacation",
          requesterName: requesterName,
        };
      case "NOT_SPECIFIED":
        return {
          name: t(`permitTypes->${type}`),
          data: citizenTravelPermit,
          permitUsage: getPermitUsage(citizenTravelPermit.permit_usage),
          permitType: "citizen",
          requesterName: requesterName,
        };
      default:
        break;
    }

    return null;
  };

  let permit = getPermit(travelPermitCategory);

  const handleFlightClick = (value: any, index: any) => {
    if (value !== flight) {
      setFlight(value);
      // NOTE: sequence is undefined in added flights
      dispatch({ type: ActionType.setExpectedFlight, payload: value.sequence });
      dispatch({ type: ActionType.setSelectedFlight, payload: value });
    }
  };

  const handleSkipWarningClick = (warning: any) => {
    setSelectedWarning(warning);
    setWarningDialogOpen(true);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setSnackbarOpen(false);
  };

  const handleDependantWithoutGuardainChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({
      type: ActionType.setDependantWithoutGuardian,
      payload: event.target.checked,
    });
  };

  const handleDeadTravelerChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch({
      type: ActionType.setDeadTraveler,
      payload: event.target.checked,
    });
    dispatch({ type: ActionType.setBuriedOutside, payload: false });
  };

  const handleBuriedOutsideChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = event.target.value === "true";
    dispatch({ type: ActionType.setBuriedOutside, payload: value });
  };

  const handlePassingNumberChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    let value = (event.target as HTMLInputElement).value;
    dispatch({
      type: ActionType.setPassingNumber,
      payload: value.trim(),
    });
    setPassingNumber(value.trim()); // TODO: remove this & use the state property only
  };

  // TODO: this is a temporary function, will be removed after cleaning the mess
  const callOperatorEntry = async () => {
    // Call operator entry api
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL ?? ""}/pass/api/operator/crossing/entry/validation/v1`,
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
            document_validation_response: state.documentValidationResponse,
            document_validation_response_signature:
              state.documentValidationResponseSignature,
            carrier_validation_response: state.expectedFlight
              ? undefined
              : state.carrierValidationResponse,
            carrier_validation_response_signature: state.expectedFlight
              ? undefined
              : state.carrierValidationResponseSignature,
            selected_expected_flight_sequence: state.expectedFlight,
            citizen_crossing_operator_entry:
              personType === PersonType.CITIZEN && state.citizenOperatorEntry
                ? {
                    traveler_arrived_dead:
                      state.citizenOperatorEntry.deadTraveler,
                    traveler_buried_outside_of_kingdom:
                      state.citizenOperatorEntry.buriedOutsideKingdom,
                    dependant_arrived_without_guardian:
                      state.citizenOperatorEntry
                        .dependantArrivedWithoutGuardian,
                    entry_pass_number:
                      state.citizenOperatorEntry.passingNumber || undefined,
                  }
                : undefined,
            visitor_crossing_operator_entry:
              personType === PersonType.VISITOR && state.visitorOperatorEntry
                ? {}
                : undefined,
            pilgrim_crossing_operator_entry:
              personType === PersonType.PILGRIM ? hajEntries : undefined,
          }),
        }
      );

      if (response.ok) {
        setSnackbarText("");
        setSnackbarOpen(false);

        const data = await response.json();

        setLoading(false);

        dispatch({
          type: ActionType.setOperatorEntryValidationResponse,
          payload: data,
        });

        dispatch({
          type: ActionType.setOperatorEntryValidationResponseSignature,
          payload: response.headers.get("x-signature") ?? null,
        });

        if (
          !state.documentValidationResponse
            .identity_verification_method_availability
        ) {
          setSnackbarText(`خطأ فني - بيانات التحقق من السمات الحيوية مفقودة`);
          setSnackbarOpen(true);
          setLoading(false);
          return;
        }

        if (data.business_warnings?.length > 0) {
          return;
        } else {
          // Move to next step
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
        setSnackbarText(t(`errors:${json.reason}`));
        setSnackbarOpen(true);
        setLoading(false);
      }
    } catch (error) {
      console.log(error);
      setSnackbarText(t(`common->API_ERROR`));
      setSnackbarOpen(true);

      setLoading(false);
    }
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (state.warningsCount > 0) {
      let text = t("info->viewWarningsBeforeProceed");
      setSnackbarText(text);
      setSnackbarOpen(true);
      return;
    }

    if (state.citizenOperatorEntry?.dependantArrivedWithoutGuardian) {
      if (passingNumber.length === 0) {
        let text = t("forms->fillOverrideNumber");
        setSnackbarText(text);
        setSnackbarOpen(true);
        return;
      }
    }

    let skipped = false;

    if (state.documentValidationResponse.crossing_terminal_type === "AIR") {
      if (flight !== null) {
        if (state.carrierValidationWarnings.length > 0) {
          state.carrierValidationWarnings.forEach((w: any) => {
            if (
              w.skipped &&
              w.type === "expected" &&
              w.flightSeq === state.expectedFlight
            ) {
              dispatch({
                type: ActionType.setPassingNumber,
                payload: passingNumber,
              });
              callOperatorEntry();
              return;
            }

            if (
              w.skipped &&
              w.type === "added" &&
              state.expectedFlight === undefined
            ) {
              dispatch({
                type: ActionType.setPassingNumber,
                payload: passingNumber,
              });
              callOperatorEntry();
              return;
            }
          });

          setSnackbarText(t("info->viewWarningsBeforeProceed"));
          setSnackbarOpen(true);
          return;
        } else {
          dispatch({
            type: ActionType.setPassingNumber,
            payload: passingNumber,
          });
          callOperatorEntry();
        }
      } else {
        setSnackbarText(t("travel->selectFlight"));
        setSnackbarOpen(true);
      }
    } else if (
      state.documentValidationResponse.crossing_terminal_type === "SEA"
    ) {
      if (seaCarrier !== null) {
        state.carrierValidationWarnings.forEach((w: any) => {
          skipped = false;

          if (w.skipped === false) {
            setSnackbarText(t("info->viewWarningsBeforeProceed"));
            setSnackbarOpen(true);
            skipped = true;
          }
        });

        if (skipped) return;

        dispatch({ type: ActionType.setPassingNumber, payload: passingNumber });
        callOperatorEntry();
      } else {
        setSnackbarText(t("travel->addFlight"));
        setSnackbarOpen(true);
      }
    } else if (
      state.documentValidationResponse.crossing_terminal_type === "LAND"
    ) {
      if (landCarrier !== null) {
        state.carrierValidationWarnings.forEach((w: any) => {
          skipped = false;

          if (w.skipped === false) {
            setSnackbarText(t("info->viewWarningsBeforeProceed"));
            setSnackbarOpen(true);
            skipped = true;
          }
        });

        if (skipped) return;

        dispatch({ type: ActionType.setPassingNumber, payload: passingNumber });
        callOperatorEntry();
      } else {
        setSnackbarText(t("travel->addFlight"));
        setSnackbarOpen(true);
      }
    }
  };

  const handleBack = () => {
    fetch(
      `${process.env.REACT_APP_API_URL ?? ""}/pass/api/admin/activity/incomplete-crossing/v1`,
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
          document_validation_response: state.documentValidationResponse,
          document_validation_response_signature:
            state.documentValidationResponseSignature,
        }),
      }
    );

    dispatch({ type: ActionType.setWarningsCount, payload: 0 });
    dispatch({ type: ActionType.setDocumentValidationWarnings, payload: [] });
    dispatch({ type: ActionType.setCarrierValidationWarnings, payload: [] });
    dispatch({ type: ActionType.setDocumentValidationResponse, payload: {} });
    dispatch({
      type: ActionType.setDocumentValidationResponseSignature,
      payload: "",
    });
    dispatch({
      type: ActionType.setOperatorEntryValidationResponse,
      payload: {},
    });
    dispatch({
      type: ActionType.setOperatorEntryValidationResponseSignature,
      payload: "",
    });
    dispatch({ type: ActionType.setCarrierValidationResponse, payload: {} });
    dispatch({
      type: ActionType.setCarrierValidationResponseSignature,
      payload: "",
    });
    dispatch({ type: ActionType.setExpectedFlight, payload: "" });
    dispatch({ type: ActionType.setPassingNumber, payload: "" });
    dispatch({ type: ActionType.setDependantWithoutGuardian, payload: false });
    dispatch({ type: ActionType.setDeadTraveler, payload: false });
    dispatch({ type: ActionType.setBuriedOutside, payload: true });

    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  return (
    <form onSubmit={(e) => handleNext(e)}>
      {/** Document & Carrier Warnigns */}
      <Box>
        {state.documentValidationWarnings.map((warning: any, index: number) => (
          <Alert
            key={index}
            className={classes.alert}
            severity="warning"
            action={
              warning.operator_can_bypass ? (
                warning.skipped === false ? (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={() => handleSkipWarningClick(warning)}
                  >
                    {t("common->skip")}
                  </Button>
                ) : (
                  <CheckCircle className={classes.AlertActionIcon} />
                )
              ) : null
            }
          >
            {`${t(`errors:${warning.reason}`)} (${warning.error_code})`}
            <div style={{ margin: "1rem .5rem 0", fontWeight: 600 }}>
              {warning.more_details
                ? Object.entries(warning.more_details).map(([key, value]) => (
                    <span>
                      {key}: {value}
                    </span>
                  ))
                : null}
            </div>
          </Alert>
        ))}
        {state.carrierValidationWarnings.map((warning: any, index: number) => {
          if (
            state.expectedFlight === warning.flightSeq ||
            state.documentValidationResponse.crossing_terminal_type !== "AIR"
          ) {
            return (
              <Alert
                key={index}
                className={classes.alert}
                severity="warning"
                action={
                  warning.operator_can_bypass ? (
                    warning.skipped === false ? (
                      <Button
                        size="small"
                        color="inherit"
                        onClick={() => handleSkipWarningClick(warning)}
                      >
                        {t("common->skip")}
                      </Button>
                    ) : (
                      <CheckCircle className={classes.AlertActionIcon} />
                    )
                  ) : null
                }
              >
                {`${t(`errors:${warning.reason}`)} (${warning.error_code})`}
                <div style={{ margin: "1rem .5rem 0", fontWeight: 600 }}>
                  {warning.more_details
                    ? Object.entries(warning.more_details).map(
                        ([key, value]) => (
                          <span>
                            {key}: {value}
                          </span>
                        )
                      )
                    : null}
                </div>
              </Alert>
            );
          }
          return null;
        })}
        {state.operatorEntryValidationResponse.business_warnings
          ? state.operatorEntryValidationResponse.business_warnings.map(
              (warning: any, index: number) => (
                <Alert
                  key={index}
                  className={classes.alert}
                  severity="warning"
                  action={
                    warning.operator_can_bypass ? (
                      !warning.skipped ? (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => handleSkipWarningClick(warning)}
                        >
                          {t("common->skip")}
                        </Button>
                      ) : (
                        <CheckCircle className={classes.AlertActionIcon} />
                      )
                    ) : null
                  }
                >
                  <div>
                    {`${t(`errors:${warning.reason}`)} (${warning.error_code})`}
                  </div>
                  <div style={{ margin: "1rem .5rem 0", fontWeight: 600 }}>
                    {warning.more_details
                      ? Object.entries(warning.more_details).map(
                          ([key, value]) => (
                            <span>
                              {key}: {value}
                            </span>
                          )
                        )
                      : null}
                  </div>
                </Alert>
              )
            )
          : null}
      </Box>

      {/** Citizen Basic Info */}
      {personType === PersonType.CITIZEN ? (
        <Paper className={classes.paper} variant="outlined">
          <Typography variant="h6" color="primary" className={classes.title}>
            {t("info->infoSummary")}
          </Typography>

          {/** Traveller Basic Info */}
          <Box my={2}>
            <Grid container spacing={3}>
              {/** Traveller Name, Nationality, Birthdate & Occupation */}
              <Grid container item xs={12} sm={8} spacing={1}>
                {/** Arabic Name */}
                <GridItem xs={12} label={t("Arabic Name")} value={arabicName} />
                {/** English Name */}
                <GridItem
                  xs={12}
                  label={t("English Name")}
                  value={englishName}
                />
                {/** Nationality */}
                <GridItem
                  xs={12}
                  label={t("Nationality")}
                  value="المملكة العربية السعودية"
                />
                {/** Birthdate */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Birthdate"), t("Gregorian"))}
                  value={personInfo.birth_date.gregorian_date}
                />
                {/** Birthdate */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Birthdate"), t("Hijri"))}
                  value={personInfo.birth_date.hijri_date}
                />
                {/** Occupation */}
                <GridItem
                  xs={12}
                  label={t("Occupation")}
                  value={citizenInfo.occupation_arabic_title}
                />
                {/** Age */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Age"), t("Gregorian"))}
                  value={personInfo.age.gregorian_years}
                />
                {/** Age */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Age"), t("Hijri"))}
                  value={personInfo.age.hijri_years}
                />
              </Grid>

              {/** Traveller Photo */}
              <Grid item xs={12} sm={4} className={classes.avatar}>
                <Box display="flex" justifyContent="center">
                  <Avatar
                    variant="rounded"
                    alt={i18n.language === "ar" ? arabicName : englishName}
                    src={`data:image/png;base64, ${photo}`}
                    className={classes.faceImg}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/** Traveller Document Info */}
          <Box my={2}>
            <Grid container spacing={3}>
              {/** Citizen Passport Document Info */}
              {documentType === DocumentType.PASSPORT && (
                <Grid container item xs={12} spacing={1}>
                  {/** Document Number */}
                  <GridItem
                    xs={12}
                    sm={4}
                    label={t("Passport Number")}
                    value={saudiPassport.passport_number}
                  />
                  {/** Document Issuance Date */}
                  <GridItem
                    xs={12}
                    sm={4}
                    label={t("Issue Date")}
                    value={saudiPassport.issuance_date.gregorian_date}
                  />
                  {/** Document Expiry Date */}
                  <GridItem
                    xs={12}
                    sm={4}
                    label={t("Expiry Date")}
                    value={saudiPassport.expiry_date.gregorian_date}
                  />
                </Grid>
              )}

              {/** Citizen National ID Document Info */}
              {documentType === DocumentType.ID && (
                <Grid container item xs={12} spacing={1}>
                  {/** Document Number */}
                  <GridItem
                    xs={12}
                    sm={3}
                    label={t("National ID Number")}
                    value={nationalIdCard.national_id}
                  />
                  {/** Document Version */}
                  <GridItem
                    xs={12}
                    sm={3}
                    label={t("Document Version")}
                    value={nationalIdCard.card_version}
                  />
                  {/** Document Issuance Date */}
                  <GridItem
                    xs={12}
                    sm={3}
                    label={t("Issue Date")}
                    value={nationalIdCard.issuance_date.hijri_date}
                  />
                  {/** Document Expiry Date */}
                  <GridItem
                    xs={12}
                    sm={3}
                    label={t("Expiry Date")}
                    value={nationalIdCard.expiry_date.hijri_date}
                  />
                </Grid>
              )}
            </Grid>
          </Box>

          {/** Citizen Update Info TODO: add citizen operator entries to its state */}
          <Grid container spacing={3}>
            {state.travelDirection === TravelDirection.ARRIVAL ? (
              <Box my={2}>
                <Grid container item xs={12} spacing={1}>
                  <Grid item xs={12}>
                    <FormGroup row>
                      {isDependant ? (
                        <FormControlLabel
                          control={
                            <Checkbox
                              color="primary"
                              checked={
                                state.citizenOperatorEntry
                                  ?.dependantArrivedWithoutGuardian || false
                              }
                              onChange={handleDependantWithoutGuardainChange}
                            />
                          }
                          label={t("permit->dependantWithoutGuardian")}
                        />
                      ) : null}
                      <FormControlLabel
                        control={
                          <Checkbox
                            color="primary"
                            checked={
                              state.citizenOperatorEntry?.deadTraveler || false
                            }
                            onChange={handleDeadTravelerChange}
                          />
                        }
                        label={t("permit->deadTraveler")}
                      />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl
                      color="primary"
                      component="fieldset"
                      disabled={
                        !state.citizenOperatorEntry?.deadTraveler || false
                      }
                    >
                      <FormLabel component="legend">
                        {t("forms->burryLocation")}
                      </FormLabel>
                      <RadioGroup
                        value={
                          state.citizenOperatorEntry?.buriedOutsideKingdom ||
                          false
                        }
                        onChange={handleBuriedOutsideChange}
                        row
                      >
                        <FormControlLabel
                          value={false}
                          control={<Radio />}
                          label={t("forms->insideKingdom")}
                        />
                        <FormControlLabel
                          value={true}
                          control={<Radio />}
                          label={t("forms->outsideKingdom")}
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid>
                  {canAddPassNumber ? (
                    <Grid item xs={12} sm={6} md={4} lg={3}>
                      <TextField
                        label={t("forms->passingNumber")}
                        margin="dense"
                        value={passingNumber}
                        inputProps={{ maxLength: "100" }}
                        disabled={
                          !state.citizenOperatorEntry
                            ?.dependantArrivedWithoutGuardian &&
                          !state.citizenOperatorEntry?.deadTraveler
                        }
                        onChange={handlePassingNumberChange}
                        variant="outlined"
                        fullWidth
                      />
                    </Grid>
                  ) : null}
                </Grid>
              </Box>
            ) : null}
          </Grid>
        </Paper>
      ) : null}

      {/** Hajji Basic Info */}
      {personType === PersonType.PILGRIM ? (
        <Paper className={classes.paper} variant="outlined">
          <Typography variant="h6" color="primary" className={classes.title}>
            {t("info->infoSummary")}
          </Typography>

          {/** Traveller Basic Info */}
          <Box my={2}>
            <Grid container spacing={3}>
              {/** Traveller Name, Nationality, Birthdate & Occupation */}
              <Grid container item xs={12} sm={8} spacing={1}>
                {/** Arabic Name */}
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("Arabic First Name")}
                  value={
                    hajEntries.new_arabic_first_name
                      ? hajEntries.new_arabic_first_name
                      : personInfo.arabic_first_name
                  }
                  onChange={handleHajEntries("new_arabic_first_name")}
                />
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("Arabic Father Name")}
                  value={
                    hajEntries.new_arabic_father_name
                      ? hajEntries.new_arabic_father_name
                      : personInfo.arabic_father_name
                  }
                  onChange={handleHajEntries("new_arabic_father_name")}
                />
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("Arabic Grandfather Name")}
                  value={
                    hajEntries.new_arabic_grandfather_name
                      ? hajEntries.new_arabic_grandfather_name
                      : personInfo.arabic_grandfather_name
                  }
                  onChange={handleHajEntries("new_arabic_grandfather_name")}
                />
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("Arabic Family Name")}
                  value={
                    hajEntries.new_arabic_family_name
                      ? hajEntries.new_arabic_family_name
                      : personInfo.arabic_family_name
                  }
                  onChange={handleHajEntries("new_arabic_family_name")}
                />
                {/** English Name */}
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("English First Name")}
                  value={
                    hajEntries.new_english_first_name
                      ? hajEntries.new_english_first_name
                      : personInfo.english_first_name
                  }
                  onChange={handleHajEntries("new_english_first_name")}
                />
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("English Father Name")}
                  value={
                    hajEntries.new_english_Father_name
                      ? hajEntries.new_english_Father_name
                      : personInfo.english_father_name
                  }
                  onChange={handleHajEntries("new_english_Father_name")}
                />
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("English Grandfather Name")}
                  value={
                    hajEntries.new_english_grandfather_name
                      ? hajEntries.new_english_grandfather_name
                      : personInfo.english_grandfather_name
                  }
                  onChange={handleHajEntries("new_english_grandfather_name")}
                />
                <GridItem
                  xs={6}
                  sm={3}
                  label={t("English Family Name")}
                  value={
                    hajEntries.new_english_family_name
                      ? hajEntries.new_english_family_name
                      : personInfo.english_family_name
                  }
                  onChange={handleHajEntries("new_english_family_name")}
                />
                {/** Nationality */}
                <GridItem
                  xs={12}
                  label={t("Nationality")}
                  select={true}
                  value={
                    hajEntries.new_nationality_code
                      ? hajEntries.new_nationality_code
                      : state.documentValidationResponse
                          .document_nationality_code
                  }
                  onChange={handleHajEntries("new_nationality_code")}
                  children={nationalities.map((option: LookupItem) => (
                    <MenuItem key={option.code} value={option.code}>
                      <b style={{ fontWeight: 600 }}>{option.code}</b>
                      <span style={{ margin: "0 8px" }}>
                        {option.arabic_label}
                      </span>
                    </MenuItem>
                  ))}
                />
                {/** Birthdate */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Birthdate"), t("Gregorian"))}
                  value={
                    hajEntries.new_birth_date
                      ? hajEntries.new_birth_date
                      : personInfo.birth_date.gregorian_date
                  }
                  onChange={handleHajEntries("new_birth_date")}
                />
                {/** Birthdate */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Birthdate"), t("Hijri"))}
                  value={personInfo.birth_date.hijri_date}
                />
                {/** Occupation */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Occupation")}
                  value={pilgrimVisaExtraInfo.occupation_arabic_title}
                />
                {/** Gender */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Gender")}
                  value={
                    hajEntries.new_gender
                      ? hajEntries.new_gender
                      : personInfo.gender
                  }
                  select={true}
                  onChange={handleHajEntries("new_gender")}
                  children={["MALE", "FEMALE"].map((option: string) => (
                    <MenuItem key={option} value={option}>
                      <span>{t(option)}</span>
                    </MenuItem>
                  ))}
                />
                {/** Age */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Age"), t("Gregorian"))}
                  value={pilgrimVisaExtraInfo.age?.gregorian_years}
                />
                {/** Age */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={concatStrings(t("Age"), t("Hijri"))}
                  value={pilgrimVisaExtraInfo.age?.hijri_years}
                />
              </Grid>

              {/** Traveller Photo */}
              <Grid item xs={12} sm={4} className={classes.avatar}>
                <Box display="flex" justifyContent="center">
                  <Avatar
                    variant="rounded"
                    alt={i18n.language === "ar" ? arabicName : englishName}
                    src={`data:image/png;base64, ${photo}`}
                    className={classes.faceImg}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/** Traveller Document Info */}
          <Box my={2}>
            <Grid container spacing={3}>
              {/** Pilgrim Document Info */}
              <Grid container item xs={12} spacing={1}>
                {/** Passport Number */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Passport Number")}
                  value={
                    hajEntries.new_document_number
                      ? hajEntries.new_document_number
                      : pilgrimPassport.passport_number
                  }
                  onChange={handleHajEntries("new_document_number")}
                />
                {/** Passport Type */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Passport Type")}
                  value={
                    hajEntries.new_passport_type_code
                      ? hajEntries.new_passport_type_code
                      : pilgrimPassport.passport_type_code
                  }
                  onChange={handleHajEntries("new_passport_type_code")}
                  select={true}
                  children={nonSaudiPassportTypes.map((option: LookupItem) => (
                    <MenuItem key={option.code} value={option.code}>
                      <b style={{ fontWeight: 600 }}>{option.code}</b>
                      <span style={{ margin: "0 8px" }}>
                        {option.arabic_label}
                      </span>
                    </MenuItem>
                  ))}
                />
                {/** Passport Issue Place */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Issue Place")}
                  value={
                    hajEntries.new_document_issue_location
                      ? hajEntries.new_document_issue_location
                      : pilgrimPassport.passport_issue_place
                  }
                  onChange={handleHajEntries("new_document_issue_location")}
                />
                {/** Document Issuance Date */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Issue Date")}
                  value={
                    pilgrimPassport.passport_issuance_date?.gregorian_date ||
                    "-"
                  }
                />
                {/** Document Expiry Date */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Expiry Date")}
                  value={
                    pilgrimPassport.passport_expiry_date?.gregorian_date || "-"
                  }
                />
                {/** Membership Type */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Membership Group")}
                  value={hajEntries.new_group_membership_type_code || ""}
                  onChange={handleHajEntries("new_group_membership_type_code")}
                  select={true}
                  children={pilgrimMemberships.map((option: LookupItem) => (
                    <MenuItem key={option.code} value={option.code}>
                      <b style={{ fontWeight: 600 }}>{option.code}</b>
                      <span style={{ margin: "0 8px" }}>
                        {option.arabic_label}
                      </span>
                    </MenuItem>
                  ))}
                />
                {/** Sponsor Number */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Sponsor Number")}
                  value={
                    hajEntries.new_sponsor_number
                      ? hajEntries.new_sponsor_number
                      : personInfo.sponsor_number
                  }
                  onChange={handleHajEntries("new_sponsor_number")}
                />
                {/** Cross with sponsor */}
                <Grid item xs={12} sm={3}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          color="primary"
                          checked={hajEntries.cross_with_sponsor || false}
                          onChange={handleCrossWithSponsor}
                        />
                      }
                      label={t("Crossing with sponsor")}
                    />
                  </FormGroup>
                </Grid>
              </Grid>
            </Grid>
          </Box>

          {/** Visa Info */}
          <Box my={2}>
            <Grid container spacing={3}>
              {/** Pilgrim Visa Info */}
              <Grid container item xs={12} spacing={1}>
                {/** Pilgrim ID */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Pilgrim ID")}
                  value={pilgrimInfo.pilgrim_id}
                />
                {/** Visa Number */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Visa Number")}
                  value={
                    hajEntries.new_visa_number
                      ? hajEntries.new_visa_number
                      : pilgrimPassport.visa_number
                  }
                  onChange={handleHajEntries("new_visa_number")}
                />
                {/** Visa Type */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Visa Type")}
                  value={pilgrimPassport.visa_type_title}
                />
                {/** Visa Issue Place */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Issue Place")}
                  value={
                    hajEntries.new_visa_issuance_place_code
                      ? hajEntries.new_visa_issuance_place_code
                      : pilgrimPassport.visa_issuance_place_code
                  }
                  onChange={handleHajEntries("new_visa_issuance_place_code")}
                  select={true}
                  children={pilgrimVisaIssuePlaces.map((option: LookupItem) => (
                    <MenuItem key={option.code} value={option.code}>
                      <b style={{ fontWeight: 600 }}>{option.code}</b>
                      <span style={{ margin: "0 8px" }}>
                        {option.arabic_label}
                      </span>
                    </MenuItem>
                  ))}
                />
                {/** Visa Issue Date */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Issue Date")}
                  value={
                    pilgrimPassport.visa_issuance_date?.gregorian_date || "-"
                  }
                />
                {/** Visa Expiry Date */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Expiry Date")}
                  value={
                    pilgrimPassport.visa_expiry_date?.gregorian_date || "-"
                  }
                />
                {/** GCC ID Number */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("GCC ID Number")}
                  value={
                    hajEntries.new_gcc_id
                      ? hajEntries.new_gcc_id
                      : pilgrimPassport.gcc_id_number
                  }
                  onChange={handleHajEntries("new_gcc_id")}
                />
                {/** Permit Number */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Permit Number")}
                  value={
                    hajEntries.new_permit_number
                      ? hajEntries.new_permit_number
                      : pilgrimPassport.permit_number
                  }
                  onChange={handleHajEntries("new_permit_number")}
                />
                {/** Permit Status */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Permit Status")}
                  value={pilgrimPassport.permit_status}
                />
                {/** Hajj Year */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Hajj Year")}
                  value={pilgrimVisaExtraInfo.hajj_year}
                />
                {/** Visa Fee Collected */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Fee Collected")}
                  value={
                    pilgrimVisaExtraInfo.fee_collected ? t("Yes") : t("No")
                  }
                />
                {/** Health Insurance Required */}
                <GridItem
                  xs={12}
                  sm={3}
                  label={t("Require Health Insurance")}
                  value={
                    pilgrimVisaExtraInfo.health_insurance_required
                      ? t("Yes")
                      : t("No")
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </Paper>
      ) : null}

      {/** Carrier List */}
      {state.documentValidationResponse.crossing_terminal_type === "AIR" &&
        flights?.length > 0 && (
          <Paper
            className={`${classes.paper} ${classes.tableContainer}`}
            variant="outlined"
          >
            <Typography variant="h6" className={classes.title}>
              {t("info->airFlights")}
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox"></TableCell>
                  <TableCell
                    classes={{ sizeSmall: classes.tableCellSizeSmall }}
                  >
                    {t("flights->carrier")}
                  </TableCell>
                  <TableCell align="left">
                    {t(`flights->${state.travelDirection}`)}
                  </TableCell>
                  <TableCell align="left">{t("flights->takeOff")}</TableCell>
                  <TableCell align="left">{t("flights->landing")}</TableCell>
                  <TableCell align="left">{t("flights->private")}</TableCell>
                  <TableCell align="left">
                    {t("flights->addedByOperator")}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flights.map((f: any, index: any) => {
                  let hasBusinessError = false;
                  let hasBusinessErrorText = "";
                  if (f.carrier_validation_response?.business_error) {
                    hasBusinessErrorText = `${t(
                      `errors:${f.carrier_validation_response.business_error.reason}`
                    )} (${
                      f.carrier_validation_response.business_error.error_code
                    })`;
                    hasBusinessError = true;
                  }

                  return (
                    <Tooltip
                      title={hasBusinessErrorText}
                      placement="top"
                      arrow
                      key={index}
                    >
                      <TableRow
                        hover
                        onClick={() => {
                          if (!hasBusinessError) {
                            handleFlightClick(f, index);
                          }
                        }}
                        selected={f === flight}
                      >
                        <TableCell
                          padding="checkbox"
                          className={
                            hasBusinessError
                              ? classes.flightWithError
                              : undefined
                          }
                        >
                          <Radio
                            color="primary"
                            size="small"
                            checked={f === flight}
                            inputRef={(ref) => {
                              radioBtnRefs.current[index] = ref;
                            }}
                            disabled={hasBusinessError}
                          />
                        </TableCell>
                        <TableCell
                          align="left"
                          classes={{ sizeSmall: classes.tableCellSizeSmall }}
                          className={
                            hasBusinessError
                              ? classes.flightWithError
                              : undefined
                          }
                        >{`${f.airline_english_name} ${f.airline_code}${f.flight_number}`}</TableCell>
                        <TableCell
                          align="left"
                          className={
                            hasBusinessError
                              ? classes.flightWithError
                              : undefined
                          }
                        >
                          {f.added
                            ? `${f.airport_country_arabic_name}`
                            : state.travelDirection ===
                              TravelDirection.DEPARTURE
                            ? `${f.arrival_airport_country_arabic_name} - ${f.arrival_airport_city_arabic_name}`
                            : `${f.departure_airport_country_arabic_name} - ${f.departure_airport_city_arabic_name}`}
                        </TableCell>
                        <TableCell
                          align="left"
                          className={
                            hasBusinessError
                              ? classes.flightWithError
                              : undefined
                          }
                        >
                          {f.added
                            ? "--"
                            : format(
                                new Date(
                                  f.scheduled_departure_datetime.gregorian_date
                                ),
                                "d MMMM y - h:mm aaaa",
                                { locale: arSA }
                              )}
                        </TableCell>
                        <TableCell
                          align="left"
                          className={
                            hasBusinessError
                              ? classes.flightWithError
                              : undefined
                          }
                        >
                          {f.added
                            ? "--"
                            : format(
                                new Date(
                                  f.scheduled_arrival_datetime.gregorian_date
                                ),
                                "d MMMM y - h:mm aaaa",
                                { locale: arSA }
                              )}
                        </TableCell>
                        <TableCell
                          align="left"
                          className={
                            hasBusinessError
                              ? classes.flightWithError
                              : undefined
                          }
                        >
                          {f.private_airline
                            ? t("common->yes")
                            : t("common->no")}
                        </TableCell>
                        <TableCell
                          align="left"
                          className={
                            hasBusinessError
                              ? classes.flightWithError
                              : undefined
                          }
                        >
                          {f.added ? t("common->yes") : t("common->no")}
                        </TableCell>
                      </TableRow>
                    </Tooltip>
                  );
                })}
              </TableBody>
            </Table>
          </Paper>
        )}
      {state.documentValidationResponse.crossing_terminal_type === "LAND" &&
        landCarrier !== null && (
          <Paper className={classes.paper} variant="outlined">
            <Typography variant="h6" color="primary" className={classes.title}>
              {t("travel->tripInfo")}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label={t("travel->transporter")}
                  type="text"
                  margin="dense"
                  value={landCarrier.transporter}
                  inputProps={{ maxLength: "100" }}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        )}
      {state.documentValidationResponse.crossing_terminal_type === "SEA" &&
        seaCarrier !== null && (
          <Paper className={classes.paper} variant="outlined">
            <Typography variant="h6" color="primary" className={classes.title}>
              {t("travel->tripInfo")}
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label={t("travel->transporter")}
                  type="text"
                  margin="dense"
                  value={`${seaCarrier.name}`}
                  inputProps={{ maxLength: "100" }}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label={t("travel->tripNumber")}
                  type="text"
                  margin="dense"
                  value={seaCarrier.journyNumber}
                  inputProps={{ maxLength: "100" }}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label={t("travel->destination")}
                  type="text"
                  margin="dense"
                  value={seaCarrier.destinationName}
                  inputProps={{ maxLength: "100" }}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Paper>
        )}

      {/** Add Flight Button */}
      {canAddCustomFlight ? (
        <Box display="flex">
          <Button
            color="primary"
            className={classes.addJournyBtn}
            startIcon={<AddIcon />}
            onClick={() => {
              addFlightBtnRef.current.blur();
              nextBtnRef.current.focus();
              setJournyDialogOpen(true);
            }}
            ref={addFlightBtnRef}
            disabled={state.personType === PersonType.PILGRIM}
          >
            {t("travel->newFlight")}
          </Button>
        </Box>
      ) : null}

      {/** Citizen Permit Info */}
      {state.travelDirection === TravelDirection.DEPARTURE && (
        <Accordion
          className={classes.expansionPanel}
          disabled={travelPermitCategory?.length === 0}
          TransitionProps={{ unmountOnExit: true }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" className={classes.title} align="center">
              {t("travel->permitInfo")}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label={t("permit->permitType")}
                  type="text"
                  margin="dense"
                  value={getPermit(travelPermitCategory)?.name}
                  inputProps={{ maxLength: "100" }}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              {permit?.permitType === "vacation" ? (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    label={t("permit->vacationNumber")}
                    type="text"
                    margin="dense"
                    value={permit?.data.vacation_number}
                    inputProps={{ maxLength: "100" }}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              ) : (
                <Grid item xs={12} sm={6} md={4} lg={3}>
                  <TextField
                    label={
                      permit?.permitType === "diplomat"
                        ? t("permit->visaNumber")
                        : t("permit->permitNumber")
                    }
                    type="text"
                    margin="dense"
                    value={
                      permit?.permitType === "diplomat"
                        ? permit?.data.visa_number
                        : permit?.data.permit_number
                    }
                    inputProps={{ maxLength: "100" }}
                    InputProps={{ readOnly: true }}
                    variant="outlined"
                    fullWidth
                  />
                </Grid>
              )}
              {permit?.permitType === "vacation" ? (
                <React.Fragment>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->vacationGerogianStartDate")}
                      type="text"
                      margin="dense"
                      value={permit?.data.start_date.gregorian_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->vacationGerogianEndDate")}
                      type="text"
                      margin="dense"
                      value={permit?.data.expiry_date.gregorian_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->vacationHijriStartDate")}
                      type="text"
                      margin="dense"
                      value={permit?.data.start_date.hijri_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->vacationHijriEndDate")}
                      type="text"
                      margin="dense"
                      value={permit?.data.expiry_date.hijri_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                </React.Fragment>
              ) : (
                <React.Fragment>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={
                        permit?.permitType === "diplomat"
                          ? t("permit->visaGerogianStartDate")
                          : t("permit->permitGerogianStartDate")
                      }
                      type="text"
                      margin="dense"
                      value={
                        permit?.permitType === "diplomat"
                          ? permit?.data.issuance_date.gregorian_date
                          : permit?.data.start_date.gregorian_date
                      }
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={
                        permit?.permitType === "diplomat"
                          ? t("permit->visaGerogianEndDate")
                          : t("permit->permitGerogianEndDate")
                      }
                      type="text"
                      margin="dense"
                      value={permit?.data.expiry_date.gregorian_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={
                        permit?.permitType === "diplomat"
                          ? t("permit->visaHijriStartDate")
                          : t("permit->permitHijriStartDate")
                      }
                      type="text"
                      margin="dense"
                      value={
                        permit?.permitType === "diplomat"
                          ? permit?.data.issuance_date.hijri_date
                          : permit?.data.start_date.hijri_date
                      }
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={
                        permit?.permitType === "diplomat"
                          ? t("permit->visaHijriEndDate")
                          : t("permit->permitHijriEndDate")
                      }
                      type="text"
                      margin="dense"
                      value={permit?.data.expiry_date.hijri_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                </React.Fragment>
              )}
              {permit?.permitType !== "vacation" && (
                <React.Fragment>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->permitUsage")}
                      type="text"
                      margin="dense"
                      value={permit?.permitUsage}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->permitUsageCounter")}
                      type="text"
                      margin="dense"
                      value={permit?.data.usage_counter}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                </React.Fragment>
              )}
              {permit?.permitType === "military" && (
                <React.Fragment>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->issuedFrom")}
                      type="text"
                      margin="dense"
                      value={`${permit?.data.issuer_sector_arabic_title.trim()} (${
                        permit?.data.issuer_sector_code
                      })`}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->permitApprovalGerogianDate")}
                      type="text"
                      margin="dense"
                      value={permit?.data.approved_date.gregorian_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->permitApprovalHijriDate")}
                      type="text"
                      margin="dense"
                      value={permit?.data.approved_date.hijri_date}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->permitCountries")}
                      type="text"
                      margin="dense"
                      value={permit?.data.authorized_countries
                        .map((c: any) =>
                          `${c.arabic_name} (${c.code})`.replace("  ", " ")
                        )
                        .join(" - ")}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                </React.Fragment>
              )}
              {permit?.permitType === "citizen" && (
                <React.Fragment>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->requesterName")}
                      type="text"
                      margin="dense"
                      value={permit?.requesterName}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <TextField
                      label={t("permit->requesterRelationship")}
                      type="text"
                      margin="dense"
                      value={`${permit?.data.requester_relationship_arabic_title} (${permit?.data.requester_relationship_code})`}
                      inputProps={{ maxLength: "100" }}
                      InputProps={{ readOnly: true }}
                      variant="outlined"
                      fullWidth
                    />
                  </Grid>
                </React.Fragment>
              )}
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <TextField
                  label={t("common->notes")}
                  type="text"
                  margin="dense"
                  value={permit?.data.remarks}
                  inputProps={{ maxLength: "100" }}
                  InputProps={{ readOnly: true }}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/** Actions (Next & Back) */}
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
            type="submit"
            ref={nextBtnRef}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              t("common->next")
            )}
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={handleBack}>
            {t("common->back")}
          </Button>
        </Grid>
      </Grid>

      {/** Warning Confirmation Dialog */}
      <WarningDialog
        warningDialogOpen={warningDialogOpen}
        setWarningDialogOpen={setWarningDialogOpen}
        selectedWarning={selectedWarning}
        setSelectedWarning={setSelectedWarning}
      />

      {/** Add Journey Dialog */}
      <AddJournyDialog
        journyDialogOpen={journyDialogOpen}
        setJournyDialogOpen={setJournyDialogOpen}
        type={state.documentValidationResponse.crossing_terminal_type}
        flights={flights}
        setFlights={setFlights}
        setSeaCarrier={setSeaCarrier}
        setLandCarrier={setLandCarrier}
        setFlight={setFlight}
        handleFlightClick={handleFlightClick}
        canAddPrivateFlight={canAddCustomPrivateFlight}
      />

      {/** Toast Notifications */}
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <Alert onClose={handleSnackbarClose} severity="warning">
          {snackbarText}
        </Alert>
      </Snackbar>
    </form>
  );
};

type GridItemProps = {
  xs: GridSize;
  sm?: GridSize;
  label: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children?: React.ReactElement[];
  select?: boolean;
};

const GridItem: React.FC<GridItemProps> = ({
  xs,
  sm = 6,
  label,
  value = "-",
  onChange,
  children,
  select,
}: GridItemProps) => (
  <Grid item xs={xs} sm={sm}>
    <TextInput
      select={select}
      label={label}
      value={value}
      onChange={onChange}
      children={children}
    />
  </Grid>
);

export default SecondStepCitizenCrossing;
