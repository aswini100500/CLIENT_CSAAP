import React from "react";
import { FaCar, FaUsers, FaSwimmingPool, FaTree } from "react-icons/fa";

export const PROJECT_TYPES = {
  PLOTTING: "plotting",
  DUPLEX: "duplex",
  TRIPLEX: "triplex",
  APARTMENT: "apartment",
  COMMERCIAL: "commercial",
  CUSTOM: "custom",
};

export const COMMERCIAL_TYPES = [
  "office space",
  "shop",
  "showroom",
  "land",
  "godown",
];

export const BROKER_LIST = [
  { id: 1, name: "John Smith", phone: "+1 (555) 123-4567" },
  { id: 2, name: "Emma Johnson", phone: "+1 (555) 234-5678" },
  { id: 3, name: "Michael Williams", phone: "+1 (555) 345-6789" },
  { id: 4, name: "Sarah Brown", phone: "+1 (555) 456-7890" },
  { id: 5, name: "David Jones", phone: "+1 (555) 567-8901" },
];

export const FACILITIES = [
  { key: "parking", label: "Car Parking", icon: FaCar },
  { key: "gym", label: "Gym", icon: FaUsers },
  { key: "swimmingPool", label: "Swimming Pool", icon: FaSwimmingPool },
  { key: "garden", label: "Garden", icon: FaTree },
  { key: "gameZone", label: "Game Zone", icon: FaUsers },
];

export const FACING_OPTIONS = [
  "North",
  "South",
  "East",
  "West",
  "North-East",
  "North-West",
  "South-East",
  "South-West",
];
