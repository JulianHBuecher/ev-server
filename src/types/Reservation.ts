import { AuthorizationActions } from './Authorization';
import CreatedUpdatedProps from './CreatedUpdatedProps';
import User from './User';

export default interface Reservation extends CreatedUpdatedProps {
  id: number;
  user: User;
  chargeBoxId: string;
  connectorId: number;
  expiryDate: Date;
  tagId: string;
  parentTagId?: string;
}

export interface ReservationTemplate extends CreatedUpdatedProps, AuthorizationActions {
  id: number;
  user: User;
  chargeBoxId: string;
  connectorId: number;
  expiryDate: Date;
  tagId: string;
  parentTagId?: string;
}
