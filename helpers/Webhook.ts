
import { HttpStatusCode, IHttp, ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
//import { AppPersistence } from '../lib/persistence';
import { GCGetter } from './GSGetter';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';


export class WebhookEndpoint extends ApiEndpoint {
    public path = 'webhook';
    private readonly Client_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly urli = 'https://accounts.google.com/o/oauth2/v2/auth?';
    private readonly secret = '-lYglmNGqFNNazKoQX1m-EC9';
    public tokenid;

    public async stepone(request: IApiRequest, persist: IPersistence, logger: ILogger, http: IHttp, modify: IModify, context: SlashCommandContext): Promise<IApiResponse> {

        logger.debug('response from first request is:', request.params);

        const auth_code = request.params.code;
        const newresponse = await http.post(`https://www.googleapis.com/oauth2/v4/token/code=${auth_code}&client_id=${this.Client_id}&client_secret=${this.secret}&redirect_uri=http://localhost:3000/general&grant_type=authorization_code`);

        if (newresponse.statusCode !== HttpStatusCode.OK || !newresponse.data) {
            logger.debug('Did not get a valid response', newresponse);
            throw new Error('Unable to retrieve response with auth code.');
        }


        const acesstoken = new GCResults(newresponse.data);
        logger.debug('Auth token received is: ', auth_code);
        this.tokenid = persist.create(acesstoken);
        return this.success();

        //return auth_cod
    }

}