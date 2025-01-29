import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class MovieTitleValidationPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value) {
      return value;
    }

    //만약 글자 길이가 2보다 작으면 에러 던지기
    if (value.length <= 2) {
      throw new BadRequestException('영화재목은 3자 이상 작성하세요');
    }

    return value;
  }
}
