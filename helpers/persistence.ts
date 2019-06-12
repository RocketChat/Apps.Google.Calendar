import { RocketChatAssociationModel, RocketChatAssociationRecord } from '@rocket.chat/apps-engine/definition/metadata';
import { IPersistence, IPersistenceRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { stringify } from 'querystring';

export class AppPersistence {
    constructor(private readonly persistence: IPersistence, private readonly persistenceRead: IPersistenceRead) { }

    public async connectUserToClient(clientid: string, user: IUser): Promise<void> {
        const userAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.ROOM, user.id);
        const clientAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, `${clientid}`);

        await this.persistence.updateByAssociations([userAssociation, clientAssociation], { uid: user.id }, true);
    }

    public async getuid(Clientid: string): Promise<string> {

        const clientAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.MISC, Clientid);
        const [result] = await this.persistenceRead.readByAssociations([clientAssociation]);
        return result ? (result as any).uid : undefined;
    }
    public async connectUserToAT(atoken: any, user: string): Promise<void> {
        const userAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user);

        await this.persistence.updateByAssociations([userAssociation], { atoken }, true);

    }
    public async getAT(user: IUser): Promise<void> {
        const userAssociation = new RocketChatAssociationRecord(RocketChatAssociationModel.USER, user.id);
        const [result] = await this.persistenceRead.readByAssociation(userAssociation);
        return result ? (result as any).atoken.atoken : undefined;
    }



}