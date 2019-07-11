import { HttpStatusCode, IHttp, ILogger, IRead, IHttpResponse, IModify, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GCResults } from '../helpers/GCResult';
import { MessageActionButtonsAlignment } from '@rocket.chat/apps-engine/definition/messages/MessageActionButtonsAlignment';
import { MessageActionType } from '@rocket.chat/apps-engine/definition/messages/MessageActionType';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { SettingType } from '@rocket.chat/apps-engine/definition/settings';
import { WebhookEndpoint } from '../helpers/Webhook';
import { AppPersistence } from '../helpers/persistence';
import { displayevents } from '../helpers/result';
import { display_calendars } from '../helpers/result';

enum Command {
    connect = 'auth',
    lgout = 'logout',
    show = 'view',
    make = 'create',
    quick = 'quickadd',
    calendar = 'list',
    config = 'configure',
}


export class GCGetter {
    private readonly SCOPES = "https://www.googleapis.com/auth/calendar";
    private readonly urli = 'https://accounts.google.com/o/oauth2/v2/auth?';
    private res;
    private readonly app: GoogleCalendarApp;

    public async login(logger: ILogger, read: IRead, http: IHttp, modify: IModify, context: SlashCommandContext, persis: IPersistence): Promise<void> {


        const client_id = await read.getEnvironmentReader().getSettings().getValueById('calendar_clientid');
        const api_key = await read.getEnvironmentReader().getSettings().getValueById('calendar_apikey');
        const secret = await read.getEnvironmentReader().getSettings().getValueById('calendar_secret_key');

        const redirect = await read.getEnvironmentReader().getSettings().getValueById('redirect_uri');
        const persistence = new AppPersistence(persis, read.getPersistenceReader());
        const id = await persistence.connectUserToClient(client_id, context.getSender());


        let signedin: boolean = false;

        const message = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());

        const [parameter] = context.getArguments();

        switch (parameter) {
            case (Command.connect):
                const response = (`${this.urli}client_id=${client_id}&redirect_uri=${redirect}/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook&scope=https://www.googleapis.com/auth/calendar&prompt=consent&access_type=offline&response_type=code`);


                try {
                    message.setText(response);
                    await modify.getCreator().finish(message);
                } catch (e) {
                    this.app.getLogger().error('Failed sending login url', e);
                    message.setText('An error occurred when trying to send the login url:disappointed_relieved:');

                    modify.getNotifier().notifyUser(context.getSender(), message.getMessage());

                }
                break;

            case (Command.lgout):


                // const mesg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
                const logresponse = `https://www.google.com/accounts/Logout?continue=${redirect}`;
                try {
                    message.setText(logresponse);
                    await modify.getCreator().finish(message);
                } catch (e) {
                    this.app.getLogger().error('Failed sending logout url', e);
                    message.setText('An error occurred when trying to send the logout url:disappointed_relieved:');

                    modify.getNotifier().notifyUser(context.getSender(), message.getMessage());


                }


                const atoken = await persistence.getAT(context.getSender());

                // console.log('This is the access token inside GCGetter:', atoken);

                break;

            case (Command.show):

                const new_token = await persistence.getAT(context.getSender());

                const dat = new Date();
                const minimum_date = dat.toISOString();
                const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}&showDeleted=false&timeMin=${minimum_date}`;
                const api_response = await http.get(url, { headers: { 'Authorization': `Bearer ${new_token}`, } });

                for (var i = 0; i < api_response.data.items.length; i++) {
                    //  console.log( newresponse.data.items[i].summary);
                    await displayevents(api_response.data.items[i], modify, context);

                }

                break;

            case (Command.make):

                const access_token = await persistence.getAT(context.getSender());
                const params = context.getArguments().join(' ');
                const array = params.split("\"");
                const create_url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}`;
                console.log('Create event array elements are these:', array[1], array[3]);

                const datetime = array[3] + 'T' + array[5];
                const date = new Date(datetime);
                //const starttime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                const start_datetime = date.toISOString();

                const e_date = array[3] + 'T' + array[7];
                const end_date = new Date(e_date);
                const end_datetime = end_date.toISOString();


                // console.log('Start date and time in ISO format is: ',startdatetime,'end date time:',enddatetime);

