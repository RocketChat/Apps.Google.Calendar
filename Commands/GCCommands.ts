import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { ISlashCommand, ISlashCommandPreview, ISlashCommandPreviewItem, SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { GoogleCalendarApp } from '../GoogleCalendar';
import { ApiEndpoint, IApiEndpointInfo, IApiRequest, IApiResponse } from '@rocket.chat/apps-engine/definition/api';
import { AppPersistence } from '../helpers/persistence';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

export class GCCommand implements ISlashCommand {

  public command = 'calendar';
  public i18nParamsExample = 'Calendar_login';
  public i18nDescription = 'Calendar_Command_Description';
  public providesPreview = false;

  constructor(private readonly app: GoogleCalendarApp) { }

  public async executor(context: SlashCommandContext, read: IRead, modify: IModify, http: IHttp, persis: IPersistence): Promise<void> {


    const msg = modify.getCreator().startMessage().setSender(context.getSender()).setRoom(context.getRoom());

    try {


      const login_status = await this.app.getGCGetter().login(this.app.getLogger(), read, http, modify, context, persis);
    } catch (e) {
      this.app.getLogger().error('Failed executing slashcommand', e);
    }

  }
}
