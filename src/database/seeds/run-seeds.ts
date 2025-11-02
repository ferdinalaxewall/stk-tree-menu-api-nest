import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { MenuSeeder } from './menu.seed';
import { Menu } from '../../menu/entities/menu.entity';

config();

const configService = new ConfigService();

// Database configuration
const AppDataSource = new DataSource({
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME', 'postgres'),
    password: configService.get('DB_PASSWORD', 'password'),
    database: configService.get('DB_NAME', 'stk_db'),
    entities: [Menu],
    synchronize: false,
    logging: false,
});

async function runSeeds() {
    try {
        console.log('🌱 Starting database seeding...');
        
        await AppDataSource.initialize();
        console.log('✅ Database connection established');

        console.log('📋 Running menu seeder...');
        await MenuSeeder.run(AppDataSource);

        console.log('🎉 All seeds completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('🔌 Database connection closed');
        }
    }
}

runSeeds();