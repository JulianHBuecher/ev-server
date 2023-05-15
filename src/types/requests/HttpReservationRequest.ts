import HttpDatabaseRequest from './HttpDatabaseRequest';
import User from '../User';

export interface HttpReservationRequest {
  chargingStationID?: string;
}

export interface HttpReservationGetRequest extends HttpReservationRequest, HttpDatabaseRequest {
  args: {
    id?: number;
    connectorId?: number;
  }
}

export interface HttpReservationUpdateRequest extends HttpReservationRequest {
  args: {
    id: number;
    user: User;
    chargeBoxId: string;
    connectorId: number;
    expiryDate: Date;
    tagId: string;
    parentTagId?: string;
  }
}

export interface HttpReservationCancelRequest extends HttpReservationRequest {
  args: {
    id: number;
    chargeBoxId: string;
    connectorId: number;
  }
}
