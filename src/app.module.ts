/* eslint-disable sort-imports-es6-autofix/sort-imports-es6 */
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CommonModule } from '@core/common/common.module';
import { MiddlewareConsumer, Module, ValidationError, ValidationPipe } from '@nestjs/common';
import {
  AllExceptionsFilter,
  BadRequestExceptionFilter,
  ForbiddenExceptionFilter,
  GatewayTimeOutExceptionFilter,
  NotFoundExceptionFilter,
  UnauthorizedExceptionFilter,
} from '@core/filters';
import { RequestLoggerMiddleware } from '@core/middleware/logging.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TimeoutInterceptor } from './core/interceptors/timeout.interceptor';
import { RouterModule } from './modules/router.module';
import { ValidationExceptionFilter } from './core/filters/validation.exception-filter';
import { TypeOrmModule } from './modules/database/database.module';
import { SocketGateway } from './modules/socket/socket.gateway';

@Module({
  imports: [CommonModule, TypeOrmModule.forRoot(), RouterModule.forRoot()],
  controllers: [AppController],
  providers: [
    SocketGateway,
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: BadRequestExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ForbiddenExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GatewayTimeOutExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          exceptionFactory: (errors: ValidationError[]) => {
            return errors[0];
          },
        }),
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: () => {
        const timeoutInMilliseconds = 30000;
        return new TimeoutInterceptor(timeoutInMilliseconds);
      },
      inject: [],
    },
    // {
    //   provide: APP_INTERCEPTOR,
    //   useFactory: (configService: ConfigService) => {
    //     const timeoutInMilliseconds = 30000;
    //     return new TimeoutInterceptor(timeoutInMilliseconds);
    //   },
    //   inject: [ConfigService],
    // },
  ],
  // exports: [TypeOrmModule],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
