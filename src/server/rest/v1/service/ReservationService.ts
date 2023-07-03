import { NextFunction, Request, Response } from 'express';
import moment from 'moment';

import ChargingStationClientFactory from '../../../../client/ocpp/ChargingStationClientFactory';
import AppAuthError from '../../../../exception/AppAuthError';
import AppError from '../../../../exception/AppError';
import BackendError from '../../../../exception/BackendError';
import ChargingStationStorage from '../../../../storage/mongodb/ChargingStationStorage';
import ReservationStorage from '../../../../storage/mongodb/ReservationStorage';
import UserStorage from '../../../../storage/mongodb/UserStorage';
import { Action, Entity } from '../../../../types/Authorization';
import ChargingStation from '../../../../types/ChargingStation';
import { ReservationDataResult } from '../../../../types/DataResult';
import { HTTPAuthError, HTTPError } from '../../../../types/HTTPError';
import {
  OCPPCancelReservationResponse,
  OCPPCancelReservationStatus,
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
import Reservation, {
  ReservationStatus,
  ReservationStatusEnum,
  ReservationType,
} from '../../../../types/Reservation';
import { ServerAction } from '../../../../types/Server';
import Tenant, { TenantComponents } from '../../../../types/Tenant';
import Constants from '../../../../utils/Constants';
import I18nManager from '../../../../utils/I18nManager';
import Logging from '../../../../utils/Logging';
import LoggingHelper from '../../../../utils/LoggingHelper';
import NotificationHelper from '../../../../utils/NotificationHelper';
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
    const reservation = await ReservationService.getReservation(
      req,
      filteredRequest,
      action,
      Action.READ
    );
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
      action,
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
    const reservation = await ReservationService.saveReservation(
      req,
      action,
      Action.CREATE,
      filteredRequest
    );
    const user = await UserStorage.getUserByTagID(req.tenant, reservation.idTag);
    NotificationHelper.notifyReservationCreated(req.tenant, user, reservation);
    res.json(Object.assign({ id: reservation.id }, Constants.REST_RESPONSE_SUCCESS));
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
    await ReservationService.saveReservation(req, action, Action.UPDATE, filteredRequest);
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
    const reservation = await ReservationService.cancelReservation(
      req,
      action,
      Action.CANCEL_RESERVATION,
      filteredRequest
    );
    const user = await UserStorage.getUserByTagID(req.tenant, reservation.idTag);
    NotificationHelper.notifyReservationCancelled(req.tenant, user, reservation);
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

  protected static checkReservationStatusTransition(
    reservation: Reservation,
    status: ReservationStatusEnum
  ): boolean {
    const fromStatus = reservation.status;
    let transitionAllowed = false;
    if (
      fromStatus === status ||
      Constants.ReservationStatusTransitions.findIndex(
        (transition) => transition.from === fromStatus && transition.to === status
      ) !== -1
    ) {
      transitionAllowed = true;
    } else {
      throw new AppError({
        action: ServerAction.RESERVATION_STATUS_TRANSITION,
        module: MODULE_NAME,
        method: ReservationService.checkReservationStatusTransition.name,
        errorCode: HTTPError.RESERVATION_INVALID_STATUS_TRANSITION_ERROR,
        message: `Transition from status ${fromStatus} to status ${status} is not permitted'`,
      });
    }
    return transitionAllowed;
  }

  private static async getReservation(
    req: Request,
    filteredRequest: HttpReservationGetRequest,
    action: ServerAction = ServerAction.RESERVATION,
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
      filteredRequest.ID as number,
      {
        ...additionalFilters,
        ...authorizations.filters,
        withChargingStation: filteredRequest.WithChargingStation,
        withTag: filteredRequest.WithTag,
        withCar: filteredRequest.WithCar,
        withUser: filteredRequest.WithUser,
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
    action: ServerAction = ServerAction.RESERVATIONS,
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
    action: ServerAction,
    authAction: Action,
    filteredRequest: HttpReservationCreateRequest | HttpReservationUpdateRequest
  ): Promise<Reservation> {
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
    const reservation = await ReservationStorage.getReservation(req.tenant, filteredRequest.id, {
      withTag: true,
    });
    if (
      !Utils.isNullOrUndefined(reservation) &&
      reservation?.tag.userID !== filteredRequest.userID
    ) {
      throw new AppError({
        action: ServerAction.RESERVATION_CREATE,
        module: MODULE_NAME,
        method: ReservationService.saveReservation.name,
        errorCode: HTTPError.RESERVATION_ALREADY_EXISTS_ERROR,
        message: 'Unable to create reservation, reservation with same ID exists for another user',
      });
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
    const reservationToSave = this.buildReservation(req, action, filteredRequest, reservation);
    if (reservation) {
      ReservationService.checkReservationStatusTransition(reservation, reservationToSave.status);
    } else {
      reservationToSave.status = ReservationService.determineReservationStatus(reservationToSave);
    }
    await ReservationService.checkForReservationCollisions(req, reservationToSave);
    if (reservationToSave.type === ReservationType.RESERVE_NOW) {
      await ReservationService.preventMultipleReserveNow(req, filteredRequest);
    }
    const result = await ReservationService.contactChargingStation(req, action, reservationToSave);
    if (!Utils.isNullOrUndefined(result)) {
      ReservationService.handleReservationResponses(result, reservationToSave);
    }
    await Logging.logInfo({
      ...LoggingHelper.getReservationProperties(reservationToSave),
      tenantID: req.tenant.id,
      user: req.user,
      module: MODULE_NAME,
      method: ReservationService.handleCreateReservation.name,
      message: `'${Utils.buildReservationName(reservationToSave)}' has been saved successfully`,
      action: action,
      detailedMessages: { reservationToSave },
    });
    return await ReservationStorage.saveReservation(req.tenant, reservationToSave);
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
    const reservation = await ReservationService.getReservation(req, filteredRequest);
    if ([ReservationStatus.IN_PROGRESS].includes(reservation.status)) {
      const result = await this.contactChargingStation(req, action, reservation);
      if (result.status !== OCPPCancelReservationStatus.ACCEPTED) {
        return;
      }
    }
    await ReservationStorage.deleteReservation(req.tenant, filteredRequest.ID);
  }

  private static async cancelReservation(
    req: Request,
    action: ServerAction = ServerAction.RESERVATION_CANCEL,
    authAction: Action = Action.CANCEL_RESERVATION,
    filteredRequest: HttpReservationCancelRequest
  ): Promise<Reservation> {
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
    ReservationService.checkReservationStatusTransition(
      reservation,
      ReservationStatusEnum.CANCELLED
    );
    if (reservation.status === ReservationStatus.IN_PROGRESS) {
      const result = await this.contactChargingStation(req, action, reservation);
      if (result.status !== OCPPCancelReservationStatus.ACCEPTED) {
        return;
      }
    }
    reservation.status = ReservationStatus.CANCELLED;
    return await ReservationStorage.saveReservation(req.tenant, reservation);
  }

  private static determineReservationStatus(reservation: Reservation): ReservationStatusEnum {
    if (reservation.type === ReservationType.RESERVE_NOW) {
      return ReservationStatusEnum.IN_PROGRESS;
    }
    const actualDate = moment();
    if (actualDate.isBetween(reservation.fromDate, reservation.toDate)) {
      return ReservationStatusEnum.IN_PROGRESS;
    } else if (actualDate.isBefore(reservation.fromDate)) {
      return ReservationStatusEnum.SCHEDULED;
    } else if (actualDate.isAfter(reservation.toDate)) {
      return ReservationStatusEnum.EXPIRED;
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
        await ReservationService.updateConnectorWithReservation(
          req.tenant,
          chargingStation,
          reservation,
          true
        );
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
      await ReservationService.resetConnector(req.tenant, chargingStation, reservation.connectorID);
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

  private static buildReservation(
    req: Request,
    action: ServerAction,
    filteredRequest: HttpReservationCreateRequest | HttpReservationUpdateRequest,
    oldReservation?: Reservation
  ): Reservation {
    const reservation: Reservation = {
      ...filteredRequest,
    };
    if (action === ServerAction.RESERVATION_UPDATE) {
      reservation.createdBy = oldReservation.createdBy;
      reservation.createdOn = oldReservation.createdOn;
      reservation.lastChangedBy = { id: req.user.id };
      reservation.lastChangedOn = new Date();
    } else {
      reservation.createdBy = { id: req.user.id };
      reservation.createdOn = new Date();
    }
    return reservation;
  }

  private static async checkForReservationCollisions(
    req: Request,
    reservation: Reservation
  ): Promise<Reservation[]> {
    const reservationsInRange = await ReservationStorage.getReservationsByDate(
      req.tenant,
      reservation.fromDate,
      reservation.toDate
    );
    const collisions = reservationsInRange.filter(
      (r) =>
        r.id !== reservation.id &&
        r.chargingStationID === reservation.chargingStationID &&
        r.connectorID === reservation.connectorID &&
        [ReservationStatus.IN_PROGRESS, ReservationStatus.SCHEDULED].includes(r.status)
    );
    if (collisions.length > 0) {
      throw new AppError({
        action: ServerAction.RESERVATION_CREATE,
        module: MODULE_NAME,
        method: ReservationService.checkForReservationCollisions.name,
        errorCode: HTTPError.RESERVATION_COLLISION_ERROR,
        message: `Unable to create reservation, because of collision with '${collisions.length} reservations'`,
      });
    }
    return collisions;
  }

  private static async preventMultipleReserveNow(
    req: Request,
    filteredRequest: HttpReservationCreateRequest | HttpReservationUpdateRequest
  ) {
    let existingReservations = await ReservationStorage.getReservationsForUser(
      req.tenant,
      filteredRequest.userID,
      ReservationType.RESERVE_NOW,
      ReservationStatusEnum.IN_PROGRESS
    );
    existingReservations = existingReservations.filter(
      (reservation) => reservation.id !== filteredRequest.id
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

  private static async updateConnectorWithReservation(
    tenant: Tenant,
    chargingStation: ChargingStation,
    reservation: Reservation,
    saveConnector = false
  ) {
    const connector = Utils.getConnectorFromID(chargingStation, reservation.connectorID);
    const user = await UserStorage.getUserByTagID(tenant, reservation.idTag);
    connector.currentUserID = user.id;
    connector.currentTagID = reservation.idTag;
    connector.reservationID = reservation.id;
    if (saveConnector) {
      await ChargingStationStorage.saveChargingStationConnectors(
        tenant,
        chargingStation.id,
        chargingStation.connectors
      );
    }
  }

  private static async resetConnector(
    tenant: Tenant,
    chargingStation: ChargingStation,
    connectorID: number,
    saveConnector = false
  ) {
    const connector = Utils.getConnectorFromID(chargingStation, connectorID);
    connector.currentUserID = null;
    connector.currentTagID = null;
    connector.reservationID = null;
    if (saveConnector) {
      await ChargingStationStorage.saveChargingStationConnectors(
        tenant,
        chargingStation.id,
        chargingStation.connectors
      );
    }
  }
}
