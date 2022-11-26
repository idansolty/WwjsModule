import { IServer } from '../common/interfaces/IServer.interface';
import { ICommandDefinition } from '../common/interfaces/CommandDefinition.interface';
import { Client, Message, LocalAuth, Chat, GroupChat } from 'whatsapp-web.js';
import * as qrcode from "qrcode-terminal"
import { BotController } from '../common/interfaces/BotController';

export class WhatsappBot implements IServer {
    private bot: Client;
    static controllers: any[] = [];
    static authLists: any[] = [];

    constructor() {
        this.bot = new Client({});
    }

    get getClient() {
        return this.bot;
    }

    public start(): void {
        this.bot.initialize();

        this.bot.on('qr', qr => {
            qrcode.generate(qr, { small: true });
        });

        this.bot.on('ready', () => console.log('Client is ready!'));

        WhatsappBot.controllers.forEach((controller) => {
            this.bot.on(controller.prefix, (...args) => controller.target.prototype.dispachAction(controller, ...args));
        });
    }

    getChatWithTimeout(chat: string, timeout: number = 30000): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(reject, timeout)
            this.bot.getChatById(chat).then(resolve);
        })
    }
}
