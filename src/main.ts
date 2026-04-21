import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar Socket.IO
  app.useWebSocketAdapter(new IoAdapter(app));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: 'mqtts://bebc10bc889c481398edb22a24d7e32c.s1.eu.hivemq.cloud:8883',
      username: 'nahuel',
      password: 'Celeste21o',
      rejectUnauthorized: false,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log('Servidor listo 🏺');
}
bootstrap();
