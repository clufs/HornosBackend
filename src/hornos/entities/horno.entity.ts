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

  @Column()
  hayHumedad: boolean;

  @CreateDateColumn()
  timestamp: Date;
}
