# Sentiment visualization in brand monitoring using ReactJS and FastAPI
![ReactJS](https://img.shields.io/badge/ReactJS-61DAFB?style=for-the-badge&logo=react&logoColor=000000)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=FFFFFF)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=FFFFFF)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=FFFFFF)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=FFFFFF)

## 👨‍💻 About
This is the repo for the dashboard web app which visualizes sentiment analysis results.

## 📁 Repository info
This repo structure is as follows:
+ `frontend`: The UI of the dashboard, built using ReactJS and ChartJS
+ `backend`: Exposes an API that accesss the databases, aggregates the data and returns result to the front-end

## Installation

### For the front-end
```bash
cd frontend

npm install

npm start
```

### For the backend
Create .env inside the /backend folder
```
MONGO_URI=yourmongouri
```
Then run the server
```bash
cd backend

python -m venv venv                 # Create a venv

venv/Scripts/activate               # Activate venv

pip install -r requirements.txt     # Install dependencies

fastapi dev main.py                 # Start FastAPI server (local only)
```
