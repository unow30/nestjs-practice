import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

/*
 * @IsNotEmpty Checks if given value is not empty (!== '', !== null, !== undefined).
 * @IsOptional Checks if value is missing and if so, ignores all validators.
 * */
export class UpdateDirectorDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  name?: string;

  @IsNotEmpty()
  @IsDateString()
  @IsOptional()
  dob?: Date;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  nationality?: string;
}
