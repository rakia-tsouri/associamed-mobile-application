import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';
import { UserRole } from '../common/user-role.enum';
import { GetUser } from '../auth/get-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rooms')
export class RoomsController {
    constructor(private readonly roomsService: RoomsService) { }

    @ApiOperation({ summary: 'Create a new room (Admin only)' })
    @Roles(UserRole.ADMIN)
    @Post()
    create(@Body() createRoomDto: CreateRoomDto) {
        return this.roomsService.create(createRoomDto);
    }

    @ApiOperation({ summary: 'Get all rooms' })
    @Roles(UserRole.USER_1, UserRole.USER_2, UserRole.ADMIN)
    @Get()
    findAll(@GetUser() user: User) {
        return this.roomsService.findAll(user);
    }

    @ApiOperation({ summary: 'Get a specific room' })
    @Roles(UserRole.USER_1, UserRole.USER_2, UserRole.ADMIN)
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.roomsService.findOne(id, user);
    }

    @ApiOperation({ summary: 'Update a room (Admin or assigned User 2)' })
    @Roles(UserRole.USER_2, UserRole.ADMIN)
    @Patch(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateRoomDto: UpdateRoomDto,
        @GetUser() user: User,
    ) {
        return this.roomsService.update(id, updateRoomDto, user);
    }

    @ApiOperation({ summary: 'Increment room counter (Admin or assigned User 2)' })
    @Roles(UserRole.USER_2, UserRole.ADMIN)
    @Patch(':id/increment')
    increment(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.roomsService.increment(id, user);
    }

    @ApiOperation({ summary: 'Decrement room counter (Admin or assigned User 2)' })
    @Roles(UserRole.USER_2, UserRole.ADMIN)
    @Patch(':id/decrement')
    decrement(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
        return this.roomsService.decrement(id, user);
    }

    @ApiOperation({ summary: 'Reset all (assigned) room counters' })
    @Roles(UserRole.USER_2, UserRole.ADMIN)
    @Post('reset')
    resetAll(@GetUser() user: User) {
        return this.roomsService.resetAll(user);
    }

    @ApiOperation({ summary: 'Delete a room (Admin only)' })
    @Roles(UserRole.ADMIN)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.roomsService.remove(id);
    }
}
