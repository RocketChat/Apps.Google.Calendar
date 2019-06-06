
import { HttpStatusCode, IHttp, ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
//import { AppPersistence } from '../lib/persistence';
import { GCGetter } from './GSGetter';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';


export class WebhookEndpoint extends ApiEndpoint {
    public path = 'webhook';
    private readonly Client_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly urli = 'http://localhost:3000/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook';
    private readonly secret = '-lYglmNGqFNNazKoQX1m-EC9';
    public tokenid;

    public async get(request: IApiRequest,endpoint:IApiEndpointInfo, read:IRead, modify: IModify, http: IHttp,persist: IPersistence): Promise<IApiResponse> {

        //logger.debug('response from first request is:', request.params);`

        const auth_code = request.query.code;
        const url='https://www.googleapis.com/oauth2/v4/token';
        const newresponse = await http.post(url, { data: {'code':`${auth_code}`,'client_id':`${this.Client_id}`,'client_secret':`${this.secret}`,'redirect_uri':`${this.urli}`,'grant_type':'authorization_code',}});

        if (newresponse.statusCode !== HttpStatusCode.OK || !newresponse.data) {
           console.log('Did not get a valid response', newresponse);
         throw new Error('Unable to retrieve response with auth code.');
        }

        console.log('his is the response from post api',newresponse);
        const acesstoken = new GCResults(newresponse.data);
       // logger.debug('Auth token received is: ', auth_code);
        this.tokenid = persist.create(acesstoken);
        return this.success();

        //return auth_cod
    }

}