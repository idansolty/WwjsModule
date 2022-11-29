import { Controller } from '@nestjs/common';
import { WwjsLogger } from 'src/Logger/logger.service';
import { POSSIBLE_AUTHS } from 'src/WwjsClient/common/auths/auth.enum';
import { BotAuth } from 'src/WwjsClient/common/decorators/auth.decoratr';
import { BotCommand } from 'src/WwjsClient/common/decorators/command.decorator';
import { BotListner } from 'src/WwjsClient/common/decorators/controller.decorator';
import { BotController } from 'src/WwjsClient/common/interfaces/BotController';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { Chat, ChatTypes, Events, GroupChat, Message } from 'whatsapp-web.js';
import { CountryCityService } from './countryCity.service';


@BotListner(Events.MESSAGE_CREATE)
@Controller()
export class CountryCityController extends BotController {

    constructor(
        private readonly Logger: WwjsLogger,
        private readonly countryCityService: CountryCityService,
        whatsappBot: WhatsappBot,
    ) {
        super(whatsappBot)
    }

    @BotAuth(POSSIBLE_AUTHS.FROM_ME)
    @BotCommand("!setCountryCityLoggerHere")
    async setLogger(message: Message) {
        const loggerChat = await message.getChat();

        this.Logger.setChat(loggerChat);

        this.Logger.logInfo("first log for logger chat");
    }

    @BotAuth(POSSIBLE_AUTHS.FROM_ME)
    @BotCommand("!countryCity")
    async countryCity(message: Message) {
        let groupName = message.body.slice(13);

        if (this.countryCityService.getOnlineGames().find(game => game.id === groupName)) {
            message.reply(`סורי אחשלי אבל כבר יש משחק רץ בקבוצה הזאת...`);
        } else {
            try {
                const chats: Chat[] = await new Promise((resolve, reject) => {
                    setTimeout(reject, 30 * 1000)
                    this.whatsappBot.getClient.getChats().then(resolve);
                })

                const chatForGame: GroupChat = chats.find((chat) => chat.name === groupName) as GroupChat;

                this.Logger.logInfo(`מתחיל לשחק ארץ עיר בקבוצה: \n ${groupName}`);
                message.reply(`מתחיל לשחק ארץ עיר בקבוצה: \n ${groupName}`);
                this.countryCityService.countryCity(groupName, chatForGame);
            } catch (e) {
                message.reply(`לא הצליח לשלוף צאטים :() \n ${JSON.stringify(e)}`);
                return;
            }
        }
    }
}