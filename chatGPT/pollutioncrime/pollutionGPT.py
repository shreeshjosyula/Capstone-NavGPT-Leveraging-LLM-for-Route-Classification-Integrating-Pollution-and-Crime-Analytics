import argparse
from langchain_openai import ChatOpenAI  
#from route import get_coordinates_from_args, get_shortest_path_points
from geolocation import guess_location_type
from pollution_data import get_pollution_data
from crime_data import get_cities_crime_data
from route1 import fetch_route_coordinates,get_coordinates_from_args
def evenly_spaced_points(route_points, num_points):
    if len(route_points) < num_points:
        raise ValueError("Number of points requested exceeds the number of available points in the route.")

    # Calculate interval
    interval = (len(route_points) - 1) / (num_points - 1)
    
    # Collect points
    selected_points = []
    for i in range(num_points):
        index = round(i * interval)
        # Ensure the index is within bounds
        index = min(index, len(route_points) - 1)
        selected_points.append(route_points[index])
    
    return selected_points
def pollutionGPT_prompt(intial_prompt,origin_lat,origin_lon,destination_lat,destination_lon,mod):
    # print("Hello vAsi")


    llm = ChatOpenAI(api_key = chatgpt_api_key, model="gpt-4o")

    origin, destination = get_coordinates_from_args(origin_lat,origin_lon,destination_lat,destination_lon)
    mode = mod
    num_points = 10  # Increase the number of points for more detailed route characterization

    #route_points = get_shortest_path_points(origin, destination)
    route_points = fetch_route_coordinates(origin, destination,mode)

    # print(route_points)
    points = evenly_spaced_points(route_points, num_points)
    # print(points)
    prompt = "for each part of the route classify based upon air quality values. "
    overall_pollution_data = []
    cities = []

    for point in points:
        # city = guess_location_type(point[1], point[0])
        # print("Point: ",point)
        # print("CITY: " ,city)
        # if city:
        #     cities.append(city)
            #traffic_data = get_traffic_data(point[0], point[1], "_dH7QbEIaV1lK7Zw4SqNE_IENYZYzXCi8nG5KMLXhKs")
            #prompt += f"This is the traffic density at {point} along the route: {traffic_data} incidents. "

        # openaq_api_key = "your key"
        pollution_data = get_pollution_data(point[1],point[0])
        overall_pollution_data.append(pollution_data)
        prompt += f"This is the aqi at {point} along the route: {pollution_data}. "

    prompt += intial_prompt
    response = llm.invoke(prompt).content
    return(response)
