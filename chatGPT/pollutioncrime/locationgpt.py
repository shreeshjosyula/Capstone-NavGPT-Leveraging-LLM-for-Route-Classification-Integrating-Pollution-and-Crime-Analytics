import argparse
from langchain_openai import ChatOpenAI  
from geolocation import guess_location_type
from pollution_data import get_pollution_data
from crime_data import get_cities_crime_data
from route1 import fetch_route_coordinates,get_coordinates_from_args
from pollutionGPT import evenly_spaced_points

def locationGPT_prompt(intial_prompt,origin_lat,origin_lon,destination_lat,destination_lon,mod):
    parser = argparse.ArgumentParser(description='Process coordinates for origin and destination.')
    parser.add_argument('--origin_lat', type=float, required=True, help='Latitude of the origin')
    parser.add_argument('--origin_lon', type=float, required=True, help='Longitude of the origin')
    parser.add_argument('--destination_lat', type=float, required=True, help='Latitude of the destination')
    parser.add_argument('--destination_lon', type=float, required=True, help='Longitude of the destination')
    parser.add_argument('--mode', type=str, required=True, help='Mode of transport')
    args = parser.parse_args()

    llm = ChatOpenAI(api_key =chatgpt_api_key, model="gpt-4o")

    origin, destination = get_coordinates_from_args(origin_lat,origin_lon,destination_lat,destination_lon)
    
    mode = mod
    num_points = 10  # Increase the number of points for more detailed route characterization

    #route_points = get_shortest_path_points(origin, destination)
    route_points = fetch_route_coordinates(origin, destination,mode)
    prompt = "Do the calculations but don't show it in response and for each part of the route classify based upon average air quality values. "
    overall_pollution_data = []
    cities = []
    points = evenly_spaced_points(route_points, num_points)

    for point in points:
        city = guess_location_type(point[1], point[0])
        # print("Point: ",point)
        # print("CITY: " ,city)
        if city:
            cities.append(city)
            #traffic_data = get_traffic_data(point[0], point[1], "_dH7QbEIaV1lK7Zw4SqNE_IENYZYzXCi8nG5KMLXhKs")
            #prompt += f"This is the traffic density at {point} along the route: {traffic_data} incidents. "

            openaq_api_key = pollution_key
            pollution_data = get_pollution_data(city, openaq_api_key)
            overall_pollution_data.append(pollution_data)
            prompt += f"This is the pollution data at {point} along the route: {pollution_data}. "

    crime_cities_data = get_cities_crime_data(cities)
    prompt += crime_cities_data
    # print(crime_cities_data)    
            
    prompt += intial_prompt
    response = llm.invoke(prompt).content
    return(response)

