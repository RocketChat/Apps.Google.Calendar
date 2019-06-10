import { HttpStatusCode, IHttp, ILogger, IRead, IHttpResponse, IModify, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { WebhookEndpoint } from '../helpers/Webhook';
import { AppPersistence } from '../helpers/persistence';



export class GCGetter {
    private readonly dClient_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly dapi_key = 'AIzaSyAY1YAPK1lIcx1bgsLOgsRfNfAluVQhuq4';
    private readonly SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
    private readonly urli = 'https://accounts.google.com/o/oauth2/v2/auth?';
    private readonly dsecret = '-lYglmNGqFNNazKoQX1m-EC9';
    private res;
    private readonly app: GoogleCalendarApp;



    public async login(phase: string, logger: ILogger, read: IRead, http: IHttp, modify: IModify, context: SlashCommandContext, persis: IPersistence): Promise<boolean> {

        const Client_id = await read.getEnvironmentReader().getSettings().getValueById('calendar_clientid') || this.dClient_id;
        const api_key = await read.getEnvironmentReader().getSettings().getValueById('calendar_apikey') || this.dapi_key;
        const secret = await read.getEnvironmentReader().getSettings().getValueById('calendar_secret_key') || this.dsecret;
        const persistence = new AppPersistence(persis, read.getPersistenceReader());
        const id = await persistence.connectUserToClient(Client_id, context.getSender());
        
        let signedin: boolean = false;

        const parame = phase;

        if (parame == 'auth') {
            //step1,2,3
            //  const auth_code = await this.app.getwebhook().stepone(req,end,this.app.getLogger(), http,modify,context);
            const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
            const response = (`${this.urli}client_id=${Client_id}&redirect_uri=http://localhost:3000/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook&scope=https://www.googleapis.com/auth/calendar.readonly&prompt=consent&access_type=offline&response_type=code`);

            try {
                msg.setText(response);
                await modify.getCreator().finish(msg);
            } catch (e) {
                this.app.getLogger().error('Failed sending login url', e);
                msg.setText('An error occurred when trying to send the login url:disappointed_relieved:');

                modify.getNotifier().notifyUser(context.getSender(), msg.getMessage());
            }

           
            
            return signedin = true;
        }

        if (parame == 'logout') {
            const resnew = await http.get(`https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000`);
       
            const atoken = await persistence.getAT(context.getSender());

            console.log('This is the access token inside GCGetter:', atoken);
    
        }

        return signedin;

    }

}