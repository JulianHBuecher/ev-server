import { Filter, Sort } from 'mongodb';
import { ReservationDataResult } from '../../types/DataResult';
import global from '../../types/GlobalType';
import Reservation from '../../types/Reservation';
import Tenant from '../../types/Tenant';
import DbParams from '../../types/database/DbParams';
import Logging from '../../utils/Logging';
import Utils from '../../utils/Utils';
import ReservationValidatorStorage from '../validator/ReservationValidatorStorage';
import DatabaseUtils from './DatabaseUtils';

const MODULE_NAME = 'ReservationStorage';
const COLLECTION_NAME = 'reservations';

export default class ReservationStorage {

  public static async getReservationById(tenant: Tenant, reservationId: number,
      connectorId?: number, chargeBoxId?: string): Promise<Reservation> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.getReservationById.name;
    DatabaseUtils.checkTenantObject(tenant);
    const filter: Filter<Reservation> = {};
    filter.id = reservationId;
    if (!Utils.isNullOrUndefined(connectorId)) {
      filter.connectorId = connectorId;
    }
    if (!Utils.isNullOrUndefined(chargeBoxId)) {
      filter.chargeBoxId = chargeBoxId;
    }
    const reservation = await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .findOne(filter);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservation);
    return reservation;
  }

  public static async getReservations(tenant: Tenant,
      params: { reservationIds?: number[]; chargingStationIDs?: string[]; connectorID?: number; } = {},
      dbParams: DbParams): Promise<ReservationDataResult> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.getReservations.name;
    DatabaseUtils.checkTenantObject(tenant);

    dbParams = Utils.cloneObject(dbParams);
    dbParams.limit = Utils.checkRecordLimit(dbParams.limit);
    dbParams.skip = Utils.checkRecordSkip(dbParams.skip);

    const filter: Filter<Reservation> = {};
    if (params.reservationIds) {
      filter.id = { $in: params.reservationIds };
    } else {
      if (params.chargingStationIDs) {
        filter.chargeBoxId = { $in: params.chargingStationIDs };
      }
      if (params.connectorID) {
        filter.connectorId = params.connectorID;
      }
    }
    const reservationsCount = await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .countDocuments();
    if (dbParams.onlyRecordCount) {
      await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationsCount);
      return {
        count: reservationsCount,
        result: []
      };
    }
    const reservations = await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .find()
      .sort(dbParams.sort as Sort)
      .limit(dbParams.limit)
      .skip(dbParams.skip)
      .toArray();
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservations);
    return {
      count: reservations.length,
      result: reservations
    };
  }

  public static async createReservation(tenant: Tenant, reservationToSave: Reservation): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.createReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    ReservationValidatorStorage.getInstance().validateReservationTemplateSave(reservationToSave);
    // Check if reservation already exists
    const reservation = await this.doesReservationExist(tenant,reservationToSave);
    if (!reservation) {
      await global.database.getCollection<Reservation>(tenant.id, COLLECTION_NAME).insertOne(reservationToSave);
    } else {
      await this.updateReservation(tenant, reservationToSave);
    }
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationToSave);
  }

  public static async createReservations(tenant: Tenant, reservationsToSave: Reservation[]): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.createReservations.name;
    DatabaseUtils.checkTenantObject(tenant);
    reservationsToSave.forEach((reservation) => {
      ReservationValidatorStorage.getInstance().validateReservationTemplateSave(reservation);
    });
    await global.database.getCollection<Reservation>(tenant.id, COLLECTION_NAME).insertMany(reservationsToSave);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationsToSave);
  }

  public static async updateReservation(tenant: Tenant, reservationToUpdate: Reservation): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.updateReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    const filter: Filter<Reservation> = {};
    filter.id = reservationToUpdate.id;
    ReservationValidatorStorage.getInstance().validateReservationTemplateSave(reservationToUpdate);
    await global.database.getCollection<Reservation>(tenant.id, COLLECTION_NAME).findOneAndReplace(filter, reservationToUpdate);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationToUpdate);
  }

  public static async updateReservations(tenant: Tenant, reservationsToUpdate: Reservation[]): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.updateReservations.name;
    DatabaseUtils.checkTenantObject(tenant);
    for (const reservation of reservationsToUpdate) {
      await this.updateReservation(tenant, reservation);
    }
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationsToUpdate);
  }

  public static async deleteReservation(tenant: Tenant, reservationToDelete: Reservation): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.deleteReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    ReservationValidatorStorage.getInstance().validateReservationTemplateSave(reservationToDelete);
    await global.database.getCollection<Reservation>(tenant.id, COLLECTION_NAME).findOneAndDelete(reservationToDelete);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationToDelete);
  }

  public static async deleteReservationById(tenant: Tenant, reservationId: number, chargeBoxId?: string): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.deleteReservationById.name;
    DatabaseUtils.checkTenantObject(tenant);
    const filter: Filter<Reservation> = { id: reservationId };
    if (!Utils.isNullOrUndefined(chargeBoxId)) {
      filter.chargeBoxId = chargeBoxId;
    }
    await global.database.getCollection<Reservation>(tenant.id, COLLECTION_NAME).deleteOne(filter);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationId);
  }

  public static async deleteReservations(tenant: Tenant, reservationsToDelete: Reservation[]): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.deleteReservations.name;
    DatabaseUtils.checkTenantObject(tenant);
    reservationsToDelete.forEach((reservation) => {
      ReservationValidatorStorage.getInstance().validateReservationTemplateSave(reservation);
    });
    const filter: Filter<Reservation> = { id: { $in: reservationsToDelete.map((r) => r.id) } };
    await global.database.getCollection<Reservation>(tenant.id, COLLECTION_NAME).deleteMany(filter);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservationsToDelete);
  }

  private static async doesReservationExist(tenant: Tenant, reservation: Reservation): Promise<boolean> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.doesReservationExist.name;
    ReservationValidatorStorage.getInstance().validateReservationTemplateSave(reservation);
    const result = await global.database.getCollection<Reservation>(tenant.id,COLLECTION_NAME).findOne(reservation);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservation);
    return !Utils.isNullOrUndefined(result);
  }
}
