import React from "react";
export const INITIAL_PROJECT_STATE = {
  name: "",
  type: "",
  city: "",
  locality: "",
  landZone: "",
  commercialSubType: "",
};

export const INITIAL_PRICE_DETAILS = {
  expectedPrice: "",
  tokenAmount: "",
  priceNegotiable: false,
};

export const INITIAL_PROPERTY_FEATURES = {
  openSides: "",
  roadWidth: "",
  constructionDone: "",
  boundaryWall: "",
  gatedColony: "",
  totalFloor: "",
  parking: false,
  gym: false,
  swimmingPool: false,
  garden: false,
  gameZone: false,
  areaType: "Carpet Area",
  landArea: "",
  propertyStatus: "",
  possessionStatus: "",
  availableFromMonth: "",
  availableFromYear: "",
  currentlyLeasedOut: "No",
  assuredReturns: "No",
  expectedPrice: "",
  tokenAmount: "",
  hasOuthouse: "No",
  outhouseArea: "",
  newFacility: "",
  furnishedStatus: "Unfurnished",
  facilities: [],
  bookTitle: "",
  totalRooms: "",
  roomAreas: [],
  personalWashroom: "No",
  personalWashroomArea: "",
  pantryCafeteria: "Not Available",
  washrooms: "",
  washroomAreas: [],
};

export const INITIAL_AREA_DETAILS = {
  plotArea: "",
  plotLength: "",
  plotBreadth: "",
  carpetArea: "",
  builtUpArea: "",
  superBuiltUpArea: "",
  constructionArea: "",
  landArea: "",
  availableFromMonth: "",
  availableFromYear: "",
};

export const INITIAL_MAIN_INFO = {
  facing: "",
  individualBoundary: false,
  landArea: "",
  totalBuiltUpArea: "",
  groundFloorArea: "",
  firstFloorArea: "",
  secondFloorArea: "",
  staircaseArea: "",
};

export const INITIAL_FLOOR_DETAILS = {
  totalBedrooms: "",
  bedroomArea: "",
  totalBathrooms: "",
  bathroomArea: "",
  studyRoom: "",
  studyRoomArea: "",
  balcony: "",
  balconyArea: "",
  kitchen: "No",
  garage: "No",
  livingArea: "",
  diningArea: "",
  additionalNotes: "",
};

export const INITIAL_APPROVAL_STATUS = [
  { authority: "", status: "" },
  { authority: "", status: "" },
];

export const INITIAL_TRANSACTION_TYPE = {
  possessionStatus: "",
  availableFrom: { month: "", year: "" },
  availableFromMonth: "",
  availableFromYear: "",
  currentlyLeasedOut: "No",
  assuredReturns: "No",
};
