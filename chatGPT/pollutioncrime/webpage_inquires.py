import requests
from bs4 import BeautifulSoup
import openai
from openai import OpenAI
import json

def scrape_webpage(url, word_limit=10000):
    """
    Scrapes the content of a webpage and returns the text.
    """
    if not url.startswith(("https://", "http://")):
        url = "https://" + url
    response = requests.get(url)

    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        text = soup.get_text()
        clean_text = text.splitlines()
        clean_text = [element.strip()
                      for element in clean_text if element.strip()]
        clean_text = '\n'.join(clean_text)
        
        summary = clean_text[:word_limit] + '...' if len(clean_text) > word_limit else clean_text
        return summary
    else:
        return "Failed to retrieve the website content."


def chat_completion_request(model, messages, tools):
    """
    Sends a request to the OpenAI API to generate a chat response.
    """
    client = OpenAI(api_key = chatgpt_api_key)
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        tools=tools
    )
    return response


def chat_with_tools(model, messages, tools):
    """
    Checks if a responsed called a tool (funtion), apply this tool and return the response.
    """
    try:
        response = chat_completion_request(model, messages, tools)
        tool_calls = response.choices[0].message.tool_calls
        if tool_calls:
            # Assuming there's only one tool call per message for simplicity
            tool_call = tool_calls[0]
            if tool_call.function.name == "scrape_webpage":
                url_to_scrape = json.loads(
                    tool_call.function.arguments)["url"]
                scraping_result = scrape_webpage(url_to_scrape)
                messages.append(
                    {"role": "assistant", "content": f"Scraping result: {scraping_result}"})
                response_with_data = chat_completion_request(
                    model, messages, tools)
                return response_with_data.choices[0].message.content, True

        else:
            return response.choices[0].message.content, False

    except Exception as e:
        print(f"An error occurred: {e}")
