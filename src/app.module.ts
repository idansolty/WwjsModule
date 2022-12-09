import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
// CR: Export all the bots from a single index file and then import bots from some 'index.ts'. then use this import as the array of the providers 
import { WhatsappBot } from './WwjsClient/proxy/server';

@Module({
  imports: [BotModule],
  controllers: [],
  providers: [WhatsappBot],
})
export class AppModule {}
