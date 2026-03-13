import { Controller } from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  Ctx,
  MqttContext,
} from '@nestjs/microservices';
import { HornosService } from './hornos.service';

@Controller('hornos')
export class HornosController {
  constructor(private readonly hornosService: HornosService) {}

  @MessagePattern('horno/+/datos')
  handleDatos(@Payload() data: any, @Ctx() context: MqttContext) {
    const topic = context.getTopic();
    const hornoId = parseInt(topic.split('/')[1]);

    // Aquí recibimos el JSON del ESP32
    return this.hornosService.register(hornoId, data.temp, data.hum);
  }
}
