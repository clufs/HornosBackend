import { Controller, Get, Param, Query, Inject } from '@nestjs/common';
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
      temperatura: data.temp,
      hayHumedad: data.hum ?? false,
      objetivo: data.objetivo ?? 0,
      potencia: data.potencia ?? 0,
      segmento: data.segmento ?? 1,
      activo: data.activo ?? false,
      corriente: data.corriente ?? 0,
      potenciaW: data.potencia_w ?? 0,
      energiaWh: data.energia_wh ?? 0,
      costo: data.costo ?? 0,
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

    // Publicar al ESP via MQTT
    this.mqttClient.emit(topic, payload);
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
}
