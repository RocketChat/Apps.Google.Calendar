import { HttpStatusCode, IHttp, ILogger, IRead, IHttpResponse, IModify, IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { MessageActionType } from '@rocket.chat/apps-engine/definition/messages/MessageActionType';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { AppPersistence } from '../helpers/persistence';
import { displayEvents, refresh_access_token, make_time_string } from '../helpers/result';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';

enum Command {
    connect = 'auth',
    lgout = 'logout',
    show = 'view',
    make = 'create',
    quick = 'quickadd',
    calendar = 'list',
    config = 'configure',
    public = 'invite',
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
        const users_id = await persistence.getuid(client_id);

        const message = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());

        const [parameter] = context.getArguments();

        switch (parameter) {

            case (Command.connect):
                const full_url = redirect + '/api/apps/public/c759c4f1-a3c1-4202-8238-c6868633ed87/webhook';

                const response = (`${this.urli}client_id=${client_id}&redirect_uri=${full_url}&scope=${this.SCOPES}&prompt=consent&access_type=offline&response_type=code`);


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

                const logout_url = 'https://accounts.google.com/o/oauth2/revoke';
                const revoke_token = await persistence.get_access_token(context.getSender());
                const logout_response = await http.get(`${logout_url}?token=${revoke_token}`);
                if (logout_response.statusCode == HttpStatusCode.OK) {
                    try {
                        message.addAttachment({

                            text: `Rocket.Chat has been logged out of your Gmail account. Login again using "/calendar auth" to use the commands.`,

                        });
                        await modify.getCreator().finish(message);
                    } catch (e) {
                        this.app.getLogger().error('Failed revoking access token', e);
                        message.setText('An error occurred when revoking the access token:');
                    }
                    const persistence = new AppPersistence(persis, read.getPersistenceReader());
                    const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, users_id);
                    const access = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'access token');
                    const refresh = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'refresh token');
                    await persis.removeByAssociations([user_association, access]);
                    await persis.removeByAssociations([user_association, refresh]);

                }
                break;

            case (Command.show):
                let view_token = await persistence.get_access_token(context.getSender());
                const view_refresh = await persistence.get_refresh_token_user(context.getSender());

                const dat = new Date();
                const minimum_date = dat.toISOString();
                const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}&showDeleted=false&timeMin=${minimum_date}`;
                let api_response = await http.get(url, { headers: { Authorization: `Bearer ${view_token}` } });
                if (api_response.statusCode == HttpStatusCode.UNAUTHORIZED) {
                    const persistence = new AppPersistence(persis, read.getPersistenceReader());
                    view_token = await refresh_access_token(view_refresh, read, http, modify, context, persis);
                    api_response = await http.get(url, { headers: { Authorization: `Bearer ${view_token}` } });
                }
                let timezone = api_response.data.timeZone;
                for (let i = 0; i < api_response.data.items.length; i++) {
                    await displayEvents(api_response.data.items[i], modify, context, timezone);
                }
                break;

            case (Command.make):

                let access_token = await persistence.get_access_token(context.getSender());
                const create_refresh = await persistence.get_refresh_token_user(context.getSender());
                const params = context.getArguments().join(' ');
                const array = params.split("\"");
                const create_url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}`;

                const user_info = await read.getUserReader().getById(users_id);

                let start_time;
                let end_time;
                let utc = user_info.utcOffset;
                start_time = await make_time_string(array[3], array[5], utc);
                end_time = await make_time_string(array[3], array[7], utc);

                let create_api_response = await http.post(create_url,
                    {
                        headers: { 'Authorization': `Bearer ${access_token}`, },
                        data: {
                            'summary': `${array[1]}`,
                            'end': { 'dateTime': `${end_time}`, },
                            'start': { 'dateTime': `${start_time}` }
                        }
                    });

                if (create_api_response.statusCode == HttpStatusCode.UNAUTHORIZED) {
                    const persistence = new AppPersistence(persis, read.getPersistenceReader());
                    access_token = await refresh_access_token(create_refresh, read, http, modify, context, persis);
                    create_api_response = await http.post(create_url,
                        {
                            headers: { 'Authorization': `Bearer ${access_token}`, },
                            data: {
                                'summary': `${array[1]}`,
                                'end': { 'dateTime': `${end_time}`, },
                                'start': { 'dateTime': `${start_time}` }
                            }
                        });
                }

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
                    this.app.getLogger().error('This is the error message:', create_api_response.data.error.message);

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
                let token = await persistence.get_access_token(context.getSender());
                const quick_refresh = await persistence.get_refresh_token_user(context.getSender());
                const quick_url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/quickAdd?key=${api_key}&text=${title_new[1]}`;
                let quick_api_response = await http.post(quick_url, { headers: { Authorization: `Bearer ${token}` } });
                if (quick_api_response.statusCode == HttpStatusCode.UNAUTHORIZED) {
                    token = await refresh_access_token(quick_refresh, read, http, modify, context, persis);
                    quick_api_response = await http.post(quick_url, { headers: { Authorization: `Bearer ${token}` } });
                }

                if (quick_api_response && quick_api_response.statusCode === HttpStatusCode.OK) {
                    message.setText('Quickadd event succcessfully created!');
                    await modify.getCreator().finish(message);
                }
                break;

            case (Command.calendar):

                let list_token = await persistence.get_access_token(context.getSender());
                const list_refresh = await persistence.get_refresh_token_user(context.getSender());
                const list_url = `https://www.googleapis.com/calendar/v3/users/me/calendarList?key=${api_key}`;
                let list_api_response = await http.get(list_url, { headers: { Authorization: `Bearer ${list_token}`, } });
                let current_calendar = await persistence.get_preferred_calendar_id(context.getSender());

                if (list_api_response.statusCode == HttpStatusCode.UNAUTHORIZED) {
                    list_token = await refresh_access_token(quick_refresh, read, http, modify, context, persis);
                    list_api_response = await http.get(list_url, { headers: { Authorization: `Bearer ${list_token}`, } });
                }

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

            case (Command.public):

                const all_users_id = await read.getRoomReader().getMembers(context.getRoom().id);
                let email_ids: Array<any> = [];
                let mapping: Array<any> = [];

                for (let index = 0; index < all_users_id.length; index++) {
                    email_ids[index] = all_users_id[index].emails[0].address;
                }
                let invite_token = await persistence.get_access_token(context.getSender());
                const invite_parameters = context.getArguments().join(' ');
                const invite_array = invite_parameters.split("\"");
                const invite_url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${api_key}&sendUpdates=all`;

                const users_info = await read.getUserReader().getById(users_id);

                let final_start;
                let final_end;
                let utcoffset = users_info.utcOffset;
                final_start = await make_time_string(invite_array[3], invite_array[5], utcoffset);
                final_end = await make_time_string(invite_array[3], invite_array[7], utcoffset);

                for (let index = 0; index < email_ids.length; index++) {
                    mapping.push({ email: email_ids[index] });
                }
                let invite_api_response = await http.post(invite_url,
                    {
                        headers: { Authorization: `Bearer ${invite_token}` },
                        data: {
                            'summary': `${invite_array[1]}`,
                            'end': { 'dateTime': `${final_end}`, },
                            'attendees': mapping,
                            'start': { 'dateTime': `${final_start}` }
                        }
                    });

                if (invite_api_response.statusCode == HttpStatusCode.UNAUTHORIZED) {
                    invite_token = await refresh_access_token(quick_refresh, read, http, modify, context, persis);
                    invite_api_response = await http.post(invite_url,
                        {
                            headers: { Authorization: `Bearer ${invite_token}`, },
                            data: {
                                'summary': `${invite_array[1]}`,
                                'end': { 'dateTime': `${final_end}`, },
                                'attendees': mapping,
                                'start': { 'dateTime': `${final_start}` },
                            }
                        });
                }
                if (invite_api_response.statusCode === HttpStatusCode.OK && invite_api_response.data.status === 'confirmed') {
                    try {
                        message.addAttachment({

                            text: `Event has been created. Find the event at [${invite_api_response.data.summary}](${invite_api_response.data.htmlLink}) `,


                        });
                        await modify.getCreator().finish(message);
                    } catch (e) {
                        this.app.getLogger().error('Failed creating events', e);
                        message.setText('An error occurred when sending the event creation as message :disappointed_relieved:');
                    }
                } else {
                    try {
                        message.addAttachment({

                            text: `Event could not be created. It encountered the error: ${invite_api_response.data.error.message}. Please try again. `,

                        });
                        await modify.getCreator().finish(message);
                    } catch (e) {
                        this.app.getLogger().error('Failed creating events', e);
                        message.setText('An error occurred when sending the event creation as message :disappointed_relieved:');
                    }
                }
                break;
        }
    }

}

