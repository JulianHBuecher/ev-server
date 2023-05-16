import { RESTServerRoute, ServerAction } from '../../../../../types/Server';
import express, { NextFunction, Request, Response } from 'express';

import ReservationService from '../../service/ReservationService';
import RouterUtils from '../../../../../utils/RouterUtils';


export default class ReservationRouter {
  private router: express.Router;

  public constructor() {
    this.router = express.Router();
  }

  public buildRoutes(): express.Router {
    this.buildRouteReservations();
    this.buildRouteReservation();
    this.buildRouteReservationCreate();
    this.buildRouteReservationUpdate();
    this.buildRouteReservationDelete();
    return this.router;
  }

  private buildRouteReservations(): void {
    this.router.get(`/${RESTServerRoute.REST_RESERVATIONS}`, (req: Request, res: Response, next: NextFunction) => {
      void RouterUtils.handleRestServerAction(ReservationService.handleGetReservations.bind(this), ServerAction.RESERVATIONS, req, res, next);
    });
  }

  private buildRouteReservation(): void {
    this.router.get(`/${RESTServerRoute.REST_RESERVATION}`, (req: Request, res: Response, next: NextFunction) => {
      req.query.ID = req.params.id;
      void RouterUtils.handleRestServerAction(ReservationService.handleGetReservation.bind(this), ServerAction.RESERVATION, req, res, next);
    });
  }

  private buildRouteReservationCreate(): void {
    this.router.post(`/${RESTServerRoute.REST_RESERVATIONS}`, (req: Request, res: Response, next: NextFunction) => {
      void RouterUtils.handleRestServerAction(ReservationService.handleCreateReservation.bind(this), ServerAction.RESERVATION_CREATE, req, res, next);
    });
  }

  private buildRouteReservationUpdate(): void {
    this.router.put(`/${RESTServerRoute.REST_RESERVATION}`, (req: Request, res: Response, next: NextFunction) => {
      req.query.ID = req.params.id;
      void RouterUtils.handleRestServerAction(ReservationService.handleUpdateReservation.bind(this), ServerAction.RESERVATION_UPDATE, req, res, next);
    });
  }

  private buildRouteReservationDelete(): void {
    this.router.delete(`/${RESTServerRoute.REST_RESERVATION}`, (req: Request, res: Response, next: NextFunction) => {
      req.query.ID = req.params.id;
      void RouterUtils.handleRestServerAction(ReservationService.handleDeleteReservation.bind(this), ServerAction.RESERVATION_DELETE, req, res, next);
    });
  }
}
