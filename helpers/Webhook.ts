
import { IHttp,ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
//import { AppPersistence } from '../lib/persistence';
import { GCGetter } from './GSGetter';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { request } from 'http';


export class WebhookEndpoint extends ApiEndpoint {
    public path = 'webhook';
    private readonly Client_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly urli = 'https://accounts.google.com/o/oauth2/v2/auth?';


    public async stepone(request:IApiRequest,endpoint:IApiEndpointInfo,logger: ILogger, http: IHttp, modify:IModify, context:SlashCommandContext): Promise<string> {


            let token=true;
            const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
            const response = (`${this.urli}client_id=${this.Client_id}&redirect_uri=http://localhost:3000/api/apps/public/3c3ed60d-774b-4d1c-a547-6fc42a5a87c6/webhook&scope=https://www.googleapis.com/auth/calendar.readonly&prompt=consent&response_type=code`);

            try{
                msg.setText(response);   
                 await modify.getCreator().finish(msg);
               }catch (e) {
                   this.app.getLogger().error('Failed sending login url', e);
                   msg.setText('An error occurred when trying to send the login url:disappointed_relieved:');
       
                   modify.getNotifier().notifyUser(context.getSender(), msg.getMessage());
               }
            logger.debug('response from first request is:',request.params);

            const auth_code= request.params.code;


        //const auth_token= request.code;

            return auth_code;

    }           

}