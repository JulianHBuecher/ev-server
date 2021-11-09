export enum ServerAction {
  UNKNOWN_ACTION = 'Unknown',

  LOGIN = 'RestLogin',
  LOGOUT = 'RestLogout',
  PASSWORD_RESET = 'RestReset',
  PING = 'Ping',
  CHECK_CONNECTION = 'CheckConnection',

  OBJECT_CLONE = 'ObjectClone',

  CHARGING_STATION_CLIENT_INITIALIZATION = 'ChargingStationClientInitialization',
  CHARGING_STATION_RESET = 'RestChargingStationReset',
  CHARGING_STATION_REQUEST_OCPP_PARAMETERS = 'RestChargingStationRequestOcppParameters',
  CHARGING_STATION_CLEAR_CACHE = 'RestChargingStationClearCache',
  CHARGING_STATION_TRIGGER_DATA_TRANSFER = 'RestChargingStationDataTransfer',
  CHARGING_STATION_GET_CONFIGURATION = 'RestChargingStationGetConfiguration',
  CHARGING_STATION_CHANGE_CONFIGURATION = 'RestChargingStationChangeConfiguration',
  CHARGING_STATION_DATA_TRANSFER = 'ChargingStationChangeDataTransfer',
  CHARGING_STATION_REMOTE_START_TRANSACTION = 'RestChargingStationRemoteStartTransaction',
  CHARGING_STATION_REMOTE_STOP_TRANSACTION = 'RestChargingStationRemoteStopTransaction',
  CHARGING_STATION_UNLOCK_CONNECTOR = 'RestChargingStationUnlockConnector',
  CHARGING_STATION_SET_CHARGING_PROFILE = 'ChargingStationSetChargingProfile',
  CHARGING_STATION_GET_COMPOSITE_SCHEDULE = 'RestChargingStationGetCompositeSchedule',
  CHARGING_STATION_CLEAR_CHARGING_PROFILE = 'ChargingStationClearChargingProfile',
  CHARGING_STATION_GET_DIAGNOSTICS = 'RestChargingStationGetDiagnostics',
  CHARGING_STATION_UPDATE_FIRMWARE = 'RestChargingStationUpdateFirmware',
  CHARGING_STATION_CHANGE_AVAILABILITY = 'RestChargingStationChangeAvailability',
  CHARGING_STATION_DOWNLOAD_QR_CODE_PDF = 'RestChargingStationDownloadQrCodePdf',

  CHARGING_STATIONS_EXPORT = 'RestChargingStationsExport',
  CHARGING_STATIONS_OCPP_PARAMS_EXPORT = 'RestChargingStationsOcppParamsExport',
  CHARGING_STATION = 'RestChargingStation',
  CHARGING_STATIONS_OCPP_PARAMETERS = 'RestChargingStationOcppParameters',
  CHARGING_STATIONS_IN_ERROR = 'RestChargingStationsInError',
  CHARGING_STATION_UPDATE_PARAMS = 'RestChargingStationUpdateParams',
  CHARGING_STATION_LIMIT_POWER = 'RestChargingStationLimitPower',
  CHARGING_STATION_DELETE = 'RestChargingStationDelete',
  CHARGING_STATION_RESERVE_NOW = 'RestChargingStationReserveNow',
  CHARGING_STATION_CANCEL_RESERVATION = 'RestChargingStationCancelReservation',

  CHECK_SMART_CHARGING_CONNECTION = 'RestCheckSmartChargingConnection',
  TRIGGER_SMART_CHARGING = 'RestTriggerSmartCharging',

  REGISTRATION_TOKEN = 'RegistrationToken',
  REGISTRATION_TOKENS = 'RegistrationTokens',
  REGISTRATION_TOKEN_DELETE = 'RegistrationTokenDelete',
  REGISTRATION_TOKEN_REVOKE = 'RegistrationTokenRevoke',
  REGISTRATION_TOKEN_UPDATE = 'RegistrationTokenUpdate',

  BOOT_NOTIFICATIONS = 'RestBootNotifications',
  STATUS_NOTIFICATIONS = 'RestStatusNotifications',

  TRANSACTION_SOFT_STOP = 'TransactionSoftStop',
  TRANSACTION_DELETE = 'TransactionDelete',
  TRANSACTIONS_DELETE = 'TransactionsDelete',
  UPDATE_TRANSACTION = 'UpdateTransaction',

  LOGGINGS = 'Loggings',
  LOGGING = 'Logging',
  LOGGINGS_EXPORT = 'LoggingsExport',

  CHARGING_STATIONS = 'RestChargingStations',

  CAR_CATALOGS = 'CarCatalogs',
  CAR_CATALOG = 'CarCatalog',
  CAR_CATALOG_IMAGE = 'CarCatalogImage',
  CAR_CATALOG_IMAGES = 'CarCatalogImages',
  CAR_MAKERS = 'CarMakers',
  CAR_CREATE = 'CarCreate',
  CAR_UPDATE = 'CarUpdate',
  CAR_DELETE = 'CarDelete',
  CARS = 'Cars',
  CAR = 'Car',
  SYNCHRONIZE_CAR_CATALOGS = 'SynchronizeCarCatalogs',

  GET_CONNECTOR_CURRENT_LIMIT = 'GetConnectorCurrentLimit',
  REGISTER_USER = 'RestRegisterUser',
  CHARGING_PROFILES = 'RestChargingProfiles',
  CHARGING_PROFILE_DELETE = 'RestChargingProfileDelete',
  CHARGING_PROFILE_UPDATE = 'RestChargingProfileUpdate',
  CHARGING_PROFILE_CREATE = 'RestChargingProfileCreate',
  GENERATE_QR_CODE_FOR_CONNECTOR = 'RestGenerateQrCodeForConnector',
  OCPP_PARAM_UPDATE = 'OcppParamUpdate',
  RESEND_VERIFICATION_MAIL = 'RestResendVerificationEmail',
  END_USER_LICENSE_AGREEMENT = 'RestEndUserLicenseAgreement',
  CHECK_END_USER_LICENSE_AGREEMENT = 'RestCheckEndUserLicenseAgreement',
  VERIFY_EMAIL = 'RestVerifyEmail',
  FIRMWARE_DOWNLOAD = 'RestFirmwareDownload',

  OFFLINE_CHARGING_STATION = 'OfflineChargingStation',

  LOGS_CLEANUP = 'LogsCleanup',
  PERFORMANCES_CLEANUP = 'PerformancesCleanup',
  PERFORMANCES = 'Performances',

  SCHEDULER = 'Scheduler',
  ASYNC_TASK = 'AsyncTask',

  REMOTE_PUSH_NOTIFICATION = 'RemotePushNotification',
  EMAIL_NOTIFICATION = 'EmailNotification',
  END_USER_REPORT_ERROR = 'EndUserReportError',

  SYNCHRONIZE_REFUND = 'RefundSynchronize',

  REGISTRATION_TOKEN_CREATE = 'RegistrationTokenCreate',

  INTEGRATION_CONNECTION_CREATE = 'IntegrationConnectionCreate',
  INTEGRATION_CONNECTIONS = 'IntegrationConnections',
  INTEGRATION_CONNECTION = 'IntegrationConnection',
  INTEGRATION_CONNECTION_DELETE = 'IntegrationConnectionDelete',

  ROAMING = 'Roaming',
  OCPI_SETTINGS = 'OcpiSettings',
  OCPI_CLIENT_INITIALIZATION = 'OcpiClientInitialization',
  OCPI_ENDPOINT_CREATE = 'OcpiEndpointCreate',
  OCPI_ENDPOINT_PING = 'OcpiEndpointPing',
  OCPI_ENDPOINT_CHECK_CDRS = 'OcpiEndpointCheckCdrs',
  OCPI_ENDPOINT_CHECK_LOCATIONS = 'OcpiEndpointCheckLocations',
  OCPI_ENDPOINT_CHECK_SESSIONS = 'OcpiEndpointCheckSessions',
  OCPI_ENDPOINT_PULL_CDRS = 'OcpiEndpointPullCdrs',
  OCPI_ENDPOINT_PULL_LOCATIONS = 'OcpiEndpointPullLocations',
  OCPI_ENDPOINT_PULL_SESSIONS = 'OcpiEndpointPullSessions',
  OCPI_ENDPOINT_PULL_TOKENS = 'OcpiEndpointPullTokens',
  OCPI_ENDPOINT_SEND_EVSE_STATUSES = 'OcpiEndpointSendEVSEStatuses',
  OCPI_ENDPOINT_SEND_TOKENS = 'OcpiEndpointSendTokens',
  OCPI_ENDPOINT_GENERATE_LOCAL_TOKEN = 'OcpiEndpointGenerateLocalToken',
  OCPI_ENDPOINTS = 'OcpiEndpoints',
  OCPI_ENDPOINT = 'OcpiEndpoint',
  OCPI_REGISTER = 'OcpiRegister',
  OCPI_UNREGISTER = 'OcpiUnregister',
  OCPI_AUTHORIZE_TOKEN = 'OcpiAuthorizeToken',
  OCPI_COMMAND = 'OcpiCommand',
  OCPI_PUT_TOKEN = 'OcpiPutToken',
  OCPI_PATCH_TOKEN = 'OcpiPatchToken',
  OCPI_PATCH_LOCATION = 'OcpiPatchLocation',
  OCPI_PATCH_STATUS = 'OcpiPatchStatus',
  OCPI_PATCH_SESSION = 'OcpiPatchSession',
  OCPI_PUT_LOCATION = 'OcpiPutLocation',
  OCPI_PUT_SESSION = 'OcpiPutSession',
  OCPI_CHECK_CDRS = 'OcpiCheckCdrs',
  OCPI_CHECK_SESSIONS = 'OcpiCheckSessions',
  OCPI_CHECK_LOCATIONS = 'OcpiCheckLocations',
  OCPI_CHECK_TOKENS = 'OcpiCheckTokens',
  OCPI_PUSH_TOKEN = 'OcpiPushToken',
  OCPI_PUSH_TOKENS = 'OcpiPushTokens',
  OCPI_PUSH_SESSION = 'OcpiPushSession',
  OCPI_PUSH_SESSIONS = 'OcpiPushSessions',
  OCPI_PUSH_EVSE_STATUSES = 'OcpiPushEVSEStatuses',
  OCPI_PUSH_CDRS = 'OcpiPushCdrs',
  OCPI_PULL_CDRS = 'OcpiPullCdrs',
  OCPI_PULL_LOCATIONS = 'OcpiPullLocations',
  OCPI_PULL_SESSIONS = 'OcpiPullSessions',
  OCPI_PULL_TOKENS = 'OcpiPullTokens',
  OCPI_START_SESSION = 'OcpiStartSession',
  OCPI_STOP_SESSION = 'OcpiStopSession',
  OCPI_RESERVE_NOW = 'OcpiReserveNow',
  OCPI_UNLOCK_CONNECTOR = 'OcpiUnlockConnector',
  OCPI_GET_VERSIONS = 'OcpiGetVersions',
  OCPI_GET_ENDPOINT_VERSIONS = 'OcpiGetEndpointVersions',
  OCPI_GET_LOCATIONS = 'OcpiGetLocations',
  OCPI_GET_TOKEN = 'OcpiGetToken',
  OCPI_GET_TARIFF = 'OcpiGetTariff',
  OCPI_GET_TARIFFS = 'OcpiGetTariffs',
  OCPI_POST_CREDENTIALS = 'OcpiPostCredentials',
  OCPI_DELETE_CREDENTIALS = 'OcpiDeleteCredentials',
  OCPI_ENDPOINT_UPDATE = 'OcpiEndpointUpdate',
  OCPI_ENDPOINT_REGISTER = 'OcpiEndpointRegister',
  OCPI_ENDPOINT_UNREGISTER = 'OcpiEndpointUnregister',
  OCPI_ENDPOINT_DELETE = 'OcpiEndpointDelete',

  OICP_SETTINGS = 'OicpSettings',
  OICP_ENDPOINT_CREATE = 'OicpEndpointCreate',
  OICP_ENDPOINT_PING = 'OicpEndpointPing',
  OICP_ENDPOINT = 'OicpEndpoint',
  OICP_ENDPOINTS = 'OicpEndpoints',
  OICP_ENDPOINT_START = 'OicpEndpointStart',
  OICP_PUSH_EVSE_DATA = 'OicpPushEvseData',
  OICP_PUSH_EVSE_STATUSES = 'OicpPushEvseStatuses',
  OICP_UPDATE_EVSE_STATUS = 'OicpUpdateEvseStatus',
  OICP_AUTHORIZE_START = 'OicpAuthorizeStart',
  OICP_AUTHORIZE_STOP = 'OicpAuthorizeStop',
  OICP_AUTHORIZE_REMOTE_START = 'OicpAuthorizeRemoteStart',
  OICP_AUTHORIZE_REMOTE_STOP = 'OicpAuthorizeRemoteStop',
  OICP_PUSH_CDRS = 'OicpPushCdrs',
  OICP_PUSH_EVSE_PRICING = 'OicpPushEvsePricing',
  OICP_PUSH_PRICING_PRODUCT_DATA = 'OicpPushPricingProductData',
  OICP_SEND_CHARGING_NOTIFICATION_START = 'OicpSendChargingNotificationStart',
  OICP_SEND_CHARGING_NOTIFICATION_PROGRESS = 'OicpSendChargingNotificationProgress',
  OICP_SEND_CHARGING_NOTIFICATION_END = 'OicpSendChargingNotificationEnd',
  OICP_SEND_CHARGING_NOTIFICATION_ERROR = 'OicpSendChargingNotificationError',
  OICP_ENDPOINT_SEND_EVSE_STATUSES = 'OicpEndpointSendEVSEStatuses',
  OICP_ENDPOINT_SEND_EVSES = 'OicpEndpointSendEVSEs',
  OICP_PUSH_SESSIONS = 'OicpPushSessions',
  OICP_CREATE_AXIOS_INSTANCE = 'OicpCreateAxiosInstance',
  OICP_ENDPOINT_UPDATE = 'OicpEndpointUpdate',
  OICP_ENDPOINT_REGISTER = 'OicpEndpointRegister',
  OICP_ENDPOINT_UNREGISTER = 'OicpEndpointUnregister',
  OICP_ENDPOINT_DELETE = 'OicpEndpointDelete',

  OCPP_SERVICE = 'OcppService',

  AUTHORIZATIONS = 'Authorizations',

  DB_WATCH = 'DBWatch',
  DB_MONITOR = 'DBMonitor',

  EXPRESS_SERVER = 'ExpressServer',
  ODATA_SERVER = 'ODataServer',

  LOCKING = 'Locking',

  STARTUP = 'Startup',

  BOOTSTRAP_STARTUP = 'BootstrapStartup',

  OCPP_BOOT_NOTIFICATION = 'OcppBootNotification',
  OCPP_AUTHORIZE = 'OcppAuthorize',
  OCPP_HEARTBEAT = 'OcppHeartbeat',
  OCPP_DIAGNOSTICS_STATUS_NOTIFICATION = 'OcppDiagnosticsStatusNotification',
  OCPP_FIRMWARE_STATUS_NOTIFICATION = 'OcppFirmwareStatusNotification',
  OCPP_STATUS_NOTIFICATION = 'OcppStatusNotification',
  OCPP_START_TRANSACTION = 'OcppStartTransaction',
  OCPP_STOP_TRANSACTION = 'OcppStopTransaction',
  OCPP_METER_VALUES = 'OcppMeterValues',
  OCPP_DATA_TRANSFER = 'OcppDataTransfer',

  EXTRA_INACTIVITY = 'ExtraInactivity',

  CONSUMPTION = 'Consumption',
  REBUILD_TRANSACTION_CONSUMPTIONS = 'RebuildTransactionConsumptions',

  WS_CLIENT_ERROR = 'WSClientError',
  WS_CLIENT_INFO = 'WSClientInfo',

  WS_CONNECTION = 'WSConnection',
  WS_CONNECTION_OPENED = 'WSConnectionOpened',
  WS_CONNECTION_CLOSED = 'WSConnectionClosed',

  WS_JSON_CONNECTION_OPENED = 'WSJsonConnectionOpened',
  WS_JSON_CONNECTION_CLOSED = 'WSJsonConnectionClosed',
  WS_JSON_CONNECTION_ERROR = 'WSJsonConnectionError',
  WS_JSON_CONNECTION_PINGED = 'WSJsonConnectionPinged',
  WS_JSON_CONNECTION_PONGED = 'WSJsonConnectionPonged',

  WS_REST_CONNECTION_OPENED = 'WSRestServerConnectionOpened',
  WS_REST_CONNECTION_CLOSED = 'WSRestServerConnectionClosed',
  WS_REST_CONNECTION_ERROR = 'WSRestServerConnectionError',

  WS_REST_CLIENT_ERROR_RESPONSE = 'WSRestClientErrorResponse',
  WS_REST_CLIENT_MESSAGE = 'WSRestClientMessage',
  WS_REST_CLIENT_SEND_MESSAGE = 'WSRestClientSendMessage',
  WS_REST_CLIENT_CONNECTION = 'WSRestClientConnection',
  WS_REST_CLIENT_CONNECTION_CLOSED = 'WSRestClientConnectionClosed',
  WS_REST_CLIENT_CONNECTION_OPENED = 'WSRestClientConnectionOpened',
  WS_REST_CLIENT_CONNECTION_ERROR = 'WSRestClientConnectionError',

  NOTIFICATION = 'Notification',
  CHARGING_STATION_STATUS_ERROR = 'ChargingStationStatusError',
  CHARGING_STATION_REGISTERED = 'ChargingStationRegistered',
  END_OF_CHARGE = 'EndOfCharge',
  OPTIMAL_CHARGE_REACHED = 'OptimalChargeReached',
  END_OF_SESSION = 'EndOfSession',
  REQUEST_PASSWORD = 'RequestPassword',
  USER_ACCOUNT_STATUS_CHANGED = 'UserAccountStatusChanged',
  NEW_REGISTERED_USER = 'NewRegisteredUser',
  UNKNOWN_USER_BADGED = 'UnknownUserBadged',
  TRANSACTION_STARTED = 'TransactionStarted',
  VERIFICATION_EMAIL = 'VerificationEmail',
  VERIFICATION_EMAIL_USER_IMPORT = 'VerificationEmailUserImport',
  PATCH_EVSE_STATUS_ERROR = 'PatchEVSEStatusError',
  PATCH_EVSE_ERROR = 'PatchEVSEError',
  USER_ACCOUNT_INACTIVITY = 'UserAccountInactivity',
  PREPARING_SESSION_NOT_STARTED = 'PreparingSessionNotStarted',
  OFFLINE_CHARGING_STATIONS = 'OfflineChargingStations',
  BILLING_USER_SYNCHRONIZATION_FAILED = 'BillingUserSynchronizationFailed',
  BILLING_INVOICE_SYNCHRONIZATION_FAILED = 'BillingInvoiceSynchronizationFailed',
  USER_ACCOUNT_VERIFICATION = 'UserAccountVerification',
  USER_CREATE_PASSWORD = 'UserCreatePassword',
  ADMIN_ACCOUNT_VERIFICATION = 'AdminAccountVerificationNotification',

  CAR_CATALOG_SYNCHRONIZATION_FAILED = 'CarCatalogSynchronizationFailed',
  CAR_CATALOG_SYNCHRONIZATION = 'CarCatalogSynchronization',
  SESSION_NOT_STARTED_AFTER_AUTHORIZE = 'SessionNotStartedAfterAuthorize',

  UPDATE_CHARGING_STATION_WITH_TEMPLATE = 'UpdateChargingStationWithTemplate',
  UPDATE_CHARGING_STATION_TEMPLATES = 'UpdateChargingStationTemplates',

  MIGRATION = 'Migration',

  SESSION_HASH_SERVICE = 'SessionHashService',

  CLEANUP_TRANSACTION = 'CleanupTransaction',
  TRANSACTIONS_COMPLETED = 'TransactionsCompleted',
  TRANSACTIONS_TO_REFUND = 'TransactionsToRefund',
  TRANSACTIONS_TO_REFUND_EXPORT = 'TransactionsToRefundExport',
  TRANSACTIONS_TO_REFUND_REPORTS = 'TransactionsRefundReports',
  TRANSACTIONS_EXPORT = 'TransactionsExport',
  TRANSACTIONS_ACTIVE = 'TransactionsActive',
  TRANSACTIONS_IN_ERROR = 'TransactionsInError',
  TRANSACTION_YEARS = 'TransactionYears',
  TRANSACTION = 'Transaction',
  TRANSACTIONS = 'Transactions',
  TRANSACTION_CONSUMPTION = 'TransactionConsumption',

  TRANSACTION_OCPI_CDR_EXPORT = 'TransactionOcpiCdrExport',

  CHARGING_STATION_CONSUMPTION_STATISTICS = 'ChargingStationConsumptionStatistics',
  CHARGING_STATION_USAGE_STATISTICS = 'ChargingStationUsageStatistics',
  CHARGING_STATION_INACTIVITY_STATISTICS = 'ChargingStationInactivityStatistics',
  CHARGING_STATION_TRANSACTIONS_STATISTICS = 'ChargingStationTransactionsStatistics',
  CHARGING_STATION_PRICING_STATISTICS = 'ChargingStationPricingStatistics',
  STATISTICS_EXPORT = 'StatisticsExport',
  USER_CONSUMPTION_STATISTICS = 'UserConsumptionStatistics',
  USER_USAGE_STATISTICS = 'UserUsageStatistics',
  USER_INACTIVITY_STATISTICS = 'UserInactivityStatistics',
  USER_TRANSACTIONS_STATISTICS = 'UserTransactionsStatistics',
  USER_PRICING_STATISTICS = 'UserPricingStatistics',

  CHARGING_STATION_TRANSACTIONS = 'RestChargingStationTransactions',

  ADD_CHARGING_STATIONS_TO_SITE_AREA = 'AddChargingStationsToSiteArea',
  REMOVE_CHARGING_STATIONS_FROM_SITE_AREA = 'RemoveChargingStationsFromSiteArea',

  ADD_ASSET_TO_SITE_AREA = 'AddAssetsToSiteArea',
  REMOVE_ASSET_TO_SITE_AREA = 'RemoveAssetsFromSiteArea',
  ASSET_CREATE = 'AssetCreate',
  ASSETS = 'Assets',
  ASSET = 'Asset',
  ASSET_IMAGE = 'AssetImage',
  ASSETS_IN_ERROR = 'AssetsInError',
  ASSET_UPDATE = 'AssetUpdate',
  ASSET_DELETE = 'AssetDelete',
  CHECK_ASSET_CONNECTION = 'CheckAssetConnection',
  RETRIEVE_ASSET_CONSUMPTION = 'RetrieveAssetConsumption',
  ASSET_CONSUMPTION = 'AssetConsumption',

  TENANT_CREATE = 'TenantCreate',
  TENANTS = 'Tenants',
  TENANT = 'Tenant',
  TENANT_UPDATE = 'TenantUpdate',
  TENANT_DELETE = 'TenantDelete',
  TENANT_LOGO = 'TenantLogo',

  COMPANY_CREATE = 'CompanyCreate',
  COMPANIES = 'Companies',
  COMPANY = 'Company',
  COMPANY_LOGO = 'CompanyLogo',
  COMPANY_UPDATE = 'CompanyUpdate',
  COMPANY_DELETE = 'CompanyDelete',

  SITE_CREATE = 'SiteCreate',
  ADD_SITES_TO_USER = 'RestAddSitesToUser',
  REMOVE_SITES_FROM_USER = 'RestRemoveSitesFromUser',
  SITES = 'Sites',
  SITE = 'Site',
  SITE_IMAGE = 'SiteImage',
  SITE_USERS = 'SiteUsers',
  SITE_UPDATE = 'SiteUpdate',
  SITE_USER_ADMIN = 'SiteUserAdmin',
  SITE_OWNER = 'SiteOwner',
  SITE_DELETE = 'SiteDelete',

  SITE_AREA_CREATE = 'SiteAreaCreate',
  SITE_AREAS = 'SiteAreas',
  SITE_AREA = 'SiteArea',
  SITE_AREA_IMAGE = 'SiteAreaImage',
  SITE_AREA_CONSUMPTION = 'SiteAreaConsumption',
  SITE_AREA_UPDATE = 'SiteAreaUpdate',
  SITE_AREA_DELETE = 'SiteAreaDelete',

  TRANSACTIONS_REFUND = 'TransactionsRefund',
  TRANSACTION_PUSH_CDR = 'TransactionPushCdr',
  SYNCHRONIZE_REFUNDED_TRANSACTIONS = 'SynchronizeRefundedTransactions',

  SETTING_CREATE = 'SettingCreate',
  SETTING_BY_IDENTIFIER = 'SettingByIdentifier',
  SETTINGS = 'Settings',
  SETTING = 'Setting',
  SETTING_UPDATE = 'SettingUpdate',
  SETTING_DELETE = 'SettingDelete',

  ADD_USERS_TO_SITE = 'AddUsersToSite',
  REMOVE_USERS_FROM_SITE = 'RemoveUsersFromSite',

  REFUND = 'Refund',
  CAR_CONNECTOR = 'CarConnector',

  USER_READ = 'UserRead',
  USER_CREATE = 'RestUserCreate',
  USER_DELETE = 'RestUserDelete',
  USER_UPDATE = 'RestUserUpdate',
  USER_UPDATE_MOBILE_TOKEN = 'RestUpdateUserMobileToken',
  USERS = 'RestUsers',
  USER_SITES = 'RestUserSites',
  USERS_IN_ERROR = 'RestUsersInError',
  USER_IMAGE = 'RestUserImage',
  TAGS = 'Tags',
  TAG = 'Tag',
  TAG_BY_VISUAL_ID= 'TagByVisualID',
  USER_DEFAULT_TAG_CAR = 'RestUserDefaultTagCar',
  TAG_CREATE = 'TagCreate',
  TAG_UPDATE = 'TagUpdate',
  TAG_UPDATE_BY_VISUAL_ID = 'TagUpdateByVisualID',
  TAG_DELETE = 'TagDelete',
  TAGS_UNASSIGN = 'TagsUnassign',
  TAG_UNASSIGN = 'TagUnassign',
  TAG_ASSIGN = 'TagAssign',
  TAGS_DELETE = 'TagsDelete',
  TAGS_IMPORT = 'TagsImport',
  TAGS_EXPORT = 'TagsExport',
  USER = 'RestUser',
  USERS_EXPORT = 'RestUsersExport',
  USERS_IMPORT = 'RestUsersImport',

  NOTIFICATIONS = 'Notifications',

  BILLING = 'Billing',
  BILLING_TRANSACTION = 'BillingTransaction',
  BILLING_SYNCHRONIZE_USERS = 'BillingSynchronizeUsers',
  BILLING_SYNCHRONIZE_USER = 'BillingSynchronizeUser',
  BILLING_FORCE_SYNCHRONIZE_USER = 'BillingForceSynchronizeUser',
  CHECK_BILLING_CONNECTION = 'CheckBillingConnection',
  BILLING_TAXES = 'BillingTaxes',
  BILLING_INVOICES = 'BillingInvoices',
  BILLING_INVOICE = 'BillingInvoice',
  BILLING_SYNCHRONIZE_INVOICES = 'BillingSynchronizeInvoices',
  BILLING_PERFORM_OPERATIONS = 'BillingPeriodicOperations',
  BILLING_FORCE_SYNCHRONIZE_USER_INVOICES = 'BillingForceSynchronizeUserInvoices',
  BILLING_DOWNLOAD_INVOICE = 'BillingDownloadInvoice',
  BILLING_NEW_INVOICE = 'BillingNewInvoice',
  BILLING_SETUP_PAYMENT_METHOD = 'BillingSetupPaymentMethod',
  BILLING_PAYMENT_METHODS = 'BillingPaymentMethods',
  BILLING_DELETE_PAYMENT_METHOD = 'BillingDeletePaymentMethod',
  BILLING_CHARGE_INVOICE = 'BillingChargeInvoice',
  BILLING_WEB_HOOK = 'BillingWebHook',
  BILLING_TEST_DATA_CLEANUP = 'BillingTestDataCleanup',

  MONGO_DB = 'MongoDB',

  CHECK_AND_APPLY_SMART_CHARGING = 'CheckAndApplySmartCharging',
  COMPUTE_AND_APPLY_CHARGING_PROFILES_FAILED = 'ComputeAndApplyChargingProfilesFailed',
  SMART_CHARGING = 'SmartCharging',

  INSTANTIATE_DUMMY_MODULE = 'InstantiateDummyModule',

  HTTP_REQUEST = 'HttpRequest',
  HTTP_RESPONSE = 'HttpResponse',
  HTTP_ERROR = 'HttpError',

  EXPORT_TO_CSV = 'ExportToCSV'
}

