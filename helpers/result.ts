import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';


export async function displayevents(result: any, modify: IModify, context: SlashCommandContext): Promise<void> {

    console.log('This is inside result function');
    const summ = result.summary as string;
    let starttime = result.start.dateTime as string;
    let endtime = result.end.dateTime as string;
    //const array = starttime.split('T',2);

    const builder = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());
    try {
        builder.addAttachment({
            title: {
                value: summ,
            },
            text: 'is a due event starting from',
            fields: [{
                short: false,
                title: "Start day",
                value: starttime,

            },

            {
                short: false,
                title: "End Time",
                value: endtime,
            }

            ]


        });
        await modify.getCreator().finish(builder);
    } catch (e) {
        this.app.getLogger().error('Failed displaying events', e);
        builder.setText('An error occurred when sending the events as message :disappointed_relieved:');
    }


}