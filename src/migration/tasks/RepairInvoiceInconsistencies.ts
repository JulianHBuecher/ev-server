import BillingFactory from '../../integration/billing/BillingFactory';
import Constants from '../../utils/Constants';
import Logging from '../../utils/Logging';
import MigrationTask from '../MigrationTask';
import { ServerAction } from '../../types/Server';
import StripeBillingIntegration from '../../integration/billing/stripe/StripeBillingIntegration';
import Tenant from '../../types/Tenant';
import TenantStorage from '../../storage/mongodb/TenantStorage';
import Utils from '../../utils/Utils';
import moment from 'moment';
import BillingStorage from '../../storage/mongodb/BillingStorage';
import { BillingInvoice } from '../../types/Billing';

const MODULE_NAME = 'RepairInvoiceInconsistencies';

export default class RepairInvoiceInconsistencies extends MigrationTask {
  async migrate(): Promise<void> {
    const tenants = await TenantStorage.getTenants({}, Constants.DB_PARAMS_MAX_LIMIT);
    for (const tenant of tenants.result) {
      await this.migrateTenant(tenant);
    }
  }

  async migrateTenant(tenant: Tenant): Promise<void> {
    const billingImpl = await BillingFactory.getBillingImpl(tenant);
    if (billingImpl && billingImpl instanceof StripeBillingIntegration) {
      await this.repairInvoices(tenant, billingImpl);
      await Logging.logDebug({
        tenantID: Constants.DEFAULT_TENANT,
        module: MODULE_NAME, method: 'migrateTenant',
        action: ServerAction.MIGRATION,
        message: `Invoice consistency has been checked for tenant: ${Utils.buildTenantName(tenant)}`
      });
    }
  }

  getVersion(): string {
    return '1.0';
  }

  getName(): string {
    return 'RepairInvoiceInconsistenciesTask';
  }

  isAsynchronous(): boolean {
    return true;
  }

  public async repairInvoices(tenant: Tenant, billingImpl: StripeBillingIntegration): Promise<void> {
    await billingImpl.checkConnection();
    const limit = Constants.BATCH_PAGE_SIZE;
    const filter = {
      startDateTime: moment().date(0).date(1).startOf('day').toDate() // 1st day of the previous month 00:00:00 (AM)
    },;
    const sort: { createdOn: 1 };
    let skip = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const invoices = await BillingStorage.getInvoices(tenant, filter, { sort, limit, skip });
      if (Utils.isEmptyArray(invoices.result)) {
        break;
      }
      skip += limit;
      for (const billingInvoice of invoices.result) {
        try {
          // Skip invoices that are already PAID or not relevant for the current billing process
          if (billingInvoice.sessions !== null) {
            continue;
          }
          await this.repairInvoice(tenant, billingImpl, billingInvoice);
        } catch (error) {
          await Logging.logError({
            tenantID: tenant.id,
            action: ServerAction.BILLING_PERFORM_OPERATIONS,
            actionOnUser: billingInvoice.user,
            module: MODULE_NAME, method: 'repairInvoices',
            message: `Failed to repair invoice: '${billingInvoice.id}'`,
            detailedMessages: { error: error.stack }
          });
        }
      }
    }
  }

  public async repairInvoice(tenant: Tenant, billingImpl: StripeBillingIntegration, billingInvoice: BillingInvoice): Promise<void> {
    const stripeInvoice = await billingImpl.getStripeInvoice(billingInvoice.invoiceID);
    // TODO!
    await Logging.logWarning({
      tenantID: tenant.id,
      action: ServerAction.BILLING_PERFORM_OPERATIONS,
      actionOnUser: billingInvoice.user,
      module: MODULE_NAME, method: 'repairInvoices',
      message: `Attempt to repair invoice: '${billingInvoice.id}'`
    });
  }

}