// RESTful API
export enum ServerRoute {
  REST_SIGNIN = 'signin',
  REST_SIGNON = 'signon',
  REST_SIGNOUT = 'signout',
  REST_PASSWORD_RESET = 'password/reset',
  REST_END_USER_LICENSE_AGREEMENT = 'eula',
  REST_END_USER_LICENSE_AGREEMENT_CHECK = 'eula/check',
  REST_MAIL_CHECK = 'mail/check',
  REST_MAIL_RESEND = 'mail/resend',

  REST_CHARGING_STATIONS = 'charging-stations',
  REST_CHARGING_STATION = 'charging-stations/:id',

  REST_CHARGING_STATIONS_RESET = 'charging-stations/:id/reset',
  REST_CHARGING_STATIONS_CACHE_CLEAR = 'charging-stations/:id/cache/clear',
  REST_CHARGING_STATIONS_TRIGGER_DATA_TRANSFER = 'charging-stations/:id/data/transfer',
  REST_CHARGING_STATIONS_RETRIEVE_CONFIGURATION = 'charging-stations/:id/configuration/retrieve',
  REST_CHARGING_STATIONS_CHANGE_CONFIGURATION = 'charging-stations/:id/configuration',
  REST_CHARGING_STATIONS_REMOTE_START = 'charging-stations/:id/remote/start',
  REST_CHARGING_STATIONS_REMOTE_STOP = 'charging-stations/:id/remote/stop',
  REST_CHARGING_STATIONS_UNLOCK_CONNECTOR = 'charging-stations/:id/connectors/:connectorId/unlock',
  REST_CHARGING_STATIONS_GET_COMPOSITE_SCHEDULE = 'charging-stations/:id/compositeschedule',
  REST_CHARGING_STATIONS_GET_DIAGNOSTICS = 'charging-stations/:id/diagnostics',
  REST_CHARGING_STATIONS_FIRMWARE_UPDATE = 'charging-stations/:id/firmware/update',
  REST_CHARGING_STATIONS_CHANGE_AVAILABILITY = 'charging-stations/:id/availability/change',
  REST_CHARGING_STATIONS_RESERVE_NOW = 'charging-stations/:id/reserve/now',
  REST_CHARGING_STATIONS_CANCEL_RESERVATION = 'charging-stations/:id/reservation/cancel',

