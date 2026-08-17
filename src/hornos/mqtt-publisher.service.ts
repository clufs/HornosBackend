import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as mqtt from 'mqtt';

@Injectable()
export class MqttPublisherService implements OnModuleDestroy {
  private client: mqtt.MqttClient;
  private logger = new Logger('MqttPublisher');
  private connected = false;

  constructor() {
    const url = 'mqtts://bebc10bc889c481398edb22a24d7e32c.s1.eu.hivemq.cloud:8883';
    this.logger.log(`Conectando MQTT Publisher a ${url}...`);

    this.client = mqtt.connect(url, {
      username: 'nahuel',
      password: 'Celeste21o',
      rejectUnauthorized: false,
      reconnectPeriod: 5000,
    });

    this.client.on('connect', () => {
      this.connected = true;
      this.logger.log('MQTT Publisher CONECTADO');
    });

    this.client.on('error', (err) => {
      this.connected = false;
      this.logger.error('MQTT Publisher error', err.message);
    });

    this.client.on('offline', () => {
      this.connected = false;
      this.logger.warn('MQTT Publisher offline');
    });

    this.client.on('reconnect', () => {
      this.logger.log('MQTT Publisher reconectando...');
    });
  }

  onModuleDestroy() {
    if (this.client) this.client.end();
  }

  publish(topic: string, payload: object): void {
    this.logger.log(`MQTT publish - connected: ${this.connected}, topic: ${topic}`);
    if (!this.client || !this.connected) {
      this.logger.warn(`MQTT NO CONECTADO - no se pudo publicar en ${topic}`);
      return;
    }
    const msg = JSON.stringify(payload);
    this.client.publish(topic, msg, undefined, (err) => {
      if (err) {
        this.logger.error(`MQTT error publicando en ${topic}`, err.message);
      } else {
        this.logger.log(`MQTT OK -> ${topic}: ${msg}`);
      }
    });
  }
}
