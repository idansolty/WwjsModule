import { IServer } from '../common/interfaces/IServer.interface';
import { ICommandDefinition } from '../common/interfaces/CommandDefinition.interface';
import { Client, Message, LocalAuth, Chat, GroupChat } from 'whatsapp-web.js';
import * as qrcode from "qrcode-terminal"

export class WhatsappBot implements IServer {
    private bot: Client;
    static controllers: any[] = [];
    static authLists: any[] = [];

    constructor() {
        this.bot = new Client({});
    }

    public start(): void {
        this.bot.initialize();

        this.bot.on('qr', qr => {
            qrcode.generate(qr, { small: true });
        });

        this.bot.on('ready', () => console.log('Client is ready!'));

        WhatsappBot.controllers.forEach((controller) => {
            this.bot.on(controller.prefix, (...args) => controller.target.prototype.dispachAction(controller, ...args));
        })
        // this.bot.on('message', (message: Message) => { this.dispachAction(message, this.bot); });
    }

    private dispachAction(action: string, message: Message, bot: Client): void {
        let messageContent: string = message.body.trim();

        const controller = WhatsappBot.controllers.find(controller => action.startsWith(controller.prefix));

        if (!controller) {
            return;
        }

        messageContent = messageContent.substring(controller.prefix.length, messageContent.length).trim();
        const command: ICommandDefinition = controller.commands.find((command: any) =>
            messageContent.startsWith(command.command));

        if (!command) {
            return;
        }

        const additionalParameter = messageContent.substring(command.command.length, messageContent.length).trim();

        console.log(`Dispatching ${command.methodName}`)
        controller.instance[command.methodName](message, bot, additionalParameter);
    }

    getChatWithTimeout(chat: string, timeout: number = 30000): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(reject, timeout)
            this.bot.getChatById(chat).then(resolve);
        })
    }
}
