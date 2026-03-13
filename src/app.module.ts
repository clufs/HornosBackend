import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HornosModule } from './hornos/hornos.module';
import { Lectura } from './hornos/entities/horno.entity';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   // Usa exactamente la URL que pusiste, pero con el flag de SSL
    //   url: 'postgresql://postgres:v2sPzMeItt1hV07m@db.mhdmnbisvtetiixabwou.supabase.co:5432/postgres',

    //   entities: [Lectura],
    //   synchronize: true, // Esto crea la tabla 'lectura' en Supabase al arrancar
    //   ssl: {
    //     rejectUnauthorized: false, // CLAVE: Supabase rechaza conexiones sin SSL
    //   },
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Usamos los datos de tu DIRECT_URL
      host: 'aws-1-sa-east-1.pooler.supabase.com',
      port: 5432,
      username: 'postgres.mhdmnbisvtetiixabwou', // Ojo: incluye el ID después del punto
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
