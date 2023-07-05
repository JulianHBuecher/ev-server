import { faker } from '@faker-js/faker';
import chai, { expect } from 'chai';
import chaiSubset from 'chai-subset';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';

import ChargingStation from '../../src/types/ChargingStation';
import { HTTPError } from '../../src/types/HTTPError';
import Reservation, { ReservationStatus, ReservationType } from '../../src/types/Reservation';
import User from '../../src/types/User';
import config from '../config';
import Factory from '../factories/Factory';
import CentralServerService from './client/CentralServerService';
import ContextDefinition from './context/ContextDefinition';
import ContextProvider from './context/ContextProvider';
import TenantContext from './context/TenantContext';

chai.use(chaiSubset);

class TestData {
  public superCentralService: CentralServerService;
  public centralService: CentralServerService;
  public newReservation: Reservation;
  public createdReservations: Reservation[] = [];
  public tenantContext: TenantContext;
  public userContext: any;
  public chargingStationContext: ChargingStation[];
}
const testData: TestData = new TestData();
describe('Reservation', () => {
  jest.setTimeout(60000);
  beforeAll(async () => {
    testData.superCentralService = new CentralServerService(null, {
      email: config.get('superadmin.username'),
      password: config.get('superadmin.password'),
    });
    testData.tenantContext = await ContextProvider.defaultInstance.getTenantContext(
      ContextDefinition.TENANT_CONTEXTS.TENANT_RESERVATION
    );
    testData.userContext = testData.tenantContext.getUserContext(
      ContextDefinition.USER_CONTEXTS.BASIC_USER
    );
    testData.chargingStationContext = testData.tenantContext
      .getChargingStations()
      .map((template) => template.chargingStation);
    testData.centralService = new CentralServerService(
      ContextDefinition.TENANT_CONTEXTS.TENANT_RESERVATION,
      {
        email: config.get('admin.username'),
        password: config.get('admin.password'),
      }
    );
  });

  afterAll(() => {});

  describe('Without any component (utnothing)', () => {
    describe('Where admin user', () => {
      beforeAll(() => {
        testData.centralService = new CentralServerService(
          ContextDefinition.TENANT_CONTEXTS.TENANT_WITH_NO_COMPONENTS,
          {
            email: config.get('admin.username'),
            password: config.get('admin.password'),
          }
        );
      });
      it('Should not be able to get reservations', async () => {
        const response = await testData.centralService.reservationApi.readReservations({});
        expect(response.status).to.equal(StatusCodes.FORBIDDEN);
      });
      it('Should not be able to get reservation by ID', async () => {
        const response = await testData.centralService.reservationApi.readReservation(null);
        expect(response.status).to.equal(StatusCodes.FORBIDDEN);
      });
    });
  });
  describe('With component reservation (utreservation)', () => {
    describe('Where admin user', () => {
      beforeAll(() => {
        testData.centralService = new CentralServerService(
          ContextDefinition.TENANT_CONTEXTS.TENANT_RESERVATION,
          {
            email: config.get('admin.username'),
            password: config.get('admin.password'),
          }
        );
      });
      it('Should be able to get reservations', async () => {
        const response = await testData.centralService.reservationApi.readReservations({});
        expect(response.status).to.equal(StatusCodes.OK);
      });
      it('Should not be able to get reservation without ID', async () => {
        const response = await testData.centralService.reservationApi.readReservation(null);
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      });
      it('Should be able to create a reservation', async () => {
        const newReservation = Factory.reservation.build({
          chargingStationID: testData.chargingStationContext[0].id,
          idTag: null,
          visualTagID: testData.userContext.tags[0].visualID,
          type: ReservationType.PLANNED_RESERVATION,
          status: ReservationStatus.SCHEDULED,
        }) as Reservation;
        testData.newReservation = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          newReservation
        );
        testData.createdReservations.push(testData.newReservation);
      });
      it('Should be able to get reservation by ID', async () => {
        const response = await testData.centralService.reservationApi.readReservation(
          testData.newReservation.id
        );
        expect(response.status).to.equal(StatusCodes.OK);
      });
      it('Should not be able to create a reservation without ID', async () => {
        const response = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          Factory.reservation.build({
            id: undefined,
            chargingStationID: testData.chargingStationContext[1].id,
            visualTagID: testData.userContext.tags[0].visualID,
          }),
          false
        );
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      });
      it('Should not be able to create a reservation without a type', async () => {
        const response = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          Factory.reservation.build({
            type: null,
            chargingStationID: testData.chargingStationContext[1].id,
            visualTagID: testData.userContext.tags[0].visualID,
          }),
          false
        );
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      });
      it('Should not be able to create a reservation without a expiry date', async () => {
        const response = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          Factory.reservation.build({
            chargingStationID: testData.chargingStationContext[1].id,
            visualTagID: testData.newReservation.visualTagID,
            fromDate: null,
            toDate: null,
            expiryDate: null,
          }),
          false
        );
        expect(response.status).to.equal(StatusCodes.BAD_REQUEST);
      });
      it('Should not be able to create a reservation with existing ID and another idTag', async () => {
        const response = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          Factory.reservation.build({
            id: testData.newReservation.id,
            chargingStationID: testData.chargingStationContext[1].id,
            type: ReservationType.PLANNED_RESERVATION,
          }),
          false
        );
        expect(response.status).to.equal(HTTPError.RESERVATION_ALREADY_EXISTS_ERROR);
      });
      it('Should not be able to create a reservation on charging station connector with existing reservation', async () => {
        const response = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          Factory.reservation.build({
            chargingStationID: testData.newReservation.chargingStationID,
            connectorID: testData.newReservation.connectorID,
            visualTagID: testData.newReservation.visualTagID, // TODO: Change this against another user
            fromDate: moment(testData.newReservation.fromDate).add(5, 'minutes').toDate(),
            toDate: moment(testData.newReservation.toDate).subtract(10, 'minutes').toDate(),
            expiryDate: moment(testData.newReservation.toDate).subtract(10, 'minutes').toDate(),
            type: ReservationType.PLANNED_RESERVATION,
          }),
          false
        );
        expect(response.status).to.equal(HTTPError.RESERVATION_COLLISION_ERROR);
      });
      it('Should not be able to create a reservation on charging station with a collision', async () => {
        const response = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          Factory.reservation.build({
            chargingStationID: testData.newReservation.chargingStationID,
            connectorID: testData.newReservation.connectorID,
            visualTagID: testData.newReservation.visualTagID, // TODO: Change this against another user
            fromDate: moment(testData.newReservation.fromDate).add(5, 'minutes').toDate(),
            toDate: moment(testData.newReservation.toDate).subtract(10, 'minutes').toDate(),
            type: ReservationType.PLANNED_RESERVATION,
          }),
          false
        );
        expect(response.status).to.equal(HTTPError.RESERVATION_COLLISION_ERROR);
      });
      // it('Should not be able to create multiple "ReserveNow" reservations by a user', async () => {
      //   const response = await testData.centralService.createEntity(
      //     testData.centralService.reservationApi,
      //     Factory.reservation.build({
      //       chargingStationID: testData.newReservation.chargingStationID,
      //       visualTagID: testData.newReservation.visualTagID, // TODO: Change this against another user
      //       fromDate: moment().add(2, 'hours').toDate(),
      //       toDate: moment().add(2.5, 'hours').toDate(),
      //       idTag: testData.newReservation.idTag,
      //       type: testData.newReservation.type,
      //     }),
      //     false
      //   );
      //   expect(response.status).to.equal(HTTPError.RESERVATION_MULTIPLE_RESERVE_NOW_ERROR);
      // });
      it('Should be able to update a reservation', async () => {
        const reservationToUpdate = (
          await testData.centralService.reservationApi.readReservation(
            testData.createdReservations[0].id
          )
        ).data;
        reservationToUpdate.visualTagID = testData.createdReservations[0].visualTagID;
        reservationToUpdate.idTag = testData.createdReservations[0].idTag;
        reservationToUpdate.expiryDate = moment().add(1, 'hour').toDate();
        reservationToUpdate.toDate = moment().add(1, 'hour').toDate();
        testData.newReservation = await testData.centralService.updateEntity(
          testData.centralService.reservationApi,
          reservationToUpdate
        );
      });
      it('Should not be be able to update a reservation and create a collision', async () => {
        testData.newReservation = await testData.centralService.createEntity(
          testData.centralService.reservationApi,
          Factory.reservation.build({
            chargingStationID: testData.createdReservations[0].chargingStationID,
            connectorID: testData.createdReservations[0].connectorID,
            visualTagID: testData.createdReservations[0].visualTagID, // TODO: Change this against another user
            fromDate: moment().add(2, 'hours').toDate(),
            toDate: moment().add(2.5, 'hours').toDate(),
            idTag: testData.createdReservations[0].idTag,
            type: testData.createdReservations[0].type,
            status: testData.createdReservations[0].status,
          })
        );
        testData.createdReservations.push(testData.newReservation);
        testData.newReservation.fromDate = moment(testData.createdReservations[0].fromDate)
          .add(5, 'minutes')
          .toDate();
        testData.newReservation.toDate = moment(testData.createdReservations[0].toDate)
          .subtract(15, 'minutes')
          .toDate();
        testData.newReservation.expiryDate = testData.newReservation.toDate;
        const response = await testData.centralService.updateEntity(
          testData.centralService.reservationApi,
          testData.newReservation,
          false
        );
        expect(response.status).to.equal(HTTPError.RESERVATION_COLLISION_ERROR);
      });
      it('Should be able to cancel a owned reservation', async () => {
        const response = await testData.centralService.reservationApi.cancelReservation(
          testData.createdReservations[0].id,
          testData.createdReservations[0].chargingStationID,
          testData.createdReservations[0].connectorID
        );
        expect(response.status).to.equal(StatusCodes.OK);
      });
      it('Should be able to cancel a reservation of another user', async () => {
        const response = await testData.centralService.reservationApi.cancelReservation(
          testData.newReservation.id,
          testData.newReservation.chargingStationID,
          testData.newReservation.connectorID
        );
        expect(response.status).to.equal(StatusCodes.OK);
      });
      // it('Should be able to delete a owned reservation', async () => {
      //   const response = await testData.centralService.reservationApi.delete(
      //     testData.createdReservations[0].id
      //   );
      //   expect(response.status).to.equal(StatusCodes.OK);
      // });
      // it('Should be able to delete a reservation of another user', async () => {
      //   const response = await testData.centralService.reservationApi.delete(
      //     testData.newReservation.id
      //   );
      //   expect(response.status).to.equal(StatusCodes.OK);
      // });
      // it('Should not be able to delete a reservation with non-existing ID', async () => {
      //   const response = await testData.centralService.reservationApi.delete(
      //     testData.newReservation.id
      //   );
      //   expect(response.status).to.equal(StatusCodes.INTERNAL_SERVER_ERROR);
      // });
      afterAll(async () => {
        testData.centralService = new CentralServerService(
          ContextDefinition.TENANT_CONTEXTS.TENANT_RESERVATION,
          {
            email: config.get('admin.username'),
            password: config.get('admin.password'),
          }
        );
        // Delete any created reservation
        for (const reservation of testData.createdReservations) {
          await testData.centralService.deleteEntity(
            testData.centralService.reservationApi,
            reservation,
            false
          );
        }
      });
    });
  });
});
