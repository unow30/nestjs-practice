import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseTable } from '../../common/entity/base-table.entity';
import { Exclude } from 'class-transformer';
import { Movie } from '../../movie/entity/movie.entity';
import { MovieUserLike } from '../../movie/entity/movie-user-like.entity';
import { Chat } from '../../chat/entity/chat.entity';
import { ChatRoom } from '../../chat/entity/chat-room.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User extends BaseTable {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '사용자 아이디' })
  id: number;

  @Column({
    unique: true,
  })
  @ApiProperty({ description: '사용자 이메일 로그인 id로 사용한다.' })
  email: string;

  @Column()
  //toClassOnly: 클라이언트로부터 데이터를 받을 때 해당 필드를 무시하고 싶을 때 true
  //toPlainOnly: 클라이언트에게 데이터를 응답할 때 해당 필드를 숨기고 싶을 때 true
  @Exclude({ toPlainOnly: true })
  @ApiProperty({ description: '사용자 패스워드' })
  password: string;

  @Column({
    enum: Role,
    default: Role.user,
  })
  @ApiProperty({
    description: '사용자 권한. 0:일반, 1:구독, 2:관리자 기본값 일반',
  })
  role: Role;

  @OneToMany(() => Movie, (movie) => movie.creator)
  @ApiProperty({ type: () => [Movie], description: '영화 생성 목록' })
  createdMovies: Movie[];

  @OneToMany(() => MovieUserLike, (mul) => mul.user)
  @ApiProperty({
    type: () => [MovieUserLike],
    description: '영화 좋아요 생성 목록',
  })
  likedMovies: MovieUserLike[];

  @OneToMany(() => Chat, (chat) => chat.author)
  @ApiProperty({ type: () => [Chat], description: '채팅 생성 목록' })
  chats: Chat[];

  @ManyToMany(() => ChatRoom, (chatroom) => chatroom.users)
  @ApiProperty({ type: () => [ChatRoom], description: '채팅방 생성 목록' })
  chatRooms: ChatRoom[];
}
