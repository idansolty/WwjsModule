import { Controller } from '@nestjs/common';
import { WwjsLogger } from 'src/Logger/logger.service';
import { POSSIBLE_AUTHS } from 'src/WwjsClient/common/auths/auth.enum';
import { BotAuth } from 'src/WwjsClient/common/decorators/auth.decoratr';
import { BotCommand } from 'src/WwjsClient/common/decorators/command.decorator';
import { BotListner } from 'src/WwjsClient/common/decorators/controller.decorator';
import { BotController } from 'src/WwjsClient/common/interfaces/BotController';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { Events, GroupChat, Reaction } from 'whatsapp-web.js';
import { CountryCityService } from './countryCity.service';

@BotListner("message_reaction")
@Controller()
export class PointsCalculatorController extends BotController {
    constructor(
        whatsappBot: WhatsappBot,
        private readonly countryCityService: CountryCityService,
        private readonly logger: WwjsLogger
    ) {
        super(whatsappBot)
    }

    public chooseFunction(functions, ...args) {
        const message = args[0];

        const functionChoosen = functions.find(currentFunction => message.reaction === currentFunction.command);

        return functionChoosen;
    }

    @BotAuth(POSSIBLE_AUTHS.GENERIC_WHITELIST)
    @BotAuth(POSSIBLE_AUTHS.GROUP_ADMIN)
    @BotCommand('😢')
    async badAnswer(reaction: Reaction) {
        const chat: any = await this.whatsappBot.getChatWithTimeout(reaction.msgId.remote);

        const message = await this.getMessageFromChat(chat, reaction.msgId._serialized);

        if (!message) {
            this.countryCityService.calculateBadAnswer(chat.name, reaction.senderId, reaction.msgId._serialized, message.timestamp, "bad answer");
            this.logger.logWarn(`sry ${reaction.senderId} message was too old to be found :(`)
        } else {
            this.countryCityService.calculateBadAnswer(chat.name, reaction.senderId, reaction.msgId._serialized, reaction.timestamp, "bad answer");
        }
    }

    @BotAuth(POSSIBLE_AUTHS.GENERIC_WHITELIST)
    @BotAuth(POSSIBLE_AUTHS.GROUP_ADMIN)
    @BotCommand('😮')
    async dupAnswer(reaction: Reaction) {
        const chat: any = await this.whatsappBot.getChatWithTimeout(reaction.msgId.remote);

        const message = await this.getMessageFromChat(chat, reaction.msgId._serialized);

        if (!message) {
            this.countryCityService.calculateBadAnswer(chat.name, reaction.senderId, reaction.msgId._serialized, message.timestamp, "dup answer");
            this.logger.logWarn(`sry ${reaction.senderId} message was too old to be found :(`)
        } else {
            this.countryCityService.calculateBadAnswer(chat.name, reaction.senderId, reaction.msgId._serialized, reaction.timestamp, "dup answer");
        }
        
    }

    @BotAuth(POSSIBLE_AUTHS.GENERIC_WHITELIST)
    @BotAuth(POSSIBLE_AUTHS.GROUP_ADMIN)
    @BotCommand('👍')
    async goodAnswer(reaction: Reaction) {
        const chat: any = await this.whatsappBot.getChatWithTimeout(reaction.msgId.remote);

        const message = await this.getMessageFromChat(chat, reaction.msgId._serialized);

        if (!message) {
            this.countryCityService.calculateGoodAnswer(chat.name, reaction.senderId, reaction.msgId._serialized, message.timestamp, "good answer");
            this.logger.logWarn(`sry ${reaction.senderId} message was too old to be found :(`)
        } else {
            this.countryCityService.calculateBadAnswer(chat.name, reaction.senderId, reaction.msgId._serialized, reaction.timestamp, "good answer");
        }
    }

    // TODO : wait for the guys at wwjs to make this a function inside the client
    async getMessageFromChat(chat:GroupChat, messageId: string) {
        const messages = await chat.fetchMessages({limit: 500});

        const messageFound = messages.find(msg => msg.id._serialized === messageId);

        return messageFound;
    }
}