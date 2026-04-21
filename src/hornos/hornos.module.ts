import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HornosService } from './hornos.service';
import { HornosController } from './hornos.controller';
import { Lectura } from './entities/horno.entity';
import { HornosAgentService } from './hornos-agent.service';
import { HornoGateway } from './horno-gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Lectura])],
  controllers: [HornosController],
  providers: [HornosService, HornosAgentService, HornoGateway],
  exports: [TypeOrmModule],
})
export class HornosModule {}
