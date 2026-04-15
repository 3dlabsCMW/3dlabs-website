import { format, isToday, parseISO } from 'date-fns';

export const formatDate = (value: string, pattern = 'MMM d, yyyy') => format(parseISO(value), pattern);

export const isDateToday = (value: string) => isToday(parseISO(value));
