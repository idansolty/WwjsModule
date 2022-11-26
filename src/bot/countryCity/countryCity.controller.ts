import { Controller } from '@nestjs/common';
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
        private readonly countryCityService: CountryCityService,
        whatsappBot: WhatsappBot,
    ) {
        super(whatsappBot)
    }

    @BotCommand("!countryCity")
    async countryCity(message: Message) {
        let groupName = message.body.slice(13);

        if (this.countryCityService.getOnlineGames().includes(groupName)) {
            message.reply(`סורי אחשלי אבל כבר יש משחק רץ בקבוצה הזאת...`);
        } else {
            try {
                const chats: Chat[] = await new Promise((resolve, reject) => {
                    setTimeout(reject, 30 * 1000)
                    this.whatsappBot.getClient.getChats().then(resolve);
                })

                const chatForGame: GroupChat = chats.find((chat) => chat.name === groupName) as GroupChat;

                message.reply(`מתחיל לשחק ארץ עיר בקבוצה: \n ${groupName}`);
                this.countryCityService.countryCity(groupName, chatForGame);
            } catch (e) {
                message.reply(`לא הצליח לשלוף צאטים :() \n ${JSON.stringify(e)}`);
                return;
            }
        }
    }
}