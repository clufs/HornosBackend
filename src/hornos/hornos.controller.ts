import { Controller, Get, Post, Put, Delete, Param, Query, Body, Inject } from '@nestjs/common';
import {
  MessagePattern,
  ClientProxy,
  Payload,
  Ctx,
  MqttContext,
} from '@nestjs/microservices';
import { HornosService } from './hornos.service';
import { HornosAgentService } from './hornos-agent.service';

@Controller('hornos')
export class HornosController {
  constructor(
  private readonly hornosService: HornosService,
  private readonly hornosAgentService: HornosAgentService,
  @Inject('MQTT_CLIENT') private readonly mqttClient: ClientProxy,
  ) {}

  @MessagePattern('horno/+/datos')
  handleDatos(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    const hornoId = parseInt(topic.split('/')[1]);

    console.log(`Datos recibidos del horno ${hornoId}:`, data);

    return this.hornosService.register(hornoId, {
      temperatura: data.t1 ?? data.temp,
      hayHumedad: data.hum ?? false,
      objetivo: data.objetivo ?? 0,
      potencia: data.potencia ?? 0,
      segmento: data.segmento ?? 1,
      activo: data.activo ?? false,
      corriente: data.corriente ?? 0,
      potenciaW: data.potencia_w ?? 0,
      energiaWh: data.energia_wh ?? 0,
      costo: data.costo ?? 0,
      totalSegmentos: data.totalSegmentos ?? 0,
      enMantencion: data.enMantencion ?? false,
    });
  }

  @Get('cmd/:hornoId/:comando')
  async enviarComando(
    @Param('hornoId') hornoId: string,
    @Param('comando') comando: string,
    @Query('programa') programa?: string,
  ) {
    const topic = `horno/${hornoId}/cmd`;
    let payload: any = { cmd: comando };
    if (programa) payload.programa = parseInt(programa);

    this.mqttClient.emit(topic, payload).subscribe({
      error: (err) => console.error('MQTT emit error', err),
    });
    return { ok: true, topic, payload };
  }

  @Get('chat')
  async hablarConElHorno(@Query('mensaje') mensaje: string) {
    return await this.hornosAgentService.preguntar(mensaje);
  }

  @Get('historial/:hornoId')
  async obtenerHistorial(
    @Param('hornoId') hornoId: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    return await this.hornosService.obtenerHistorialPorFecha(
      parseInt(hornoId),
      desde ? new Date(desde) : undefined,
      hasta ? new Date(hasta) : undefined,
    );
  }

  // ==================== PERFILES DE FUEGO ====================

  @Post('perfiles')
  async crearPerfil(@Body() body: {
    hornoId: number;
    nombre: string;
    descripcion?: string;
    segmentos: { target: number; rate: number; hold: number }[];
    notas?: string;
    material?: string;
    tempMaxima?: number;
    duracionEstimada?: number;
  }) {
    return this.hornosService.crearPerfil(body);
  }

  @Get('perfiles/:hornoId')
  async listarPerfiles(@Param('hornoId') hornoId: string) {
    return this.hornosService.listarPerfiles(parseInt(hornoId));
  }

  @Get('perfil/:id')
  async obtenerPerfil(@Param('id') id: string) {
    return this.hornosService.obtenerPerfil(parseInt(id));
  }

  @Put('perfil/:id')
  async actualizarPerfil(
    @Param('id') id: string,
    @Body() body: Partial<{
      nombre: string;
      descripcion: string;
      segmentos: { target: number; rate: number; hold: number }[];
      notas: string;
      material: string;
      tempMaxima: number;
      duracionEstimada: number;
      favorito: boolean;
    }>,
  ) {
    return this.hornosService.actualizarPerfil(parseInt(id), body);
  }

  @Delete('perfil/:id')
  async eliminarPerfil(@Param('id') id: string) {
    return this.hornosService.eliminarPerfil(parseInt(id));
  }
}