                const create_api_response = await http.post(create_url, { headers: { 'Authorization': `Bearer ${access_token}`, }, data: { 'summary': `${array[1]}`, 'end': { 'dateTime': `${end_datetime}`, }, 'start': { 'dateTime': `${start_datetime}` } } });
                console.log('This is the create event request response: ', create_api_response);
                if (create_api_response.statusCode == HttpStatusCode.OK && create_api_response.data.status == "confirmed") { //console.log('Event created wohoooooo!!!');
                    try {
                        message.addAttachment({

                            text: `Event has been created. Find the event at [${create_api_response.data.summary}](${create_api_response.data.htmlLink}) `,


                        });
                        await modify.getCreator().finish(message);
                    } catch (e) {
                        this.app.getLogger().error('Failed creating events', e);
                        message.setText('An error occurred when sending the event creation as message :disappointed_relieved:');
                    }
                }
                else {
                    console.log('This is the error message:', create_api_response.data.error.message);

                    try {
                        message.addAttachment({

                            text: `Event could not be created. It encountered the error: ${create_api_response.data.error.message}. Please try again. `,


                        });
                        await modify.getCreator().finish(message);
                    } catch (e) {
                        this.app.getLogger().error('Failed creating events', e);
                        message.setText('An error occurred when sending the event creation as message :disappointed_relieved:');
                    }
                }
                break;

            case (Command.quick):

                const title = context.getArguments().join(' ');
                const title_new = title.split('\"');
                //const fintitle = titlenew.;
                const token = await persistence.getAT(context.getSender());
                const quick_url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/quickAdd?key=${api_key}&text=${title_new[1]}`;
                const quick_api_response = await http.post(quick_url, { headers: { 'Authorization': `Bearer ${token}`, } });
                console.log('This is the quick-add response', quick_api_response);
                if (quick_api_response && quick_api_response.statusCode == HttpStatusCode.OK) {
                    // const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
                    message.setText('Quickadd event succcessfully created!');
                    await modify.getCreator().finish(message);
                }
                break;

            case (Command.calendar):

                const list_token = await persistence.getAT(context.getSender());
                const list_url = `https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${api_key}`;
                const list_api_response = await http.get(list_url, { headers: { 'Authorization': `Bearer ${list_token}`, } });
                console.log('This is the calendar list respose:', list_api_response);

                let all_calendars: Array<string> = list_api_response.data.items;

                for (var i = 0; i < list_api_response.data.items.length; i++) {
                    all_calendars[i] = list_api_response.data.items[i].summary;
                }

                console.log('This is calendar name inside list command:', all_calendars[2])
                message.addAttachment({
                    color: '#73a7ce',
                    text: all_calendars.map((option, index) => `*${index + 1}*) ${option}`).join('\n\n'),

                });

                message.addAttachment({
                    color: '#73a7ce',
                    actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
                    actions: all_calendars.map((option: string, index: number) => ({
                        type: MessageActionType.BUTTON,
                        text: `${index + 1}`,
                        msg_in_chat_window: true,
                        msg: `/calendar configure ${all_calendars[index]}`,
                    })),
                });
                await modify.getCreator().finish(message);


                break;

            case (Command.config):

                const calendar = context.getArguments();
                console.log('This is calendar name inside GCgetter:', calendar[1]);

                const configure_token = await persistence.getAT(context.getSender());
                const configure_url = `https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${api_key}`;
                const configure_api_response = await http.get(configure_url, { headers: { 'Authorization': `Bearer ${configure_token}`, } });
                //console.log('This is the configure list respose:', configure_api_response);
                let selected_calendar_id;

                for (var i = 0; i < configure_api_response.data.items.length; i++) {
                    if (configure_api_response.data.items[i].summary.includes(`${calendar[1]}`)) {
                        selected_calendar_id = configure_api_response.data.items[i].id;
                    }
                }
                console.log('This is final calendar id inside persis:', selected_calendar_id);
                const id = await persistence.connect_user_to_calendar_id(selected_calendar_id, context.getSender());
                const final_calendar_id = await persistence.get_preferred_calendar_id(context.getSender());
                console.log('This is the final calendar id from function:', final_calendar_id);

                break;
        }
    }


}
