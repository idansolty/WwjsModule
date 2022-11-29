import { Injectable } from '@nestjs/common';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { Chat } from 'whatsapp-web.js';

@Injectable()
export class WwjsLogger {
    private logChat: Chat;

    constructor(
    ) { }

    public setChat(chat: Chat) {
        this.logChat = chat;
    }

    public async logInfo(message) {
        if (!this.logChat) {
            console.log("cannot write log no chat was defined");
            return;
        }
        await this.logChat.sendMessage(`Info-Log: \n${message}`)
    }

    public async logWarn(message) {
        if (this.logChat) {
            console.log("cannot write log no chat was defined");
            return;
        }
        await this.logChat.sendMessage(`Info-Warn: \n${message}`)
    }

    public async logError(message) {
        if (this.logChat) {
            console.log("cannot write log no chat was defined");
            return;
        }
        await this.logChat.sendMessage(`Info-Error: \n${message}`)
    }
}


