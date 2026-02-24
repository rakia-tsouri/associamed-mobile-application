import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Delete,
    UseGuards,
    Param,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../common/user-role.enum';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @ApiOperation({ summary: 'Create a new user (Admin/Bureau only)' })
    @Roles(UserRole.ADMIN)
    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(
            createUserDto.username,
            createUserDto.password,
            createUserDto.role,
        );
    }

    @ApiOperation({ summary: 'Get all users (Admin only)' })
    @Roles(UserRole.ADMIN)
    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @ApiOperation({ summary: 'Update a user (Admin only)' })
    @Roles(UserRole.ADMIN)
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateData: Partial<CreateUserDto>) {
        return this.usersService.update(id, updateData);
    }

    @ApiOperation({ summary: 'Delete a user (Admin only)' })
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.remove(id);
    }

    @ApiOperation({ summary: 'Get current user profile' })
    @Get('profile/:id')
    getProfile(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.findById(id);
    }
}
