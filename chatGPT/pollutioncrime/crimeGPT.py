import argparse
from langchain_openai import ChatOpenAI  
from route1 import get_coordinates_from_args, fetch_route_coordinates
from geolocation import guess_location_type
from pollution_data import get_pollution_data
from crime_data import get_cities_crime_data
from pollutionGPT import evenly_spaced_points

def crimeGPT_prompt(intial_prompt,origin_lat,origin_lon,destination_lat,destination_lon,mod):


    llm = ChatOpenAI(api_key = chatgpt_api_key, model="gpt-4o")

    origin, destination = get_coordinates_from_args(origin_lat,origin_lon,destination_lat,destination_lon)
    mode = mod
    num_points = 10  # Increase the number of points for more detailed route characterization
    
    
    route_points = fetch_route_coordinates(origin, destination,mode)
    prompt = "Do the calculations but don't show it in response and for each part of the route classify based upon average crime quality values. "
    cities = []
    points = evenly_spaced_points(route_points, num_points)
    for point in points:
        city = guess_location_type(point[1], point[0])
        if city:
            cities.append(city)

    crime_cities_data = get_cities_crime_data(cities)
    prompt += crime_cities_data
    prompt += str(points)
    prompt += 'use the route point provided, for each city give one start coordinate from this which is closest'
    # print(crime_cities_data)    
    # print(prompt)
    print(points)
            
    prompt += intial_prompt
    response = llm.invoke(prompt).content
    # print(response)
    return(response)

