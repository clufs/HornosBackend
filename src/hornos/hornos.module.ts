import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HornosService } from './hornos.service';
import { HornosController } from './hornos.controller';
import { Lectura } from './entities/horno.entity';
import { HornosAgentService } from './hornos-agent.service';

@Module({
  // Aquí le decimos a Nest: "Este módulo va a usar la tabla Lectura"
  imports: [TypeOrmModule.forFeature([Lectura])],
  controllers: [HornosController],

  providers: [HornosService, HornosAgentService],
  // Exportar el TypeOrmModule ayuda si otros módulos necesitan usarlo
  exports: [TypeOrmModule],
})
export class HornosModule {}
