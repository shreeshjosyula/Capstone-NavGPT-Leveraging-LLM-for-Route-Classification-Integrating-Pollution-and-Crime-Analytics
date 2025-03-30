import requests
import platform
from geopy.geocoders import Nominatim

def guess_location_type(latitude, longitude):
    geolocator = Nominatim(user_agent="geo_guesser")
    try:
        location = geolocator.reverse((latitude, longitude), exactly_one=True)
        if location:
            address = location.raw.get('address', {})
            # Check for different possible fields that might contain the city name
            city = address.get('city') or address.get('town') or address.get('village') or address.get('municipality') or 'N/A'
            return city
        else:
            print(f"No location found for lat: {latitude}, lon: {longitude}")
            return None
    except Exception as e:
        print(f"Error in reverse geocoding: {e}")
        return None



# These functions are not being used. Can be used in the future
def get_location():
    latitude, longitude = None, None
    os_name = platform.system()
    if os_name == "Darwin":
        print("Running on MacOS")
        location_data = get_ip_location()
        latitude, longitude = location_data['latitude'], location_data['longitude']
    elif os_name == "Windows":
        print("Running on Windows")
        location_data = get_ip_location()
        latitude, longitude = location_data['latitude'], location_data['longitude']
    elif os_name == "Linux":
        print("Running on Linux")
        location_data = get_ip_location()
        latitude, longitude = location_data['latitude'], location_data['longitude']
    else:
        print("Unable to identify operating System")
        location_data = get_ip_location()
        latitude, longitude = location_data['latitude'], location_data['longitude']
    
    return latitude, longitude

def get_ip_location():
    url = 'https://freegeoip.app/json/'

    response = requests.get(url)
    data = response.json()

    if response.status_code == 200:
        return data
    else:
        return None