  REST_CHARGING_STATIONS_DOWNLOAD_FIRMWARE = 'charging-stations/firmware/download',
  REST_CHARGING_STATIONS_QRCODE_GENERATE = 'charging-stations/:id/connectors/:connectorId/qrcode/generate',
  REST_CHARGING_STATIONS_QRCODE_DOWNLOAD = 'charging-stations/qrcode/download',

  REST_CHARGING_STATION_GET_OCPP_PARAMETERS = 'charging-stations/:id/ocpp/parameters',
  REST_CHARGING_STATIONS_REQUEST_OCPP_PARAMETERS = 'charging-stations/ocpp/parameters',
  REST_CHARGING_STATIONS_EXPORT_OCPP_PARAMETERS = 'charging-stations/ocpp/parameters/export',

  REST_CHARGING_STATIONS_UPDATE_PARAMETERS = 'charging-stations/:id/parameters',
  REST_CHARGING_STATIONS_POWER_LIMIT = 'charging-stations/:id/power/limit',
  REST_CHARGING_STATIONS_TRANSACTIONS = 'charging-stations/:id/transactions',
  REST_CHARGING_STATIONS_IN_ERROR = 'charging-stations/status/in-error',
  REST_CHARGING_STATIONS_EXPORT = 'charging-stations/action/export',
  REST_CHARGING_STATIONS_BOOT_NOTIFICATIONS = 'charging-stations/notifications/boot',
  REST_CHARGING_STATIONS_STATUS_NOTIFICATIONS = 'charging-stations/notifications/status',

