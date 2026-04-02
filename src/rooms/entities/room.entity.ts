import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('rooms')
export class Room {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ default: 4 })
    capacity: number;

    @Column({ default: 0 })
    availableSlots: number;

    @ManyToOne(() => User, (user) => user.rooms, { nullable: true, onDelete: 'SET NULL' })
    assignedTo: User | null;
}
