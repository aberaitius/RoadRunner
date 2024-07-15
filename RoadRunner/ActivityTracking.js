import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const ActivityTracking = () => {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(null);
  const [trail, setTrail] = useState([]);

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

  useEffect(() => {
    const subscription = Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      },
      (newLocation) => {
        setLocation(newLocation);
        setTrail((currentTrail) => [
          ...currentTrail,
          {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
          },
        ]);
      }
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      {errorMsg ? <Text>{errorMsg}</Text> : null}
      {location ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          }}
        >
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          />
          <Polyline coordinates={trail} strokeWidth={5} strokeColor="red" />
        </MapView>
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
    alignItems: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default ActivityTracking;
