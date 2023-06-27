import { ReservationStatus, ReservationType } from '../Reservation';
import HttpByIDRequest from './HttpByIDRequest';
import HttpDatabaseRequest from './HttpDatabaseRequest';

export interface HttpReservationGetRequest extends HttpByIDRequest {
  ID: number;
}

export interface HttpReservationsGetRequest extends HttpDatabaseRequest {
  Search: string;
  ReservationID: string;
  ChargingStationID: string;
  ConnectorID: string;
  UserID: string;
  CarID: string;
  SiteID: string;
  SiteAreaID: string;
  CompanyID: string;
  StartDateTime: Date;
  EndDateTime: Date;
  Status: ReservationStatus;
  Type: ReservationType;
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
  visualTagID?: string;
  parentIdTag?: string;
  userID?: string;
  carID?: string;
  type: ReservationType;
  status: ReservationStatus;
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
  visualTagID?: string;
  parentIdTag?: string;
  userID?: string;
  carID?: string;
  type: ReservationType;
  status: ReservationStatus;
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