  REST_CHARGING_STATION_CHECK_SMART_CHARGING_CONNECTION = 'charging-stations/smartcharging/connection/check',
  REST_CHARGING_STATION_TRIGGER_SMART_CHARGING = 'charging-stations/smartcharging/trigger',

  REST_CHARGING_PROFILES = 'charging-profiles',
  REST_CHARGING_PROFILE = 'charging-profiles/:id',

  REST_TRANSACTIONS = 'transactions',
  REST_TRANSACTIONS_IN_ERROR = 'transactions/status/in-error',
  REST_TRANSACTIONS_ACTIVE = 'transactions/status/active',
  REST_TRANSACTIONS_COMPLETED = 'transactions/status/completed',
  REST_TRANSACTION = 'transactions/:id',
  REST_TRANSACTIONS_EXPORT = 'transactions/action/export',
  REST_TRANSACTION_CDR = 'transactions/:id/ocpi/cdr',
  REST_TRANSACTION_CDR_EXPORT = 'transactions/:id/ocpi/cdr/export',
  REST_TRANSACTION_CONSUMPTIONS = 'transactions/:id/consumptions',
  REST_TRANSACTION_SOFT_STOP = 'transactions/:id/soft-stop',
  REST_TRANSACTIONS_REFUND_ACTION = 'transactions/action/refund',
  REST_TRANSACTIONS_REFUND = 'transactions/status/refund',
  REST_TRANSACTIONS_REFUND_EXPORT = 'transactions/status/refund/export',
  REST_TRANSACTIONS_SYNCHRONIZE_REFUNDED = 'transactions/status/refund/synchronize',
  REST_TRANSACTIONS_REFUND_REPORTS = 'transactions/status/refund/reports',

