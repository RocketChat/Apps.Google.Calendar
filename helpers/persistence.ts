import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
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
    public async connectUserToAT(atoken: any, user: string): Promise<void> {
        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user);

        await this.persistence.updateByAssociations([user_association], { atoken }, true);

    }
    public async getAT(user: IUser): Promise<void> {
        const user_association = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);

        const [result] = await this.persistenceRead.readByAssociation(user_association);
        return result ? (result as any).atoken.acess_token : undefined;

    }
}