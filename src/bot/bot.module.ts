import { Module } from '@nestjs/common';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { GeneralController } from './general.controller';
import { ReactionController } from './reaction.controller';

@Module({
    controllers: [GeneralController, ReactionController],
    providers: [WhatsappBot],
})
export class BotModule {}
