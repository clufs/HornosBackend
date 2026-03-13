import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  // Aplicación Híbrida: HTTP (para tu web) + MQTT (para los hornos)
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.MQTT,
    options: {
      url: 'mqtts://bebc10bc889c481398edb22a24d7e32c.s1.eu.hivemq.cloud:8883',
      username: 'nahuel',
      password: 'Celeste21o',
      rejectUnauthorized: false, // Necesario para la nube
    },
  });

  await app.startAllMicroservices();
  await app.listen(3000);
  console.log('Servidor listo para recibir datos de los hornos 🏺');
}
bootstrap();
