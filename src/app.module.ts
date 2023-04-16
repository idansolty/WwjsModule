import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { WhatsappBot } from './WwjsClient/proxy/server';
import { DefaultController } from './default.controller';

@Module({
  imports: [BotModule],
  controllers: [DefaultController],
  providers: [WhatsappBot],
})
export class AppModule {}
