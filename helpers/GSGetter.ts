import { HttpStatusCode, IHttp, ILogger, IRead, IHttpResponse, IModify, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { MessageActionType } from '@rocket.chat/apps-engine/definition/messages/MessageActionType';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { AppPersistence } from '../helpers/persistence';
import { displayevents } from '../helpers/result';

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
    private readonly SCOPES = 'https://www.googleapis.com/auth/calendar';
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

        const message = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());

        const [parameter] = context.getArguments();

        switch (parameter) {
            case (Command.connect):
                const response = (`${this.urli}client_id=${client_id}&redirect_uri=${redirect}/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook&scope=${this.SCOPES}&prompt=consent&access_type=offline&response_type=code`);


                try {
                    message.addAttachment({
                        text: 'Click the button to authenticate to your Gmail account.',
                        actions: [{
                            type: MessageActionType.BUTTON,
                            text: 'Authenticate',
                            msg_in_chat_window: false,
                            url: `${response}`,
                        }],
                    });

                    await modify.getCreator().finish(message);
                } catch (e) {
                    this.app.getLogger().error('Failed sending login url', e);
                    message.setText('An error occurred when trying to send the login url:disappointed_relieved:');

                    modify.getNotifier().notifyUser(context.getSender(), message.getMessage());

                }
                break;

            case (Command.lgout):

                const logresponse = `https://www.google.com/accounts/Logout?continue=https://appengine.google.com/_ah/logout?continue=${redirect}`;
                try {
                    message.addAttachment({
                        text: 'Click the button to logout your Gmail account.',
                        actions: [{
                            type: MessageActionType.BUTTON,
                            text: 'Logout',
                            msg_in_chat_window: false,
                            url: `${logresponse}`,
                        }],
                    });
                    await modify.getCreator().finish(message);
                } catch (e) {
                    this.app.getLogger().error('Failed sending logout url', e);
                    message.setText('An error occurred when trying to send the logout url:disappointed_relieved:');

                    modify.getNotifier().notifyUser(context.getSender(), message.getMessage());


                }


                const atoken = await persistence.getAT(context.getSender());

                break;

            case (Command.show):

                const new_token = await persistence.getAT(context.getSender());

                const dat = new Date();
                const minimum_date = dat.toISOString();
                const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}&showDeleted=false&timeMin=${minimum_date}`;
                const api_response = await http.get(url, { headers: { Authorization: `Bearer ${new_token}` } });

                for (let i = 0; i < api_response.data.items.length; i++) {
                    await displayevents(api_response.data.items[i], modify, context);

                }

                break;

            case (Command.make):

                const access_token = await persistence.getAT(context.getSender());
                const params = context.getArguments().join(' ');
                const array = params.split("\"");
                const create_url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}`;

                const datetime = array[3] + 'T' + array[5];
                const date = new Date(datetime);
                const start_datetime = date.toISOString();
                const e_date = array[3] + 'T' + array[7];
                const end_date = new Date(e_date);
                const end_datetime = end_date.toISOString();
                const create_api_response = await http.post(create_url, { headers: { 'Authorization': `Bearer ${access_token}`, }, data: { 'summary': `${array[1]}`, 'end': { 'dateTime': `${end_datetime}`, }, 'start': { 'dateTime': `${start_datetime}` } } });
                if (create_api_response.statusCode == HttpStatusCode.OK && create_api_response.data.status == "confirmed") {
                    try {
                        message.addAttachment({

                            text: `Event has been created. Find the event at [${create_api_response.data.summary}](${create_api_response.data.htmlLink}) `,


                        });
                        await modify.getCreator().finish(message);
                    } catch (e) {
                        this.app.getLogger().error('Failed creating events', e);
                        message.setText('An error occurred when sending the event creation as message :disappointed_relieved:');
                    }
                } else {
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
                const token = await persistence.getAT(context.getSender());
                const quick_url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/quickAdd?key=${api_key}&text=${title_new[1]}`;
                const quick_api_response = await http.post(quick_url, { headers: { Authorization: `Bearer ${token}`, } });
                if (quick_api_response && quick_api_response.statusCode === HttpStatusCode.OK) {
                    // const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
                    message.setText('Quickadd event succcessfully created!');
                    await modify.getCreator().finish(message);
                }
                break;

            case (Command.calendar):

                const list_token = await persistence.getAT(context.getSender());
                const list_url = `https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${api_key}`;
                const list_api_response = await http.get(list_url, { headers: { Authorization: `Bearer ${list_token}`, } });
                let current_calendar = await persistence.get_preferred_calendar_id(context.getSender());
                (list_api_response.data.items as Array<any>).forEach((value) => {

                    if (current_calendar == value.id || value.primary && current_calendar == undefined) {
                        message.addAttachment({
                            color: value.backgroundColor,
                            text: value.summary,
                        });
                    } else {
                        message.addAttachment({
                            color: value.backgroundColor,
                            text: value.summary,
                            actions: [{
                                type: MessageActionType.BUTTON,
                                text: 'Set as default',
                                msg_in_chat_window: true,
                                msg: `/calendar configure ${value.id}`,
                            }],
                        });
                    }
                });
                await modify.getCreator().finish(message);
                break;

            case (Command.config):

                const calendar = context.getArguments();
                const id = await persistence.connect_user_to_calendar_id(calendar[1], context.getSender());
                const final_calendar_id = await persistence.get_preferred_calendar_id(context.getSender());
                break;
        }
    }
}
