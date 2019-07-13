import { ISlashCommandPreviewItem, SlashCommandPreviewItemType } from '@rocket.chat/apps-engine/definition/slashcommands';
import { HttpStatusCode, IHttp, ILogger, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IApiRequest } from '@rocket.chat/apps-engine/definition/api';

export class GCResults {
    public acess_token: string;

    constructor(data?: any) {

        if (data) {
            this.acess_token = data.access_token as string;
        }
    }

    public result(): string {
        if (!this.acess_token) {
            throw new Error('Invalid result');
        }
        return this.acess_token;
    }

}