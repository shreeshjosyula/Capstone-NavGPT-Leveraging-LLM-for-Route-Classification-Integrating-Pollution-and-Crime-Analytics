from flask import Flask, request, jsonify
from locationgpt import locationGPT_prompt
from pollutionGPT import pollutionGPT_prompt
from crimeGPT import crimeGPT_prompt
from langchain_openai import ChatOpenAI  
import json
import argparse

app = Flask(__name__)

@app.route('/api', methods=['GET'])
def handle_api():
    origin_lat = request.args.get('origin_lat', type=float)
    origin_lon = request.args.get('origin_lon', type=float)
    destination_lat = request.args.get('destination_lat', type=float)
    destination_lon = request.args.get('destination_lon', type=float)
    mode = request.args.get('mode', default='car', type=str)
    route_mode = request.args.get('route_mode', type=str)

    if not all([origin_lat, origin_lon, destination_lat, destination_lon, route_mode]):
        return jsonify({"error": "Missing required parameters"}), 400

    return main(origin_lat, origin_lon, destination_lat, destination_lon, mode, route_mode)


def main(origin_lat, origin_lon, destination_lat, destination_lon, mode, route_mode):

    formated_json_example = '''{
  "coordinates": [
    [42.9690239, -81.2587204],
    [43.00652350965132, -81.1693993875431],
    [43.03836173779748, -81.06265706241301],
    [43.071442716535834, -80.95650911366758],
    [43.103818525204645, -80.85013342836608],
    [43.147000557496334, -80.76308453368692],
    [43.20747975449501, -80.70815256723502],
    [43.286564997666346, -80.73453784444001],
    [43.359574525548275, -80.71643324302327],
    [45.49453, -73.757431]
  ],
  "color": [
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "green"
  ],
  "average_AQI": [
    53,
    65,
    60,
    59,
    58,
    57,
    55,
    56,
    54,
    50
  ]
}
'''
    formated_json_example_1 = '''{
  "coordinates": [
    [42.9690239, -81.2587204],
    [43.00652350965132, -81.1693993875431],
    [43.03836173779748, -81.06265706241301],
    [43.071442716535834, -80.95650911366758],
    [43.103818525204645, -80.85013342836608],
    [43.147000557496334, -80.76308453368692],
    [43.20747975449501, -80.70815256723502],
    [43.286564997666346, -80.73453784444001],
    [43.359574525548275, -80.71643324302327],
    [45.49453, -73.757431]
  ],
  "color": [
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "orange",
    "green"
  ],
  "crime_data": [
    53,
    65,
    60,
    59,
    58,
    57,
    55,
    56,
    54,
    50
  ]
}
'''
    llm = ChatOpenAI(api_key= chatgpt_api_key, model="gpt-4o")
    
    pollution_question = "What is the average air quality index on each part of the route? State point of each part. Classify it in a structured way and if you say moderate, say orange afterwards; for healthy, it should say green; for unhealthy, it should say red. Perform calculations and give me the answer. The best part should be classified as green and worst part as red."
    crime_question = "What is the crime data on each part of the route? State point of each part. Classify it in a structured way. The crime severity index of 0-50 should be classified as green, 50-75 should be orange and 75 should be red."
    convert_question = "Convert this into a single json string without any text in the format [coordinate: [location1_lat, location1_lon],........,[locationend_lat, locationend_lon],color:[1,2,3,4],average_AQI:[1,2,3,4]. Do the format exactly like the example. Remove json from the top of the string. Here is an example " + formated_json_example 
    convert_question_1 = "Convert this into a single json string without any text in the format [coordinate: [location1_longitude, location1_latitude],........,[locationend_longitude, locationend_latitude],color:[1,2,3,4],crime_data:[1,2,3,4]. Do the format exactly like the example. Remove json from the top of the string. Here is an example " + formated_json_example_1
    if route_mode == 'crimeroute':
        crimeGPT_response = crimeGPT_prompt(crime_question, origin_lat, origin_lon, destination_lat, destination_lon, mode)
        # response = llm.invoke(crimeGPT_response + "\n\n" + convert_question_1).content
        response = llm.invoke(crimeGPT_response + "\n\n" + convert_question_1).content

        print(response)
    elif route_mode == 'pollutionroute':
        pollutionGPT_response = pollutionGPT_prompt(pollution_question, origin_lat, origin_lon, destination_lat, destination_lon, mode)
        response = llm.invoke(pollutionGPT_response + "\n\n" + convert_question).content
        

    else :
        pollutionGPT_response = pollutionGPT_prompt(pollution_question, origin_lat, origin_lon, destination_lat, destination_lon, mode)
        response = llm.invoke(pollutionGPT_response + "\n\n" + convert_question).content
        
    json_object = json.loads(response)
    return jsonify(json_object)  # Return final JSON as response

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=3001)
