import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HornosModule } from './hornos/hornos.module';
import { Lectura } from './hornos/entities/horno.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'aws-1-sa-east-1.pooler.supabase.com',
      port: 5432,
      username: 'postgres.mhdmnbisvtetiixabwou',
      password: 'v2sPzMeItt1hV07m',
      database: 'postgres',
      entities: [Lectura],
      synchronize: true,
      ssl: {
        rejectUnauthorized: false,
      },
    }),
    HornosModule,
  ],
})
export class AppModule {}
