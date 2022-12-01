import { Controller } from '@nestjs/common';
import { POSSIBLE_AUTHS } from 'src/WwjsClient/common/auths/auth.enum';
import { BotAuth } from 'src/WwjsClient/common/decorators/auth.decoratr';
import { BotCommand } from 'src/WwjsClient/common/decorators/command.decorator';
import { BotListner } from 'src/WwjsClient/common/decorators/controller.decorator';
import { BotController } from 'src/WwjsClient/common/interfaces/BotController';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { Events } from 'whatsapp-web.js';
import { User } from './countryCity/types/user.type';


@BotListner(Events.MESSAGE_CREATE)
@Controller()
export class GeneralController extends BotController {
  constructor(
    whatsappBot: WhatsappBot
  ) { 
    super(whatsappBot)
  }

  @BotCommand("!ping")
  pingPong(message) {
    message.reply("Pong", message.author || message.from)
  }

  @BotAuth(POSSIBLE_AUTHS.FROM_ME)
  @BotAuth(POSSIBLE_AUTHS.NOT_GROUP)
  @BotAuth(POSSIBLE_AUTHS.GENERIC_BLACKLIST)
  @BotCommand("!debug")
  async debugFunction(message) {
    console.log("debugging");
  }

  @BotAuth(POSSIBLE_AUTHS.GROUP_ADMIN)
  @BotCommand("hello there!")
  starWars(message) {
    message.reply("General Kenobi!", message.from)
  }
}