import fs from 'fs';
import global from '../../../../types/GlobalType';
import Reservation from '../../../../types/Reservation';
import { HttpReservationCancelRequest, HttpReservationGetRequest, HttpReservationUpdateRequest } from '../../../../types/requests/HttpReservationRequest';
import Schema from '../../../../types/validator/Schema';
import SchemaValidator from '../../../../validator/SchemaValidator';

export default class ReservationValidatorRest extends SchemaValidator {
  private static instance: ReservationValidatorRest | null = null;
  private reservationGet: Schema = JSON.parse(fs.readFileSync(`${global.appRoot}/assets/server/rest/v1/schemas/reservation/reservation-get.json`,'utf-8'));
  private reservationCreate: Schema = JSON.parse(fs.readFileSync(`${global.appRoot}/assets/server/rest/v1/schemas/reservation/reservation-create.json`,'utf-8'));
  private reservationUpdate: Schema = JSON.parse(fs.readFileSync(`${global.appRoot}/assets/server/rest/v1/schemas/reservation/reservation-update.json`,'utf-8'));
  private reservationCancel: Schema = JSON.parse(fs.readFileSync(`${global.appRoot}/assets/server/rest/v1/schemas/reservation/reservation-cancel.json`,'utf-8'));

  private constructor() {
    super('ReservationValidatorRest');
  }

  public static getInstance(): ReservationValidatorRest {
    if (!ReservationValidatorRest.instance) {
      ReservationValidatorRest.instance = new ReservationValidatorRest();
    }
    return ReservationValidatorRest.instance;
  }

  public validateReservationGetReq(data: Record<string, unknown>): HttpReservationGetRequest {
    return this.validate(this.reservationGet, data);
  }

  public validateReservationCreateReq(data: Reservation): Reservation {
    return this.validate(this.reservationCreate, data);
  }

  public validateReservationUpdateReq(data: Record<string, unknown>): HttpReservationUpdateRequest {
    return this.validate(this.reservationUpdate, data);
  }

  public validateReservationCancelReq(data: Record<string, unknown>): HttpReservationCancelRequest {
    return this.validate(this.reservationCancel, data);
  }
}
