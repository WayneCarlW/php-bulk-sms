### Running Steps
- Clone the repository
#### Configuring the Send SMS API
- Open the folder in your text editor
- Visit `https://africastalking.com` and create your account
- Navigate to settings
- Click on API key and follow the prompt to obtain your key.
- Create a `.env` file at the root of the project
- In the `.env`
    
    `AT_USER_NAME=yourusername`
    `AT_API_KEY=yourapikey`

#### Building the App

- run `docker compose up --build`
- open http://localhost:8090/index.html