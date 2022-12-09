/**
 * CR:
 * Remove unused imports
 */
import { Message } from "whatsapp-web.js";

export enum POSSIBLE_AUTHS {
    GENERIC_WHITELIST = "CHAT_WHITE_LIST",
    GENERIC_BLACKLIST = "CHAT_BLACK_LIST",
    FROM_ME = "FROM_ME",
    GROUP_ADMIN = "GROUP_ADMIN",
    NOT_GROUP = "NOT_GROUP"
}

export class AuthOperationType {
    constructor(authType: string, operation: (options: dataForAuth) => boolean) {
        this.authType = authType;

        this.operation = operation
    }

    authType: string;
    operation: (options: dataForAuth) => boolean;
}

export type dataForAuth = Record<string, any>;

export class GenericControllerAuth {
    public AUTHS: AuthOperationType[];

    constructor() {
        this.AUTHS = [];

        this.AUTHS.push({
            authType: POSSIBLE_AUTHS.GROUP_ADMIN,
            operation: (data) => {
                if (data.messageChat.isGroup) {
                    const participant = data.messageChat.participants.find(user => user.id._serialized === (data.message.author || data.message.senderId))

                    return participant?.isAdmin || data.message.fromMe;
                }

                return false;
            }
        })

        this.AUTHS.push({
            authType: POSSIBLE_AUTHS.FROM_ME,
            operation: (data) => {
                return data.message.id.fromMe;
            }
        })

        this.AUTHS.push({
            authType: POSSIBLE_AUTHS.NOT_GROUP,
            operation: (data) => {
                return !data.messageChat.isGroup;
            }
        })

        this.AUTHS.push({
            authType: POSSIBLE_AUTHS.GENERIC_BLACKLIST,
            operation: (data) => {
                const releventList : string[] = data.lists[POSSIBLE_AUTHS.GENERIC_BLACKLIST] 
                const fromId = data.message.from;

                if (releventList.includes(fromId)) {
                    return false;
                }
                
                return true;
            }
        })

        this.AUTHS.push({
            authType: POSSIBLE_AUTHS.GENERIC_WHITELIST,
            operation: (data) => {
                const releventList : string[] = data.lists[POSSIBLE_AUTHS.GENERIC_WHITELIST] 
                const fromId = data.message.from;

                if (!releventList.includes(fromId)) {
                    return false;
                }
                
                return true;
            }
        })
    }

    public addAuth(newAuth: AuthOperationType) {
        this.AUTHS.push(newAuth)
    }
}