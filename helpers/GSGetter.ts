import { HttpStatusCode, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';

export class GCGetter {
    private readonly Client_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly api_key = 'AIzaSyAY1YAPK1lIcx1bgsLOgsRfNfAluVQhuq4';
    private readonly DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"];
    private readonly SCOPES = "https://www.googleapis.com/auth/calendar.readonly";
    private readonly urli = 'https://accounts.google.com/o/oauth2/v2/auth?';
    private readonly secret = '-lYglmNGqFNNazKoQX1m-EC9';

    public async login(phase: string, logger: ILogger, http: IHttp): Promise<boolean> {

        let signedin: boolean = false;

        const parame = phase;

        if (parame == 'auth') {
            //step1,2,3

            const response = await http.get(`${this.urli}client_id='${this.Client_id}'&redirect_uri=http://localhost:3000/general&scope=https://www.googleapis.com/auth/calendar.readonly&prompt=consent&response_type=code`);

            //step4
            if (response.statusCode !== HttpStatusCode.OK || !response.data) {
                logger.debug('Did not get a valid response', response);
                throw new Error('Unable to retrieve gifs.');
            }

            //response = https://oauth2.example.com/auth?code=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
            //need to create regex such that res=4/P7q7W91a-oMsCeLvIaQm6bTrgtp7
            const res = new RegExp[''];

            const newresponse = await http.get(`https://www.googleapis.com/oauth2/v4/token/code='${this.res}'&client_id='${this.Client_id}'&client_secret='${this.secret}'&redirect_uri=http://localhost:3000/general&grant_type=authorization_code`);


            const acesstoken = new GCResults(newresponse);

            if (accesstoken) {
                signedin = true;
            }


        }

        if (parame == 'logout') {
            const resnew = await http.get(`https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000`);
        }

        return signedin;

    }

}