import { Filter, ObjectId, Sort } from 'mongodb';

import DbParams from '../../types/database/DbParams';
import { ReservationDataResult } from '../../types/DataResult';
import global, { FilterParams } from '../../types/GlobalType';
import { OCPPReservationStatus } from '../../types/ocpp/OCPPClient';
import Reservation, { ReservationType } from '../../types/Reservation';
import Tenant from '../../types/Tenant';
import UserToken from '../../types/UserToken';
import Constants from '../../utils/Constants';
import Logging from '../../utils/Logging';
import Utils from '../../utils/Utils';
import ReservationValidatorStorage from '../validator/ReservationValidatorStorage';
import DatabaseUtils from './DatabaseUtils';

const MODULE_NAME = 'ReservationStorage';
const COLLECTION_NAME = 'reservations';

export default class ReservationStorage {
  public static async getReservations(
    tenant: Tenant,
    params: {
      search?: string;
      reservationIDs?: string[];
      chargingStationIDs?: string[];
      connectorIDs?: string[];
      userIDs?: string[];
      carIDs?: string[];
      siteIDs?: string[];
      status?: OCPPReservationStatus;
      types?: string[];
      withUser?: boolean;
      withChargingStation?: boolean;
      withCar?: boolean;
      withTag?: boolean;
      withCompany?: boolean;
      withSite?: boolean;
      withSiteArea?: boolean;
    } = {},
    dbParams: DbParams,
    projectFields?: string[]
  ): Promise<ReservationDataResult> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.getReservations.name;
    DatabaseUtils.checkTenantObject(tenant);

    dbParams = Utils.cloneObject(dbParams);
    dbParams.limit = Utils.checkRecordLimit(dbParams.limit);
    dbParams.skip = Utils.checkRecordSkip(dbParams.skip);

    const filters: FilterParams = {};
    const aggregation = [];

    if (params.search) {
      filters.$or = [
        // TODO
        { '': { $regex: params.search, $options: 'i' } },
      ];
    }
    if (!Utils.isEmptyArray(params.reservationIDs)) {
      filters.id = {
        $in: params.reservationIDs.map((reservationId) => Utils.convertToInt(reservationId)),
      };
    }
    if (!Utils.isEmptyArray(params.chargingStationIDs)) {
      filters.chargingStationID = { $in: params.chargingStationIDs };
    }
    if (!Utils.isEmptyArray(params.connectorIDs)) {
      filters.connectorID = {
        $in: params.connectorIDs.map((connectorID) => Utils.convertToInt(connectorID)),
      };
    }
    if (!Utils.isEmptyArray(params.carIDs)) {
      filters.carID = { $in: params.carIDs.map((carID) => DatabaseUtils.convertToObjectID(carID)) };
    }
    if (!Utils.isEmptyArray(params.userIDs)) {
      filters.carID = {
        $in: params.userIDs.map((userID) => DatabaseUtils.convertToObjectID(userID)),
      };
    }
    if (!Utils.isEmptyArray(params.siteIDs)) {
      DatabaseUtils.pushSiteUserLookupInAggregation({
        tenantID: tenant.id,
        aggregation,
        localField: 'userID',
        foreignField: 'userID',
        asField: 'siteUsers',
      });
      aggregation.push({
        $match: {
          'siteUsers.siteID': {
            $in: params.siteIDs.map((site) => DatabaseUtils.convertToObjectID(site)),
          },
        },
      });
    }
    aggregation.push({ $match: filters });

    const reservationsCount = await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .countDocuments();

    if (dbParams.onlyRecordCount) {
      await Logging.traceDatabaseRequestEnd(
        tenant,
        MODULE_NAME,
        METHOD_NAME,
        startTime,
        reservationsCount
      );
      return {
        count: reservationsCount,
        result: [],
      };
    }

    if (params.withUser) {
      DatabaseUtils.pushUserLookupInAggregation({
        tenantID: tenant.id,
        aggregation: aggregation,
        asField: 'user',
        localField: 'userID',
        foreignField: '_id',
        oneToOneCardinality: true,
        oneToOneCardinalityNotNull: false,
      });
    }
    if (params.withCar) {
      DatabaseUtils.pushCarLookupInAggregation({
        tenantID: tenant.id,
        aggregation: aggregation,
        asField: 'car',
        localField: 'carID',
        foreignField: '_id',
        oneToOneCardinality: true,
        oneToOneCardinalityNotNull: false,
      });
    }
    if (params.withTag) {
      DatabaseUtils.pushTagLookupInAggregation({
        tenantID: tenant.id,
        aggregation: aggregation,
        asField: 'tag',
        localField: 'idTag',
        foreignField: '_id',
        oneToOneCardinality: true,
        oneToOneCardinalityNotNull: false,
      });
    }
    if (params.withChargingStation) {
      DatabaseUtils.pushChargingStationLookupInAggregation({
        tenantID: tenant.id,
        aggregation: aggregation,
        asField: 'chargingStation',
        localField: 'chargingStationID',
        foreignField: '_id',
        oneToOneCardinality: true,
        oneToOneCardinalityNotNull: false,
      });
    }
    if (params.withCompany) {
      DatabaseUtils.pushCompanyLookupInAggregation({
        tenantID: tenant.id,
        aggregation: aggregation,
        asField: 'company',
        localField: 'companyID',
        foreignField: '_id',
        oneToOneCardinality: true,
        oneToOneCardinalityNotNull: false,
      });
    }
    // Sanitize missing dbParams
    if (!dbParams.sort) {
      dbParams.sort = { expiryDate: -1 };
    }
    if (!dbParams.skip) {
      dbParams.skip = 0;
    }
    if (!dbParams.limit) {
      dbParams.limit = 1;
    }

