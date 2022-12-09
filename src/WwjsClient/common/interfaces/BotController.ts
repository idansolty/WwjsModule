/**
 * CR: 
 * Remove unused imports
 */
import { WhatsappBot } from "src/WwjsClient/proxy/server";
import { Chat, GroupChat, GroupNotification, Message, Reaction } from "whatsapp-web.js";
import { AuthOperationType, dataForAuth, GenericControllerAuth, POSSIBLE_AUTHS } from "../auths/auth.enum";

export class BotController {
    // CR: list and not List
    public Lists: Record<string, string[]>;
    public blackList;
    private argsForAuth;
    public authsFunctions: GenericControllerAuth;

    constructor(
        public readonly whatsappBot: WhatsappBot
    ) {
        this.authsFunctions = new GenericControllerAuth();
        this.argsForAuth = {};
        this.Lists = {
            [POSSIBLE_AUTHS.GENERIC_BLACKLIST]: [],
            [POSSIBLE_AUTHS.GENERIC_WHITELIST]: []
        }
    }

    public async dispachAction(controller, ...args) {
        const functions = Reflect.getMetadata('commands', controller.target)

        const functionChoosen = this.chooseFunction(functions, ...args)

        if (!functionChoosen) {
            return;
        }

        const auths = Reflect.getMetadata('auths', controller.target)

        if (!await this.authify(functionChoosen, auths, ...args)) {
            return;
        }

        console.log(`Dispatching ${functionChoosen.methodName}`)
        this[functionChoosen.methodName](args[0]);
    }

    // CR: chooseFunction should be private 
    public chooseFunction(functions, ...args) {
        const message = args[0];

        const functionChoosen = functions.find(currentFunction => message.body.startsWith(currentFunction.command));

        return functionChoosen;
    }

    // CR: authify should be private 
    public async authify(functionName, auths, ...args): Promise<boolean> {
        const message: any = args[0];
        const relevantAuths = auths.filter(currentAuth => currentAuth.methodName === functionName.methodName);
        const messageChat = await this.whatsappBot.getChatWithTimeout(message.msgId?.remote || message.id.remote);

        const dataForOperation = {
            message,
            messageChat,
            lists: this.Lists,
            ...this.argsForAuth
        };

        const authResult = relevantAuths.every(
            releventAuth => {
                const authObject = this.authsFunctions.AUTHS.find((auth) => auth.authType === releventAuth.authType);
                return !!authObject?.operation(dataForOperation);
            }
        );

        return authResult;
    }

    // CR: addArgsForAuth should be private, and i think you're not using this function 
    public addArgsForAuth(name: string, value: any) {
        this.argsForAuth[name] = value;
    }

    // CR: This function is unused
    private addAuthObjects(authType: string, operation: (options: dataForAuth) => boolean) {
        const newAuthObject = new AuthOperationType(authType, operation);

        this.authsFunctions.addAuth(newAuthObject)
    }

    /**
     * CR: 
     * Add boolean return type
     * What is the type of 'value'?
     */
    public addToList(name: string, value) {
        if (this.Lists[name]) {
            this.Lists[name].push(value);
            return true;
        }

        return false;
    }

    public setList(name: string, value) {
        this.Lists[name] = value;
    }
}