  REST_USERS = 'users',
  REST_USER = 'users/:id',
  REST_USER_DEFAULT_TAG_CAR = 'users/:id/default-car-tag',
  REST_USER_SITES = 'users/:id/sites',
  REST_USER_UPDATE_MOBILE_TOKEN = 'users/:id/mobile-token',
  REST_USER_IMAGE = 'users/:id/image',
  REST_USERS_IN_ERROR = 'users/status/in-error',
  REST_USERS_IMPORT = 'users/action/import',
  REST_USERS_EXPORT = 'users/action/export',

  REST_TAGS = 'tags',
  REST_TAG = 'tags/:id',
  REST_TAGS_IMPORT = 'tags/action/import',
  REST_TAGS_EXPORT = 'tags/action/export',

  REST_ASSETS = 'assets',
  REST_ASSET = 'assets/:id',
  REST_ASSETS_IN_ERROR = 'assets/status/in-error',
  REST_ASSET_CHECK_CONNECTION = 'assets/connectors/:id/connection/check',
  REST_ASSET_RETRIEVE_CONSUMPTION = 'assets/:id/connector/consumption/retrieve-last',
  REST_ASSET_CONSUMPTIONS = 'assets/:id/consumptions',
  REST_ASSET_IMAGE = 'assets/:id/image',

