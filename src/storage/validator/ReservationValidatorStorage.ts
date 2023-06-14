import fs from 'fs';
import global from '../../types/GlobalType';
import { ReservationTemplate } from '../../types/Reservation';
import Schema from '../../types/validator/Schema';
import SchemaValidator from '../../validator/SchemaValidator';

export default class ReservationValidatorStorage extends SchemaValidator {
  private static instance: ReservationValidatorStorage | null = null;
  private reservationTemplateSave: Schema = JSON.parse(
    fs.readFileSync(
      `${global.appRoot}/assets/schemas/reservation/reservation-template-save.json`,
      'utf-8'
    )
  );

  private constructor() {
    super(ReservationValidatorStorage.name);
  }

  public static getInstance(): ReservationValidatorStorage {
    if (!ReservationValidatorStorage.instance) {
      ReservationValidatorStorage.instance = new ReservationValidatorStorage();
    }
    return ReservationValidatorStorage.instance;
  }

  public validateReservationTemplateSave(data: any): ReservationTemplate {
    return this.validate(this.reservationTemplateSave, data);
  }
}
