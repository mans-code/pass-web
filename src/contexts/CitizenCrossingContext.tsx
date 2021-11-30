import createCtx from "../utils/createCtx-useReducer";

/**
 * document: {
 *  type: string,
 *  number: string
 *  version?: number
 *  validationResponse: {}
 *  validationReponseSignature: string
 *  validationWarnings: []
 * }
 *
 * carrier: {
 *  validationResponse: {}
 *  validationResponseSignature: string
 *  validationWarnings: []
 * }
 *
 * expectedFlight
 */
const initialState = {
  documentType: "PASSPORT",
  documentNumber: "",
  documentVersion: "",
  documentValidationResponse: {} as any,
  documentValidationResponseSignature: "",
  carrierValidationResponse: {} as any,
  carrierValidationResponseSignature: "",
  documentValidationWarnings: [] as any[],
  // expectedFlightsWarnings: [] as any[],
  carrierValidationWarnings: [] as any[],
  verificationResponse: {} as any,
  verificationResponseSignature: "",
  warningsCount: 0,
  expectedFlight: "",
  selectedFlight: null as any,
  passingNumber: "",
  travelDirection: "",
  dependantWithoutGuardian: false,
  deadTraveler: false,
  buriedOutside: true,
  verifyingAndCrossing: false,
  doCrossing: false,
};

type CitizenCrossingState = typeof initialState;
type Action =
  | { type: "setDocumentType"; payload: string }
  | { type: "setDocumentNumber"; payload: string }
  | { type: "setDocumentVersion"; payload: string }
  | { type: "setDocumentValidationResponse"; payload: object }
  | { type: "setDocumentValidationResponseSignature"; payload: string }
  | { type: "setCarrierValidationResponse"; payload: object }
  | { type: "setCarrierValidationResponseSignature"; payload: string }
  | { type: "setDocumentValidationWarnings"; payload: any[] }
  // | { type: "setExpectedFlightsWarnings"; payload: any[] }
  | { type: "setCarrierValidationWarnings"; payload: any[] }
  | { type: "setWarningsCount"; payload: number }
  | { type: "setExpectedFlight"; payload: string }
  | { type: "setPassingNumber"; payload: string }
  | { type: "setTravelDirection"; payload: string }
  | { type: "setDependantWithoutGuardian"; payload: boolean }
  | { type: "setDeadTraveler"; payload: boolean }
  | { type: "setBuriedOutside"; payload: boolean }
  | { type: "resetState"; payload: string }
  | { type: "setVerificationResponse"; payload: object }
  | { type: "setVerificationResponseSignature"; payload: string }
  | { type: "setVerifyingAndCrossing"; payload: boolean }
  | { type: "doCrossing"; payload: boolean }
  | { type: "setSelectedFlight"; payload: object };

function reducer(
  state: CitizenCrossingState,
  action: Action
): CitizenCrossingState {
  switch (action.type) {
    case "setDocumentType":
      return { ...state, documentType: action.payload };
    case "setDocumentNumber":
      return { ...state, documentNumber: action.payload };
    case "setDocumentVersion":
      return { ...state, documentVersion: action.payload };
    case "setDocumentValidationResponse":
      return { ...state, documentValidationResponse: action.payload };
    case "setDocumentValidationResponseSignature":
      return { ...state, documentValidationResponseSignature: action.payload };
    case "setVerificationResponse":
      return { ...state, verificationResponse: action.payload };
    case "setVerificationResponseSignature":
      return { ...state, verificationResponseSignature: action.payload };
    case "setCarrierValidationResponse":
      return { ...state, carrierValidationResponse: action.payload };
    case "setCarrierValidationResponseSignature":
      return { ...state, carrierValidationResponseSignature: action.payload };
    case "setDocumentValidationWarnings":
      return { ...state, documentValidationWarnings: action.payload };
    // case "setExpectedFlightsWarnings":
    // 	return { ...state, expectedFlightsWarnings: action.payload };
    case "setCarrierValidationWarnings":
      return { ...state, carrierValidationWarnings: action.payload };
    case "setWarningsCount":
      return { ...state, warningsCount: action.payload };
    case "setExpectedFlight":
      return { ...state, expectedFlight: action.payload };
    case "setPassingNumber":
      return { ...state, passingNumber: action.payload };
    case "setTravelDirection":
      return { ...state, travelDirection: action.payload };
    case "setDependantWithoutGuardian":
      return { ...state, dependantWithoutGuardian: action.payload };
    case "setDeadTraveler":
      return { ...state, deadTraveler: action.payload };
    case "setBuriedOutside":
      return { ...state, buriedOutside: action.payload };
    case "setVerifyingAndCrossing":
      return { ...state, verifyingAndCrossing: action.payload };
    case "setSelectedFlight":
      return { ...state, selectedFlight: action.payload };
    case "doCrossing":
      return { ...state, doCrossing: action.payload };
    case "resetState":
      return { ...initialState, travelDirection: action.payload };
    default:
      return state;
  }
}

const [CitizenCrossingContext, CitizenCrossingProvider] = createCtx(
  reducer,
  initialState
);

export { CitizenCrossingContext, CitizenCrossingProvider };
