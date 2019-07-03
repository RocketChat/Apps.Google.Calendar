import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';


export async function displayevents(result: any, modify: IModify, context: SlashCommandContext): Promise<void> {

    console.log('This is inside result function');
    const summary = result.summary as string;
    const start_time = result.start.dateTime as string;
    let end_time = result.end.dateTime as string;

    const start_date = new Date(start_time);
    const start_year = start_date.getFullYear();
    const start_month = (start_date.getMonth() + 1);
    const date_start = start_date.getDate();//prints expected format.
    const start_hours = start_date.getHours();
    const start_minutes = start_date.getMinutes();

    const short_cut_date = new Date(end_time);
    const year_new = short_cut_date.getFullYear();
    const month_new = (short_cut_date.getMonth() + 1);
    const date_new = short_cut_date.getDate();//prints expected format.
    const hours_end = short_cut_date.getHours();
    const minutes_end = short_cut_date.getMinutes();
    let timezone = start_time.split('+', 2);
    let sign;
    if (timezone) {
        sign = '+';
    }
    else {
        timezone = start_time.split('-', 2);
        sign = '-'
    }
    const builder = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
    try {
        builder.addAttachment({
            title: {
                value: summary,
            },
            text: `is a due event on your calendar starting from date ${date_start}/${start_month}/${start_year} at ${start_hours}:${start_minutes} (UTC ${sign}${timezone[1]}) to ${date_new}/${month_new}/${[year_new]} at ${hours_end}:${minutes_end} (UTC ${sign}${timezone[1]}). [Find and manage the event here](${result.htmlLink}) `,



        });
        await modify.getCreator().finish(builder);
    } catch (e) {
        this.app.getLogger().error('Failed displaying events', e);
        builder.setText('An error occurred when sending the events as message :disappointed_relieved:');
    }


}