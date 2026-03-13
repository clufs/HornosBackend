import { PartialType } from '@nestjs/mapped-types';
import { CreateHornoDto } from './create-horno.dto';

export class UpdateHornoDto extends PartialType(CreateHornoDto) {}
