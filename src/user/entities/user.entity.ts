import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Exclude } from 'class-transformer';

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Column()
  //toClassOnly: 클라이언트로부터 데이터를 받을 때 해당 필드를 무시하고 싶을 때 true
  //toPlainOnly: 클라이언트에게 데이터를 응답할 때 해당 필드를 숨기고 싶을 때 true
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  role: Role;
}
