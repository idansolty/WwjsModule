import { Controller } from '@nestjs/common';
import { POSSIBLE_AUTHS } from 'src/WwjsClient/common/auths/auth.enum';
import { BotAuth } from 'src/WwjsClient/common/decorators/auth.decoratr';
import { BotCommand } from 'src/WwjsClient/common/decorators/command.decorator';
import { BotListner } from 'src/WwjsClient/common/decorators/controller.decorator';
import { BotController } from 'src/WwjsClient/common/interfaces/BotController';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { Events } from 'whatsapp-web.js';

@BotListner("message_reaction")
@Controller()
export class ReactionController extends BotController {
    constructor(
        whatsappBot: WhatsappBot
    ) {
        super(whatsappBot)
    }

    public chooseFunction(functions, ...args) {
        const message = args[0];

        const functionChoosen = functions.find(currentFunction => message.reaction === currentFunction.command);

        return functionChoosen;
    }

    @BotAuth(POSSIBLE_AUTHS.FROM_ME)
    @BotCommand('😮')
    pingPong(reaction) {
        console.log("do something relevent....");
    }
}