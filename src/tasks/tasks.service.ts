import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { filterColumn } from 'utils/filter-column';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
    constructor(private prisma: PrismaService) {}

    async create(createTaskDto: CreateTaskDto) {
        return this.prisma.task.create({
            data: {
                ...createTaskDto,
                isDeleted: false,
            },
        });
    }

    async findAll(params: {
        page?: number;
        per_page?: number;
        sort?: string;
        title?: string;
        status?: string;
        priority?: string;
        categoryId?: string;
        from?: string;
        to?: string;
        operator?: 'and' | 'or';
    }) {
        const {
            page = 1,
            per_page = 10,
            sort = 'dueDate.desc',
            title,
            status,
            priority,
            from,
            to,
            categoryId,
        } = params;
        console.log('🚀 ~ TasksService ~ categoryId:', categoryId);

        // Ensure that per_page is a number
        const limit = Number(per_page); // Convert to number
        const offset = (page - 1) * limit;

        // Determine sorting column and order
        const [sortColumn, sortOrder] = sort.split('.') as [keyof Prisma.TaskOrderByWithRelationInput, 'asc' | 'desc'];

        // Build the filter object
        const where: Prisma.TaskWhereInput = {
            isDeleted: false,
            ...(title ? filterColumn({ column: 'title', value: title }) : {}),
            ...(status ? filterColumn({ column: 'status', value: status, isSelectable: true }) : {}),
            ...(priority ? filterColumn({ column: 'priority', value: priority, isSelectable: true }) : {}),
            ...(categoryId
                ? filterColumn({ column: 'categoryId', value: Number(categoryId), isSelectable: true })
                : {}),
            ...(from || to
                ? {
                      createdAt: {
                          ...(from ? { gte: new Date(from) } : {}),
                          ...(to ? { lt: new Date(new Date(to).setDate(new Date(to).getDate() + 1)) } : {}),
                      },
                  }
                : {}),
        };

        // Execute the query with pagination, sorting, and filtering
        const data = await this.prisma.task.findMany({
            where,
            orderBy: { [sortColumn]: sortOrder },
            skip: offset,
            take: limit, // Use the converted number
            include: { Category: true },
        });

        // Get the total count
        const total = await this.prisma.task.count({ where });

        const pageCount = Math.ceil(total / limit); // Use the converted number

        return {
            data,
            meta: {
                page,
                pageCount,
                total,
            },
        };
    }

    async findOne(id: number) {
        const task = await this.prisma.task.findUnique({
            where: { id },
            include: { Category: true },
        });

        if (!task || task.isDeleted) {
            throw new NotFoundException(`Task with ID ${id} not found`);
        }

        return task;
    }

    async update(id: number, updateTaskDto: UpdateTaskDto) {
        const task = await this.findOne(id);

        if (task.isDeleted) {
            throw new BadRequestException(`Cannot update a deleted task.`);
        }

        return this.prisma.task.update({
            where: { id },
            data: updateTaskDto,
        });
    }

    async remove(id: number) {
        const task = await this.findOne(id);

        if (task.isDeleted) {
            throw new BadRequestException(`Task is already deleted.`);
        }

        // Soft delete by setting isDeleted to true
        return this.prisma.task.update({
            where: { id },
            data: { isDeleted: true },
        });
    }
}
