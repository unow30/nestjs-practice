import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { join, parse } from 'path';
import { readdir, unlink } from 'fs/promises';
import { Movie } from '../movie/entity/movie.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
// import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly schedulerRegistry: SchedulerRegistry,
    // @Inject(WINSTON_MODULE_NEST_PROVIDER)
    // private readonly logger: LoggerService,
  ) {}

  // @Cron('*/5 * * * * *', { name: 'printer' }) //1초마다 실행
  printer() {
    const error = new Error('에러 발생!'); // 에러 객체 생성

    // this.logger.error('에러단계', error.stack, TasksService.name);
    // this.logger.warn('경고단계', TasksService.name);
    // this.logger.log('로그단계', TasksService.name);
    // this.logger.debug('디버그단계', TasksService.name);
    // this.logger.verbose('버보스단계', TasksService.name);
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
