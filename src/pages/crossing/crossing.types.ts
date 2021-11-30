export enum DocumentType {
  "ID" = "ID",
  "PASSPORT" = "PASSPORT",
  "GCC_ID_CARD" = "GCC_ID_CARD",
  "VISA" = "VISA",
}

export enum PersonType {
  "CITIZEN" = "CITIZEN",
  "RESIDENT" = "RESIDENT",
  "VISITOR" = "VISITOR",
  "PILGRIM" = "PILGRIM",
}

export enum TravelDirection {
  "ARRIVAL" = "ARRIVAL",
  "DEPARTURE" = "DEPARTURE",
}

export enum VisitorInfoSource {
  "MOFA_RECORD" = "MOFA_RECORD",
  "EXCHANGED_RECORD" = "EXCHANGED_RECORD",
  "NIC_RECORD" = "NIC_RECORD",
  "NEW_RECORD_WITHOUT_VISA" = "NEW_RECORD_WITHOUT_VISA",
}

export type Dependant = {
  firstName?: string;
  fatherName?: string;
  grandfatherName?: string;
  familyName?: string;
  birthdate?: string;
  gender?: "MALE" | "FEMALE";
};

export type VisitorOperatorEntry = {
  infoSource: keyof typeof VisitorInfoSource;
  selectedNICRecord?: number;
  newArabicFirstName?: string;
  newArabicFatherName?: string;
  newArabicGrandfatherName?: string;
  newArabicFamilyName?: string;
  newEnglishFirstName?: string;
  newEnglishFatherName?: string;
  newEnglishGrandfatherName?: string;
  newEnglishFamilyName?: string;
  newGender?: "MALE" | "FEMALE";
  newReligionCode?: number;
  newBirthdate?: string;
  newBirthPlace?: string;
  newBirthCountryCode?: number;
  newDocumentNumber?: string;
  newDocumentType?: keyof typeof DocumentType;
  newPassportTypeCode?: number;
  newDocumentIssuePlace?: string;
  newDocumentIssuanceDate?: string;
  newDocumentExpiryDate?: string;
  newMoiOrderNumber?: string;
  newSponsorNumber?: string;
  newSponsorNameOrAddress?: string;
  newOmrahPermitNumber?: string;
  dependantInfoList?: Dependant[];
  deadTravelerDeparture?: boolean;
  travelerToBeBuriedOutsideKingdom?: boolean;
  selectedSpecialPermit?: number;
  entryVisaSpecialIdentityCode?: number;
};

type CitizenOperatorEntry = {
  deadTraveler?: boolean;
  buriedOutsideKingdom?: boolean;
  dependantArrivedWithoutGuardian?: boolean;
  passingNumber?: string;
};

export type OmrahAgent = {
  permit_number: number;
  owner_id: string;
  agent_name: string;
};

export type CrossingState = {
  travelDirection: keyof typeof TravelDirection;
  documentType: keyof typeof DocumentType;
  personType: keyof typeof PersonType;
  documentNumber: string;
  documentVersion: string;
  birthdate: string;
  nationality: string;
  passportType: string;
  crewMember: boolean;
  visitorOperatorEntry: VisitorOperatorEntry | null;
  citizenOperatorEntry: CitizenOperatorEntry | null;
  documentValidationResponse: any;
  documentValidationResponseSignature: string | null;
  carrierValidationResponse: any;
  carrierValidationResponseSignature: string | null;
  operatorEntryValidationResponse: any;
  operatorEntryValidationResponseSignature: string | null;
  documentValidationWarnings: any[];
  carrierValidationWarnings: any[];
  verificationResponse: any;
  verificationResponseSignature: string | null;
  warningsCount: number;
  expectedFlight: string | null;
  selectedFlight: any;
  verifyingAndCrossing: boolean;
  doCrossing: boolean;
};
