
import { NextFunction, Request, Response } from 'express';
import { ServerAction } from '../../../../types/Server';
import ReservationValidatorRest from '../validator/ReservationValidatorRest';
import UtilsService from './UtilsService';
import { Action } from '../../../../types/Authorization';
import AuthorizationService from './AuthorizationService';
import ReservationStorage from '../../../../storage/mongodb/ReservationStorage';
import Constants from '../../../../utils/Constants';
import OCPPUtils from '../../../ocpp/utils/OCPPUtils';
import { HttpReservationCancelRequest, HttpReservationGetRequest, HttpReservationUpdateRequest } from '../../../../types/requests/HttpReservationRequest';
import { ReservationDataResult } from '../../../../types/DataResult';
import Reservation from '../../../../types/Reservation';
import { StatusCodes } from 'http-status-codes';

const MODULE_NAME = 'ReservationService';

export default class ReservationService {

  public static async handleGetReservations(action: ServerAction, req: Request, res: Response, next: NextFunction): Promise<void> {
    const filteredRequest = ReservationValidatorRest.getInstance().validateReservationGetReq(req.body);
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

  private static async getReservations(req: Request, filteredRequest: HttpReservationGetRequest,
      authAction: Action = Action.LIST, additionalFilters: Record<string, any> = {}): Promise<ReservationDataResult> {
    const authorizations = await AuthorizationService.checkAndGetReservationsAuthorizations(
      req.tenant, req.user, authAction, filteredRequest, false);
    if (!authorizations.authorized) {
      return Constants.DB_EMPTY_DATA_RESULT;
    }
    return await ReservationStorage.getReservations(req.tenant,
      { chargingStationIDs: [filteredRequest.chargingStationID] }, Constants.DB_PARAMS_MAX_LIMIT);
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
    await ReservationStorage.deleteReservationById(req.tenant,filteredRequest.args.id,filteredRequest.chargingStationID);
  }

}
