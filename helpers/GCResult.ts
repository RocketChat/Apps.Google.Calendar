import { ISlashCommandPreviewItem, SlashCommandPreviewItemType } from '@rocket.chat/apps-engine/definition/slashcommands';
import { HttpStatusCode, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApiRequest } from '@rocket.chat/apps-engine/definition/api';

export class GCResults {
    public atoken: string;

    constructor(data?: any) {

        if (data) {
            this.atoken = data.access_token as string;
        }
    }

    public result(): string {
        if (!this.atoken) {
            throw new Error('Invalid result');
        }
        return this.atoken;
    }

}