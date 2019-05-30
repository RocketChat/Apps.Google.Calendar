import { HttpStatusCode, IHttp, ILogger, IRead, IHttpResponse, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';

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

            const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
            const response = (`${this.urli}client_id=${this.Client_id}&redirect_uri=http://localhost:3000/home&scope=https://www.googleapis.com/auth/calendar.readonly&prompt=consent&response_type=code`);

            try{

                //const loginstatus = await this.app.getGCGetter().login(cont,this.app.getLogger(), http,modify,context);
                msg.setText('Please click the link below and authenticate!');   
                msg.setText(response);
                 await modify.getCreator().finish(msg);
               }catch (e) {
                   this.app.getLogger().error('Failed sending login url', e);
                   msg.setText('An error occurred when trying to send the request:disappointed_relieved:');
       
                   modify.getNotifier().notifyUser(context.getSender(), msg.getMessage());
               }

           // this.app.('The auth code we got is: ${this.response}');

            //step4
            logger.debug('response from first request is:',response);
    
            //response = https://oauth2.example.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
            //need to create regex such that res=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
            const newr = response.split('code=',2);
            const arry = newr[1];
            const cd = arry.split('&',2);
            this.res=cd[0];

            logger.debug('The auth code we got is:',this.res);
            const newresponse = await http.post(`https://www.googleapis.com/oauth2/v4/token/code=${this.res}&client_id=${this.Client_id}&client_secret=${this.secret}&redirect_uri=http://localhost:3000/general&grant_type=authorization_code`);
            
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