  REST_CARS = 'cars',
  REST_CAR = 'cars/:id',
  REST_CAR_CATALOGS = 'car-catalogs',
  REST_CAR_CATALOG = 'car-catalogs/:id',
  REST_CAR_CATALOG_IMAGES = 'car-catalogs/:id/images',
  REST_CAR_CATALOG_IMAGE = 'car-catalogs/:id/image',
  REST_CAR_CATALOG_SYNCHRONIZE = 'car-catalogs/action/synchronize',
  REST_CAR_MAKERS = 'car-makers',

  REST_PING = 'ping',

  REST_TENANTS = 'tenants',
  REST_TENANT = 'tenants/:id',

  REST_COMPANIES = 'companies',
  REST_COMPANY = 'companies/:id',
  REST_COMPANY_LOGO = 'companies/:id/logo',

  REST_CONNECTIONS = 'connections',
  REST_CONNECTION = 'connections/:id',

  REST_LOGGINGS = 'loggings',
  REST_LOGGING = 'loggings/:id',
  REST_LOGGINGS_EXPORT = 'loggings/action/export',

  REST_NOTIFICATIONS = 'notifications',
  REST_NOTIFICATIONS_END_USER_REPORT_ERROR = 'notifications/action/end-user/report-error',


  REST_OCPI_ENDPOINT_PING = 'ocpi/endpoints/:id/ping',
  REST_OCPI_ENDPOINT_CHECK_CDRS = 'ocpi/endpoints/:id/cdrs/check',
  REST_OCPI_ENDPOINT_CHECK_LOCATIONS = 'ocpi/endpoints/:id/locations/check',
  REST_OCPI_ENDPOINT_CHECK_SESSIONS = 'ocpi/endpoints/:id/sessions/check',
  REST_OCPI_ENDPOINT_PULL_CDRS = 'ocpi/endpoints/:id/cdrs/pull',
  REST_OCPI_ENDPOINT_PULL_LOCATIONS = 'ocpi/endpoints/:id/locations/pull',
  REST_OCPI_ENDPOINT_PULL_SESSIONS = 'ocpi/endpoints/:id/sessions/pull',
  REST_OCPI_ENDPOINT_PULL_TOKENS = 'ocpi/endpoints/:id/tokens/pull',
  REST_OCPI_ENDPOINT_SEND_EVSE_STATUSES = 'ocpi/endpoints/:id/evses/statuses/send',
  REST_OCPI_ENDPOINT_SEND_TOKENS = 'ocpi/endpoints/:id/tokens/send',
  REST_OCPI_ENDPOINT_GENERATE_LOCAL_TOKEN = 'ocpi/endpoints/tokens/generate',
  REST_OCPI_ENDPOINTS = 'ocpi/endpoints',
  REST_OCPI_ENDPOINT = 'ocpi/endpoints/:id',
  REST_OCPI_ENDPOINT_REGISTER = 'ocpi/endpoints/:id/register',
  REST_OCPI_ENDPOINT_UNREGISTER = 'ocpi/endpoints/:id/unregister',

