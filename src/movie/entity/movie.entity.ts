import { Exclude, Expose, Transform } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

// @Exclude() //클래스 전체에 숨김 가능
// export class Movie {
//   id: number;
//   title: string;
//
//   //@Expose() 보통 전체 클래스의 exclude이고 일부만 보여줘야 할 때 expose를 사용할 수 있다.
//   // @Exclude() //프로퍼티에 숨김 가능
//   genre: string;
// }

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
