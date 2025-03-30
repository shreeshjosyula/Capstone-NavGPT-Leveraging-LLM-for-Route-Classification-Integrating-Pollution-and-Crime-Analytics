[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-718a45dd9cf7e7f842a935f5ebbe5719a5e09af4491e668f4dbf3b35d5cca122.svg)](https://classroom.github.com/online_ide?assignment_repo_id=14937100&assignment_repo_type=AssignmentRepo)


Capstone Project (ICMI 2025)
Project Instructions
==============================
# Install the packages
Locate to the downloaded zip file or git clone on VScode or terminal
cmd - npm install 

# Download android studio
Install latest android studio version and don't forget to install the emulator in the android studio
- If you are using a physical device don't forget to switch on the debugging developer mode on your phone

# To run the code on android device or emulator
- Run Windows Powershell in administrator
- Locate to the directory of the project
- Then run the cmd
  -  npx react-native run-android
- This will open node.js server and start building and install apk in your emulator or Physical device

# You need to Signup or Login in the app
- password should be atleast 6 character
- After Signup it will redirect you to login

# Create a .env file 
- chatgpt_api_key = your_api_key
- weather_api_key = your_api_key
- graphhopper_api_key = your_api_key
- mapbox_api_key = your_api_key
- pollution_key = your_api_key
- openaq_api_key = your_api_key

# To run the python Pollution and the Crime Routeserver
- You can run it on external server or Terminal, these files is located in chatGPT/PollutionCrimeTraffic folder
- To connect the to the app you need to run the file in externel server
- To run and check on terminal
  - locate the terminal to chatGPT/PollutionCrimeTraffic folder
  - then run the command
    - $ python app.py
  - then it will start running on one of the port use the following link with the parameters
      - Example API Request
        To request a route from your API with specific parameters, you can use the following example:

        http://127.0.0.1:3001/api?origin_lat=43.465187&origin_lon=-80.52237&destination_lat=43.647938&destination_lon=-79.38355&mode=car&route_mode=crimeroute
        
        Parameters:

      - origin_lat - Latitude of the origin point (e.g., 43.465187).
      - origin_lon - Longitude of the origin point (e.g., -80.52237).
      - destination_lat - Latitude of the destination point (e.g., 43.647938).
      - destination_lon - Longitude of the destination point (e.g., -79.38355).
      - mode - Transportation mode, in this case, car.
      - route_mode - Specifies the type of route; example, 'crimeroute', 'pollutionroute', 'trafficroute'.

==============================

Project Organization
------------

    ├── README.md                <- The top-level README for describing highlights for using this project.
    │
    ├── reports
    │   └── final_project_report <- final report .pdf format
    │   └── presentation         <-  final power point presentation
    │
    ├── assets                   <- Contains all the images that are being used in the map
    |
    ├── chatGPT
    │    └── pollutioncrime
    │    │    │
    │    │    ├── app.py               <- This file helps to runs the python backend for Pollution, Crime and Traffic
    │    │    ├── requirements.txt     <- This contains the dependency for the python file
    │    │    ├── Procfile             <- this contains the command used to run the python file ine server
    │    │    ├── requirements.txt     <- python packages needed by the server to install
    │    │    │
    │    │    └── crime_data.py        <- Contains the function that webscraps the Wikipedia page to get CSI value
    │    │    └── crimeGPT.py          <- The CSI values are fed into the fined tuned LLM to get color coding
    │    │    └── pollution_data.py    <- Contains the function that helps to get AQI values using WAQI API
    │    │    └── pollutionGPT.py      <- The AQI values are fed into fined tuned LLM ti get color coding
    │    │    └── .....                <- Contains remaining python file pollution, crime and traffic
    │    └──ChatGPTComponent.tsx       <- The is the ChatGPT chatbox component
    │    └──knowledgeBase.json         <- this is the knowledgebase for location detail that being used in ChatGPTComponent.tsx
    │
    ├── components
    │    │
    │    ├── LoginSignup.tsx           <- This is the login and SignUp page
    │    └── UserInfoPage.tsx          <- This the user information screen
    │
    ├── styles/styles.ts         <- stylesheet for MapNavigation.tsx
    ├── .env                     <- environmental file for api keys
    │
    ├── ...
    ├── App.tsx                  <- This the main Application file where screen navigation is being done
    ├── index.js                 <- index file for app.tsx
    |
    ├── env.d.ts                 <- defines structure of the .env file
    |
    ├── babel.config.js          <- this handles how the .env file is being called
    |
    ├── firebaseConfig.js        <- This contains the firbase configuration and keys to connect to the firebase
    |
    ├── MapNavigation.tsx        <- This is the main file where map, navigation and location search is being handled
    |
    ├──...
    ├── package.json             <- this file contains the packages that are being used
    ├── package-lock.json        <- creates packages when you run npm install
    └── ...



