import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiHideProperty } from '@nestjs/swagger';

export class BaseTable {
  // 생성일자
  @CreateDateColumn()
  @Exclude()
  @ApiHideProperty()
  createdAt: Date;

  // 변경일자
  @UpdateDateColumn()
  @Exclude()
  @ApiHideProperty()
  updatedAt: Date;

  // 변경횟수(생성시 1)
  @VersionColumn()
  @Exclude()
  @ApiHideProperty()
  version: number;
}
