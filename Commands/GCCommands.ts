import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { GCGetter } from '../helpers/GSGetter';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';



export class GCCommand implements ISlashCommand {

    public command = 'calendar';
    public i18nParamsExample = 'Calendar_login';
    public i18nDescription = 'Calendar_Command_Description';
    public providesPreview = false;

    constructor(private readonly app: GoogleCalendarApp) { }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
         
        const cont= context.getArguments().join(' ');
    
        const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
    
          //  try{

             const loginstatus = await this.app.getGCGetter().login(cont,this.app.getLogger(), http,modify,context);
               // msg.setText('Successfully executed')
    
    //}

    }
}