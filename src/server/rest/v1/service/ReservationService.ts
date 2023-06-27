import { NextFunction, Request, Response } from 'express';
import moment from 'moment';

import ChargingStationClientFactory from '../../../../client/ocpp/ChargingStationClientFactory';
import AppAuthError from '../../../../exception/AppAuthError';
import AppError from '../../../../exception/AppError';
import BackendError from '../../../../exception/BackendError';
import ReservationStorage from '../../../../storage/mongodb/ReservationStorage';
import { Action, Entity } from '../../../../types/Authorization';
import { ReservationDataResult } from '../../../../types/DataResult';
import { HTTPAuthError, HTTPError } from '../../../../types/HTTPError';
import {
  OCPPCancelReservationResponse,
  OCPPReservationStatus,
  OCPPReserveNowResponse,
} from '../../../../types/ocpp/OCPPClient';
import {
  HttpReservationCancelRequest,
  HttpReservationCreateRequest,
  HttpReservationDeleteRequest,
  HttpReservationGetRequest,
  HttpReservationUpdateRequest,
  HttpReservationsGetRequest,
} from '../../../../types/requests/HttpReservationRequest';
import Reservation, { ReservationStatus, ReservationType } from '../../../../types/Reservation';
import { ServerAction } from '../../../../types/Server';
import { TenantComponents } from '../../../../types/Tenant';
import Constants from '../../../../utils/Constants';
import I18nManager from '../../../../utils/I18nManager';
import Logging from '../../../../utils/Logging';
import LoggingHelper from '../../../../utils/LoggingHelper';
import Utils from '../../../../utils/Utils';
import ReservationValidatorRest from '../validator/ReservationValidatorRest';
import AuthorizationService from './AuthorizationService';
import UtilsService from './UtilsService';

const MODULE_NAME = 'ReservationService';

export default class ReservationService {
  public static async handleGetReservation(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    UtilsService.assertComponentIsActiveFromToken(
      req.user,
      TenantComponents.RESERVATION,
      Action.READ,
      Entity.RESERVATION,
      MODULE_NAME,
      'handleGetReservation'
    );
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationGetReq(
      req.query
    );
    const reservation = await ReservationService.getReservation(req, filteredRequest, Action.READ);
    res.json(reservation);
    next();
  }

  public static async handleGetReservations(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    UtilsService.assertComponentIsActiveFromToken(
      req.user,
      TenantComponents.RESERVATION,
      Action.LIST,
      Entity.RESERVATION,
      MODULE_NAME,
      ReservationService.handleGetReservations.name
    );
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationsGetReq(
      req.query
    );
    const reservations = await ReservationService.getReservations(
      req,
      filteredRequest,
      Action.LIST
    );
    res.json(reservations);
    next();
  }

  public static async handleCreateReservation(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    UtilsService.assertComponentIsActiveFromToken(
      req.user,
      TenantComponents.RESERVATION,
      Action.CREATE,
      Entity.RESERVATION,
      MODULE_NAME,
      ReservationService.handleCreateReservation.name
    );
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationCreateReq(
      req.body
    );
    const reservationID = await ReservationService.saveReservation(
      req,
      action,
      Action.CREATE,
      filteredRequest
    );
    res.json(Object.assign({ id: reservationID }, Constants.REST_RESPONSE_SUCCESS));
    next();
  }

  public static async handleUpdateReservation(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    UtilsService.assertComponentIsActiveFromToken(
      req.user,
      TenantComponents.RESERVATION,
      Action.UPDATE,
      Entity.RESERVATION,
      MODULE_NAME,
      ReservationService.handleUpdateReservation.name
    );
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationUpdateReq(
      req.body
    );
    await ReservationService.updateReservation(req, Action.UPDATE, filteredRequest);
    res.json(Constants.REST_RESPONSE_SUCCESS);
    next();
  }

  public static async handleDeleteReservation(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    UtilsService.assertComponentIsActiveFromToken(
      req.user,
      TenantComponents.RESERVATION,
      Action.DELETE,
      Entity.RESERVATION,
      MODULE_NAME,
      ReservationService.handleDeleteReservation.name
    );
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationDeleteReq(
      req.query
    );
    await ReservationService.deleteReservation(req, action, filteredRequest, Action.DELETE);
    res.json(Constants.REST_RESPONSE_SUCCESS);
    next();
  }

