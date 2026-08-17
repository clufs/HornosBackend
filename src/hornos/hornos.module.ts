import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HornosService } from './hornos.service';
import { HornosController } from './hornos.controller';
import { Lectura } from './entities/horno.entity';
import { PerfilFuego } from './entities/perfil-fuego.entity';
import { HornosAgentService } from './hornos-agent.service';
import { HornoGateway } from './horno-gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lectura, PerfilFuego]),
    ClientsModule.register([
      {
        name: 'MQTT_CLIENT',
        transport: Transport.MQTT,
        options: {
          url: 'mqtts://bebc10bc889c481398edb22a24d7e32c.s1.eu.hivemq.cloud:8883',
          username: 'nahuel',
          password: 'Celeste21o',
          rejectUnauthorized: false,
        },
      },
    ]),
  ],
  controllers: [HornosController],
  providers: [HornosService, HornosAgentService, HornoGateway],
  exports: [TypeOrmModule],
})
export class HornosModule {}