import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { STTBotModule } from './sttBot/bot.module';
import { WhatsappBot } from './WwjsClient/proxy/server';

@Module({
  imports: [STTBotModule],
  controllers: [],
  providers: [WhatsappBot],
})
export class AppModule {}