    // Add Created By / Last Changed By
    DatabaseUtils.pushCreatedLastChangedInAggregation(tenant.id, aggregation);
    // Convert Object ID to string
    DatabaseUtils.pushConvertObjectIDToString(aggregation, 'userID');
    // Handle the ID
    // DatabaseUtils.pushRenameDatabaseID(aggregation);
    // Project
    DatabaseUtils.projectFields(aggregation, projectFields);

    const reservations = (await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .aggregate(aggregation, DatabaseUtils.buildAggregateOptions())
      .sort(dbParams.sort as Sort)
      .limit(dbParams.limit)
      .skip(dbParams.skip)
      .toArray()) as Reservation[];
    await Logging.traceDatabaseRequestEnd(
      tenant,
      MODULE_NAME,
      METHOD_NAME,
      startTime,
      reservations
    );
    return {
      count: reservations.length,
      result: reservations,
    };
  }

  public static async getReservation(
    tenant: Tenant,
    id: number = Constants.UNKNOWN_NUMBER_ID,
    params: {
      withUser?: boolean;
      withChargingStation?: boolean;
      withCar?: boolean;
      withTag?: boolean;
      withCompany?: boolean;
      withSite?: boolean;
      withSiteArea?: boolean;
      type?: ReservationType;
      chargingStationIDs?: string[];
      connectorIDs?: string[];
    } = {},
    projectFields?: string[]
  ): Promise<Reservation> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.getReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    const reservations = await ReservationStorage.getReservations(
      tenant,
      {
        reservationIDs: [id.toString()],
        withUser: params.withUser,
        withChargingStation: params.withChargingStation,
        withCar: params.withCar,
        withTag: params.withTag,
        withCompany: params.withCompany,
        withSite: params.withSite,
        withSiteArea: params.withSiteArea,
      },
      Constants.DB_PARAMS_SINGLE_RECORD,
      projectFields
    );
    const reservation = reservations.count === 1 ? reservations.result.pop() : null;
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservation);
    return reservation;
  }

  public static async createReservation(
    tenant: Tenant,
    reservationToSave: Reservation
  ): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.createReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    ReservationValidatorStorage.getInstance().validateReservationTemplateSave(reservationToSave);
    const reservation: any = {
      ...reservationToSave,
    };
    DatabaseUtils.addLastChangedCreatedProps(reservation, reservationToSave);

    const createdReservation = await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(reservation.id) },
        { $set: reservation },
        { upsert: true, returnDocument: 'after' }
      );
    await global.database
      .getCollection<any>(tenant.id, 'chargingstations')
      .findOneAndUpdate(
        { _id: reservationToSave.chargingStationID },
        { $set: { 'connectors.$[connector].reservation': reservationToSave.id } },
        { arrayFilters: [{ 'connector.connectorId': { $eq: reservationToSave.connectorID } }] }
      );
    await Logging.traceDatabaseRequestEnd(
      tenant,
      MODULE_NAME,
      METHOD_NAME,
      startTime,
      createdReservation
    );
  }

  public static async createReservations(
    tenant: Tenant,
    reservationsToSave: Reservation[]
  ): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.createReservations.name;
    DatabaseUtils.checkTenantObject(tenant);
    for (const reservation of reservationsToSave) {
      await ReservationStorage.createReservation(tenant, reservation);
    }
    await Logging.traceDatabaseRequestEnd(
      tenant,
      MODULE_NAME,
      METHOD_NAME,
      startTime,
      reservationsToSave
    );
  }

  public static async updateReservation(
    tenant: Tenant,
    reservationsToUpdate: Reservation
  ): Promise<string> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.updateReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    const reservation: any = { ...reservationsToUpdate };
    const updatedReservation = await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .findOneAndUpdate({ id: reservation.id }, { $set: reservation });
    await Logging.traceDatabaseRequestEnd(
      tenant,
      MODULE_NAME,
      METHOD_NAME,
      startTime,
      updatedReservation
    );
    return updatedReservation.value.id.toString();
  }

  public static async updateReservations(
    tenant: Tenant,
    reservationsToUpdate: Reservation[]
  ): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.updateReservations.name;
    DatabaseUtils.checkTenantObject(tenant);
    for (const reservation of reservationsToUpdate) {
      await this.updateReservation(tenant, reservation);
    }
    await Logging.traceDatabaseRequestEnd(
      tenant,
      MODULE_NAME,
      METHOD_NAME,
      startTime,
      reservationsToUpdate
    );
  }

  public static async deleteReservation(tenant: Tenant, reservationID: number): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.deleteReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .deleteOne({ id: reservationID });
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, {
      reservationID,
    });
  }

  private static async doesReservationExist(
    tenant: Tenant,
    reservation: Reservation
  ): Promise<boolean> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.doesReservationExist.name;
    const filter: Filter<Reservation> = { id: reservation.id };
    const result = await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .findOne(filter);
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservation);
    return !Utils.isNullOrUndefined(result);
  }
}
