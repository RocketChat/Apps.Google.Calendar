import { ISlashCommandPreviewItem, SlashCommandPreviewItemType } from '@rocket.chat/apps-engine/definition/slashcommands';
import { HttpStatusCode, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';

export class GCResults {
    public atoken: string;

    constructor(data?: any) {

        if (data) {
            this.atoken = data.access_token as string;
        }
    }

    public result(): Promise<any> {
        if (!this.atoken) {
            throw new Error('Invalid result');
        }
        else
            return this.atoken;

    }

}