  REST_SETTINGS = 'settings',
  REST_SETTING = 'settings/:id',

  // BILLING URLs for CRUD operations on PAYMENT METHODS
  REST_BILLING_PAYMENT_METHODS = 'users/:userID/payment-methods',
  REST_BILLING_PAYMENT_METHOD = 'users/:userID/payment-methods/:paymentMethodID',

  // BILLING URLs for Non-CRUD Operations on PAYMENT METHODS
  REST_BILLING_PAYMENT_METHOD_SETUP = 'users/:userID/payment-methods/setup',
  REST_BILLING_PAYMENT_METHOD_ATTACH = 'users/:userID/payment-methods/:paymentMethodID/attach',
  REST_BILLING_PAYMENT_METHOD_DETACH = 'users/:userID/payment-methods/:paymentMethodID/detach',

  REST_BILLING_SETTING = 'billing-setting', // GET and PUT
  REST_BILLING_CHECK = 'billing/check',
  REST_BILLING_CLEAR_TEST_DATA = 'billing/clearTestData',

  // BILLING URLs for CRUD operations on INVOICES
  REST_BILLING_INVOICES = 'invoices',
  REST_BILLING_INVOICE = 'invoices/:invoiceID',

  // BILLING URLs for Non-CRUD operations on INVOICES
  REST_BILLING_DOWNLOAD_INVOICE = 'invoices/:invoiceID/download',
}

export enum ServerProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  WS = 'ws',
  WSS = 'wss'
}

export enum ServerType {
  REST_SERVER = 'Rest',
  SOAP_SERVER = 'Soap',
  JSON_SERVER = 'Json',
  OCPI_SERVER = 'Ocpi',
  OICP_SERVER = 'Oicp',
  ODATA_SERVER = 'OData',
  BATCH_SERVER = 'Batch',
  CENTRAL_SERVER = 'CentralServer',
}

export enum WSServerProtocol {
  OCPP16 = 'ocpp1.6',
  REST = 'rest'
}

