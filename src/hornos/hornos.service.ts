import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lectura } from './entities/horno.entity';

@Injectable()
export class HornosService {
  constructor(
    @InjectRepository(Lectura)
    private lecturaRepo: Repository<Lectura>,
  ) {}

  async register(hornoId: number, temperatura: number, hayHumedad: boolean) {
    const nueva = this.lecturaRepo.create({ hornoId, temperatura, hayHumedad });

    return await this.lecturaRepo.save(nueva);
  }

  // Este te servirá para tu App de celular después
  async obtenerHistorial(hornoId: number) {
    return await this.lecturaRepo.find({
      where: { hornoId },
      order: { timestamp: 'DESC' },
      take: 50, // Trae las últimas 50 lecturas
    });
  }
}
