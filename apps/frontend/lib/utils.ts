import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RegistrationStatus, RegistrationReason } from "@packages/shared-types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const registrationStatusValues = Object.values(RegistrationStatus) as string[];

/**
 * Safely parse a string to RegistrationStatus with fallback to DRAFT.
 */
export function parseRegistrationStatus(value: string): RegistrationStatus {
  if (registrationStatusValues.includes(value)) {
    return value as RegistrationStatus;
  }
  return RegistrationStatus.DRAFT;
}

const registrationReasonValues = Object.values(RegistrationReason) as string[];

/**
 * Safely parse a string to RegistrationReason with fallback to NEW_PLAYER.
 */
export function parseRegistrationReason(value: string): RegistrationReason {
  if (registrationReasonValues.includes(value)) {
    return value as RegistrationReason;
  }
  return RegistrationReason.NEW_PLAYER;
}
