import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WhatsappBot } from './WwjsClient/proxy/server';

async function bootstrap() {
   const app = await NestFactory.create(AppModule);

  const bot = new WhatsappBot()
  
  bot.start()

  await app.listen(3000);
}

bootstrap();
