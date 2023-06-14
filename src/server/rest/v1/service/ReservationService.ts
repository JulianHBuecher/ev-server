import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import AppAuthError from '../../../../exception/AppAuthError';
import ReservationStorage from '../../../../storage/mongodb/ReservationStorage';
import { Action, Entity } from '../../../../types/Authorization';
import { ReservationDataResult } from '../../../../types/DataResult';
import { HTTPAuthError } from '../../../../types/HTTPError';
import { HttpReservationsGetRequest } from '../../../../types/requests/HttpReservationRequest';
import Reservation from '../../../../types/Reservation';
import { ServerAction } from '../../../../types/Server';
import { TenantComponents } from '../../../../types/Tenant';
import Constants from '../../../../utils/Constants';
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
    const authorizations = await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      filteredRequest,
      Action.READ
    );
    if (!authorizations.authorized) {
      throw new AppAuthError({
        errorCode: HTTPAuthError.FORBIDDEN,
        user: req.user,
        action: Action.READ,
        entity: Entity.RESERVATION,
        module: MODULE_NAME,
        method: ReservationService.handleGetReservation.name,
        value: filteredRequest.ID.toString(),
      });
    }
    const reservation = await ReservationService.getReservation(req, filteredRequest.ID);
    UtilsService.assertObjectExists(
      action,
      reservation,
      `Reservation ID '${filteredRequest.ID}' does not exist`,
      MODULE_NAME,
      ReservationService.getReservation.name,
      req.user
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
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant,
      req.user,
      Action.LIST,
      filteredRequest,
      false
    );
    if (!authorizations.authorized) {
      UtilsService.sendEmptyDataResult(res, next);
    }
    const reservations = await ReservationService.getReservations(
      req,
      filteredRequest,
      {},
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
    await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      {},
      Action.CREATE,
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
    const reservation: Reservation = {
      ...filteredRequest,
      createdBy: { id: req.user.id },
      createdOn: new Date(),
      lastChangedBy: { id: req.user.id },
      lastChangedOn: new Date(),
    };
    await ReservationService.saveReservation(req, reservation);
    await Logging.logInfo({
      ...LoggingHelper.getReservationProperties(reservation),
      tenantID: req.tenant.id,
      user: req.user,
      module: MODULE_NAME,
      method: ReservationService.handleCreateReservation.name,
      message: `'${Utils.buildReservationName(reservation)}' has been created successfully`,
      action: action,
      detailedMessages: { reservation },
    });
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
    await AuthorizationService.checkAndGetReservationAuthorizations(
      req.tenant,
      req.user,
      {},
      Action.UPDATE,
      filteredRequest as Reservation
    );
    await ReservationService.updateReservation(req, {
      ...filteredRequest,
      lastChangedBy: { id: req.user.id },
      lastChangedOn: new Date(),
    });
    res.json(Constants.REST_RESPONSE_SUCCESS);
    next();
  }

  public static async handleDeleteReservation(
    action: ServerAction,
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationDeleteReq(
      req.query
    );
    UtilsService.assertIdIsProvided(
      action,
      filteredRequest.ID,
      MODULE_NAME,
      ReservationService.deleteReservation.name,
      req.user
    );
    await ReservationService.deleteReservation(req, filteredRequest.ID);
    res.json(Constants.REST_RESPONSE_SUCCESS);
    next();
  }

  private static async getReservation(
    req: Request,
    id: number = Constants.UNKNOWN_NUMBER_ID,
    additionalFilters: Record<string, any> = {},
    projectFields?: string[]
  ): Promise<Reservation> {
    return await ReservationStorage.getReservation(
      req.tenant,
      id,
      {
        ...additionalFilters,
        withChargingStation: true,
        withTag: true,
      },
      projectFields
    );
  }

  private static async getReservations(
    req: Request,
    filteredRequest: HttpReservationsGetRequest,
    additionalFilters: Record<string, any> = {},
    projectFields?: string[]
  ): Promise<ReservationDataResult> {
    return await ReservationStorage.getReservations(
      req.tenant,
      {
        search: filteredRequest.Search,
        withUser: filteredRequest.WithUser,
        withCar: filteredRequest.WithCar,
        withChargingStation: filteredRequest.WithChargingStation,
        withCompany: filteredRequest.WithCompany,
        withSite: filteredRequest.WithSite,
        withSiteArea: filteredRequest.WithSiteArea,
        withTag: filteredRequest.WithTag,
        ...additionalFilters,
      },
      {
        limit: filteredRequest.Limit ?? Constants.DB_PARAMS_MAX_LIMIT.limit,
        sort:
          UtilsService.httpSortFieldsToMongoDB(filteredRequest.SortFields) ??
          Constants.DB_PARAMS_MAX_LIMIT.sort,
        skip: filteredRequest.Skip ?? Constants.DB_PARAMS_MAX_LIMIT.skip,
        onlyRecordCount: filteredRequest.OnlyRecordCount,
      },
      projectFields
    );
  }

  private static async saveReservation(req: Request, reservation: Reservation): Promise<void> {
    await ReservationStorage.createReservation(req.tenant, reservation);
  }

  private static async updateReservation(req: Request, reservation: Reservation): Promise<void> {
    await ReservationStorage.updateReservation(req.tenant, reservation);
  }

  private static async deleteReservation(
    req: Request,
    id: number = Constants.UNKNOWN_NUMBER_ID
  ): Promise<void> {
    await ReservationStorage.deleteReservation(req.tenant, id);
  }
}
