import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { UserRole } from '../../common/user-role.enum';
import { Room } from '../../rooms/entities/room.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER_1,
    })
    role: UserRole;

    @OneToMany(() => Room, (room) => room.assignedTo)
    rooms: Room[];
}
