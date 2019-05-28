import {
    IConfigurationExtend,
    IEnvironmentRead,
    IAppAccessors,
    ILogger,
} from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';


export class GoogleCalendarApp extends App {

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
       
    }
    protected async extendConfiguration(configuration: IConfigurationExtend, environmentRead: IEnvironmentRead): Promise<void> {
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
            packageValue: 'en',
            required: true,
            public: false,
            i18nLabel: 'Customize_Calendar_ClientID',
            i18nDescription: 'Customize_Calendar_ClientID',
        });

        await configuration.slashCommands.provideSlashCommand(new GCCommand(this));

    }
}