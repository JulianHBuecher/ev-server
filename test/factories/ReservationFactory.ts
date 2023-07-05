import { faker } from '@faker-js/faker';
import moment from 'moment';
import { Factory } from 'rosie';

export default Factory.define('reservation')
  .attr('id', () => faker.datatype.number(1000000))
  .attr('chargingStationID', () =>
    faker.helpers.arrayElement(['CS-EVLINK-00004', 'CS-KEBA-00001', 'CS-KEBA-00002'])
  )
  .attr('connectorID', () => faker.datatype.number({ min: 1, max: 2 }))
  .attr('fromDate', () =>
    faker.datatype.datetime({
      min: moment().add(5, 'minutes').toDate().getTime(),
      max: moment().add(1, 'hour').toDate().getTime(),
    })
  )
  .attr('toDate', ['fromDate'], (fromDate: number) =>
    faker.datatype.datetime({
      min: moment(fromDate).toDate().getTime(),
      max: moment(fromDate).add(1, 'hour').toDate().getTime(),
    })
  )
  .attr('expiryDate', ['toDate'], (toDate: number) => moment(toDate).toDate())
  .attr('idTag', () => faker.random.alphaNumeric(20).toString().toUpperCase())
  .attr('visualTagID', () => faker.name.fullName())
  .attr('parentIdTag', () => faker.random.alphaNumeric(20).toString().toUpperCase())
  .attr('carID', () => faker.database.mongodbObjectId())
  .attr('type', () => faker.helpers.arrayElement(['planned_reservation', 'reserve_now']))
  .attr('status', () =>
    faker.helpers.arrayElement([
      'reservation_done',
      'reservation_scheduled',
      'reservation_in_progress',
      'reservation_cancelled',
      'reservation_expired',
    ])
  );
