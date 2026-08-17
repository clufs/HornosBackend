import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PerfilFuego {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  hornoId: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'jsonb' })
  segmentos: { target: number; rate: number; hold: number }[];

  @Column({ type: 'text', nullable: true })
  notas: string;

  @Column({ type: 'text', nullable: true })
  material: string;

  @Column({ type: 'int', nullable: true })
  tempMaxima: number;

  @Column({ type: 'float', nullable: true })
  duracionEstimada: number;

  @Column({ default: false })
  favorito: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
