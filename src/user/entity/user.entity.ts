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

  @OneToMany(() => Movie, (movie) => movie.creator)
  createdMovies: Movie[];

  @OneToMany(() => MovieUserLike, (mul) => mul.user)
  likedMovies: MovieUserLike[];

  @OneToMany(() => Chat, (chat) => chat.author)
  chats: Chat[];

  @ManyToMany(() => ChatRoom, (chatroom) => chatroom.users)
  chatRooms: ChatRoom[];
}
