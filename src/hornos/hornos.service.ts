import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lectura } from './entities/horno.entity';
import { HornoGateway } from './horno-gateway';

@Injectable()
export class HornosService {
  constructor(
    @InjectRepository(Lectura)
    private lecturaRepo: Repository<Lectura>,
    private readonly gateway: HornoGateway,
  ) {}

  async register(hornoId: number, temperatura: number, hayHumedad: boolean) {
    const nueva = this.lecturaRepo.create({ hornoId, temperatura, hayHumedad });
    const guardada = await this.lecturaRepo.save(nueva);

    // Calcular fase
    const fase = this.calcularFase(temperatura);

    // Emitir por WebSocket a la app Android
    this.gateway.emitirLectura({
      temp_c: temperatura,
      tasa_c_min: 0,
      fase_actual: fase,
      alert_flags: this.calcularAlertas(temperatura),
      soak_activo: temperatura >= 1045,
      temp_max: temperatura,
      tiempo_s: 0,
    });

    return guardada;
  }

  async obtenerHistorial(hornoId: number) {
    return await this.lecturaRepo.find({
      where: { hornoId },
      order: { timestamp: 'DESC' },
      take: 50,
    });
  }

  private calcularFase(temp: number): string {
    if (temp < 120) return 'secado';
    if (temp < 573) return 'pre_sint';
    if (temp < 600) return 'cuarzo';
    if (temp < 900) return 'sint_media';
    if (temp < 1050) return 'maduracion';
    return 'soak';
  }

  private calcularAlertas(temp: number): number {
    let flags = 0;
    if (temp > 560 && temp < 590) flags |= 0x02;
    if (temp > 1060) flags |= 0x04;
    return flags;
  }
}
