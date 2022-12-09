/**
 * CR: 
 * Remove unused imports
 * Why the file is located in the folder 'proxy' with the name 'server'?
 * 
 */

import { IServer } from '../common/interfaces/IServer.interface';
import { ICommandDefinition } from '../common/interfaces/CommandDefinition.interface';
import { Client, Message, LocalAuth, Chat, GroupChat } from 'whatsapp-web.js';
import * as qrcode from "qrcode-terminal"
import { BotController } from '../common/interfaces/BotController';

// CR: Maybe WhatsappBot should extends an abstract that implements IServer (or IBot), the class should have the properties bot, controllerts and authListeners. 
export class WhatsappBot implements IServer {
    private bot: Client;
    // CR: Try to avoid using static. Find a way to register the controllers and authListeners with the instance of WhatsappBot 
    static controllers: any[] = [];
    static authLists: any[] = [];

    constructor() {
        // CR: What new Client Does? Maybe initialize it will null and on 'start' set it to new Client({}) 
        this.bot = new Client({});
    }

    get getClient() {
        return this.bot;
    }

    public start(app): void {
        this.bot.initialize();

        // CR: You can change on('qr') and on('ready') also to decorators 
        this.bot.on('qr', qr => {
            qrcode.generate(qr, { small: true });
        });

        this.bot.on('ready', () => console.log('Client is ready!'));

        WhatsappBot.controllers.forEach((controller) => {
            const targetClass = app.get(controller.target);

            this.bot.on(controller.prefix, (...args) => targetClass.dispachAction(controller, ...args));
        });
    }

    // CR: Create async function performWithTimeout<T>(callback, timeout): Promise<T> that does this generically
    async getChatWithTimeout(chat: string, timeout: number = 30000): Promise<any> {
        return new Promise((resolve, reject) => {
            setTimeout(reject, timeout)
            this.bot.getChatById(chat).then(resolve);
        })
    }
}
