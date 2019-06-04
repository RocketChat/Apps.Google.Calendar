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


    public async login(phase: string, logger: ILogger, http: IHttp, modify:IModify, context:SlashCommandContext, req:IApiRequest, end:IApiEndpointInfo): Promise<boolean> {

        let signedin: boolean = false;
        
        const parame = phase;

        if (parame == 'auth') {
            //step1,2,3
            const auth_code = await this.app.getwebhook().stepone(req,end,this.app.getLogger(), http,modify,context);

            
           
            const newresponse = await http.post(`https://www.googleapis.com/oauth2/v4/token/code=${auth_code}&client_id=${this.Client_id}&client_secret=${this.secret}&redirect_uri=http://localhost:3000/general&grant_type=authorization_code`);
            
            if (newresponse.statusCode !== HttpStatusCode.OK || !newresponse.data) {
              logger.debug('Did not get a valid response', newresponse);
                throw new Error('Unable to retrieve response with auth code.');
            }


            const acesstoken = new GCResults(newresponse.data);

            if (acesstoken) {
                signedin = true;
            }


        }

        if (parame == 'logout') {
            const resnew = await http.get(`https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000`);
        }

        return signedin;

    }

}