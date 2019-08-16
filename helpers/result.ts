import { IModify, IRead, IHttp, HttpStatusCode, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext, ISlashCommand } from '@rocket.chat/apps-engine/definition/slashcommands';
import { AppPersistence } from '../helpers/persistence';

export async function displayevents(result: any, modify: IModify, context: SlashCommandContext): Promise<void> {

    const summary = result.summary as string;
    const start_time = result.start.dateTime as string;
    let end_time = result.end.dateTime as string;

    const start_date = new Date(start_time);
    const start_year = start_date.getFullYear();
    const start_month = (start_date.getMonth() + 1);
    const date_start = start_date.getDate();
    const start_hours = start_date.getHours();
    const start_minutes = start_date.getMinutes();

    const short_cut_date = new Date(end_time);
    const year_new = short_cut_date.getFullYear();
    const month_new = (short_cut_date.getMonth() + 1);
    const date_new = short_cut_date.getDate();
    const hours_end = short_cut_date.getHours();
    const minutes_end = short_cut_date.getMinutes();
    let timezone = start_time.split('+', 2);
    let sign;
    if (timezone) {
        sign = '+';
    } else {
        timezone = start_time.split('-', 2);
        sign = '-';
    }
    const builder = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
    try {
        builder.addAttachment({
            title: {
                value: summary,
            },
            text: `is a due event on your calendar starting from date ${date_start}/${start_month}/${start_year} at ${start_hours}:${start_minutes}(UTC ${sign}${timezone[1]}) to ${date_new}/${month_new}/${[year_new]} at ${hours_end}:${minutes_end} (UTC ${sign}${timezone[1]}). [Find and manage the event here](${result.htmlLink}) `,
        });
        await modify.getCreator().finish(builder);
    } catch (e) {
        this.app.getLogger().error('Failed displaying events', e);
        builder.setText('An error occurred when sending the events as message :disappointed_relieved:');
    }
}

export async function get_access_token(result: any): Promise<any> {

    const token = result.data.access_token;
    return token;
}

export async function get_refresh_token(result: any): Promise<any> {

    const token = result.data.refresh_token;
    return token;
}

export async function refresh_access_token(token: string, read: IRead, http: IHttp, modify: IModify, context: SlashCommandContext, persis: IPersistence): Promise<any> {

    const client_id = await read.getEnvironmentReader().getSettings().getValueById('calendar_clientid');
    const secret = await read.getEnvironmentReader().getSettings().getValueById('calendar_secret_key');
    const url = `https://www.googleapis.com/oauth2/v4/token?refresh_token=${token}&client_id=${client_id}&client_secret=${secret}&grant_type=refresh_token`;
    const message = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());

    const refresh_response = await http.post(url);
    console.log('This is respones from new ref token inside refresh acc-token function:', refresh_response);
    if (refresh_response.statusCode == HttpStatusCode.OK) {
        const access_token = refresh_response.data.access_token;
        const persistence = new AppPersistence(persis, read.getPersistenceReader());
        const users_id = await persistence.getuid(client_id);
        const new_id = await persistence.connect_user_to_token(access_token, users_id);

        return access_token;
    } else {
        console.log('Encountered error during refreshing access token:', refresh_response.data.error.message);
    }
}
