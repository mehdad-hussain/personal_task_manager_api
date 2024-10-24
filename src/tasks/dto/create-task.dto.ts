export class CreateTaskDto {
    title: string;
    description?: string;
    dueDate: Date;
    priority: 'low' | 'medium' | 'high';
    status?: 'pending' | 'completed';
    categoryId: number;
    isDeleted: boolean;
}
