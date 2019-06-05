import { HttpStatusCode, IHttp, ILogger, IRead, IHttpResponse, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { WebhookEndpoint } from '../helpers/Webhook';
import { request } from 'http';

export class GCGetter {
    private readonly Client_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly api_key = 'AIzaSyAY1YAPK1lIcx1bgsLOgsRfNfAluVQhuq4';
    private readonly DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    private readonly SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
    private readonly urli = 'https://accounts.google.com/o/oauth2/v2/auth?';
    private readonly secret = '-lYglmNGqFNNazKoQX1m-EC9';
    private  res; 
    private readonly app: GoogleCalendarApp;


    public async login(phase: string, logger: ILogger, http: IHttp, modify:IModify, context:SlashCommandContext): Promise<boolean> {

        let signedin: boolean = false;
        
        const parame = phase;

        if (parame == 'auth') {
            //step1,2,3
          //  const auth_code = await this.app.getwebhook().stepone(req,end,this.app.getLogger(), http,modify,context);
          const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
          const response = (`${this.urli}client_id=${this.Client_id}&redirect_uri=http://localhost:3000/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook&scope=https://www.googleapis.com/auth/calendar.readonly&prompt=consent&response_type=code`);

          try{
              msg.setText(response);   
               await modify.getCreator().finish(msg);
             }catch (e) {
                 this.app.getLogger().error('Failed sending login url', e);
                 msg.setText('An error occurred when trying to send the login url:disappointed_relieved:');
     
                 modify.getNotifier().notifyUser(context.getSender(), msg.getMessage());
             }


        }

        if (parame == 'logout') {
            const resnew = await http.get(`https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000`);
        }

        return signedin;

    }

}