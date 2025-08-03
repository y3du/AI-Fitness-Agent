# 🚀 AI Fitness App

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Expo](https://img.shields.io/badge/Expo-53.0.10-blue)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)

---

<p align="center">
  <img src="frontend/assets/icon.png" alt="AI Fitness App Logo" width="120" />
</p>

<h2 align="center">AI-Powered Fitness & Nutrition App</h2>

<p align="center">
  <b>Personalized workouts, smart nutrition plans, and progress tracking — all in one beautiful app.</b>
</p>

---

## ✨ Features

- 🏋️‍♂️ <b>Personalized Workouts:</b> AI-generated weekly routines based on your goals, experience, and equipment.
- 🥗 <b>Smart Nutrition:</b> Custom meal plans tailored to your dietary preferences and feedback.
- 👤 <b>Seamless Onboarding:</b> Easy setup, persistent login, and profile management.
- 🔄 <b>Feedback Loops:</b> Rate workouts and meals to improve future recommendations.

---

## 🖼️ Screenshots

> **Tip:** Add your app screenshots below for maximum impact! Replace the URLs with your own images (local or hosted).

<p align="center">
  <img src="https://placehold.co/200x400?text=Home+Screen" width="200" alt="Home Screen" />
  <img src="https://placehold.co/200x400?text=Workout+Screen" width="200" alt="Workout Screen" />
  <img src="https://placehold.co/200x400?text=Nutrition+Screen" width="200" alt="Nutrition Screen" />
  <img src="https://placehold.co/200x400?text=Progress+Screen" width="200" alt="Progress Screen" />
</p>

<!--
Example for adding your own screenshots:

<p align="center">
  <img src="screenshots/home.png" width="200" alt="Home Screen" />
  <img src="screenshots/workout.png" width="200" alt="Workout Screen" />
  <img src="screenshots/nutrition.png" width="200" alt="Nutrition Screen" />
  <img src="screenshots/progress.png" width="200" alt="Progress Screen" />
</p>
-->

---

## 🏗️ Project Structure

```text
fullstack-project/
  backend/
    main.py                # FastAPI app and API endpoints
    db.py                  # PostgreSQL connection pool
    db_ops.py              # Database operations
    workout_generator.py   # AI workout logic
    nutrition_generator.py # AI nutrition logic
    models.py, schemas.py  # Pydantic models and schemas
  frontend/
    src/
      screens/             # All app screens (Home, Workout, Nutrition, Progress, Onboarding, etc.)
      navigation/          # App navigation setup
      context/             # React context for state management
      utils/               # API utilities
    App.js, app.json       # App entry and Expo config
```

---

## ⚙️ Tech Stack

- **Frontend:** React Native (Expo), React Navigation, AsyncStorage, Chart Kit, Vector Icons
- **Backend:** FastAPI, PostgreSQL, psycopg2, dotenv
- **API:** RESTful endpoints for user, workout, nutrition, and feedback management

---

## 🚦 Quickstart

### Backend

1. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```
2. **Configure environment variables**
   Create a `.env` file in `backend/`:
   ```env
   DB_USER=youruser
   DB_PASSWORD=yourpassword
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=yourdbname
   ```
3. **Run the backend server**
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. **Install Node dependencies**
   ```bash
   cd frontend
   npm install
   ```
2. **Configure API base URL**
   Create a `.env` file in `frontend/`:
   ```env
   API_BASE_URL=http://localhost:8000
   ```
3. **Start the Expo app**
   ```bash
   npm start
   ```
   Scan the QR code with Expo Go or run on an emulator.

---

## 🔌 API Endpoints

| Endpoint                                      | Method | Description                        |
|-----------------------------------------------|--------|------------------------------------|
| `/users/`                                     | POST   | Create a new user                  |
| `/workouts/current/`                          | POST   | Generate or fetch weekly workouts  |
| `/workouts/feedback/`                         | POST   | Submit workout feedback            |
| `/nutrition/plan/`                            | POST   | Generate or fetch nutrition plan   |
| `/users/{user_id}/dietary-preferences`        | POST   | Set dietary preferences            |
| `/users/{user_id}/dietary-preferences`        | GET    | Get dietary preferences            |

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

<p align="center">
  <b>Made with ❤️ by the AI Fitness App Team</b>
</p> 