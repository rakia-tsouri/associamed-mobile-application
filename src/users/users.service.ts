import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/user-role.enum';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(username: string, password: Buffer | string, role: UserRole): Promise<User> {
        const existingUser = await this.usersRepository.findOne({ where: { username } });
        if (existingUser) {
            throw new ConflictException('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            username,
            password: hashedPassword,
            role,
        });

        return this.usersRepository.save(user);
    }

    async findOne(username: string): Promise<User | null> {
        return this.usersRepository.findOne({ where: { username } });
    }

    async findById(id: number): Promise<User> {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    async update(id: number, updateData: Partial<User>): Promise<User> {
        const user = await this.findById(id);
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        Object.assign(user, updateData);
        return this.usersRepository.save(user);
    }

    async remove(id: number): Promise<void> {
        const user = await this.findById(id);
        if (user.username === 'admin') {
            throw new ConflictException('Cannot delete the primary admin user');
        }
        await this.usersRepository.remove(user);
    }
}
