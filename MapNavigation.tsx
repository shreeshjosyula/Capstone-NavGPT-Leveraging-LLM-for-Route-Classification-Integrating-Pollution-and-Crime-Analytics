import { graphhopper_api_key, mapbox_api_key } from '@env';
import Mapbox from '@rnmapbox/maps';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  Image,
  PermissionsAndroid,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { FloatingAction } from 'react-native-floating-action';
import ChatGPTComponent from './chatGPT/ChatGPTComponent.tsx';
import styles from './styles/styles.ts';

Mapbox.setAccessToken(mapbox_api_key);


const arrowIcon = require('./assets/navArrow.png');
const startIcon = require('./assets/start.png');
const endIcon = require('./assets/location.png');
const backButtonImage = require('./assets/back.png');
const profileIcon = require('./assets/profile.png');
const currentLocationIcon = require('./assets/current.png');
const chatIcon = require('./assets/chat.png');

interface MapNavigationProps {
  onProfilePress: () => void;
}

type Coordinate = [number, number];
interface PollutionDataType {
  coordinates: Coordinate[];
  color: string[];
  average_AQI: number[];
}
interface CrimeDataType {
  coordinates: Coordinate[];
  color: string[];
  crime_data: number[];
}


const MapNavigation: React.FC<MapNavigationProps> = ({ onProfilePress }) => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [startLocation, setStartLocation] = useState('');
  const [startLocationSuggestions, setStartLocationSuggestions] = useState<any[]>([]);
  const [endLocation, setEndLocation] = useState('');
  const [endLocationSuggestions, setEndLocationSuggestions] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [startCoordinates, setStartCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [endCoordinates, setEndCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [cameraInitialized, setCameraInitialized] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string } | null>(null);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [currentInstruction, setCurrentInstruction] = useState<string | null>(null);
  const [navigationStarted, setNavigationStarted] = useState(false);
  const [showStartInput, setShowStartInput] = useState(false);
  const [coloredSegments, setColoredSegments] = useState<any[]>([]);
  const [pollutionSegments, setPollutionSegments] = useState<any[]>([]);
  const [crimeSegments, setCrimeSegments] = useState<any[]>([]);
  const [showPollutionRoute, setShowPollutionRoute] = useState(false);
  const [showCrimeRoute, setShowCrimeRoute] = useState(false);
  const [directionState, setDirectionState] = useState(false);
  const [pollutionRouteInfo, setPollutionRouteInfo] = useState<{ distance: string; time: string } | null>(null);
  const [chatVisible, setChatVisible] = useState(false);
  const [segPollutionData, setPollutionSegData] = useState<PollutionDataType>();
  const [segCrimeData, setSegCrimeData] = useState<CrimeDataType>();

  const mapViewRef = useRef<Mapbox.MapView>(null);
  const cameraRef = useRef<Mapbox.Camera>(null);
  const startInputRef = useRef<TextInput>(null);
  const endInputRef = useRef<TextInput>(null);
  const isDarkMode = useColorScheme() === 'dark';
  const routeColors = ['#029be5', '#ffa500', '#00ff00', '#ff00ff', '#8a2be2'];

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (startLocation.length > 2 && startInputRef.current?.isFocused()) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${startLocation}.json?access_token=${mapbox_api_key}`,
          );
          const data = await response.json();
          setStartLocationSuggestions(data.features || []);
        } catch (error) {
          console.error('Error fetching start location suggestions:', error);
        }
      } else {
        setStartLocationSuggestions([]);
      }
    }, 300);
  
    return () => clearTimeout(delayDebounceFn);
  }, [startLocation]);
  
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (endLocation.length > 2 && endInputRef.current?.isFocused()) {
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${endLocation}.json?access_token=${mapbox_api_key}`,
          );
          const data = await response.json();
          setEndLocationSuggestions(data.features || []);
        } catch (error) {
          console.error('Error fetching end location suggestions:', error);
        }
      } else {
        setEndLocationSuggestions([]);
      }
    }, 300);
  
    return () => clearTimeout(delayDebounceFn);
  }, [endLocation]);

  const handleStartLocationSuggestionSelect = (suggestion: any) => {
    setShowStartInput(true);
    if (suggestion.geometry && suggestion.geometry.coordinates) {
      const [longitude, latitude] = suggestion.geometry.coordinates;
      const coordinates = { latitude, longitude };
      setStartLocation(suggestion.place_name);
      setStartCoordinates(coordinates);
      setStartLocationSuggestions([]);
      startInputRef.current?.blur();
    } else {
      console.warn('Invalid suggestion data:', suggestion);
    }
  };
  
  const handleEndLocationSuggestionSelect = (suggestion: any) => {
    if (suggestion.geometry && suggestion.geometry.coordinates) {
      const [longitude, latitude] = suggestion.geometry.coordinates;
      const coordinates = { latitude, longitude };
      setEndLocation(suggestion.place_name);
      setEndCoordinates(coordinates);
      setEndLocationSuggestions([]);
      setShowStartInput(false);  // Hide the input box after selecting
      endInputRef.current?.blur();
    } else {
      console.warn('Invalid suggestion data:', suggestion);
    }
  };

  const fetchRoute = async () => {
    try {
      if (!startCoordinates || !endCoordinates) {
        throw new Error('Invalid coordinates');
      }
      console.log(startCoordinates,endCoordinates);
      // for multiple route
      // const response = await fetch(
      //   `https://graphhopper.com/api/1/route?point=${startCoordinates.latitude},${startCoordinates.longitude}&point=${endCoordinates.latitude},${endCoordinates.longitude}&points_encoded=false&vehicle=car&locale=en&key=a3919316-b88c-40ad-9226-ef8b65dcee5c&algorithm=alternative_route`
      // );

      //for single routes
      const response = await fetch(
        `https://graphhopper.com/api/1/route?point=${startCoordinates.latitude},${startCoordinates.longitude}&point=${endCoordinates.latitude},${endCoordinates.longitude}&points_encoded=false&vehicle=car&locale=en&key=${graphhopper_api_key}`
      );

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();

      const routesData = data.paths.map((path: any) => {
        if (path.points.coordinates.length === 0) {
          console.warn(`Route ${path.id} has no coordinates.`);
          return null;
        }

        return {
          coordinates: path.points.coordinates,
          distance: path.distance / 1000,
          time: path.time / 60000,
          instructions: path.instructions.map((step: any) => step.text),
        };
      }).filter((route: any) => route !== null);

      const geojsonRoutes = routesData.map((route: any) => ({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route.coordinates,
          },
          properties: {},
        }],
      }));

      setRoutes(geojsonRoutes);

      // Set the primary route info and instructions
      const primaryRoute = routesData[0];
      const hours = Math.floor(primaryRoute.time / 60);
      const minutes = Math.round(primaryRoute.time % 60);
      const timeString = `${hours > 0 ? `${hours} hr ` : ''}${minutes} min`;
      setRouteInfo({ distance: primaryRoute.distance.toFixed(2), time: timeString });
      setInstructions(primaryRoute.instructions);
      setCurrentInstruction(primaryRoute.instructions[0]);

      if (mapViewRef.current && primaryRoute.coordinates.length > 1) {
        const coordinates = primaryRoute.coordinates;
        const bounds = coordinates.reduce(
          (acc, coord) => {
            acc.minLng = Math.min(acc.minLng, coord[0]);
            acc.maxLng = Math.max(acc.maxLng, coord[0]);
            acc.minLat = Math.min(acc.minLat, coord[1]);
            acc.maxLat = Math.max(acc.maxLat, coord[1]);
            return acc;
          },
          {
            minLng: coordinates[0][0],
            maxLng: coordinates[0][0],
            minLat: coordinates[0][1],
            maxLat: coordinates[0][1],
          }
        );

        const camera = {
          bounds: {
            ne: [bounds.maxLng + 0.1, bounds.maxLat + 0.1],
            sw: [bounds.minLng - 0.1, bounds.minLat - 0.1],
          },
          padding: { top: 20, left: 20, right: 20, bottom: 20 },
          animationDuration: 1000,
        };

        cameraRef.current?.fitBounds(camera.bounds.ne, camera.bounds.sw, camera.padding);
      }

      // Fetch segment routes
      // await fetchSegmentRoutesTemp(startCoordinates, endCoordinates, primaryRoute.coordinates);
      await fetchSegmentPollutionRoutes(startCoordinates, endCoordinates, primaryRoute.coordinates);

    } catch (error) {
      console.error('Error fetching route from graphhopper:', error);
    }
  };

  const fetchSegmentPollutionRoutes = async (startCoord, endCoord, routeCoordinates) => {
    const url = `https://pollutioncrime.onrender.com/api?origin_lat=${startCoord.latitude}&origin_lon=${startCoord.longitude}&destination_lat=${endCoord.latitude}&destination_lon=${endCoord.longitude}&mode=car&route_mode=pollutionroute`;
    try {
      const response = await fetch(url);
      const data_api = await response.json();
  
      // Update segData with the fetched data
      setPollutionSegData(data_api);
      console.log(data_api);
      // Create pollution segments from the fetched data
      let segments = [];
      for (let i = 0; i < data_api.coordinates.length - 1 && i < 9; i++) {
        let start = data_api.coordinates[i];
        let end = data_api.coordinates[i + 1];
        const color = data_api.color[i];
  
        // Find all coordinates in the actual route between the start and end coordinates
        const startIndex = routeCoordinates.findIndex(
          (coord) => coord[0] === start[0] && coord[1] === start[1]
        );
        const endIndex = routeCoordinates.findIndex(
          (coord) => coord[0] === end[0] && coord[1] === end[1]
        );
  
        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
          const segmentCoordinates = routeCoordinates.slice(startIndex, endIndex + 1);
          segments.push({
            coordinates: segmentCoordinates,
            color: color,
          });
        }
      }
      console.log(segments);
      setPollutionSegments(segments);
      console.log('fetched the pollution route');
    } catch (error) {
      console.error('Error fetching pollution route data:', error);
    }
    console.log('running crime route');
    await fetchSegmentCrimeRoutes(startCoordinates, endCoordinates, routeCoordinates);

    // setTimeout(() => {
    //   fetchSegmentCrimeRoutes(startCoordinates, endCoordinates, routeCoordinates);
    // }, 30000);
  }

  const fetchSegmentCrimeRoutes = async (startCoord, endCoord, routeCoordinates) => {
    const url = `https://pollutioncrime.onrender.com/api?origin_lat=${startCoord.latitude}&origin_lon=${startCoord.longitude}&destination_lat=${endCoord.latitude}&destination_lon=${endCoord.longitude}&mode=car&route_mode=crimeroute`;    
    try {
      const response = await fetch(url);
      const data_api = await response.json();
  
      // Update segData with the fetched data
      setSegCrimeData(data_api);
      console.log(data_api);
  
      // Create pollution segments from the fetched data
      let segments = [];
      for (let i = 0; i < data_api.coordinates.length - 1 && i < 9; i++) {
        let start = data_api.coordinates[i];
        let end = data_api.coordinates[i + 1];
        const color = data_api.color[i];
  
        // Find all coordinates in the actual route between the start and end coordinates
        const startIndex = routeCoordinates.findIndex(
          (coord) => coord[0] === start[0] && coord[1] === start[1]
          
        );
        const endIndex = routeCoordinates.findIndex(
          (coord) => coord[0] === end[0] && coord[1] === end[1]
        );

        if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
          const segmentCoordinates = routeCoordinates.slice(startIndex, endIndex + 1);
          segments.push({
            coordinates: segmentCoordinates,
            color: color,
          });
        }
      }
      console.log(segments);
      setCrimeSegments(segments);
      console.log('fetched the crime route');
    } catch (error) {
      console.error('Error fetching crime route data:', error);
    }
  }

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission',
          message: 'This app needs access to your location to show your current position on the map.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        Mapbox.locationManager.start();
        Mapbox.locationManager.addListener(handleLocationUpdate);
      } else {
        Alert.alert('Location permission denied.');
        setIsLoading(false);
      }
    } catch (err) {
      console.warn(err);
      setIsLoading(false);
    }
  };

  const handleLocationUpdate = (location: any) => {
    setLocation(location.coords);
    setIsLoading(false);
  };

  useEffect(() => {
    requestLocationPermission();

    return () => {
      Mapbox.locationManager.removeListener(handleLocationUpdate);
      Mapbox.locationManager.stop();
    };
  }, []);

  useEffect(() => {
    if (location && !startCoordinates) {
      setStartCoordinates({ latitude: location.latitude, longitude: location.longitude });
    }
  }, [location]);

  const calculateBearing = (start: { latitude: number, longitude: number }, end: { latitude: number, longitude: number }) => {
    const startLat = start.latitude * (Math.PI / 180);
    const startLng = start.longitude * (Math.PI / 180);
    const endLat = end.latitude * (Math.PI / 180);
    const endLng = end.longitude * (Math.PI / 180);

    const dLng = endLng - startLng;

    const x = Math.sin(dLng) * Math.cos(endLat);
    const y = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);

    const bearing = Math.atan2(x, y) * (180 / Math.PI);

    return (bearing + 360) % 360;
  };

  const useCurrentLocationAsStart = () => { 
    if (location) {
      setStartCoordinates({
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setStartLocation('Current Location');
      setStartLocationSuggestions([]);
    } else {
      alert('Current location is not available');
    }
  };

  const startNavigation = () => {
    if (!endCoordinates) {
      console.error('Invalid end coordinates for navigation');
      return;
    }

    if (!routes[0] || !routes[0].features || routes[0].features.length === 0) {
      console.error('Route data is not available');
      return;
    }

    setNavigationStarted(true);

    // Set the initial camera view for navigation
    if (cameraRef.current) {
      const nextPoint = routes[0].features[0].geometry.coordinates[1];
      const bearing = calculateBearing(startCoordinates!, {
        latitude: nextPoint[1],
        longitude: nextPoint[0]
      });

      cameraRef.current.setCamera({
        centerCoordinate: [startCoordinates!.longitude, startCoordinates!.latitude],
        zoomLevel: 15,  // Zoom level for a closer view
        pitch: 60,  // Tilt the map to 60 degrees
        heading: bearing,
        animationDuration: 1000,  // Smooth animation
      });
    }
  };

  const stopNavigation = () => {
    setNavigationStarted(false);
    setRoutes([]);
    setInstructions([]);
    setPollutionSegments([]);
    setCrimeSegments([]);
    setDirectionState(false);
    setCurrentInstruction(null);
    setRouteInfo(null);
    setShowStartInput(false);
    setStartLocation('');
    setEndLocation('');
    setStartCoordinates(location ? { latitude: location.latitude, longitude: location.longitude } : null);
    setEndCoordinates(null);

    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: location ? [location.longitude, location.latitude] : [0, 0],
        zoomLevel: 15,  // Zoom level for a closer view
        pitch: 0,  // Reset pitch to 0
        heading: 0,
        animationDuration: 1000,  // Smooth animation
      });
    }
  };

  const calculateDistance = (coords1: { latitude: number, longitude: number }, coords2: { latitude: number, longitude: number }) => {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const lat1 = coords1.latitude;
    const lon1 = coords1.longitude;
    const lat2 = coords2.latitude;
    const lon2 = coords2.longitude;

    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;

    return d;
  };

  const generateDottedLine = () => {
    if (!startCoordinates || !routes[0]) return null;

    const coordinates = [
      [startCoordinates.longitude, startCoordinates.latitude],
      [routes[0].features[0].geometry.coordinates[0][0], routes[0].features[0].geometry.coordinates[0][1]]
    ];

    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        },
        properties: {}
      }]
    };
  };

  const dottedLine = generateDottedLine();


  return (
    <View style={styles(isDarkMode).container}>
      <TouchableOpacity style={styles(isDarkMode).profileButton} onPress={onProfilePress}>
        <Image source={profileIcon} style={styles(isDarkMode).profileImage} />
      </TouchableOpacity>
      <View style={styles(isDarkMode).container}>
        {showStartInput && (
          <TouchableOpacity style={styles(isDarkMode).backButton} onPress={stopNavigation}>
            <Image source={backButtonImage} style={{ width: 30, height: 30 }} />
          </TouchableOpacity>
        )}
        <Mapbox.MapView
          ref={mapViewRef}
          style={styles(isDarkMode).map}
          zoomEnabled
          styleURL={
            navigationStarted
              ? isDarkMode
                ? "mapbox://styles/mapbox/navigation-night-v1"
                : "mapbox://styles/mapbox/navigation-day-v1"
              : isDarkMode
                ? "mapbox://styles/mapbox/dark-v10"
                : "mapbox://styles/mapbox/streets-v11"
          }
          rotateEnabled
        >
          {isLoading ? (
            <View style={styles(isDarkMode).spinnerContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <>{directionState ? (
              <Mapbox.Camera
              ref={cameraRef}
              zoomLevel={directionState ? 11 : 15}
            />
            ):(
              <Mapbox.Camera
              ref={cameraRef}
              zoomLevel={directionState ? 11 : 15}
              centerCoordinate={location ? [location.longitude, location.latitude] : [0,0]}
            />
            )
            }
              {navigationStarted ? (
                <Mapbox.PointAnnotation
                  id="currentLocation"
                  coordinate={location ? [location.longitude, location.latitude] : [0, 0]}
                >
                  <View style={{ width: 50, height: 50, transform: [{ rotate: `${location?.heading || 0}deg` }] }}>
                    <Image
                      source={arrowIcon}
                      style={{ width: 30, height: 30 }}
                      resizeMode="contain"
                    />
                  </View>
                </Mapbox.PointAnnotation>
              ) : (
                <Mapbox.UserLocation
                  renderMode="normal"
                  showsUserHeadingIndicator={true}
                />
              )}
              {dottedLine && !navigationStarted && (
                <Mapbox.ShapeSource id="dotted-line" shape={dottedLine}>
                  <Mapbox.LineLayer
                    id="dotted-line-layer"
                    style={{
                      lineColor: 'grey', // Dotted line color
                      lineWidth: 2, // Dotted line width
                      lineDasharray: [2, 4], // Dotted line pattern
                    }}
                  />
                </Mapbox.ShapeSource>
              )}
              {showPollutionRoute && !showCrimeRoute && (
                pollutionSegments.map((segment, index) => (
                  <Mapbox.ShapeSource key={`pollution-segment-${index}`} id={`pollution-segment-${index}`} shape={{
                    type: 'FeatureCollection',
                    features: [{
                      type: 'Feature',
                      geometry: {
                        type: 'LineString',
                        coordinates: segment.coordinates,
                      },
                      properties: {},
                    }],
                  }}>
                    <Mapbox.LineLayer
                      id={`pollution-segment-line-${index}`}
                      style={{
                        lineColor: segment.color,
                        lineWidth: 6,
                      }}
                    />
                  </Mapbox.ShapeSource>
                ))
              )} 
              {!showPollutionRoute && showCrimeRoute && (
                crimeSegments.map((segment, index) => (
                  <Mapbox.ShapeSource key={`crime-segment-${index}`} id={`crime-segment-${index}`} shape={{
                    type: 'FeatureCollection',
                    features: [{
                      type: 'Feature',
                      geometry: {
                        type: 'LineString',
                        coordinates: segment.coordinates,
                      },
                      properties: {},
                    }],
                  }}>
                    <Mapbox.LineLayer
                      id={`crime-segment-line-${index}`}
                      style={{
                        lineColor: segment.color,
                        lineWidth: 6,
                      }}
                    />
                  </Mapbox.ShapeSource>
                ))
              )}
              {!showPollutionRoute && !showCrimeRoute &&
                routes.map((route, index) => (
                  <Mapbox.ShapeSource key={`route-${index}`} id={`route-${index}`} shape={route}>
                    <Mapbox.LineLayer
                      id={`route-line-${index}`}
                      style={{
                        lineColor: routeColors[index % routeColors.length],
                        lineWidth: 6,
                      }}
                    />
                  </Mapbox.ShapeSource>))
              }
              {startCoordinates && !navigationStarted && (
                <Mapbox.PointAnnotation
                  id="start-point"
                  coordinate={[startCoordinates.longitude, startCoordinates.latitude]}
                >
                  <Image
                    source={startIcon}
                    style={{ width: 20, height: 20 }}
                    resizeMode="contain"
                  />
                </Mapbox.PointAnnotation>
              )}
              {endCoordinates && (
                <Mapbox.PointAnnotation
                  id="end-point"
                  coordinate={[endCoordinates.longitude, endCoordinates.latitude]}
                >
                  <Image
                    source={endIcon}
                    style={{ width: 35, height: 35 }}
                    resizeMode="contain"
                  />
                </Mapbox.PointAnnotation>
              )}
              {routeInfo && (
                <Mapbox.PointAnnotation
                  id="route-tag"
                  coordinate={routes[0].features[0].geometry.coordinates[Math.floor(routes[0].features[0].geometry.coordinates.length / 2)]}
                >
                  <View style={styles(isDarkMode).tagContainer}>
                    <Text style={styles(isDarkMode).tagText}>{routeInfo.time}</Text>
                  </View>
                </Mapbox.PointAnnotation>
              )}
            </>
          )}
        </Mapbox.MapView>
        {!navigationStarted && (
          <View style={styles(isDarkMode).inputContainer}>
             <View style={styles(isDarkMode).inputRow}>
  <TextInput
    ref={startInputRef}
    style={styles(isDarkMode).input}
    placeholder="Start Location"
    placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
    value={startLocation}
    onChangeText={text => {
      setStartLocation(text);
      setStartLocationSuggestions([]); // Clear suggestions if typing again
    }}
  />

  <TouchableOpacity onPress={useCurrentLocationAsStart}>
    <Image
      source={currentLocationIcon}
      style={{ width: 30, height: 30, marginLeft: 8 }}
      resizeMode="contain"
    />
  </TouchableOpacity>
  
</View>
{startLocationSuggestions.length > 0 && (
  <View style={[styles(isDarkMode).suggestionsContainer, { width: '100%' }]}>
    <FlatList
      data={startLocationSuggestions}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles(isDarkMode).suggestion}
          onPress={() => handleStartLocationSuggestionSelect(item)}
        >
          <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{item.place_name}</Text>
        </TouchableOpacity>
      )}
    />
  </View>
)}
<TextInput
  ref={endInputRef}
  style={styles(isDarkMode).input}
  placeholder="End Location"
  placeholderTextColor={isDarkMode ? '#cccccc' : '#999999'}
  value={endLocation}
  onChangeText={text => {
    setEndLocation(text);
    setEndLocationSuggestions([]); // Clear suggestions if typing again
    setShowStartInput(true); // Show input box while typing
  }}
/>
{showStartInput && endLocationSuggestions.length > 0 && (
  <View style={[styles(isDarkMode).suggestionsContainer, { width: '100%' }]}>
    <FlatList
      data={endLocationSuggestions}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles(isDarkMode).suggestion}
          onPress={() => handleEndLocationSuggestionSelect(item)}
        >
          <Text style={{ color: isDarkMode ? '#ffffff' : '#000000' }}>{item.place_name}</Text>
              </TouchableOpacity>
              )}
              />
              </View>
              )}
            
              <View style={styles(isDarkMode).buttonContainer}>
                <Button title="Direction" onPress={() => {
                  fetchRoute();
                  setShowStartInput(true);
                  setDirectionState(true);
                }} />
              </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', marginRight: 10 }}>Show Pollution detected Route</Text>
              <Switch
                value={showPollutionRoute}
                onValueChange={(value) => {
                  setShowPollutionRoute(value);
                  if(value){setShowCrimeRoute(!value)};}
                  }
              />
            </View>
            
            
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
              <Text style={{ color: isDarkMode ? '#ffffff' : '#000000', marginRight: 10 }}>Show Crime detected Route     </Text>
              <Switch
                value={showCrimeRoute}
                onValueChange={(value) => {
                  setShowCrimeRoute(value);
                  if(value){setShowPollutionRoute(!value)};}
                  }
              />
            </View>
          </View>
        )}

