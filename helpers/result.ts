import { IModify, IRead, IHttp, HttpStatusCode, IPersistence } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext, ISlashCommand } from '@rocket.chat/apps-engine/definition/slashcommands';
import { AppPersistence } from '../helpers/persistence';

export async function displayevents(result: any, modify: IModify, context: SlashCommandContext, time: any): Promise<void> {

    const summary = result.summary as string;
    const start_time = result.start.dateTime as string;
    let end_time = result.end.dateTime as string;

    const array1 = start_time.split('T');
    const array2 = end_time.split('T');

    const start_date = array1[0].split('-');
    const start_final = array1[1].split(':');

    const end_date = array2[0].split('-');
    const end_final = array2[1].split(':');
    let timezone = time;

    const builder = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
    try {
        builder.addAttachment({
            title: {
                value: summary,
            },
            text: `is a due event on your calendar starting from date ${start_date[2]}/${start_date[1]}/${start_date[0]} at ${start_final[0]}:${start_final[1]}(${timezone}) to ${end_date[2]}/${end_date[1]}/${end_date[0]} at ${end_final[0]}:${end_final[1]} (${timezone}). [Find and manage the event here](${result.htmlLink}) `,
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

export async function make_time_string( date: string, time: string, utc: number) : Promise<string>{

    const date_string = date + 'T' + time + 'Z';
    const new_date = new Date(date_string);
    const datetime = new_date.toISOString();
    const datetime_ms = datetime.split(".");

    let final_time;
    let decimal = Math.abs(utc - Math.floor(utc));
    decimal = decimal * 60;
    if (utc > 0) {
                    utc = utc - (decimal / 60);
                }
    if (utc < 0) {
                    utc = utc + (decimal / 60);
                }

    if (utc > 0 && utc < 10) {
                    if (decimal == 0) {
                        final_time = datetime_ms[0] + '+0' + utc + ':' + decimal + '0';
                    } else {
                    final_time = datetime_ms[0] + '+0' + utc + ':' + decimal;
                    }
                } else if (utc < 0 && utc > -10) {
                    utc = utc * -1;
                    if (decimal == 0) {
                        final_time = datetime_ms[0] + '-0' + utc + ':' + decimal + '0';
                    } else {
                    final_time = datetime_ms[0] + '-0' + utc + ':' + decimal;
                    }
                } else if (utc >= 10) {
                    if (decimal == 0) {
                        final_time = datetime_ms[0] + '+' + utc + ':' + decimal + '0';
                    } else {
                    final_time = datetime_ms[0] + '+' + utc + ':' + decimal;
                    }
                } else {

                    if (decimal == 0) {
                        final_time = datetime_ms[0]  + utc + ':' + decimal + '0';
                    } else {
                    final_time = datetime_ms[0] + utc + ':' + decimal;
                    }
                }
                return final_time;
}