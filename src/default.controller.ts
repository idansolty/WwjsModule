import { Controller } from '@nestjs/common';
import { BotCommand } from 'src/WwjsClient/common/decorators/command.decorator';
import { BotListner } from 'src/WwjsClient/common/decorators/controller.decorator';
import { BotController } from 'src/WwjsClient/common/interfaces/BotController';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { Events, Message } from 'whatsapp-web.js';
import { POSSIBLE_AUTHS } from './WwjsClient/common/auths/auth.enum';
import { BotAuth } from './WwjsClient/common/decorators/auth.decoratr';

@BotListner(Events.MESSAGE_CREATE)
@Controller()
export class DefaultController extends BotController {
  constructor(
    whatsappBot: WhatsappBot
  ) {
    super(whatsappBot)
  }

  @BotAuth(POSSIBLE_AUTHS.FROM_ME)
  @BotCommand("!pong")
  async poingPong(message: Message) {
    message.reply("pingPong");
    return;
  }
}