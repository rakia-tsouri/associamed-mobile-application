import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { EventsGateway } from '../events/events.gateway';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/user-role.enum';
import { UsersService } from '../users/users.service';

@Injectable()
export class RoomsService {
    constructor(
        @InjectRepository(Room)
        private roomsRepository: Repository<Room>,
        private eventsGateway: EventsGateway,
        private usersService: UsersService,
    ) { }

    async create(createRoomDto: CreateRoomDto): Promise<Room> {
        const { assignedToId, ...roomData } = createRoomDto;
        const room = this.roomsRepository.create(roomData);

        if (assignedToId) {
            room.assignedTo = await this.usersService.findById(assignedToId);
        }

        const savedRoom = await this.roomsRepository.save(room) as Room;
        this.eventsGateway.broadcastRoomUpdate(savedRoom);
        return savedRoom;
    }

    async findAll(user: User): Promise<Room[]> {
        if (user.role === UserRole.USER_2) {
            return this.roomsRepository.find({
                where: { assignedTo: { id: user.id } },
                relations: ['assignedTo'],
            });
        }
        return this.roomsRepository.find({ relations: ['assignedTo'] });
    }

    async findOne(id: number, user?: User): Promise<Room> {
        const room = await this.roomsRepository.findOne({
            where: { id },
            relations: ['assignedTo'],
        });

        if (!room) {
            throw new NotFoundException(`Room with ID ${id} not found`);
        }

        if (user && user.role === UserRole.USER_2 && room.assignedTo?.id !== user.id) {
            throw new ForbiddenException('You do not have access to this room');
        }

        return room;
    }

    async update(id: number, updateRoomDto: UpdateRoomDto, user: User): Promise<Room> {
        const room = await this.findOne(id, user);

        const { assignedToId, ...updateData } = updateRoomDto;

        if (assignedToId !== undefined) {
            if (user.role !== UserRole.ADMIN) {
                throw new ForbiddenException('Only admins can assign rooms');
            }
            if (assignedToId === null) {
                room.assignedTo = null;
            } else {
                room.assignedTo = await this.usersService.findById(assignedToId);
            }
        }

        Object.assign(room, updateData);

        const maxCapacity = room.capacity > 0 ? room.capacity : 4;
        if (room.availableSlots < 0 || room.availableSlots > maxCapacity) {
            throw new BadRequestException(`Available slots must be between 0 and ${maxCapacity}`);
        }

        const savedRoom = await this.roomsRepository.save(room) as Room;
        this.eventsGateway.broadcastRoomUpdate(savedRoom);
        return savedRoom;
    }

    async increment(id: number, user: User): Promise<Room> {
        const room = await this.findOne(id, user);
        const maxCapacity = room.capacity > 0 ? room.capacity : 4;
        if (room.availableSlots >= maxCapacity) {
            throw new BadRequestException('Room is already at maximum capacity');
        }
        room.availableSlots += 1;
        const savedRoom = await this.roomsRepository.save(room) as Room;
        this.eventsGateway.broadcastRoomUpdate(savedRoom);
        return savedRoom;
    }

    async decrement(id: number, user: User): Promise<Room> {
        const room = await this.findOne(id, user);
        if (room.availableSlots <= 0) {
            throw new BadRequestException('Room is already empty');
        }
        room.availableSlots -= 1;
        const savedRoom = await this.roomsRepository.save(room) as Room;
        this.eventsGateway.broadcastRoomUpdate(savedRoom);
        return savedRoom;
    }

    async resetAll(user: User): Promise<void> {
        if (user.role === UserRole.ADMIN) {
            await this.roomsRepository
                .createQueryBuilder()
                .update(Room)
                .set({ availableSlots: 0 })
                .execute();
        } else {
            // Reset only assigned rooms for User 2
            await this.roomsRepository
                .createQueryBuilder()
                .update(Room)
                .set({ availableSlots: 0 })
                .where('assignedToId = :userId', { userId: user.id })
                .execute();
        }

        const rooms = await this.findAll(user);
        rooms.forEach(room => this.eventsGateway.broadcastRoomUpdate(room));
    }

    async remove(id: number): Promise<void> {
        const room = await this.findOne(id);
        await this.roomsRepository.remove(room);
    }
}
