import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/Logger/logger.module';
import { WhatsappBot } from 'src/WwjsClient/proxy/server';
import { CountryCityController } from './countryCity/countryCity.controller';
import { CountryCityService } from './countryCity/countryCity.service';
import { UserHandlerService } from './countryCity/handlers/users.handler';
import { GeneralController } from './general.controller';
import { ReactionController } from './reaction.controller';

@Module({
    imports: [LoggerModule.register()],
    controllers: [GeneralController, CountryCityController],
    providers: [WhatsappBot, CountryCityService, CountryCityController, UserHandlerService],
})
export class BotModule { }
