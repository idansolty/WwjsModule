import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/Logger/logger.module';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { STTController } from './general.controller';

@Module({
    imports: [LoggerModule.register({ name: "STT Module" })],
    controllers: [
        STTController
    ],
    providers: [
        WhatsappBot
    ],
})
export class STTBotModule { }
