import moment from 'moment';

import ChargingStationClientFactory from '../../../client/ocpp/ChargingStationClientFactory';
import LockingManager from '../../../locking/LockingManager';
import ReservationStorage from '../../../storage/mongodb/ReservationStorage';
import ChargingStation from '../../../types/ChargingStation';
import { LockEntity } from '../../../types/Locking';
import { OCPPReservationStatus } from '../../../types/ocpp/OCPPClient';
import { ChargePointStatus } from '../../../types/ocpp/OCPPServer';
import { ReservationStatus, ReservationType } from '../../../types/Reservation';
import { ServerAction } from '../../../types/Server';
import { TaskConfig } from '../../../types/TaskConfig';
import Tenant, { TenantComponents } from '../../../types/Tenant';
import Constants from '../../../utils/Constants';
import Logging from '../../../utils/Logging';
import Utils from '../../../utils/Utils';
import TenantSchedulerTask from '../../TenantSchedulerTask';

const MODULE_NAME = 'SynchronizeReservationsTask';

export default class SynchronizeReservationsTask extends TenantSchedulerTask {
  public async processTenant(tenant: Tenant, config: TaskConfig): Promise<void> {
    if (!Utils.isTenantComponentActive(tenant, TenantComponents.RESERVATION)) {
      await Logging.logDebug({
        tenantID: tenant.id,
        action: ServerAction.SYNCHRONIZE_RESERVATIONS,
        module: MODULE_NAME,
        method: 'run',
        message: 'Reservations not active in this Tenant',
      });
      return;
    }
    const reservationsLock = LockingManager.createExclusiveLock(
      tenant.id,
      LockEntity.RESERVATION,
      'synchronize-reservations'
    );
    if (await LockingManager.acquire(reservationsLock)) {
      try {
        const upcomingReservations = await ReservationStorage.getReservations(
          tenant,
          {
            withChargingStation: true,
            dateRange: { fromDate: moment().toDate(), toDate: moment().add(5, 'minutes').toDate() },
            statuses: [ReservationStatus.SCHEDULED],
          },
          Constants.DB_PARAMS_MAX_LIMIT
        );
        const ongoingReservations = await ReservationStorage.getReservations(
          tenant,
          {
            withChargingStation: true,
            dateRange: { fromDate: moment().toDate(), toDate: moment().add(5, 'minutes').toDate() },
            statuses: [ReservationStatus.IN_PROGRESS],
            types: [ReservationType.PLANNED_RESERVATION],
          },
          Constants.DB_PARAMS_MAX_LIMIT
        );
        if (!Utils.isEmptyArray(upcomingReservations.result)) {
          for (const reservation of upcomingReservations.result) {
            reservation.status = ReservationStatus.IN_PROGRESS;
            const chargingStationClient =
              await ChargingStationClientFactory.getChargingStationClient(
                tenant,
                reservation['chargingStation'] as ChargingStation
              );
            const response = await chargingStationClient.reserveNow({
              connectorId: reservation.connectorID,
              expiryDate: reservation.expiryDate ?? reservation.toDate,
              idTag: reservation.idTag,
              reservationId: reservation.id,
              parentIdTag: reservation.parentIdTag ?? '',
            });
            if (response.status === OCPPReservationStatus.ACCEPTED) {
              await ReservationStorage.updateReservation(tenant, reservation);
            }
          }
        }
        if (!Utils.isEmptyArray(ongoingReservations.result)) {
          for (const reservation of ongoingReservations.result) {
            const chargingStation = reservation['chargingStation'] as ChargingStation;
            if (
              chargingStation.connectors[reservation.connectorID].status ===
              ChargePointStatus.AVAILABLE
            ) {
              const chargingStationClient =
                await ChargingStationClientFactory.getChargingStationClient(
                  tenant,
                  chargingStation
                );
              await chargingStationClient.reserveNow({
                connectorId: reservation.connectorID,
                expiryDate: reservation.expiryDate ?? reservation.toDate,
                idTag: reservation.idTag,
                reservationId: reservation.id,
                parentIdTag: reservation.parentIdTag ?? '',
              });
            }
          }
        }
      } catch (error) {
        await Logging.logActionExceptionMessage(
          tenant.id,
          ServerAction.SYNCHRONIZE_RESERVATIONS,
          error as Error
        );
      } finally {
        await LockingManager.release(reservationsLock);
      }
    }
  }
}
