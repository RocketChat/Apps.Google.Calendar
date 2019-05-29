import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { GCResults } from '../helpers/GCResult';


export class GCCommand implements ISlashCommand {

    public command = 'calendar';
    public i18nParamsExample = 'Calendar_login';
    public i18nDescription = 'Calendar_Command_Description';
    public providesPreview = false;

    constructor(private readonly app: GoogleCalendarApp) { }

    public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {
        // if there are no args or args[0] === 'random'
        // then get a single one

        // otherwise, fetch the results and get a random one
        // as the max amount returned will be ten
       // throw new Error('Method not implemented.');
    
        
        const cont= context.getArguments;
    
        const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
    
            try{

             const loginstatus = await this.app.getGCGetter().login(cont,this.app.getLogger(), http);

              await modify.getCreator().finish(msg);
            }catch (e) {
                this.app.getLogger().error('Failed getting a gif', e);
                msg.setText('An error occurred when trying to send the gif :disappointed_relieved:');
    
                modify.getNotifier().notifyUser(context.getSender(), msg.getMessage());
            }

    }

}