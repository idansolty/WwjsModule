import { WhatsappBot } from "src/WwjsClient/proxy/server";
import { Chat, GroupChat, GroupNotification, Message, Reaction } from "whatsapp-web.js";
import { POSSIBLE_AUTHS } from "../auths/auth.enum";

export class BotController {
    private whiteList;
    private blackList;

    constructor(
        public readonly whatsappBot: WhatsappBot
    ) { }

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
        const auth = auths.find(currentAuth => currentAuth.methodName === functionName.methodName);

        if (auth) {
            switch (auth.authType) {
                case POSSIBLE_AUTHS.CHAT_WHITE_LIST: {
                    return false; // TODO: implement
                }
                case POSSIBLE_AUTHS.CHAT_BLACK_LIST: {
                    return false; // TODO: implement
                }
                case POSSIBLE_AUTHS.FROM_ME: {
                    return message.id.fromMe;
                }
                case POSSIBLE_AUTHS.GROUP_ADMIN: {
                    if (message.author) {
                        const chat: GroupChat = await this.whatsappBot.getChatWithTimeout(message.from);
                        const participant = chat.participants.find(user => user.id._serialized === message.id.participant)

                        return participant?.isAdmin;
                    }

                    return false;
                }
                case POSSIBLE_AUTHS.NOT_GROUP: {
                    return !message.author;
                }
            }
        }

        return true;
    }
}