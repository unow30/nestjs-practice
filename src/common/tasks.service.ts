import { Injectable } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { join, parse } from 'path';
import { readdir, unlink } from 'fs/promises';
import { Movie } from '../movie/entity/movie.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  // @Cron('* * * * * *', { name: 'printer' }) //1초마다 실행
  printer() {
    console.log('print every second');
  }

  // @Cron('*/5 * * * * *') //5초마다 실행
  stopper() {
    console.log('stopper run');

    //cron printer 작업 들어있다.
    const job = this.schedulerRegistry.getCronJob('printer');

    if (job.running) {
      job.stop();
    } else {
      job.start();
    }
  }

  // @Cron('0 * * * * *')
  async calculateMovieLikeCounts() {
    await this.movieRepository.query(
      `update movie m
        set "likeCount" = (select count(*) from movie_user_like mul
        where m.id = mul."movieId"
        and mul."isLike" = true)`,
    );

    await this.movieRepository.query(
      `update movie m
        set "dislikeCount" = (select count(*) from movie_user_like mul
        where m.id = mul."movieId"
        and mul."isLike" = false)`,
    );
  }

  // @Cron('* * * * * *')
  async eraseOrphan() {
    const files = await readdir(join(process.cwd(), 'public', 'temp'));
    console.log('files', files);

    //임시 파일 중 삭제할 파일을 찾는다.
    const deleteFileTargets = files.filter((file) => {
      const filename = parse(file).name;
      const split = filename.split('_');

      //uuid 포맷 형식이 아닌 파일
      if (split.length !== 2) {
        return true;
      }

      try {
        const date = +new Date(parseInt(split[split.length - 1]));
        const aDayInMilSec = 24 * 60 * 60 * 1000;
        const now = +new Date();

        console.table({
          'now - date > aDayInMilSec': now - date > aDayInMilSec,
        });

        //업로드한지 하루가 지난 파일을 찾는다.
        return now - date > aDayInMilSec;
      } catch (e) {
        //에러가 나는 파일 또한 찾는다.
        return true;
      }
    });

    //여러 파일을 한번에 제거
    await Promise.all(
      deleteFileTargets.map((file) =>
        unlink(join(process.cwd(), 'public', 'temp', file)),
      ),
    );
  }
}
