import { differenceInDays, differenceInHours, format, subDays } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const hours = differenceInHours(now, date);
  
  if (hours < 1) return 'À l\'instant';
  if (hours < 24) return `Il y a ${hours}h`;
  
  const days = differenceInDays(now, date);
  if (days < 7) return `Il y a ${days}j`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
  
  return format(date, 'dd/MM/yyyy', { locale: fr });
};

export const formatDate = (date: Date, formatStr: string = 'dd/MM/yyyy'): string => {
  return format(date, formatStr, { locale: fr });
};

export const getAgeInHours = (date: Date): number => {
  return differenceInHours(new Date(), date);
};

export const isFreshEnough = (date: Date, maxHours: number = 24): boolean => {
  return getAgeInHours(date) <= maxHours;
};

export const getLastNDays = (days: number): Date[] => {
  const dates: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dates.push(subDays(new Date(), i));
  }
  return dates;
};

export const isBusinessDay = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6; // Pas dimanche ni samedi
};

export const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}; 