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
    console.log({ context });

    const topic = context.getTopic();
    // aca obtenemos el id del horno desde el topic
    const hornoId = parseInt(topic.split('/')[1]);

    // nosotros obtenemos el la data del esp32
    console.log(`Datos recibidos del horno ${hornoId}:`, data);

    return this.hornosService.register(hornoId, data.temp, data.hum);
  }
}
