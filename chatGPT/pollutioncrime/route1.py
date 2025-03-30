import requests
def fetch_route_coordinates(origin, destination, mode):
    url = "https://graphhopper.com/api/1/route"
    params = {
        'point': [origin, destination],
        'points_encoded': 'false',
        'vehicle': mode,
        'locale': 'en',
        'key': 'a3919316-b88c-40ad-9226-ef8b65dcee5c'
    }
    
    response = requests.get(url, params=params)
    
    if response.status_code == 200:
        data = response.json()
        coordinates = data['paths'][0]['points']['coordinates']
        # print(coordinates)
        return coordinates
    else:
        print(f"Error: Unable to fetch data. HTTP Status code: {response.status_code}")
        return None
def get_coordinates_from_args(origin_lat,origin_lon,destination_lat,destination_lon):
    # print("Hi boro")
    origin = f"{origin_lat},{origin_lon}"
    destination = f"{destination_lat},{destination_lon}"
    return origin, destination