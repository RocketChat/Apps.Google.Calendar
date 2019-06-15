import { HttpStatusCode, IHttp, ILogger, IRead, IHttpResponse, IModify, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { WebhookEndpoint } from '../helpers/Webhook';
import { AppPersistence } from '../helpers/persistence';
import { stringify } from 'querystring';
import { displayevents } from '../helpers/result';


enum Command {
    connect = 'auth',
    lgout = 'logout',
    show = 'view',
    make = 'create',
}


export class GCGetter {
    private readonly dClient_id = '201256566157-552j1d7qdejuhrnovkoseieu85oomgh5.apps.googleusercontent.com';
    private readonly dapi_key = 'AIzaSyAY1YAPK1lIcx1bgsLOgsRfNfAluVQhuq4';
    private readonly SCOPES = "https://www.googleapis.com/auth/calendar";
    private readonly urli = 'https://accounts.google.com/o/oauth2/v2/auth?';
    private readonly dsecret = '-lYglmNGqFNNazKoQX1m-EC9';
    private res;
    private readonly app: GoogleCalendarApp;





    public async login(logger: ILogger, read: IRead, http: IHttp, modify: IModify, context: SlashCommandContext, persis: IPersistence): Promise<void> {

        const Client_id = await read.getEnvironmentReader().getSettings().getValueById('calendar_clientid') || this.dClient_id;
        const api_key = await read.getEnvironmentReader().getSettings().getValueById('calendar_apikey') || this.dapi_key;
        const secret = await read.getEnvironmentReader().getSettings().getValueById('calendar_secret_key') || this.dsecret;
        const persistence = new AppPersistence(persis, read.getPersistenceReader());
        const id = await persistence.connectUserToClient(Client_id, context.getSender());

        let signedin: boolean = false;
        const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());


        const [parame] = context.getArguments();
        switch (parame) {

            case (Command.connect):
                const response = (`${this.urli}client_id=${Client_id}&redirect_uri=http://localhost:3000/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook&scope=https://www.googleapis.com/auth/calendar&prompt=consent&access_type=offline&response_type=code`);

                try {
                    msg.setText(response);
                    await modify.getCreator().finish(msg);
                } catch (e) {
                    this.app.getLogger().error('Failed sending login url', e);
                    msg.setText('An error occurred when trying to send the login url:disappointed_relieved:');

                    modify.getNotifier().notifyUser(context.getSender(), msg.getMessage());

                }
                break;

            case (Command.lgout):

                const mesg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
                const logresponse = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000`;
                try {
                    mesg.setText(logresponse);
                    await modify.getCreator().finish(mesg);
                } catch (e) {
                    this.app.getLogger().error('Failed sending login url', e);
                    mesg.setText('An error occurred when trying to send the login url:disappointed_relieved:');

                    modify.getNotifier().notifyUser(context.getSender(), mesg.getMessage());
                }


                const atoken = await persistence.getAT(context.getSender());

                console.log('This is the access token inside GCGetter:', atoken);

                break;

            case (Command.show):

                const newatoken = await persistence.getAT(context.getSender());

                const dat = new Date();
                const newdate = dat.toISOString();
                const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}&showDeleted=false&timeMin=${newdate}`;
                const newresponse = await http.get(url, { headers: { 'Authorization': `Bearer ${newatoken}`, } });

                for (var i = 0; i < newresponse.data.items.length; i++) {
                    //  console.log( newresponse.data.items[i].summary);
                    await displayevents(newresponse.data.items[i], modify, context);

                }

                break;

            case (Command.make):

                const createatoken = await persistence.getAT(context.getSender());
                const params = context.getArguments().join(' ');
                const array = params.split("\"");
                const createurl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}`;
                console.log('Create event array elements are these:', array[1], array[3]);

                const datetime = array[3] + 'T' + array[5];
                const date = new Date(datetime);
                //const starttime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                const startdatetime = date.toISOString();

                const edate = array[3] + 'T' + array[7];
                const enddate = new Date(edate);
                const enddatetime = enddate.toISOString();


                // console.log('Start date and time in ISO format is: ',startdatetime,'end date time:',enddatetime);

                const createresponse = await http.post(createurl, { headers: { 'Authorization': `Bearer ${createatoken}`, }, data: { 'summary': `${array[1]}`, 'end': { 'dateTime': `${enddatetime}`, }, 'start': { 'dateTime': `${startdatetime}` } } });
                console.log('This is the create event request response: ', createresponse);
                if (createresponse.statusCode == HttpStatusCode.OK && createresponse.data.status == "confirmed") { //console.log('Event created wohoooooo!!!');
                    try {
                        msg.addAttachment({

                            text: `Event has been created. Find the event at [${createresponse.data.summary}](${createresponse.data.htmlLink}) `,


                        });
                        await modify.getCreator().finish(msg);
                    } catch (e) {
                        this.app.getLogger().error('Failed creating events', e);
                        msg.setText('An error occurred when sending the event creation as message :disappointed_relieved:');
                    }
                }
                else {
                    console.log('This is the error message:', createresponse.data.error.message);

                    try {
                        msg.addAttachment({

                            text: `Event could not be created. It encountered the error: ${createresponse.data.error.message}. Please try again. `,


                        });
                        await modify.getCreator().finish(msg);
                    } catch (e) {
                        this.app.getLogger().error('Failed creating events', e);
                        msg.setText('An error occurred when sending the event creation as message :disappointed_relieved:');
                    }
                }
                break;
        }

    }

}