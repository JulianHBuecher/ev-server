import { AuthorizationActions } from './Authorization';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import { OCPPReservationStatus } from './ocpp/OCPPClient';

export default interface Reservation extends CreatedUpdatedProps, AuthorizationActions {
  id: number;
  chargingStationID: string;
  connectorID: number;
  fromDate?: Date;
  toDate?: Date;
  expiryDate?: Date;
  arrivalTime?: Date;
  idTag: string;
  parentIdTag?: string;
  userID?: string;
  carID?: string;
  siteID?: string;
  siteAreaID?: string;
  companyID?: string;
  type: ReservationType;
  status: OCPPReservationStatus;
}

export interface ReservationTemplate extends CreatedUpdatedProps, AuthorizationActions {
  id: number;
  chargingStationID: string;
  connectorID: number;
  expiryDate: Date;
  idTag: string;
  parentIdTag?: string;
  type: string;
}

export enum ReservationType {
  PLANNED = 'planned_reservation',
  NOW = 'reserve_now',
}
