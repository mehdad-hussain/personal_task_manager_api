import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
    imports: [TasksModule, CategoriesModule],
    controllers: [AppController],
    providers: [PrismaService, AppService],
})
export class AppModule {}
