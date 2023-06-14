import { OCPPReservationStatus } from '../ocpp/OCPPClient';
import { ReservationType } from '../Reservation';
import HttpByIDRequest from './HttpByIDRequest';
import HttpDatabaseRequest from './HttpDatabaseRequest';

export interface HttpReservationGetRequest extends HttpByIDRequest {
  ID: number;
}

export interface HttpReservationsGetRequest extends HttpDatabaseRequest {
  Search: string;
  WithUser: boolean;
  WithChargingStation: boolean;
  WithCar: boolean;
  WithTag: boolean;
  WithCompany: boolean;
  WithSite: boolean;
  WithSiteArea: boolean;
}

export interface HttpReservationCreateRequest {
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

export interface HttpReservationUpdateRequest {
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

export interface HttpReservationDeleteRequest {
  ID: number;
}

export interface HttpReservationCancelRequest {
  ID: number;
  args: {
    chargingStationID: string;
    connectorID: number;
  };
}
