import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WhatsappBot } from './WwjsClient/proxy/server';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const bot = app.get(WhatsappBot);

  bot.start(app)

  await app.listen(3000);
}

bootstrap();
