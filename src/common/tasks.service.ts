import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { join, parse } from 'path';
import { readdir, unlink } from 'fs/promises';

@Injectable()
export class TasksService {
  constructor() {}

  @Cron('* * * * * *')
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

    // for (let i = 0; i < deleteFileTargets.length; i++) {
    //   const fileName = deleteFileTargets[i];
    //
    //   unlink(join(process.cwd(), 'public', 'temp', fileName));
    // }
  }
}
