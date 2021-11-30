import createCtx from "utils/createCtx-useReducer";
import {
  CrossingState,
  DocumentType,
  PersonType,
  TravelDirection,
} from "./crossing.types";

const initialState: CrossingState = {
  travelDirection: TravelDirection.ARRIVAL,
  documentType: DocumentType.PASSPORT,
  personType: PersonType.CITIZEN,
  documentNumber: "",
  documentVersion: "",
  birthdate: "",
  nationality: "",
  passportType: "",
  crewMember: false,
  citizenOperatorEntry: null,
  visitorOperatorEntry: null,
  documentValidationResponse: {},
  documentValidationResponseSignature: null,
  carrierValidationResponse: {},
  carrierValidationResponseSignature: null,
  operatorEntryValidationResponse: {},
  operatorEntryValidationResponseSignature: null,
  documentValidationWarnings: [],
  carrierValidationWarnings: [],
  verificationResponse: {},
  verificationResponseSignature: null,
  warningsCount: 0,
  expectedFlight: null,
  selectedFlight: null,
  verifyingAndCrossing: false,
  doCrossing: false,
};

export enum ActionType {
  "setDocumentType" = "setDocumentType",
  "setPersonType" = "setPersonType",
  "setDocumentNumber" = "setDocumentNumber",
  "setDocumentVersion" = "setDocumentVersion",
  "setBirthdate" = "setBirthdate",
  "setNationality" = "setNationality",
  "setPassportType" = "setPassportType",
  "setCrewMember" = "setCrewMember",
  "setDocumentValidationResponse" = "setDocumentValidationResponse",
  "setDocumentValidationResponseSignature" = "setDocumentValidationResponseSignature",
  "setCarrierValidationResponse" = "setCarrierValidationResponse",
  "setCarrierValidationResponseSignature" = "setCarrierValidationResponseSignature",
  "setOperatorEntryValidationResponse" = "setOperatorEntryValidationResponse",
  "setOperatorEntryValidationResponseSignature" = "setOperatorEntryValidationResponseSignature",
  "setDocumentValidationWarnings" = "setDocumentValidationWarnings",
  "setCarrierValidationWarnings" = "setCarrierValidationWarnings",
  "setWarningsCount" = "setWarningsCount",
  "setExpectedFlight" = "setExpectedFlight",
  "setPassingNumber" = "setPassingNumber",
  "setTravelDirection" = "setTravelDirection",
  "setDependantWithoutGuardian" = "setDependantWithoutGuardian",
  "setDeadTraveler" = "setDeadTraveler",
  "setBuriedOutside" = "setBuriedOutside",
  "resetState" = "resetState",
  "setVerificationResponse" = "setVerificationResponse",
  "setVerificationResponseSignature" = "setVerificationResponseSignature",
  "setVerifyingAndCrossing" = "setVerifyingAndCrossing",
  "doCrossing" = "doCrossing",
  "setSelectedFlight" = "setSelectedFlight",
}

type Action =
  | { type: ActionType.setDocumentType; payload: keyof typeof DocumentType }
  | { type: ActionType.setPersonType; payload: keyof typeof PersonType }
  | { type: ActionType.setDocumentNumber; payload: string }
  | { type: ActionType.setDocumentVersion; payload: string }
  | { type: ActionType.setBirthdate; payload: string }
  | { type: ActionType.setNationality; payload: string }
  | { type: ActionType.setPassportType; payload: string }
  | { type: ActionType.setCrewMember; payload: boolean }
  | { type: ActionType.setDocumentValidationResponse; payload: object }
  | {
      type: ActionType.setDocumentValidationResponseSignature;
      payload: string | null;
    }
  | { type: ActionType.setCarrierValidationResponse; payload: object }
  | {
      type: ActionType.setCarrierValidationResponseSignature;
      payload: string | null;
    }
  | { type: ActionType.setOperatorEntryValidationResponse; payload: object }
  | {
      type: ActionType.setOperatorEntryValidationResponseSignature;
      payload: string | null;
    }
  | { type: ActionType.setDocumentValidationWarnings; payload: any[] }
  | { type: ActionType.setCarrierValidationWarnings; payload: any[] }
  | { type: ActionType.setWarningsCount; payload: number }
  | { type: ActionType.setExpectedFlight; payload: string }
  | { type: ActionType.setPassingNumber; payload: string }
  | {
      type: ActionType.setTravelDirection;
      payload: keyof typeof TravelDirection;
    }
  | { type: ActionType.setDependantWithoutGuardian; payload: boolean }
  | { type: ActionType.setDeadTraveler; payload: boolean }
  | { type: ActionType.setBuriedOutside; payload: boolean }
  | { type: ActionType.resetState; payload: keyof typeof TravelDirection }
  | { type: ActionType.setVerificationResponse; payload: object }
  | {
      type: ActionType.setVerificationResponseSignature;
      payload: string | null;
    }
  | { type: ActionType.setVerifyingAndCrossing; payload: boolean }
  | { type: ActionType.doCrossing; payload: boolean }
  | { type: ActionType.setSelectedFlight; payload: object };

