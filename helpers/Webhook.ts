
import { HttpStatusCode, IHttp, ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { GCResults } from '../helpers/GCResult';
import { AppPersistence } from '../helpers/persistence';
import { get_refresh_token, get_access_token } from '../helpers/result';

export class WebhookEndpoint extends ApiEndpoint {
    public path = 'webhook';
    public tokenid;
    private readonly urli = 'http://localhost:3000/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook';

    public async get(request: IApiRequest, endpoint: IApiEndpointInfo, read: IRead, modify: IModify, http: IHttp, persist: IPersistence): Promise<IApiResponse> {

        const client_id = await read.getEnvironmentReader().getSettings().getValueById('calendar_clientid');
        const secret = await read.getEnvironmentReader().getSettings().getValueById('calendar_secret_key');
        const api_key = await read.getEnvironmentReader().getSettings().getValueById('calendar_apikey');

        const auth_code = request.query.code;
        const url = 'https://www.googleapis.com/oauth2/v4/token';
        const new_response = await http.post(url, { data: { 'code': `${auth_code}`, 'client_id': `${client_id}`, 'client_secret': `${secret}`, 'redirect_uri': `${this.urli}`, 'grant_type': 'authorization_code', } });

        if (new_response.statusCode !== HttpStatusCode.OK || !new_response.data) {
            console.log('Did not get a valid response', new_response);
            throw new Error('Unable to retrieve response with auth code.');
        }

        console.log('This is the response from post api', new_response);
        const access_token = await get_access_token(new_response);
        console.log('This is accesstoken from new function inside webhook:', access_token);
        const persistence = new AppPersistence(persist, read.getPersistenceReader());
        const user_id = await persistence.getuid(client_id);
        const id = await persistence.connect_user_to_token(access_token, user_id);
        const refresh_token = await get_refresh_token(new_response);
        const new_id = await persistence.connect_user_to_refresh_token(refresh_token, user_id);

        if (access_token) {
            return this.success('<html><body><script type="text/javascript"></script><div>Sign-in successful! Please close this window/tab and continue using!</div></body></html>');
        } else {
            throw new Error('Sign-in not successful');
        }
    }

}
