import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WhatsappBot } from './WwjsClient/proxy/server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CR: Export all the bots from a single index file and then import bots from some 'index.ts'. Then use foreach on the array of bots and start all of them
  const bot = app.get(WhatsappBot);

  bot.start(app)

  await app.listen(3000);
}

bootstrap();
