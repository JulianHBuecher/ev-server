import Reservation from '../../../src/types/Reservation';
import { RESTServerRoute } from '../../../src/types/Server';
import AuthenticatedBaseApi from './utils/AuthenticatedBaseApi';
import CrudApi from './utils/CrudApi';
import TestConstants from './utils/TestConstants';

export default class ReservationApi extends CrudApi {
  public constructor(authenticatedApi: AuthenticatedBaseApi) {
    super(authenticatedApi);
  }

  public async readReservations(
    params,
    paging = TestConstants.DEFAULT_PAGING,
    ordering = TestConstants.DEFAULT_ORDERING
  ) {
    return super.readAll(
      params,
      paging,
      ordering,
      this.buildRestEndpointUrl(RESTServerRoute.REST_RESERVATIONS)
    );
  }

  public async readReservation(id: number) {
    return super.read(
      { ID: id },
      this.buildRestEndpointUrl(RESTServerRoute.REST_RESERVATION, { id })
    );
  }

  public async update(data: Reservation) {
    return super.update(
      data,
      this.buildRestEndpointUrl(RESTServerRoute.REST_RESERVATION, { id: data.id })
    );
  }

  public async create(data: Reservation) {
    return super.create(data, this.buildRestEndpointUrl(RESTServerRoute.REST_RESERVATIONS));
  }

  public async delete(id: number) {
    return super.delete(
      id,
      this.buildRestEndpointUrl(RESTServerRoute.REST_RESERVATION, { id: id })
    );
  }

  public async cancelReservation(id: number, chargingStationID: string, connectorID: number) {
    return super.update(
      { args: { chargingStationID: chargingStationID, connectorID: connectorID } },
      this.buildRestEndpointUrl(RESTServerRoute.REST_RESERVATION_CANCEL, {
        id: id,
      })
    );
  }
}
