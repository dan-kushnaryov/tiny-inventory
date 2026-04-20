import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @ValidateIf((_o: unknown, v: unknown) => v !== null && v !== undefined)
  @IsString()
  @MaxLength(5000)
  address?: string | null;
}