{routeInfo && (
  <View style={styles(isDarkMode).routeInfo}>
    <Text style={styles(isDarkMode).routeText}>
      Time: {routeInfo?.time}
    </Text>
    <Text style={styles(isDarkMode).routeText}>
      Distance: {routeInfo?.distance} km
    </Text>
    {!navigationStarted ? (
      <TouchableOpacity style={[styles(isDarkMode).currentLocationButton, { backgroundColor: 'green' }]} onPress={startNavigation}>
        <Text style={styles(isDarkMode).currentLocationButtonText}>Start</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={[styles(isDarkMode).currentLocationButton, { backgroundColor: 'red' }]}
        onPress={stopNavigation}
      >
        <Text style={styles(isDarkMode).currentLocationButtonText}>Stop</Text>
      </TouchableOpacity>
    )}
  </View>
)}

        {navigationStarted && currentInstruction && (
          <View style={styles(isDarkMode).instructionContainer}>
            <Text style={styles(isDarkMode).instructionText}>{currentInstruction}</Text>
          </View>
        )}
      </View>
      <FloatingAction
        actions={[{
          text: "Chat",
          icon: chatIcon,
          name: "bt_chat",
          position: 1
        }]}
        overrideWithAction
        onPressItem={() => setChatVisible(true)}
        floatingIcon={chatIcon}
        color={isDarkMode ? '#333' : '#fff'}
      />
      {chatVisible && (
        <View style={styles(isDarkMode).chatContainer}>
          <ChatGPTComponent location={location} />
          <TouchableOpacity onPress={() => setChatVisible(false)} style={styles(isDarkMode).closeButton}>
            <Text style={styles(isDarkMode).closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MapNavigation;
