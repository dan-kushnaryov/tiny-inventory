import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow same-origin/non-browser requests (curl, server-to-server, health checks).
      if (!origin) {
        callback(null, true);
        return;
      }

      try {
        const url = new URL(origin);
        const isLocalHost =
          url.hostname === 'localhost' || url.hostname === '127.0.0.1';
        const port = Number.parseInt(url.port, 10);
        const isViteDevPort = port >= 5173 && port <= 5180;
        const isVitePreviewPort = port >= 4173 && port <= 4180;

        if (isLocalHost && (isViteDevPort || isVitePreviewPort)) {
          callback(null, true);
          return;
        }
      } catch {
        // Fall through to reject invalid Origin header values.
      }

      callback(new Error(`CORS blocked for origin: ${origin}`), false);
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = app.get(ConfigService);
  await app.listen(config.getOrThrow<number>('PORT'));
}
void bootstrap();
