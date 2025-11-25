# Vocal Range Explorer

A web application that helps you determine your vocal classification (Tenor, Baritone, Soprano, etc.) using real-time pitch detection and AI analysis.

## Features

- **Real-time Pitch Detection**: Uses the Web Audio API and auto-correlation to detect your pitch via microphone.
- **Visual Feedback**: A tuner-style interface helps you hold the correct note.
- **AI Analysis**: Integrates with Google's Gemini API to analyze your range and provide personalized voice type descriptions.
- **Recommendations**: Gets song suggestions and vocal exercises tailored to your voice type.

## How to Use

1. Click "Start Vocal Test".
2. Sing your lowest comfortable note and capture it.
3. Sing your highest comfortable note and capture it.
4. View your results, song suggestions, and recommended exercises.

## Local Development

To run this application locally on your machine:

1.  **Clone the repository** (or download the files).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup API Key**:
    *   Create a file named `.env` in the root directory.
    *   Add your Google Gemini API key (Get one from [Google AI Studio](https://aistudio.google.com/)):
        ```env
        API_KEY=your_actual_api_key_here
        ```
4.  **Run the app**:
    ```bash
    npm run dev
    ```
5.  Open the link provided in the terminal (usually `http://localhost:5173`).

## Credits

*   **Technology**: Built with the assistance of **Gemini 3 Pro** and **Google AI Studio**.
*   **Inspiration**: Special thanks to **Jonas** for the encouragement to sing together!

## License

MIT