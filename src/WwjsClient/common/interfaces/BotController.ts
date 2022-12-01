import { WhatsappBot } from "src/WwjsClient/proxy/server";
import { Chat, GroupChat, GroupNotification, Message, Reaction } from "whatsapp-web.js";
import { AuthOperationType, dataForAuth, GenericControllerAuth, POSSIBLE_AUTHS } from "../auths/auth.enum";

export class BotController {
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
            console.log("no function choosen")
            return;
        }

        const auths = Reflect.getMetadata('auths', controller.target)

        if (!await this.authify(functionChoosen, auths, ...args)) {
            return;
        }

        console.log(`Dispatching ${functionChoosen.methodName}`)
        this[functionChoosen.methodName](args[0]);
    }

    public chooseFunction(functions, ...args) {
        const message = args[0];

        const functionChoosen = functions.find(currentFunction => message.body.startsWith(currentFunction.command));

        return functionChoosen;
    }

    public async authify(functionName, auths, ...args): Promise<boolean> {
        const message: any = args[0];
        const relevantAuths = auths.filter(currentAuth => currentAuth.methodName === functionName.methodName);
        const messageChat = await this.whatsappBot.getChatWithTimeout(message.msgId?.remote || message.from);

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

    public addArgsForAuth(name: string, value: any) {
        this.argsForAuth[name] = value;
    }

    private addAuthObjects(authType: string, operation: (options: dataForAuth) => boolean) {
        const newAuthObject = new AuthOperationType(authType, operation);

        this.authsFunctions.addAuth(newAuthObject)
    }

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