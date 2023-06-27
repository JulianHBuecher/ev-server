import { ReservationAuthorizationActions } from './Authorization';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { ImportStatus } from './GlobalType';

export default interface Reservation extends CreatedUpdatedProps, ReservationAuthorizationActions {
  id: number;
  chargingStationID: string;
  connectorID: number;
  fromDate?: Date;
  toDate?: Date;
  expiryDate?: Date;
  arrivalTime?: Date;
  idTag: string;
  parentIdTag?: string;
  carID?: string;
  type: ReservationType;
  status: ReservationStatus;
}

export interface ImportedReservation {
  id: number;
  chargingStationID: string;
  connectorID: number;
  importedBy?: string;
  importedOn?: Date;
  status?: ImportStatus;
  errorDescription?: string;
  fromDate: Date;
  toDate: Date;
  expiryDate: Date;
  arrivalTime?: Date;
  idTag: string;
  parentIdTag?: string;
  carID?: string;
  type: ReservationType;
  importedData?: {
    autoActivateReservationAtImport: boolean;
  };
}

export enum ReservationStatus {
  DONE = 'reservation_done',
  SCHEDULED = 'reservation_scheduled',
  IN_PROGRESS = 'reservation_in_progress',
  CANCELLED = 'reservation_cancelled',
  INACTIVE = 'reservation_inactive',
  EXPIRED = 'reservation_expired',
}

export enum ReservationType {
  PLANNED_RESERVATION = 'planned_reservation',
  RESERVE_NOW = 'reserve_now',
}
