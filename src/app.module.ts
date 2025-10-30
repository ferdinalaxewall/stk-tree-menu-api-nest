import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [DatabaseModule, MenuModule],
})
export class AppModule {}
