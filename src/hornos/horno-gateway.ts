import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { MqttPublisherService } from './mqtt-publisher.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class HornoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('HornoGateway');

  constructor(
    @Inject('MQTT_CLIENT') private readonly mqttClient: ClientProxy,
    private readonly mqttPublisher: MqttPublisherService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway iniciado');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  emitirLectura(data: LecturaHorno) {
    this.server.emit('lectura', data);
  }

  emitirStatus(data: ControlStatus) {
    this.server.emit('status', data);
  }

  emitirAlerta(alerta: string) {
    this.server.emit('alerta', { mensaje: alerta, timestamp: Date.now() });
  }

  @SubscribeMessage('iniciarPerfil')
  handleIniciarPerfil(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { segmentos: { target: number; rate: number; hold: number }[] },
  ) {
    this.logger.log(`Perfil recibido de ${client.id}: ${data.segmentos.length} segmentos`);
    const payload = { cmd: 'iniciar', segmentos: data.segmentos };
    this.mqttPublisher.publish('horno/1/cmd', payload);
    return { ok: true };
  }

  @SubscribeMessage('detenerPerfil')
  handleDetenerPerfil(@ConnectedSocket() client: Socket) {
    this.logger.log(`Detener perfil pedido por ${client.id}`);
    this.mqttPublisher.publish('horno/1/cmd', { cmd: 'detener' });
    return { ok: true };
  }

  @SubscribeMessage('emergencia')
  handleEmergencia(@ConnectedSocket() client: Socket) {
    this.logger.log(`Emergencia activada por ${client.id}`);
    this.mqttPublisher.publish('horno/1/cmd', { cmd: 'emergencia' });
    return { ok: true };
  }
}

export interface LecturaHorno {
  temp_c: number;
  tasa_c_min: number;
  fase_actual: string;
  alert_flags: number;
  soak_activo: boolean;
  temp_max: number;
  tiempo_s: number;
}

export interface ControlStatus {
  ssr: boolean;
  setpoint: number;
  objetivo: number;
  segmento: number;
  totalSegmentos: number;
  activo: boolean;
  enMantencion: boolean;
}
