
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import ReservationStorage from '../../../../storage/mongodb/ReservationStorage';
import { Action } from '../../../../types/Authorization';
import { ReservationDataResult } from '../../../../types/DataResult';
import Reservation from '../../../../types/Reservation';
import { ServerAction } from '../../../../types/Server';
import { HttpReservationCancelRequest, HttpReservationGetRequest, HttpReservationUpdateRequest, HttpReservationsGetRequest } from '../../../../types/requests/HttpReservationRequest';
import Constants from '../../../../utils/Constants';
import ReservationValidatorRest from '../validator/ReservationValidatorRest';
import AuthorizationService from './AuthorizationService';
import Utils from '../../../../utils/Utils';

const MODULE_NAME = 'ReservationService';

export default class ReservationService {

  public static async handleGetReservation(action: ServerAction, req: Request, res: Response, next: NextFunction): Promise<void> {
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationGetReq(req.body);
    res.json(await ReservationService.getReservation(req, filteredRequest));
    next();
  }

  public static async handleGetReservations(action: ServerAction, req: Request, res: Response, next: NextFunction): Promise<void> {
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationsGetReq(req.query);
    res.json(await ReservationService.getReservations(req, filteredRequest));
    next();
  }

  public static async handleCreateReservation(action: ServerAction, req: Request, res: Response, next: NextFunction): Promise<void> {
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationCreateReq(req.body);
    await ReservationService.saveReservation(req,filteredRequest);
    res.json({ status: StatusCodes.CREATED });
    next();
  }

  public static async handleUpdateReservation(action: ServerAction, req: Request, res: Response, next: NextFunction): Promise<void> {
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationUpdateReq(req.body);
    await ReservationService.updateReservation(req,filteredRequest);
    res.json({ status: StatusCodes.NO_CONTENT });
    next();
  }

  public static async handleDeleteReservation(action: ServerAction, req: Request, res: Response, next: NextFunction): Promise<void> {
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationCancelReq(req.body);
    await ReservationService.cancelReservation(req,filteredRequest);
    res.json({ status: StatusCodes.OK });
    next();
  }

  private static async getReservation(req: Request, filteredRequest: HttpReservationGetRequest,
      authAction: Action = Action.READ): Promise<Reservation> {
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant, req.user, authAction, filteredRequest, false);
    if (!authorizations.authorized) {
      return;
    }
    return await ReservationStorage.getReservationById(req.tenant,filteredRequest.args.id,filteredRequest.chargingStationId,filteredRequest.args.connectorId);
  }

  private static async getReservations(req: Request, filteredRequest: HttpReservationsGetRequest,
      authAction: Action = Action.LIST, additionalFilters: Record<string, any> = {}): Promise<ReservationDataResult> {
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant, req.user, authAction, filteredRequest, false);
    if (!authorizations.authorized) {
      return Constants.DB_EMPTY_DATA_RESULT;
    }
    return await ReservationStorage.getReservations(
      req.tenant,
      {
        reservationIds: filteredRequest.reservationIds ? filteredRequest.reservationIds.split('|').map((id) => Utils.convertToInt(id)) : null,
        chargingStationIds: filteredRequest.chargingStationIds ? filteredRequest.chargingStationIds.split('|') : null,
        connectorIds: filteredRequest.connectorIds ? filteredRequest.connectorIds.split('|').map((id) => Utils.convertToInt(id)) : null
      },
      Constants.DB_PARAMS_MAX_LIMIT);
  }

  private static async saveReservation(req: Request, filteredRequest: Reservation,
      authAction: Action = Action.CREATE): Promise<void> {
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant, req.user, authAction, {}, false);
    if (!authorizations.authorized) {
      return;
    }
    await ReservationStorage.createReservation(req.tenant, { ...filteredRequest });
  }

  private static async updateReservation(req: Request, filteredRequest: HttpReservationUpdateRequest,
      authAction: Action = Action.UPDATE): Promise<void> {
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant, req.user, authAction, filteredRequest, false);
    if (!authorizations.authorized) {
      return;
    }
    await ReservationStorage.updateReservation(req.tenant,{ ...filteredRequest.args });
  }

  private static async cancelReservation(req: Request, filteredRequest: HttpReservationCancelRequest,
      authAction: Action = Action.DELETE): Promise<void> {
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant, req.user, authAction, filteredRequest, false);
    if (!authorizations.authorized) {
      return;
    }
    await ReservationStorage.deleteReservationById(req.tenant,filteredRequest.args.id,filteredRequest.chargingStationId);
  }

}
