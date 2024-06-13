import { IsNotEmpty, IsString } from 'class-validator';

export class GetAnswerDto {
  @IsString()
  @IsNotEmpty()
  question: string;
}