  public static async handleCancelReservation(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    UtilsService.assertComponentIsActiveFromToken(
      req.user,
      TenantComponents.RESERVATION,
      Action.CANCEL_RESERVATION,
      Entity.RESERVATION,
      MODULE_NAME,
      ReservationService.handleCancelReservation.name
    );
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationCancelReq(
      req.query
    );
    await ReservationService.cancelReservation(
      req,
      action,
      Action.CANCEL_RESERVATION,
      filteredRequest
    );
    res.json(Constants.REST_RESPONSE_SUCCESS);
    next();
  }

  public static async handleExportReservations(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    req.query.limit = Constants.EXPORT_PAGE_SIZE.toString();
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationsGetReq(
      req.query
    );
    await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant,
      req.user,
      Action.EXPORT,
      filteredRequest
    );
    await UtilsService.exportToCSV(
      req,
      res,
      'exported-reservations.csv',
      filteredRequest,
      ReservationService.getReservations.bind(this, req, filteredRequest),
      ReservationService.convertToCSV.bind(this)
    );
  }

  public static async handleImportReservations() {
    // TODO: Impl
  }

  private static async getReservation(
    req: Request,
    filteredRequest: HttpReservationGetRequest,
    authAction: Action = Action.READ,
    additionalFilters: Record<string, any> = {}
  ): Promise<Reservation> {
    const authorizations = await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      filteredRequest,
      authAction
    );
    if (!authorizations.authorized) {
      throw new AppAuthError({
        errorCode: HTTPAuthError.FORBIDDEN,
        user: req.user,
        action: authAction,
        entity: Entity.RESERVATION,
        module: MODULE_NAME,
        method: ReservationService.handleGetReservation.name,
        value: filteredRequest.ID.toString(),
      });
    }
    const reservation = await ReservationStorage.getReservation(
      req.tenant,
      filteredRequest.ID,
      {
        ...additionalFilters,
        ...authorizations.filters,
        withChargingStation: true,
        withTag: true,
        withUser: true,
      },
      authorizations.projectFields
    );
    if (authorizations.projectFields) {
      reservation.projectFields = authorizations.projectFields;
    }
    if (authorizations.metadata) {
      reservation.metadata = authorizations.metadata;
    }
    await AuthorizationService.addReservationAuthorizations(
      req.tenant,
      req.user,
      reservation,
      authorizations
    );
    return reservation;
  }

  private static async getReservations(
    req: Request,
    filteredRequest: HttpReservationsGetRequest,
    authAction: Action = Action.LIST,
    additionalFilters: Record<string, any> = {}
  ): Promise<ReservationDataResult> {
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant,
      req.user,
      authAction,
      filteredRequest,
      false
    );
    if (!authorizations.authorized) {
      return Constants.DB_EMPTY_DATA_RESULT;
    }
    const reservations = await ReservationStorage.getReservations(
      req.tenant,
      {
        search: filteredRequest.Search,
        reservationIDs: filteredRequest.ReservationID
          ? filteredRequest.ReservationID.split('|')
          : null,
        chargingStationIDs: filteredRequest.ChargingStationID
          ? filteredRequest.ChargingStationID.split('|')
          : null,
        connectorIDs: filteredRequest.ConnectorID ? filteredRequest.ConnectorID.split('|') : null,
        userIDs: filteredRequest.UserID ? filteredRequest.UserID.split('|') : null,
        carIDs: filteredRequest.CarID ? filteredRequest.CarID.split('|') : null,
        siteIDs: filteredRequest.SiteID ? filteredRequest.SiteID.split('|') : null,
        siteAreaIDs: filteredRequest.SiteAreaID ? filteredRequest.SiteAreaID.split('|') : null,
        companyIDs: filteredRequest.CompanyID ? filteredRequest.CompanyID.split('|') : null,
        dateRange: {
          fromDate: filteredRequest.StartDateTime ?? null,
          toDate: filteredRequest.EndDateTime ?? null,
        },
        statuses: filteredRequest.Status ? filteredRequest.Status.split('|') : null,
        types: filteredRequest.Type ? filteredRequest.Type.split('|') : null,
        withUser: filteredRequest.WithUser,
        withCar: filteredRequest.WithCar,
        withChargingStation: filteredRequest.WithChargingStation,
        withCompany: filteredRequest.WithCompany,
        withSite: filteredRequest.WithSite,
        withSiteArea: filteredRequest.WithSiteArea,
        withTag: filteredRequest.WithTag,
        ...additionalFilters,
        ...authorizations.filters,
      },
      {
        limit: filteredRequest.Limit,
        sort: UtilsService.httpSortFieldsToMongoDB(filteredRequest.SortFields),
        skip: filteredRequest.Skip,
        onlyRecordCount: filteredRequest.OnlyRecordCount,
      },
      authorizations.projectFields
    );
    if (authorizations.projectFields) {
      reservations.projectFields = authorizations.projectFields;
    }
    if (filteredRequest.WithAuth) {
      await AuthorizationService.addReservationsAuthorizations(
        req.tenant,
        req.user,
        reservations,
        authorizations
      );
    }
    return reservations;
  }

  private static async saveReservation(
    req: Request,
    action: ServerAction = ServerAction.RESERVATION_CREATE,
    authAction: Action = Action.CREATE,
    filteredRequest: HttpReservationCreateRequest
  ): Promise<string> {
    await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      {},
      authAction,
      filteredRequest as Reservation
    );
    if (filteredRequest.userID) {
      await UtilsService.checkAndGetUserAuthorization(
        req.tenant,
        req.user,
        filteredRequest.userID,
        Action.READ,
        action
      );
    }
    if (!filteredRequest.idTag) {
      const tag = await UtilsService.checkAndGetTagByVisualIDAuthorization(
        req.tenant,
        req.user,
        filteredRequest.visualTagID,
        Action.READ,
        ServerAction.RESERVATION_CREATE
      );
      filteredRequest.idTag = tag.id;
    }
    const newReservation = this.buildNewReservation(req, filteredRequest);
    await ReservationService.checkForReservationCollisions(req, newReservation);
    if (newReservation.type === ReservationType.RESERVE_NOW) {
      await ReservationService.preventMultipleReserveNow(req, filteredRequest);
    }
    const result = await ReservationService.contactChargingStation(req, action, newReservation);
    if (!Utils.isNullOrUndefined(result)) {
      ReservationService.handleReservationResponses(result, newReservation);
    }
    await Logging.logInfo({
      ...LoggingHelper.getReservationProperties(newReservation),
      tenantID: req.tenant.id,
      user: req.user,
      module: MODULE_NAME,
      method: ReservationService.handleCreateReservation.name,
      message: `'${Utils.buildReservationName(newReservation)}' has been created successfully`,
      action: action,
      detailedMessages: { newReservation },
    });
    return await ReservationStorage.createReservation(req.tenant, newReservation);
  }

  private static async updateReservation(
    req: Request,
    authAction: Action = Action.UPDATE,
    filteredRequest: HttpReservationUpdateRequest
  ): Promise<void> {
    await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      {},
      authAction,
      filteredRequest as Reservation
    );
    await ReservationStorage.updateReservation(req.tenant, {
      ...filteredRequest,
      lastChangedBy: { id: req.user.id },
      lastChangedOn: new Date(),
    });
  }

  private static async deleteReservation(
    req: Request,
    action: ServerAction = ServerAction.RESERVATION_DELETE,
    filteredRequest: HttpReservationDeleteRequest,
    authAction: Action = Action.DELETE
  ): Promise<void> {
    await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      filteredRequest,
      authAction,
      {}
    );
    UtilsService.assertIdIsProvided(
      action,
      filteredRequest.ID,
      MODULE_NAME,
      ReservationService.deleteReservation.name,
      req.user
    );
    await ReservationStorage.deleteReservation(req.tenant, filteredRequest.ID);
  }

  private static async cancelReservation(
    req: Request,
    action: ServerAction = ServerAction.RESERVATION_CANCEL,
    authAction: Action = Action.CANCEL_RESERVATION,
    filteredRequest: HttpReservationCancelRequest
  ): Promise<void> {
    await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      filteredRequest,
      authAction,
      {}
    );
    UtilsService.assertIdIsProvided(
      action,
      filteredRequest.ID,
      MODULE_NAME,
      ReservationService.cancelReservation.name,
      req.user
    );
    const reservation = await ReservationService.getReservation(req, filteredRequest);
    const result = await this.contactChargingStation(req, action, reservation);
    if (result.status === OCPPReservationStatus.ACCEPTED) {
      reservation.status = ReservationStatus.CANCELLED;
      await ReservationStorage.updateReservation(req.tenant, reservation);
    }
  }

  private static determineReservationStatus(reservation: Reservation) {
    if (reservation.type === ReservationType.RESERVE_NOW) {
      return ReservationStatus.IN_PROGRESS;
    }
    const actualDate = moment();
    if (actualDate.isBetween(reservation.fromDate, reservation.toDate)) {
      return ReservationStatus.IN_PROGRESS;
    } else if (actualDate.isBefore(reservation.fromDate)) {
      return ReservationStatus.SCHEDULED;
    } else if (actualDate.isAfter(reservation.toDate)) {
      return ReservationStatus.EXPIRED;
    }
  }

  private static async contactChargingStation(
    req: Request,
    action: ServerAction,
    reservation: Reservation
  ): Promise<OCPPReserveNowResponse | OCPPCancelReservationResponse> {
    // Get the Charging station
    const chargingStation = await UtilsService.checkAndGetChargingStationAuthorization(
      req.tenant,
      req.user,
      reservation.chargingStationID,
      Action.READ,
      action,
      null,
      { withSite: true, withSiteArea: true }
    );
    // Get the OCPP Client
    const chargingStationClient = await ChargingStationClientFactory.getChargingStationClient(
      req.tenant,
      chargingStation
    );
    if (!chargingStationClient) {
      throw new BackendError({
        action,
        module: MODULE_NAME,
        method: ReservationService.contactChargingStation.name,
        message: 'Charging Station is not connected to the backend',
      });
    }
    if (moment().isBetween(moment(reservation.fromDate), moment(reservation.toDate))) {
      if (
        [ServerAction.CHARGING_STATION_RESERVE_NOW, ServerAction.RESERVATION_CREATE].includes(
          action
        )
      ) {
        return chargingStationClient.reserveNow({
          connectorId: reservation.connectorID,
          expiryDate: reservation.expiryDate,
          idTag: reservation.idTag,
          parentIdTag: reservation.parentIdTag,
          reservationId: reservation.id,
        });
      }
    } else if (
      [ServerAction.CHARGING_STATION_CANCEL_RESERVATION, ServerAction.RESERVATION_DELETE].includes(
        action
      )
    ) {
      return chargingStationClient.cancelReservation({
        reservationId: reservation.id,
      });
    }
  }

  private static convertToCSV(
    req: Request,
    reservations: Reservation[],
    writeHeader = true
  ): string {
    const getDateCell = (requestedDate: Date, i18nManager: I18nManager) => {
      if (requestedDate) {
        return [
          i18nManager.formatDateTime(requestedDate, 'L') +
            ' ' +
            i18nManager.formatDateTime(requestedDate, 'LT'),
        ];
      }
      return [
        i18nManager.translate('general.invalidDate') +
          ' ' +
          i18nManager.translate('general.invalidTime'),
      ];
    };
    let headers = null;
    const i18nManager = I18nManager.getInstanceForLocale(req.user.locale);
    if (writeHeader) {
      headers = [
        'id',
        'chargingStation',
        'connector',
        'fromDate',
        'toDate',
        'expiryDate',
        'arrivalTime',
        'idTag',
        'parentIdTag',
        'car',
        'type',
        'status',
        'createdOn',
      ].join(Constants.CSV_SEPARATOR);
    }
    const rows = reservations
      .map((reservation) => {
        const row = [
          reservation.id,
          reservation.chargingStationID,
          reservation.connectorID,
          getDateCell(reservation.fromDate, i18nManager),
          getDateCell(reservation.toDate, i18nManager),
          getDateCell(reservation.expiryDate, i18nManager),
          reservation.arrivalTime ? getDateCell(reservation.arrivalTime, i18nManager) : '',
          reservation.idTag,
          reservation.parentIdTag ?? '',
          reservation.carID ?? '',
          reservation.type,
          reservation.status,
          getDateCell(reservation.createdOn, i18nManager),
        ].map((value) => Utils.escapeCsvValue(value));
        return row;
      })
      .join(Constants.CR_LF);
    return Utils.isNullOrUndefined(headers)
      ? Constants.CR_LF + rows
      : [headers, rows].join(Constants.CR_LF);
  }

  private static handleReservationResponses(
    response: OCPPReserveNowResponse | OCPPCancelReservationResponse,
    reservation: Reservation
  ) {
    switch (response.status) {
      case OCPPReservationStatus.REJECTED:
        throw new AppError({
          action: ServerAction.RESERVATION_CREATE,
          module: MODULE_NAME,
          method: ReservationService.handleReservationResponses.name,
          errorCode: HTTPError.RESERVATION_REJECTED_ERROR,
          message: `Unable to create reservation, either reservation on connector '${reservation.connectorID}' is not supported or another error occurred'`,
        });
      case OCPPReservationStatus.FAULTED:
        throw new AppError({
          action: ServerAction.RESERVATION_CREATE,
          module: MODULE_NAME,
          method: ReservationService.handleReservationResponses.name,
          errorCode: HTTPError.RESERVATION_FAULTED_ERROR,
          message: `Unable to create reservation, charging station '${reservation.chargingStationID}' or connector '${reservation.connectorID}' are in faulted state'`,
        });
      case OCPPReservationStatus.OCCUPIED:
        throw new AppError({
          action: ServerAction.RESERVATION_CREATE,
          module: MODULE_NAME,
          method: ReservationService.handleReservationResponses.name,
          errorCode: HTTPError.RESERVATION_OCCUPIED_ERROR,
          message: `Unable to create reservation, connector '${reservation.connectorID}' seems to be occupied'`,
        });
      case OCPPReservationStatus.UNAVAILABLE:
        throw new AppError({
          action: ServerAction.RESERVATION_CREATE,
          module: MODULE_NAME,
          method: ReservationService.handleReservationResponses.name,
          errorCode: HTTPError.RESERVATION_UNAVAILABLE_ERROR,
          message: `Unable to create reservation, charging station '${reservation.chargingStationID}' or connector '${reservation.connectorID}' are unavailable now'`,
        });
    }
  }

  private static buildNewReservation(
    req: Request,
    filteredRequest: HttpReservationCreateRequest
  ): Reservation {
    return {
      ...filteredRequest,
      status: ReservationService.determineReservationStatus({ ...filteredRequest }),
      createdBy: { id: req.user.id },
      createdOn: new Date(),
    };
  }

  private static async checkForReservationCollisions(
    req: Request,
    reservation: Reservation
  ): Promise<void> {
    const collisions = await ReservationStorage.getCollidingReservations(req.tenant, reservation);
    if (collisions.length > 0) {
      throw new AppError({
        action: ServerAction.RESERVATION_CREATE,
        module: MODULE_NAME,
        method: ReservationService.checkForReservationCollisions.name,
        errorCode: HTTPError.RESERVATION_COLLISION_ERROR,
        message: `Unable to create reservation, because of collision with '${collisions.length} reservations'`,
      });
    }
  }

  private static async preventMultipleReserveNow(
    req: Request,
    filteredRequest: HttpReservationCreateRequest | HttpReservationUpdateRequest
  ) {
    const existingReservations = await ReservationStorage.getReservationsForUser(
      req.tenant,
      filteredRequest.userID,
      ReservationType.RESERVE_NOW,
      ReservationStatus.IN_PROGRESS
    );
    if (existingReservations.length > 0) {
      throw new AppError({
        action: ServerAction.RESERVATION_CREATE,
        module: MODULE_NAME,
        method: ReservationService.preventMultipleReserveNow.name,
        errorCode: HTTPError.RESERVATION_MULTIPLE_RESERVE_NOW_ERROR,
        message: `Unable to create reservation, because 'RESERVE NOW' reservation for user '${filteredRequest.userID}' already exists`,
      });
    }
  }
}
