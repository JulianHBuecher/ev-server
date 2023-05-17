import { AuthorizationActions } from './Authorization';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import User from './User';

export default interface Reservation extends CreatedUpdatedProps {
  id: number;
  chargingStationId: string;
  connectorId: number;
  expiryDate: Date;
  tagId: string;
  parentTagId?: string;
  type?: string;
}

export interface ReservationTemplate extends CreatedUpdatedProps, AuthorizationActions {
  id: number;
  chargingStationId: string;
  connectorId: number;
  expiryDate: Date;
  tagId: string;
  parentTagId?: string;
  type: string;
}
