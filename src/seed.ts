import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { UserRole } from './common/user-role.enum';

async function seed() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);

    try {
        const admin = await usersService.findOne('admin');
        if (!admin) {
            await usersService.create('admin', 'admin123', UserRole.ADMIN);
            console.log('Initial admin user created: admin / admin123');
        } else {
            console.log('Admin user already exists');
        }

        const user1 = await usersService.findOne('user1');
        if (!user1) {
            await usersService.create('user1', 'user123', UserRole.USER_1);
            console.log('Initial User 1 created: user1 / user123');
        }

        const user2 = await usersService.findOne('user2');
        if (!user2) {
            await usersService.create('user2', 'user223', UserRole.USER_2);
            console.log('Initial User 2 created: user2 / user223');
        }

    } catch (error) {
        console.error('Seeding failed:', error.message);
    } finally {
        await app.close();
    }
}

seed();
