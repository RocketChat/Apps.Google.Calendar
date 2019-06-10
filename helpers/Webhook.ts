
import { HttpStatusCode, IHttp, ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { GCGetter } from './GSGetter';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { AppPersistence } from '../helpers/persistence';


export class WebhookEndpoint extends ApiEndpoint {
    public path = 'webhook';
    private readonly dClient_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly dapi_key = 'AIzaSyAY1YAPK1lIcx1bgsLOgsRfNfAluVQhuq4';
    private readonly urli = 'http://localhost:3000/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook';
    private readonly dsecret = '-lYglmNGqFNNazKoQX1m-EC9';
    public tokenid;

    public async get(request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persist: IPersistence): Promise<IApiResponse> {

        const Client_id = await read.getEnvironmentReader().getSettings().getValueById('calendar_clientid') || this.dClient_id;
        const secret = await read.getEnvironmentReader().getSettings().getValueById('calendar_secret_key') || this.dsecret;
        const api_key = await read.getEnvironmentReader().getSettings().getValueById('calendar_apikey') || this.dapi_key;

        //logger.debug('response from first request is:', request.params);`

        const auth_code = request.query.code;
        const url = 'https://www.googleapis.com/oauth2/v4/token';
        const newresponse = await http.post(url, { data: { 'code': `${auth_code}`, 'client_id': `${Client_id}`, 'client_secret': `${secret}`, 'redirect_uri': `${this.urli}`, 'grant_type': 'authorization_code', } });

        if (newresponse.statusCode !== HttpStatusCode.OK || !newresponse.data) {
            console.log('Did not get a valid response', newresponse);
            throw new Error('Unable to retrieve response with auth code.');
        }

        console.log('This is the response from post api', newresponse);
        const acesstoken = new GCResults(newresponse.data);
        // logger.debug('Auth token received is: ', auth_code);
        const atoken = acesstoken;
        const persistence = new AppPersistence(persist, read.getPersistenceReader());
        const uid = await persistence.getuid(Client_id);
        const id = await persistence.connectUserToAT(acesstoken, uid);
        

        if (acesstoken) {
            //location.assign('http://localhost:3000/home');
            return this.success('<html><body><script type="text/javascript"></script><div>Sign-in successful! Please close this window/tab and continue using!</div></body></html>');
        }
        else
            throw new Error('Sign-in not successful');
        // return auth_cod
        //return this.success();
    }

}