function reducer(state: CrossingState, action: Action): CrossingState {
  switch (action.type) {
    case ActionType.setDocumentType:
      return { ...state, documentType: action.payload };
    case ActionType.setPersonType:
      return { ...state, personType: action.payload };
    case ActionType.setDocumentNumber:
      return { ...state, documentNumber: action.payload };
    case ActionType.setDocumentVersion:
      return { ...state, documentVersion: action.payload };
    case ActionType.setBirthdate:
      return { ...state, birthdate: action.payload };
    case ActionType.setNationality:
      return { ...state, nationality: action.payload };
    case ActionType.setPassportType:
      return { ...state, passportType: action.payload };
    case ActionType.setCrewMember:
      return { ...state, crewMember: action.payload };
    case ActionType.setDocumentValidationResponse:
      return { ...state, documentValidationResponse: action.payload };
    case ActionType.setDocumentValidationResponseSignature:
      return { ...state, documentValidationResponseSignature: action.payload };
    case ActionType.setVerificationResponse:
      return { ...state, verificationResponse: action.payload };
    case ActionType.setVerificationResponseSignature:
      return { ...state, verificationResponseSignature: action.payload };
    case ActionType.setCarrierValidationResponse:
      return { ...state, carrierValidationResponse: action.payload };
    case ActionType.setCarrierValidationResponseSignature:
      return { ...state, carrierValidationResponseSignature: action.payload };
    case ActionType.setOperatorEntryValidationResponse:
      return { ...state, operatorEntryValidationResponse: action.payload };
    case ActionType.setOperatorEntryValidationResponseSignature:
      return {
        ...state,
        operatorEntryValidationResponseSignature: action.payload,
      };
    case ActionType.setDocumentValidationWarnings:
      return { ...state, documentValidationWarnings: action.payload };
    case ActionType.setCarrierValidationWarnings:
      return { ...state, carrierValidationWarnings: action.payload };
    case ActionType.setWarningsCount:
      return { ...state, warningsCount: action.payload };
    case ActionType.setExpectedFlight:
      return { ...state, expectedFlight: action.payload };
    case ActionType.setPassingNumber:
      return {
        ...state,
        citizenOperatorEntry: {
          ...state.citizenOperatorEntry,
          passingNumber: action.payload,
        },
      };
    case ActionType.setTravelDirection:
      return { ...state, travelDirection: action.payload };
    case ActionType.setDependantWithoutGuardian:
      return {
        ...state,
        citizenOperatorEntry: {
          ...state.citizenOperatorEntry,
          dependantArrivedWithoutGuardian: action.payload,
        },
      };
    case ActionType.setDeadTraveler:
      return {
        ...state,
        citizenOperatorEntry: {
          ...state.citizenOperatorEntry,
          deadTraveler: action.payload,
        },
      };
    case ActionType.setBuriedOutside:
      return {
        ...state,
        citizenOperatorEntry: {
          ...state.citizenOperatorEntry,
          buriedOutsideKingdom: action.payload,
        },
      };
    case ActionType.setVerifyingAndCrossing:
      return { ...state, verifyingAndCrossing: action.payload };
    case ActionType.setSelectedFlight:
      return { ...state, selectedFlight: action.payload };
    case ActionType.doCrossing:
      return { ...state, doCrossing: action.payload };
    case ActionType.resetState:
      return {
        ...initialState,
        travelDirection: action.payload,
        documentType: state.documentType,
        personType: state.personType,
        nationality:
          state.personType === PersonType.CITIZEN ? state.nationality : "",
      };
    default:
      return state;
  }
}

const [CrossingContext, CrossingProvider] = createCtx(reducer, initialState);

export { CrossingContext, CrossingProvider };
