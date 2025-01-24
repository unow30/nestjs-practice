import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

enum MovieGenre {
  Fantasy = 'fantasy',
  Action = 'action',
}

export class UpdateMovieDto {
  /*
   * @IsNotEmpty Checks if given value is not empty (!== '', !== null, !== undefined).
   * @IsOptional Checks if value is missing and if so, ignores all validators.
   * */
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  title?: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  genre?: string;

  @IsNotEmpty()
  @IsOptional()
  detail?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  directorId?: number;
}
