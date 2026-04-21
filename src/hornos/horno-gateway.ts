import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class HornoGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private logger = new Logger('HornoGateway');

  afterInit() {
    this.logger.log('WebSocket Gateway iniciado');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Este método lo llama el servicio MQTT cada vez que llega una lectura
  emitirLectura(data: LecturaHorno) {
    this.server.emit('lectura', data);
  }

  emitirAlerta(alerta: string) {
    this.server.emit('alerta', { mensaje: alerta, timestamp: Date.now() });
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
