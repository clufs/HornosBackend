import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Lectura {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hornoId: number;

  @Column('float')
  temperatura: number;

  @Column('float', { nullable: true })
  temperatura2: number;

  @Column()
  hayHumedad: boolean;

  @Column('float', { default: 0 })
  objetivo: number;

  @Column('float', { default: 0 })
  potencia: number;

  @Column('int', { default: 1 })
  segmento: number;

  @Column({ default: false })
  activo: boolean;

  @Column('float', { default: 0 })
  corriente: number;

  @Column('float', { default: 0 })
  potenciaW: number;

  @Column('float', { default: 0 })
  energiaWh: number;

  @Column('float', { default: 0 })
  costo: number;

  @CreateDateColumn()
  timestamp: Date;
}