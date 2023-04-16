import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/Logger/logger.module';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { GeneralController } from './general.controller';
@Module({
    imports: [],
    controllers: [GeneralController],
    providers: [
        WhatsappBot
    ],
})
export class BotModule { }
