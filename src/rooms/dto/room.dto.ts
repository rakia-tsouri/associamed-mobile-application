import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateRoomDto {
    @ApiProperty({ example: 'Cardiologie' })
    @IsString()
    name: string;

    @ApiProperty({ example: 0, minimum: 0, maximum: 4 })
    @IsInt()
    @Min(0)
    @Max(4)
    availableSlots: number;

    @ApiProperty({ example: 4, minimum: 1, required: false })
    @IsInt()
    @Min(1)
    @IsOptional()
    capacity?: number;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    assignedToId?: number;
}

export class UpdateRoomDto {
    @ApiProperty({ example: 'Cardiologie (+)', required: false })
    @IsString()
    @IsOptional()
    name?: string;

    @ApiProperty({ example: 2, minimum: 0, maximum: 4, required: false })
    @IsInt()
    @Min(0)
    @Max(4)
    @IsOptional()
    availableSlots?: number;

    @ApiProperty({ example: 4, minimum: 1, required: false })
    @IsInt()
    @Min(1)
    @IsOptional()
    capacity?: number;

    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    assignedToId?: number;
}
