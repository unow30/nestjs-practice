import { IsNumber } from 'class-validator';

import { Column, Entity } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class DirectorDto {
  @IsNumber()
  @ApiProperty({ description: '감독 id' })
  id: number;

  @Column()
  @ApiProperty({ description: '감독 이름' })
  name: string;

  @Column()
  @ApiProperty({ description: '감독 생일' })
  dob: Date;

  @Column()
  @ApiProperty({ description: '감독 국가' })
  nationality: string;
}
