import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lectura } from './entities/horno.entity';
import { PerfilFuego } from './entities/perfil-fuego.entity';
import { HornoGateway } from './horno-gateway';

@Injectable()
export class HornosService {
  constructor(
    @InjectRepository(Lectura)
    private lecturaRepo: Repository<Lectura>,
    @InjectRepository(PerfilFuego)
    private perfilRepo: Repository<PerfilFuego>,
    private readonly gateway: HornoGateway,
  ) {}

// async register(hornoId: number, temperatura: number, hayHumedad: boolean) {
//     const nueva = this.lecturaRepo.create({ hornoId, temperatura, hayHumedad });
//     const guardada = await this.lecturaRepo.save(nueva);

//     // Calcular fase
//     const fase = this.calcularFase(temperatura);

//     // Emitir por WebSocket a la app Android
//     this.gateway.emitirLectura({
//       temp_c: temperatura,
//       tasa_c_min: 0,
//       fase_actual: fase,
//       alert_flags: this.calcularAlertas(temperatura),
//       soak_activo: temperatura >= 1045,
//       temp_max: temperatura,
//       tiempo_s: 0,
//     });

//     return guardada;
// }

async register(hornoId: number, data: {
  temperatura: number,
  hayHumedad: boolean,
  objetivo?: number,
  potencia?: number,
  segmento?: number,
  activo?: boolean,
  corriente?: number,
  potenciaW?: number,
  energiaWh?: number,
  costo?: number,
  totalSegmentos?: number,
  enMantencion?: boolean,
}) {
  const nueva = this.lecturaRepo.create({
    hornoId,
    temperatura:  data.temperatura,
    hayHumedad:   data.hayHumedad,
    objetivo:     data.objetivo   ?? 0,
    potencia:     data.potencia   ?? 0,
    segmento:     data.segmento   ?? 1,
    activo:       data.activo     ?? false,
    corriente:    data.corriente  ?? 0,
    potenciaW:    data.potenciaW  ?? 0,
    energiaWh:    data.energiaWh  ?? 0,
    costo:        data.costo      ?? 0,
  });

  const guardada = await this.lecturaRepo.save(nueva);

  const fase = this.calcularFase(data.temperatura);

  this.gateway.emitirLectura({
    temp_c:      data.temperatura,
    tasa_c_min:  0,
    fase_actual: fase,
    alert_flags: this.calcularAlertas(data.temperatura),
    soak_activo: data.activo ?? false,
    temp_max:    data.temperatura,
    tiempo_s:    0,
  });

  this.gateway.emitirStatus({
    ssr:             (data.potencia ?? 0) > 0,
    setpoint:        data.objetivo ?? 0,
    objetivo:        data.objetivo ?? 0,
    segmento:        data.segmento ?? 1,
    totalSegmentos:  data.totalSegmentos ?? 0,
    activo:          data.activo ?? false,
    enMantencion:    data.enMantencion ?? false,
  });

  return guardada;
}

async obtenerHistorialPorFecha(
  hornoId: number,
  desde?: Date,
  hasta?: Date
) {
  const query = this.lecturaRepo.createQueryBuilder('lectura')
    .where('lectura.hornoId = :hornoId', { hornoId })
    .orderBy('lectura.timestamp', 'ASC');

  if (desde) query.andWhere('lectura.timestamp >= :desde', { desde });
  if (hasta) query.andWhere('lectura.timestamp <= :hasta', { hasta });

  const lecturas = await query.getMany();
  if (lecturas.length === 0) return [];

  const puntos = lecturas.map((l, i) => ({
    x: i,
    y: l.temperatura,
    original: l
  }));

  const simplificados = this.douglasPeucker(puntos, 2.0);

  // Calcular minutos desde el primer dato
  const tiempoInicio = new Date(simplificados[0].original.timestamp).getTime();

  return simplificados.map(p => {
    const tiempoActual = new Date(p.original.timestamp).getTime();
    const minutosTranscurridos = Math.round((tiempoActual - tiempoInicio) / 1000 / 60);
    return {
      temperatura: p.original.temperatura,
      minutosDesdeInicio: minutosTranscurridos,
      timestamp: p.original.timestamp
    };
  });
}

private douglasPeucker(
  puntos: { x: number; y: number; original: any }[],
  epsilon: number
): { x: number; y: number; original: any }[] {
  if (puntos.length <= 2) return puntos;

  // Encontrar el punto más alejado de la línea entre el primero y último
  const primero = puntos[0];
  const ultimo = puntos[puntos.length - 1];

  let maxDistancia = 0;
  let maxIndex = 0;

  for (let i = 1; i < puntos.length - 1; i++) {
    const distancia = this.distanciaPuntoLinea(
      puntos[i], primero, ultimo
    );
    if (distancia > maxDistancia) {
      maxDistancia = distancia;
      maxIndex = i;
    }
  }

  // Si la distancia máxima es mayor que epsilon, recursión
  if (maxDistancia > epsilon) {
    const izquierda = this.douglasPeucker(
      puntos.slice(0, maxIndex + 1), epsilon
    );
    const derecha = this.douglasPeucker(
      puntos.slice(maxIndex), epsilon
    );
    return [...izquierda.slice(0, -1), ...derecha];
  }

  // Si no, devolver solo el primero y último
  return [primero, ultimo];
}

private distanciaPuntoLinea(
  punto: { x: number; y: number },
  lineaInicio: { x: number; y: number },
  lineaFin: { x: number; y: number }
): number {
  const dx = lineaFin.x - lineaInicio.x;
  const dy = lineaFin.y - lineaInicio.y;
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return 0;
  return Math.abs(
    dy * punto.x - dx * punto.y + 
    lineaFin.x * lineaInicio.y - lineaFin.y * lineaInicio.x
  ) / mag;
}

async obtenerHistorial(hornoId: number) {
  // Trae un punto cada 30 segundos usando query nativa
  return await this.lecturaRepo.query(`
    SELECT DISTINCT ON (
      date_trunc('minute', timestamp) + 
      INTERVAL '30 seconds' * ROUND(EXTRACT(SECOND FROM timestamp) / 30)
    )
    id, "hornoId", temperatura, "hayHumedad", timestamp
    FROM lectura
    WHERE "hornoId" = $1
    ORDER BY 
      date_trunc('minute', timestamp) + 
      INTERVAL '30 seconds' * ROUND(EXTRACT(SECOND FROM timestamp) / 30),
      timestamp ASC
  `, [hornoId]);
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

  // ==================== PERFILES DE FUEGO ====================

  async crearPerfil(data: {
    hornoId: number;
    nombre: string;
    descripcion?: string;
    segmentos: { target: number; rate: number; hold: number }[];
    notas?: string;
    material?: string;
    tempMaxima?: number;
    duracionEstimada?: number;
  }) {
    const perfil = this.perfilRepo.create(data);
    return this.perfilRepo.save(perfil);
  }

  async listarPerfiles(hornoId: number) {
    return this.perfilRepo.find({
      where: { hornoId },
      order: { favorito: 'DESC', updatedAt: 'DESC' },
    });
  }

  async obtenerPerfil(id: number) {
    return this.perfilRepo.findOneBy({ id });
  }

  async actualizarPerfil(id: number, data: Partial<{
    nombre: string;
    descripcion: string;
    segmentos: { target: number; rate: number; hold: number }[];
    notas: string;
    material: string;
    tempMaxima: number;
    duracionEstimada: number;
    favorito: boolean;
  }>) {
    await this.perfilRepo.update(id, data);
    return this.perfilRepo.findOneBy({ id });
  }

  async eliminarPerfil(id: number) {
    return this.perfilRepo.delete(id);
  }
}
