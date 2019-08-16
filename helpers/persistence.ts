import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IPersistence, IPersistenceRead, IRead, IRoomRead, IHttp, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

export class AppPersistence {
    constructor(private readonly persistence: IPersistence, private readonly persistenceRead: IPersistenceRead) { }

    public async connectUserToClient(clientid: string, user: IUser): Promise<void> {
        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, user.id);
        const client_association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, `${clientid}`);

        await this.persistence.updateByAssociations([user_association, client_association], { uid: user.id }, true);
    }

    public async getuid(Clientid: string): Promise<string> {

        const client_association = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, Clientid);
        const [result] = await this.persistenceRead.readByAssociations([client_association]);
        return result ? (result as any).uid : undefined;
    }
    public async connect_user_to_token(atoken: any, user: string): Promise<void> {
        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user);
        const access = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'access token');
        await this.persistence.updateByAssociations([user_association, access], { atoken }, true);

    }
    public async get_access_token(user: IUser): Promise<void> {
        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);
        const access = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'access token');
        const [result] = await this.persistenceRead.readByAssociations([user_association, access]);
        return (result as any).atoken;

    }

    public async connect_user_to_calendar_id(calendar: any, user: IUser): Promise<void> {
        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);
        const calendarid = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'selected calendar');
        await this.persistence.updateByAssociations([user_association, calendarid], { calendar }, true);

    }

    public async get_preferred_calendar_id(user: IUser): Promise<any> {

        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);
        const calendarid = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'selected calendar');
        const [result] = await this.persistenceRead.readByAssociations([user_association, calendarid]);
        return result ? (result as any).calendar : 'primary';
    }

    public async connect_user_to_refresh_token(token: any, user: string): Promise<void> {
        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user);
        const refresh = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'refresh token');
        await this.persistence.updateByAssociations([user_association, refresh], { token }, true);

    }

    public async get_refresh_token_user(user: IUser): Promise<any> {

        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);
        const refresh = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, 'refresh token');
        const [result] = await this.persistenceRead.readByAssociations([user_association, refresh]);
        return (result as any).token;
    }
}
