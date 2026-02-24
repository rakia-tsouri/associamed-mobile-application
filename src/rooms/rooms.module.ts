import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Room]),
        EventsModule,
        UsersModule,
    ],
    providers: [RoomsService],
    controllers: [RoomsController],
    exports: [RoomsService],
})
export class RoomsModule { }
