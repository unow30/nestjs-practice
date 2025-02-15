import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ClassSerializerInterceptor,
  UseInterceptors,
  Request,
  ParseIntPipe,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Public } from '../auth/decorator/public.decorator';
import { Role } from '../user/entities/user.entity';
import { RBAC } from '../auth/decorator/rbac.decorator';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CacheInterceptor } from '../common/interceptor/cache.interceptor';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor) //class transformer를 movie controller에 적용하겠다.
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @Public()
  getMovies(@Query() dto: GetMoviesDto) {
    return this.movieService.findAll(dto);
  }

  @Get(':id')
  @Public()
  getMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.findOne(id);
  }

  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(
    FileInterceptor('movie', {
      limits: { fileSize: 200000000 },
      fileFilter(req, file, callback) {
        if (file.mimetype !== 'video/mp4') {
          return callback(
            new BadRequestException('mp4타입만 업로드 가능합니다.'),
            false,
          );
        }
        return callback(null, true);
      },
    }),
  )
  postMovie(
    @Body() body: CreateMovieDto,
    @Request() req,
    @UploadedFile() movie?: Express.Multer.File,
  ) {
    return this.movieService.create(body, movie.filename, req.queryRunner);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  patchMovie(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateMovieDto,
  ) {
    return this.movieService.update(id, body);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovie(@Param('id', ParseIntPipe) id: number) {
    return this.movieService.remove(id);
  }
}
