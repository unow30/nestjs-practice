import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 } from 'uuid';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from '../movie/entity/movie.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Movie]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'public', 'temp'),
        filename(req, file, cb) {
          const split = file.originalname.split('.');

          let ext = 'mp4';
          if (split.length > 1) {
            ext = split[split.length - 1];
          }

          cb(null, `${v4()}_${Date.now()}.${ext}`);
        },
      }),
    }),
  ],
  controllers: [CommonController],
  providers: [CommonService, TasksService],
  exports: [CommonService],
})
export class CommonModule {}
