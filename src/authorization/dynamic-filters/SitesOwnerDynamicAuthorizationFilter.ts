import { AuthorizationFilter, DynamicAuthorizationDataSourceName, Entity } from '../../types/Authorization';

import DynamicAuthorizationFilter from '../DynamicAuthorizationFilter';
import SitesOwnerDynamicAuthorizationDataSource from '../dynamic-data-source/SitesOwnerDynamicAuthorizationDataSource';
import Utils from '../../utils/Utils';

export default class SitesOwnerDynamicAuthorizationFilter extends DynamicAuthorizationFilter {
  public processFilter(authorizationFilters: AuthorizationFilter, extraFilters: Record<string, any>): void {
    // Get Site IDs
    const sitesOwnerDataSource = this.getDataSource(
      DynamicAuthorizationDataSourceName.SITES_OWNER) as SitesOwnerDynamicAuthorizationDataSource;
    const { siteIDs } = sitesOwnerDataSource.getData();
    // Check
    if (!Utils.isEmptyArray(siteIDs)) {
      // Force the filter
      authorizationFilters.filters.siteIDs = siteIDs;
      // Check if filter is provided
      if (Utils.objectHasProperty(extraFilters, 'SiteID') &&
          !Utils.isNullOrUndefined(extraFilters['SiteID'])) {
        const filteredSiteIDs: string[] = extraFilters['SiteID'].split('|');
        // Override
        authorizationFilters.filters.siteIDs = filteredSiteIDs.filter(
          (siteID) => authorizationFilters.filters.siteIDs.includes(siteID));
      }
    }
    if (!Utils.isEmptyArray(authorizationFilters.filters.siteIDs)) {
      authorizationFilters.authorized = true;
    }
    if (this.negateFilter) {
      authorizationFilters.authorized = !authorizationFilters.authorized;
    }
  }

  public getApplicableEntities(): Entity[] {
    return [
      Entity.SITE,
      Entity.USERS
    ];
  }

  public getApplicableDataSources(): DynamicAuthorizationDataSourceName[] {
    return [
      DynamicAuthorizationDataSourceName.SITES_OWNER
    ];
  }
}