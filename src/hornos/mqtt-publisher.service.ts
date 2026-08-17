import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttPublisherService implements OnModuleInit, OnModuleDestroy {
  private clientPromise: Promise<mqtt.MqttClient | null> = Promise.resolve(null);
  private logger = new Logger('MqttPublisher');

  onModuleInit() {
    this.clientPromise = mqtt.connectAsync(
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

  async onModuleDestroy() {
    const client = await this.clientPromise;
    if (client) client.end();
  }

  async publish(topic: string, payload: object): Promise<void> {
    try {
      const client = await this.clientPromise;
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
