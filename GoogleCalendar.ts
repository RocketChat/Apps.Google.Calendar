import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { GCCommand } from './Commands/GCCommands';
import { GCGetter } from './helpers/GSGetter';
import { WebhookEndpoint } from './helpers/Webhook';



export class GoogleCalendarApp extends App {

    private gcGetter: GCGetter;
   // private webhook : WebhookEndpoint;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.gcGetter = new GCGetter();
        //this.webhook= new WebhookEndpoint(this);

    }
    public getGCGetter(): GCGetter {
        return this.gcGetter;
    }

   

    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
      
        await configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new WebhookEndpoint(this)],

        });

       
        await configuration.settings.provideSetting({
            id: 'calendar_apikey',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Customize_GoogleCalendar_APIKey',
            i18nDescription: 'Customize_GoogleCalendar_APIKey_Description',
        });

        await configuration.settings.provideSetting({
            id: 'calendar_clientid',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Customize_Calendar_ClientID',
            i18nDescription: 'Customize_Calendar_ClientID',
        });

        await configuration.settings.provideSetting({
            id: 'calendar_secret_key',
            type: SettingType.STRING,
            packageValue: '',
            required: true,
            public: false,
            i18nLabel: 'Customize_Calendar_SecretKey',
            i18nDescription: 'Customize_Calendar_SecretKey',
        });
       
        await configuration.slashCommands.provideSlashCommand(new GCCommand(this));

    }
}