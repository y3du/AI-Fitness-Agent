# 🚀 AI Fitness App: Your Personal AI Agent for Health & Wellness

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Expo](https://img.shields.io/badge/Expo-53.0.10-blue)](https://expo.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)](https://www.postgresql.org/)

---



<h2 align="center">AI-Powered Fitness & Nutrition App with Intelligent Agents</h2>

<p align="center">
  <b>Experience the next generation of fitness and nutrition with advanced AI agents, cutting-edge prompt engineering, and intelligent automation. Our app delivers hyper-personalized workout routines and adaptive meal plans, dynamically tailored to your unique goals, preferences, and feedback—all powered by state-of-the-art artificial intelligence.</b>
</p>

---

## ✨ Features

- 🤖 <b>AI Agent-Driven Workouts:</b> Advanced AI agents generate weekly routines tailored to your goals, experience, and available equipment using state-of-the-art prompt engineering.
- 🥗 <b>Smart Nutrition Planning:</b> Intelligent meal plans adapt to your dietary preferences, restrictions, and real-time feedback, powered by AI-driven prompt design.
- 👤 <b>Seamless Onboarding:</b> Effortless setup with persistent login, profile management, and dynamic user modeling.
- 🔄 <b>Continuous Feedback Loops:</b> Rate workouts and meals to enable the AI agent to refine future recommendations and optimize your fitness journey.
- 🏆 <b>Goal-Oriented Motivation:</b> Set, track, and celebrate milestones with badges, reminders, and personalized encouragement from your AI agent.
- 🌐 <b>Cross-Platform Experience:</b> Enjoy a seamless experience on both iOS and Android via Expo.
- 🔒 <b>Secure & Private:</b> All user data is encrypted and processed securely. Your privacy is our priority.
- 🧠 <b>Prompt Engineering at Core:</b> Every recommendation is crafted using advanced prompt engineering techniques for optimal personalization.

---

## 🖼️ Screenshots

<p align="center">
  <img src="SCREENSHOTS/1.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/2.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/3.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/4.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/5.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/6.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/7.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/8.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/9.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/10.jpeg" width="200" alt="Home Screen" />
  <img src="SCREENSHOTS/11.jpeg" width="200" alt="Home Screen" />
  
</p>

---

## 🏗️ Project Structure

```text
fullstack-project/
  backend/
    main.py                # FastAPI app and API endpoints
    db.py                  # PostgreSQL connection pool
    db_ops.py              # Database operations
    workout_generator.py   # AI agent for workout logic (prompt engineering)
    nutrition_generator.py # AI agent for nutrition logic (prompt engineering)
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
- **AI/ML:** Custom AI agents leveraging prompt engineering for dynamic workout and nutrition generation
- **API:** RESTful endpoints for user, workout, nutrition, and feedback management
- **Automation:** Intelligent feedback loops and agent-based adaptation

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

## 🧠 How It Works

1. **User Onboarding:** The AI agent collects user goals, experience, body metrics, and dietary preferences using dynamic forms and prompt engineering.
2. **AI Agent-Driven Generation:** Custom AI agents use advanced prompt engineering to generate weekly workout routines and adaptive meal plans, ensuring every recommendation is uniquely tailored.
3. **Feedback Loops:** User feedback is processed by the AI agent, which refines future plans and recommendations, learning and adapting over time.
4. **Progress Analytics:** The app visualizes user progress with interactive charts, trend analysis, and actionable insights, all powered by intelligent automation.
5. **Continuous Personalization:** The AI agent leverages prompt engineering to continuously improve and personalize the user experience.

---

## 🗺️ Roadmap

- [x] Core AI agent for workout and nutrition generation
- [x] Prompt engineering for personalized recommendations
- [x] Feedback-driven adaptation and learning
- [ ] Integration with wearable devices (e.g., Fitbit, Apple Watch)
- [ ] Social features: share progress, join challenges
- [ ] Voice assistant integration for hands-free interaction
- [ ] Advanced analytics and predictive insights
- [ ] In-app AI chat agent for real-time fitness and nutrition Q&A

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