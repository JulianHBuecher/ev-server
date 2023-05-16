import HttpDatabaseRequest from './HttpDatabaseRequest';
import User from '../User';

export interface HttpReservationRequest {
  chargingStationId?: string;
}

export interface HttpReservationGetRequest extends HttpReservationRequest, HttpDatabaseRequest {
  args: {
    id?: number;
    connectorId?: number;
  }
}

export interface HttpReservationsGetRequest extends HttpDatabaseRequest {
  chargingStationIds?: string;
  connectorIds?: string;
  reservationIds?: string;
}

export interface HttpReservationUpdateRequest extends HttpReservationRequest {
  args: {
    id: number;
    user: User;
    expiryDate: Date;
    chargingStationId: string;
    connectorId: number;
    tagId: string;
    parentTagId?: string;
  }
}

export interface HttpReservationCancelRequest extends HttpReservationRequest {
  args: {
    id: number;
    chargingStationId: string;
    connectorId: number;
  }
}
