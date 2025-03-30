from webpage_inquires import chat_with_tools
from langchain_openai import ChatOpenAI  

TOOLS =[
    {
        "type": "function",
        "function": {
            "name": "scrape_webpage",
            "description": "Scrape the content of the specified webpage.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The URL of the webpage to scrape, it can have the http, https protocol or none and just have the domain.",
                    }
                },
                "required": ["url"],
            },
        }
    }
]
CRIME_DATA_STRING = """
                            City  2020  2019  2016  2015  2014  2013  2012  2011  2010  2009
            Abbotsford–Mission  77.2  86.4  82.3  90.4  81.1  70.7  79.7  72.4  89.8 118.8
                        Barrie  44.9  53.1  46.3  43.8  42.3  38.6  46.1  49.2  50.1  53.9
                    Brantford  80.8  83.4  88.4  70.0  73.5  73.9  67.6  84.5  92.5  91.5
                        Calgary  78.0  92.9  61.3  72.1  63.0  62.0  61.2  72.1  82.1  84.8
                        Edmonton 104.8 114.9 102.5 103.9  93.3  89.7  95.8 105.9 106.0 118.7
                        Gatineau  51.4  55.8  63.8  55.9  57.5  65.1  71.4  68.1  59.7  74.5
                Greater Sudbury  87.8  82.1  61.4  63.9  62.9  66.3  75.4  78.7  85.0  98.1
                        Guelph  63.1  64.6  49.1  47.3  44.1  42.5  53.8  48.2  44.5  49.2
                        Halifax  64.3  60.7  60.2  77.3  79.0  73.6  84.8  92.4 111.7 105.6
                        Hamilton  55.5  66.0  54.6  55.0  59.9  62.5  75.8  80.9  84.3  86.5
                        Kelowna 111.9 121.4  62.7  69.8  60.4  67.1  81.8  86.0  95.9 104.3
                        Kingston  70.6  67.8  38.5  54.5  44.3  48.6  53.7  48.1  54.5  71.9
    Kitchener–Cambridge–Waterloo  74.7  73.3  60.1  54.5  51.1  57.0  60.9  69.5  69.8  65.1
                        London  74.7  75.1  59.4  56.7  49.0  56.9  64.1  70.5  74.3  69.9
                        Moncton 104.2 108.9  79.3  75.6  74.5  66.5  73.4  68.2  72.4  79.4
                        Montreal  52.7  58.0  73.1  76.1  72.5  79.5  87.8  97.7  98.3 102.7
                        Ottawa  48.3  57.0  62.1  53.7  49.6  56.1  58.2  63.9  67.5  78.1
                    Peterborough  62.1  54.4  68.9  56.9  51.7  57.7  66.2  60.2  65.8  59.5
                        Quebec 100.0  43.1  47.5  48.3  50.8  48.6  51.3  50.9  51.0  52.2
                        Regina 104.8 130.0 124.1 107.9 103.8 105.8 110.1 123.5 151.2 155.6
                        Saguenay  67.7  47.7  61.3  58.2  57.2  79.4  55.2  59.2  72.8  71.2
                    Saint John  43.9  56.1  49.3  64.3  63.8  65.7  61.6  59.5  68.0  91.3
                    Saskatoon 105.7 117.3 114.0 113.5 122.6 109.9 126.4 134.5 155.7 154.7
                    Sherbrooke  47.8  47.2  55.6  44.1  51.6  45.3  49.7  49.3  51.8  54.2
        St. Catharines–Niagara  58.1  64.3  37.6  42.2  40.9  49.3  54.1  48.0  56.9  63.5
                    St. John's  88.9  71.3  79.6  69.5  79.5  77.3  74.7  90.1  69.3  72.4
                    Thunder Bay  93.8 100.6 125.6 119.2 138.5 110.9 118.8 128.7 138.5 136.1
                        Toronto  46.2  54.2  70.4  64.6  63.5  68.2  78.4  84.7  88.4  94.5
                Trois-Rivières  47.7  51.8  46.2  59.9  57.3  51.4  46.4  46.2  44.4  56.0
                    Vancouver  88.6  95.4  77.8  85.0  78.2  83.6  92.6  98.3 108.2 117.8
                        Victoria  75.8  74.3  56.8  69.1  58.4  54.4  63.7  70.9  81.3  81.0
                        Windsor  83.3  80.3  58.1  67.7  57.0  61.9  66.4  59.8  65.1  74.6
                        Winnipeg 116.3 131.7 149.6 122.1 116.1 119.9 145.4 173.8 163.9 187.0
                        Canada  73.4  79.5  75.3  74.5  70.2  73.7  81.4  85.3  88.9  93.7
"""

