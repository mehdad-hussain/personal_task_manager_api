interface FilterColumnConfig<ModelWhereInput> {
    column: keyof ModelWhereInput; // Key of the where input type for the specific model
    value: string | number;
    isSelectable?: boolean;
}

export function filterColumn<ModelWhereInput>({ column, value, isSelectable }: FilterColumnConfig<ModelWhereInput>) {
    if (typeof value === 'number') {
        return { [column]: value };
    }
    const [filterValue, filterOperator] = (value?.split('~').filter(Boolean) ?? []) as [string, string | undefined];

    if (!filterValue) return {};

    if (isSelectable) {
        switch (filterOperator) {
            case 'eq':
                return { [column]: { in: filterValue.split('.').filter(Boolean) } };
            case 'notEq':
                return { [column]: { notIn: filterValue.split('.').filter(Boolean) } };
            case 'isNull':
                return { [column]: null };
            case 'isNotNull':
                return { [column]: { not: null } };
            default:
                return { [column]: { in: filterValue.split('.').filter(Boolean) } };
        }
    }

    switch (filterOperator) {
        case 'ilike':
            return { [column]: { contains: filterValue, mode: 'insensitive' } };
        case 'notIlike':
            return { [column]: { not: { contains: filterValue, mode: 'insensitive' } } };
        case 'startsWith':
            return { [column]: { startsWith: filterValue, mode: 'insensitive' } };
        case 'endsWith':
            return { [column]: { endsWith: filterValue, mode: 'insensitive' } };
        case 'eq':
            return { [column]: filterValue };
        case 'notEq':
            return { [column]: { not: filterValue } };
        case 'isNull':
            return { [column]: null };
        case 'isNotNull':
            return { [column]: { not: null } };
        default:
            return { [column]: { contains: filterValue, mode: 'insensitive' } };
    }
}
