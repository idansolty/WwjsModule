import { Controller } from '@nestjs/common';
import axios from 'axios';
import { POSSIBLE_AUTHS } from 'src/WwjsClient/common/auths/auth.enum';
import { BotAuth } from 'src/WwjsClient/common/decorators/auth.decoratr';
import { BotCommand } from 'src/WwjsClient/common/decorators/command.decorator';
import { BotListner } from 'src/WwjsClient/common/decorators/controller.decorator';
import { BotController } from 'src/WwjsClient/common/interfaces/BotController';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { Events, Message, MessageTypes } from 'whatsapp-web.js';
import * as stt from "@google-cloud/speech";

@BotListner(Events.MESSAGE_CREATE)
@Controller()
export class STTController extends BotController {
  constructor(
    whatsappBot: WhatsappBot
  ) {
    super(whatsappBot)
  }

  public chooseFunction(functions, ...args) {
    const message = args[0];

    const functionChoosen = functions.find(currentFunction => message.body.startsWith(currentFunction.command));

    if (!functionChoosen) {
      const funcByType = functions.find(currentFunction => message.type === currentFunction.command);

      return funcByType;
    }

    return functionChoosen;
  }

  @BotCommand("!sttping")
  pingPong(message) {
    message.reply("Pong", message.author || message.from)
  }

  @BotCommand("!addChatToStt")
  sttAdder(message: Message) {
    this.addToList(POSSIBLE_AUTHS.GENERIC_WHITELIST, message.from);
  }

  // @BotAuth(POSSIBLE_AUTHS.GENERIC_WHITELIST)
  @BotAuth(POSSIBLE_AUTHS.FROM_ME)
  @BotCommand(MessageTypes.AUDIO)
  async debugFunction(message: Message) {
    const media = await message.downloadMedia();
    const body = {
      "audio": {
        "content": media.data
      },
      "config": {
        "encoding": 2,
        "languageCode": "he-IL"
      }
    };

    console.log(media.data)

    const newClient = new stt.SpeechClient();

    const response = await newClient.recognize(body);

    console.log(response);

    // const [answer] = response.results;

    // message.reply(answer.alternatives[0].transcript);
  }
}