import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, MinLength } from 'class-validator';
import { UserRole } from '../../common/user-role.enum';

export class CreateUserDto {
    @ApiProperty({ example: 'admin' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.USER_1 })
    @IsEnum(UserRole)
    role: UserRole;
}
