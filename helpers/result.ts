import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';


export async function displayevents(result: any, modify: IModify, context: SlashCommandContext): Promise<void> {

    console.log('This is inside result function');
    const summ = result.summary as string;
    const starttime = result.start.dateTime as string;
    let endtime = result.end.dateTime as string;

    const startdate = new Date(starttime);
    const startyear = startdate.getFullYear();
    const startmonth = (startdate.getMonth() + 1);
    const datestart = startdate.getDate();//prints expected format.
    const starthours = startdate.getHours();
    const startminutes = startdate.getMinutes();

    const shortcutdate = new Date(endtime);
    const yearnew = shortcutdate.getFullYear();
    const monthnew = (shortcutdate.getMonth() + 1);
    const datenew = shortcutdate.getDate();//prints expected format.
    const hoursend = shortcutdate.getHours();
    const minutesend = shortcutdate.getMinutes();
    let timezone = starttime.split('+', 2);
    let sign;
    if (timezone) {
        sign = '+';
    }
    else {
        timezone = starttime.split('-', 2);
        sign = '-'
    }
    const builder = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
    try {
        builder.addAttachment({
            title: {
                value: summ,
            },
            text: `is a due event on your calendar starting from date ${datestart}/${startmonth}/${startyear} at ${starthours}:${startminutes} (UTC ${sign}${timezone[1]}) to ${datenew}/${monthnew}/${[yearnew]} at ${hoursend}:${minutesend} (UTC ${sign}${timezone[1]}). [Find and manage the event here](${result.htmlLink}) `,


        });
        await modify.getCreator().finish(builder);
    } catch (e) {
        this.app.getLogger().error('Failed displaying events', e);
        builder.setText('An error occurred when sending the events as message :disappointed_relieved:');
    }


}