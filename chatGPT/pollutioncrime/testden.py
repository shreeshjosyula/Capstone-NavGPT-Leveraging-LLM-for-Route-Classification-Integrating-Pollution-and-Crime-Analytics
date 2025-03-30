from locationgpt import locationGPT_prompt
from pollutionGPT import pollutionGPT_prompt
from crimeGPT import crimeGPT_prompt
from langchain_openai import ChatOpenAI  
import json
import argparse

def main(origin_lat, origin_lon, destination_lat, destination_lon, mode):

    llm = ChatOpenAI(api_key =chatgpt_api_key, model="gpt-4o")

    pollution_question = "What is the average air quality index on each part of the route? State point of each part. Classify it in a structured way and if you say moderate, say orange afterwards; for healthy, it should say green; for unhealthy, it should say red. Even if AQI values are different, give different colors even if all lie in green range.The best part should be classified as green and worst part as red."
    crime_question = "What is the crime data on each part of the route? State point of each part. Classify it in a structured way. The best part should be classified as green and worst part as red."
    convert_question = "Convert this into a single json string without any text in the format [coordinate: [location1_lat, location1_lon],........,[locationend_lat, locationend_lon],color:[1,2,3,4],average_AQI:[1,2,3,4]. Do the format exaclty like the exmaple. Remove json from the top of the string. Here is an example " + formated_json_example 

    crimeGPT_response = crimeGPT_prompt(crime_question,origin_lat,origin_lon,destination_lat,destination_lon, mode)
    print(crimeGPT_response)
    print("-"*50)
    response = llm.invoke(crimeGPT_response + "\n\n" + convert_question).content
    print(response)





if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--origin_lat', type=float, required=True)
    parser.add_argument('--origin_lon', type=float, required=True)
    parser.add_argument('--destination_lat', type=float, required=True)
    parser.add_argument('--destination_lon', type=float, required=True)
    parser.add_argument('--mode', type=str, default='car')

    args = parser.parse_args()
    main(args.origin_lat, args.origin_lon, args.destination_lat, args.destination_lon, args.mode)
