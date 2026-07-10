import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
} from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  options!: string[];

  @IsInt()
  @Min(0)
  @Max(3)
  correctIndex!: number;

  @IsInt()
  @Min(5)
  @Max(120)
  @IsOptional()
  timeLimitSec?: number;

  @IsNumber()
  order!: number;

  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
