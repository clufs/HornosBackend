import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttPublisherService implements OnModuleInit, OnModuleDestroy {
  private client: mqtt.MqttClient;
  private logger = new Logger('MqttPublisher');

  onModuleInit() {
    this.client = mqtt.connectAsync(
      'mqtts://bebc10bc889c481398edb22a24d7e32c.s1.eu.hivemq.cloud:8883',
      {
        username: 'nahuel',
        password: 'Celeste21o',
        rejectUnauthorized: false,
      },
    ).then((client) => {
      this.logger.log('MQTT Publisher conectado');
      return client;
    }).catch((err) => {
      this.logger.error('MQTT Publisher error de conexion', err);
      return null;
    });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.then(c => c?.end());
    }
  }

  async publish(topic: string, payload: object): Promise<void> {
    try {
      const client = await this.client;
      if (!client || !client.connected) {
        this.logger.warn('MQTT no conectado, no se pudo publicar');
        return;
      }
      const msg = JSON.stringify(payload);
      client.publish(topic, msg);
      this.logger.log(`MQTT publicado en ${topic}: ${msg}`);
    } catch (err) {
      this.logger.error('Error publicando MQTT', err);
    }
  }
}
