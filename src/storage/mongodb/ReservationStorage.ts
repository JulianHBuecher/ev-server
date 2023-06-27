import { ObjectId, Sort } from 'mongodb';

import LoggingDatabaseTableCleanupTask from '../../scheduler/tasks/LoggingDatabaseTableCleanupTask';
import DbParams from '../../types/database/DbParams';
import { ReservationDataResult } from '../../types/DataResult';
import global, { FilterParams } from '../../types/GlobalType';
import Reservation, { ReservationStatus, ReservationType } from '../../types/Reservation';
import Tenant from '../../types/Tenant';
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
      siteAreaIDs?: string[];
      companyIDs?: string[];
      dateRange?: { fromDate: Date; toDate: Date };
      expiryDate?: Date;
      statuses?: string[];
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
      filters.$or = [];
      filters.$or.push(
        // TODO: Determine seach options
        { id: { $regex: params.search, $options: 'i' } },
        { 'chargingStation.id': { $regex: params.search, $options: 'i' } },
        { type: { $regex: params.search, $options: 'i' } },
        { status: { $regex: params.search, $options: 'i' } }
      );
    }
    if (!Utils.isEmptyArray(params.reservationIDs)) {
      filters.id = {
        $in: params.reservationIDs.map((reservationID) => Utils.convertToInt(reservationID)),
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
    if (!Utils.isNullOrUndefined(params.statuses)) {
      filters.status = { $in: params.statuses.map((status) => status) };
    }
    if (!Utils.isEmptyArray(params.types)) {
      filters.type = {
        $in: params.types.map((t) => t),
      };
    }
    if (params.dateRange) {
      const dateRange = [
        {
          fromDate: {
            $gte: Utils.convertToDate(params.dateRange.fromDate),
            $lt: Utils.convertToDate(params.dateRange.toDate),
          },
        },
        {
          toDate: {
            $gte: Utils.convertToDate(params.dateRange.fromDate),
            $lt: Utils.convertToDate(params.dateRange.toDate),
          },
        },
      ];
      if (Utils.isEmptyArray(filters.$or)) {
        filters.$or = dateRange;
      } else {
        filters.$or.push(dateRange);
      }
    }
    if (params.expiryDate) {
      filters.expiryDate = {};
      filters.expiryDate.$lte = Utils.convertToDate(params.expiryDate);
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
      // Car Catalog
      DatabaseUtils.pushCarCatalogLookupInAggregation({
        tenantID: Constants.DEFAULT_TENANT_ID,
        aggregation,
        localField: 'car.carCatalogID',
        asField: 'car.carCatalog',
        foreignField: '_id',
        oneToOneCardinality: true,
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
      if (params.withUser) {
        DatabaseUtils.pushUserLookupInAggregation({
          tenantID: tenant.id,
          aggregation: aggregation,
          asField: 'tag.user',
          localField: 'tag.userID',
          foreignField: '_id',
          oneToOneCardinality: true,
          oneToOneCardinalityNotNull: false,
        });
      }
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
      if (params.withCompany) {
        DatabaseUtils.pushCompanyLookupInAggregation({
          tenantID: tenant.id,
          aggregation: aggregation,
          asField: 'chargingStation.company',
          localField: 'chargingStation.companyID',
          foreignField: '_id',
          oneToOneCardinality: true,
          oneToOneCardinalityNotNull: false,
        });
      }
      if (params.withSite) {
        DatabaseUtils.pushSiteLookupInAggregation({
          tenantID: tenant.id,
          aggregation: aggregation,
          asField: 'chargingStation.site',
          localField: 'chargingStation.siteID',
          foreignField: '_id',
          oneToOneCardinality: true,
          oneToOneCardinalityNotNull: false,
        });
      }
      if (params.withSiteArea) {
        DatabaseUtils.pushSiteAreaLookupInAggregation({
          tenantID: tenant.id,
          aggregation: aggregation,
          asField: 'chargingStation.siteArea',
          localField: 'chargingStation.siteAreaID',
          foreignField: '_id',
          oneToOneCardinality: true,
          oneToOneCardinalityNotNull: false,
        });
      }
    }
    if (!Utils.isEmptyArray(params.userIDs)) {
      aggregation.push({
        $match: {
          'tag.userID': {
            $in: params.userIDs.map((userID) => DatabaseUtils.convertToObjectID(userID)),
          },
        },
      });
    }
    if (!Utils.isEmptyArray(params.siteIDs)) {
      aggregation.push({
        $match: {
          'chargingStation.siteID': {
            $in: params.siteIDs.map((site) => DatabaseUtils.convertToObjectID(site)),
          },
        },
      });
    }
    if (!Utils.isEmptyArray(params.siteAreaIDs)) {
      aggregation.push({
        $match: {
          'chargingStation.siteAreaID': {
            $in: params.siteAreaIDs.map((siteArea) => DatabaseUtils.convertToObjectID(siteArea)),
          },
        },
      });
    }
    if (!Utils.isEmptyArray(params.companyIDs)) {
      aggregation.push({
        $match: {
          'chargingStation.companyID': {
            $in: params.companyIDs.map((company) => DatabaseUtils.convertToObjectID(company)),
          },
        },
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

    // Convert Object ID to string
    DatabaseUtils.pushConvertObjectIDToString(aggregation, 'carID');
    // Add Created By / Last Changed By
    DatabaseUtils.pushCreatedLastChangedInAggregation(tenant.id, aggregation);
    // Project
    DatabaseUtils.projectFields(aggregation, projectFields);

    const reservations = (await global.database
      .getCollection<any>(tenant.id, COLLECTION_NAME)
      .aggregate<any>(aggregation, DatabaseUtils.buildAggregateOptions())
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
  ): Promise<string> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.createReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    const reservation =
      ReservationValidatorStorage.getInstance().validateReservation(reservationToSave);
    const reservationMDB = {
      ...reservation,
      carID: reservation.carID ? DatabaseUtils.convertToObjectID(reservation.carID) : null,
    };
    DatabaseUtils.addLastChangedCreatedProps(reservationMDB, reservationToSave);
    const createdReservation = await global.database
      .getCollection<any>(tenant.id, COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(reservationMDB.id) },
        {
          $set: reservationMDB,
        },
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
    return createdReservation.value.id.toString();
  }

  public static async updateReservation(
    tenant: Tenant,
    reservationToUpdate: Reservation
  ): Promise<string> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.updateReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    const reservation =
      ReservationValidatorStorage.getInstance().validateReservation(reservationToUpdate);
    const reservationMDB = {
      ...reservation,
      carID: reservation.carID ? DatabaseUtils.convertToObjectID(reservation.carID) : null,
    };
    const updatedReservation = await global.database
      .getCollection<any>(tenant.id, COLLECTION_NAME)
      .findOneAndUpdate({ id: reservationToUpdate.id }, { $set: reservationMDB });
    await Logging.traceDatabaseRequestEnd(
      tenant,
      MODULE_NAME,
      METHOD_NAME,
      startTime,
      updatedReservation
    );
    return updatedReservation.value._id.toString();
  }

  public static async updateReservations(
    tenant: Tenant,
    reservationsToUpdate: Reservation[]
  ): Promise<string[]> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.updateReservations.name;
    const updatedReservations: string[] = [];
    for (const reservation of reservationsToUpdate) {
      updatedReservations.push(await this.updateReservation(tenant, reservation));
    }
    await Logging.traceDatabaseRequestEnd(
      tenant,
      MODULE_NAME,
      METHOD_NAME,
      startTime,
      updatedReservations
    );
    return updatedReservations;
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

  public static async cancelReservation(tenant: Tenant, reservationID: number): Promise<void> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.cancelReservation.name;
    DatabaseUtils.checkTenantObject(tenant);
    const filters: FilterParams = {};
    filters.id = {
      $eq: reservationID,
    };
    await global.database
      .getCollection<Reservation>(tenant.id, COLLECTION_NAME)
      .findOneAndUpdate(filters, {
        $set: {
          status: ReservationStatus.CANCELLED,
        },
      });
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, {
      reservationID,
    });
  }

  public static async getCollidingReservations(
    tenant: Tenant,
    reservation: Reservation
  ): Promise<Reservation[]> {
    const startTime = Logging.traceDatabaseRequestStart();
    const METHOD_NAME = this.getCollidingReservations.name;
    const filters: FilterParams = {};
    filters.chargingStationID = { $eq: reservation.chargingStationID };
    filters.connectorID = { $eq: reservation.connectorID };
    filters.status = { $in: [ReservationStatus.IN_PROGRESS, ReservationStatus.SCHEDULED] };
    if (reservation.fromDate || reservation.toDate || reservation.expiryDate) {
      filters.$or = [];
      if (reservation.fromDate) {
        filters.$or.push({
          $and: [
            { fromDate: { $gte: Utils.convertToDate(reservation.fromDate) } },
            { fromDate: { $lte: Utils.convertToDate(reservation.toDate) } },
          ],
        });
      }
      if (reservation.toDate) {
        filters.$or.push({
          $and: [
            { toDate: { $gte: Utils.convertToDate(reservation.fromDate) } },
            { toDate: { $lte: Utils.convertToDate(reservation.toDate) } },
          ],
        });
      }
      if (reservation.expiryDate) {
        filters.$or.push({
          $and: [
            { expiryDate: { $gte: Utils.convertToDate(reservation.fromDate) } },
            { expiryDate: { $lte: Utils.convertToDate(reservation.toDate) } },
          ],
        });
      }
    }
    const collisions = (await global.database
      .getCollection<any>(tenant.id, COLLECTION_NAME)
      .aggregate<any>([{ $match: filters }])
      .toArray()) as Reservation[];
    await Logging.traceDatabaseRequestEnd(tenant, MODULE_NAME, METHOD_NAME, startTime, reservation);
    return collisions;
  }

  public static async getReservationsForUser(
    tenant: Tenant,
    userID: string,
    type?: ReservationType,
    status?: ReservationStatus
  ): Promise<Reservation[]> {
    const reservations = await this.getReservations(
      tenant,
      {
        withTag: true,
        withUser: true,
        userIDs: [userID],
        types: [type],
        statuses: [status],
      },
      Constants.DB_PARAMS_MAX_LIMIT
    );
    return reservations.result;
  }
}
