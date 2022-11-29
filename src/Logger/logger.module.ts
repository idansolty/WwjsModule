import { DynamicModule, Module } from '@nestjs/common';
import { WwjsLogger } from './logger.service';
@Module({})
export class LoggerModule {
  static register(): DynamicModule {
    return {
      module: LoggerModule,
      providers: [WwjsLogger],
      exports: [WwjsLogger],
    };
  }
}
