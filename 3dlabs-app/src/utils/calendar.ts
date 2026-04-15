import * as Calendar from 'expo-calendar';

import { ScheduleItem } from '../types';

export const addScheduleItemToDeviceCalendar = async (item: ScheduleItem) => {
  const { status } = await Calendar.requestCalendarPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Calendar permission denied');
  }

  const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
  const preferredCalendar = calendars.find((c) => c.allowsModifications) ?? calendars[0];
  if (!preferredCalendar) {
    throw new Error('No editable calendar found');
  }

  const startDate = new Date(`${item.date}T${item.startTime}`);
  const endDate = item.endTime ? new Date(`${item.date}T${item.endTime}`) : new Date(startDate.getTime() + 60 * 60 * 1000);

  await Calendar.createEventAsync(preferredCalendar.id, {
    title: item.title,
    startDate,
    endDate,
    location: item.location,
    notes: item.notes
  });
};
