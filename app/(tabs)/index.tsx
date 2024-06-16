import React, { useEffect, useState } from 'react';
import { Text, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchDataFromAPI } from '../services/calendar.service';
import { ChallengeData, Calendar, Action } from '../models/ChallengeData';
import { ClockIcon } from 'react-native-heroicons/outline';
import { CheckCircleIcon } from 'react-native-heroicons/solid';
import { MapPinIcon } from 'react-native-heroicons/solid';
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (month: number) => MONTH_NAMES[month];

export default function CalendarComponent() {
  const [data, setData] = useState<ChallengeData | null>(null);

  useEffect(() => {
    fetchDataFromAPI()
      .then((challengeData) => {
        const sortedCalendar = challengeData.calendar
          .sort((a, b) => {
            if (a.year === b.year) {
              return a.month - b.month;
            }
            return a.year - b.year;
          })
          .map(calendarItem => ({
            ...calendarItem,
            month: calendarItem.month % 12,
            actions: calendarItem.actions.sort((actionA, actionB) => {
              const dateA = new Date(actionA.scheduledDate);
              const dateB = new Date(actionB.scheduledDate);
              return dateA.getDate() - dateB.getDate();
            })
          }));
        setData({ ...challengeData, calendar: sortedCalendar });
      })
      .catch((error) => {
        console.error('Error fetching data: ', error);
      });
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: '#00b47d' };
      case 'Scheduled':
        return { backgroundColor: '#006a4b' };
      case 'Unscheduled':
        return { backgroundColor: '#011638' };
      default:
        return {};
    }
  };

  const renderAction = ({ item }: { item: Action }) => {
    const scheduledDate = new Date(item.scheduledDate);
    const dayOfWeek = scheduledDate.toLocaleString('en-us', { weekday: 'short' }).toUpperCase();
    const dayOfMonth = scheduledDate.getDate();

    let icon = null;
    switch (item.status) {
      case 'Completed':
        icon = <CheckCircleIcon size={24} color="#00b47d" />;
        break;
      case 'Scheduled':
        icon = <ClockIcon size={24} color="#00b47d" />;
        break;
      case 'Unscheduled':
        icon = <Text style={{ fontWeight: 'bold', fontSize: 12, color: '#666666' }}>TBD</Text>;
        break;
      default:
        icon = null;
    }

    return (
      <View style={{ flexDirection: 'row', marginVertical: 2, borderRadius: 5 }}>
        <View style={{ width: '10%', marginRight: 10, alignItems: 'center' }}>
          {item.status !== 'Unscheduled' && (
            <>
              <Text style={{ fontWeight: 'bold', fontSize: 12, textAlign: 'center', color: '#666666' }}>{dayOfWeek}</Text>
              <Text style={{ fontWeight: 'bold', fontSize: 25, textAlign: 'center', marginTop: 5 }}>{dayOfMonth}</Text>
            </>
          )}

          <View style={{ marginTop: 5 }}>
            {icon}
          </View>
        </View>
        <View style={[getStatusStyle(item.status), { flex: 1, padding: 15, borderRadius: 5, }]}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#ffffff' }}>{item.name}</Text>
          {item.vendor ? (
            <>
              <Text style={{ color: '#ffffff' }}>{item.vendor.vendorName}</Text>
              <Text style={{ color: '#ffffff', marginBottom: 10, fontWeight: 'bold' }}>{item.vendor.phoneNumber}</Text>
              {item.vendor.streetAddress &&
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <MapPinIcon size={15} color="white" />
                  <Text style={{ color: '#ffffff', marginLeft: 2 }}>{item.vendor.streetAddress}</Text>
                </View>}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: '#ffffff' }}>{item.status}</Text>
                {item.status !== 'Completed' && <Text style={{ color: '#ffffff', marginLeft: 5 }}>{item.arrivalStartWindow} - {item.arrivalEndWindow}</Text>}
              </View>
            </>
          ) :
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
                <MapPinIcon size={15} color="white" />
                <Text style={{ color: '#ffffff', marginLeft: 5 }}>{data.customer.street}</Text>
              </View>
              <Text style={{ color: '#ffffff' }}>Schedule data & time TBD</Text>
            </>
          }
        </View>
      </View>
    );
  };

  const renderCalendarItem = ({ item }: { item: Calendar }) => (
    <View style={{ marginVertical: 10 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 18 }}>
        {`${getMonthName(item.month)} ${item.year}`}
      </Text>
      {item.actions.length > 0 ? (
        <FlatList
          style={{ marginTop: 15 }}
          data={item.actions}
          keyExtractor={(action) => action.id}
          renderItem={renderAction}
        />
      ) : (
        <View style={{ flexDirection: 'row', marginVertical: 5, borderRadius: 5, marginTop: 15 }}>
          <View style={{ width: '10%', marginRight: 10, alignItems: 'center' }}>
          </View>
          <View style={{ flex: 1, padding: 15, borderRadius: 5, backgroundColor: '#848fa5' }}>
            <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: 18, paddingVertical: 4 }}>No Maintenance Scheduled</Text>
          </View>
        </View>
      )}
    </View>
  );

  if (!data) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ alignItems: 'center', paddingTop: 30 }}>
        <Text style={{  fontSize: 18 }}>Calendar</Text>
      </View>
      <View style={{ height: 0.3, backgroundColor: 'grey', marginVertical: 10, }} />
      <FlatList
        style={{ flex: 1, paddingHorizontal: 15 }}
        data={data.calendar}
        keyExtractor={(item) => `${item.year}-${item.month}`}
        renderItem={renderCalendarItem}
      />
    </SafeAreaView>
  );
}