import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

const ActivityTracking = () => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  const startTracking = async () => {
    let { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access background location was denied');
      return;
    }
    await Location.startLocationUpdatesAsync('location-task', {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 10,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: 'Tracking your location',
        notificationBody: 'Your location is being tracked in the background',
      },
    });
    setStartTime(new Date());
    setTracking(true);
  };

  const stopTracking = async () => {
    await Location.stopLocationUpdatesAsync('location-task');
    const endTime = new Date();
    const timeDiff = (endTime - startTime) / 1000; // time difference in seconds
    setElapsedTime(timeDiff);
    setTracking(false);
  };

  return (
    <View style={styles.container}>
      {errorMsg ? <Text>{errorMsg}</Text> : null}
      {location ? (
        <Text>Latitude: {location.coords.latitude}, Longitude: {location.coords.longitude}</Text>
      ) : (
        <Text>Fetching location...</Text>
      )}
      <Button title={tracking ? "Stop Tracking" : "Start Tracking"} onPress={tracking ? stopTracking : startTracking} />
      {elapsedTime !== null && (
        <Text>Elapsed Time: {Math.floor(elapsedTime / 60)} minutes and {Math.floor(elapsedTime % 60)} seconds</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
});

export default ActivityTracking;