def main():
    cities = ["Toronto", "Montreal", "Detroit", "Waterloo", "Newtonville", "Sakami"]

    print(get_cities_crime_data(cities))

    # print()
    # print()

    # print(get_cities_crime_data("Toronto"))
    # print(get_cities_crime_data("Montreal"))
    # print(get_cities_crime_data("Detriot"))
    # print(get_cities_crime_data("Waterloo"))
    # print(get_cities_crime_data("Newtonville"))
    # print(get_cities_crime_data("Sakami")) 

    # print()
    # print()
    
    # print(get_city_crime_data_manual("Toronto"))
    # print(get_city_crime_data_manual("Montreal"))
    # print(get_city_crime_data_manual("Detriot"))
    # print(get_city_crime_data_manual("Waterloo"))
    # print(get_city_crime_data_manual("Newtonville"))
    # print(get_city_crime_data_manual("Sakami"))

def get_cities_crime_data(cities):
    website = "https://en.wikipedia.org/wiki/Crime_in_Canada"
    
    format_string = f"Here is a list of cites: {str(cities)} for each city I want you to follow the below format. Make sure to create a new line for each city" \
                f"If \'city\' exists in the Violent Crime Severity Index for 2020. Look at the header \"Violent crime severity index by census metropolitan area\" in the website" \
                f"Use this format: \"The Crime Data for cityx is \'x\'.\" " \
                f"If the city is not available, please give it for the nearest city. " \
                f"Use this format: \"The Crime Data for the nearest city to cityx is \'x\'. The nearest city is y.\" " \
                f"If you can't find a nearby city that is close, do the below" \
                f"Use this format: \"The Crime Data for cityx is \'g\'. This is the Canada's average.\" " \
                f"Variable table:\n" \
                f"cityx: the city name that is being mentined currently\n" \
                f"x: the value of the violent crime\n" \
                f"y: the nearest city that you came up with\n" \
                f"g: is the numerical value of Canada's average on the Violent Crime Severity Index for 2020\n" \
                f"Please follow the provided format. I only want the prompt; don't output anything else." \
                f"When you give crime data values make sure to put these \'\' quotes to highlight the numerical values."

    prompt = f"Can you scrape the content of this website for me: {website} and get Violent Crime Severity Index for 2020 information. {format_string}"
    messages = [
        {"role": "system", "content": "You're an intelligent assistant. \
        When an URL is mentioned, use the function tool to scrape the content of the webpage than answer the question."},
        {"role": "user", "content": prompt}
    ]
    
    response, success = chat_with_tools("gpt-4o", messages, TOOLS)
    if not success:
        return "Unable to access the crime data"
    else:
        return response
    
def get_city_crime_data(city):
    website = "https://en.wikipedia.org/wiki/Crime_in_Canada"
    
    format_string = f"If {city} exists in the Violent Crime Severity Index for 2020. Look at the header \"Violent crime severity index by census metropolitan area\" in the website. Only print a sentence for each city." \
                f"Use this format: \"The Crime Data for {city} is \'x\'.\" " \
                f"If the city is not available, please give it for the nearest city. " \
                f"Use this format: \"The Crime Data for the nearest city to {city} is \'x\'. The nearest city is y.\" " \
                f"If you can't find a nearby city, do the below" \
                f"Use this format: \"The Crime Data for {city} is \'g\'. This is the Canada's average.\" " \
                f"Variable table:\n" \
                f"x: the value of the violent crime\n" \
                f"y: the nearest city that you came up with\n" \
                f"g: is the numerical value of Canada's average on the Violent Crime Severity Index for 2020\n" \
                f"Please follow the provided format. I only want the prompt; don't output anything else." \
                f"When you give crime data values make sure to put these \'\' quotes to highlight the numerical values."

    prompt = f"Can you scrape the content of this website for me: {website} and give crime information about {city}. {format_string}"
    messages = [
        {"role": "system", "content": "You're an intelligent assistant. \
        When an URL is mentioned, use the function tool to scrape the content of the webpage than answer the question."},
        {"role": "user", "content": prompt}
    ]
    
    
    response, success = chat_with_tools("gpt-4o", messages, TOOLS)
    if not success:
        return "Unable to access the crime data"
    else:
        return response
    
def get_city_crime_data_manual(city):
    format_string = f"Use this format: \"The Crime Data for {city} is \'x\'.\" " \
                    f"If the city is not available, please give it for the nearest city. " \
                    f"Use this format: \"The Crime Data for the nearest city to {city} is \'x\'. The nearest city is y.\" " \
                    f"If you can't find a nearby city that is  close, do the below" \
                    f"Use this format: \"The Crime Data for {city} is \'73.4\'. This is the Canada's average.\" " \
                    f"Variable table:\n" \
                    f"x: the value of the violent crime\n" \
                    f"y: the nearest city that you came up with\n" \
                    f"Please follow the provided format. I only want the prompt; don't output anything else." \
                    f"When you give crime data values make sure to put these \'\' quotes to highlight the numerical values."

    prompt = f"Give me the crime information about {city}. {format_string} \n Here is the crime data information(Only use this information to give crime data): \n {CRIME_DATA_STRING}"
    llm = ChatOpenAI(api_key= chatgpt_api_key, model="gpt-4o")
    response = llm.invoke(prompt).content
    return response

if __name__ == "__main__":
    main()

