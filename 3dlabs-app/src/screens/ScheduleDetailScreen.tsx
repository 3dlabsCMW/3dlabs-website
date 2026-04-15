import React from 'react';
import { Alert, Text } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';

import { AppButton } from '../components/AppButton';
import { Card } from '../components/Card';
import { Screen } from '../components/Screen';
import { ScheduleItem } from '../types';
import { addScheduleItemToDeviceCalendar } from '../utils/calendar';

type ParamList = {
  ScheduleDetail: { item: ScheduleItem };
};

export const ScheduleDetailScreen = () => {
  const route = useRoute<RouteProp<ParamList, 'ScheduleDetail'>>();
  const { item } = route.params;

  const onAddToCalendar = async () => {
    try {
      await addScheduleItemToDeviceCalendar(item);
      Alert.alert('Added', 'Event added to your device calendar.');
    } catch (error) {
      Alert.alert('Unable to add', 'Please allow calendar access first.');
    }
  };

  return (
    <Screen>
      <Card title={item.title} subtitle={`${item.date} • ${item.startTime}${item.endTime ? ` - ${item.endTime}` : ''}`}>
        <Text>Status: {item.status}</Text>
        <Text>Category: {item.category}</Text>
        <Text>Location: {item.location || 'N/A'}</Text>
        <Text>Notes: {item.notes || 'N/A'}</Text>
      </Card>
      <AppButton label="Add to Phone Calendar" onPress={onAddToCalendar} />
    </Screen>
  );
};
