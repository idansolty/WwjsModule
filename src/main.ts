import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WhatsappBot } from './WwjsClient/proxy/server';
import * as dotenv from "dotenv";

async function bootstrap() {
  dotenv.config({ path: __dirname+'/.env' });

  const app = await NestFactory.create(AppModule);

  const bot = app.get(WhatsappBot);

  bot.start(app)

  await app.listen(8080);
}

bootstrap();
