# Smart Kerala Agriculture Portal

## Problem Statement
Farmers in Kerala often face challenges in identifying the most suitable crops for their specific land. Traditional soil testing can be time-consuming and expensive, and generic agricultural advice often fails to account for the highly localized soil variations across Kerala's diverse geography. This lack of precise, accessible information leads to sub-optimal crop yields and inefficient land management.

## Project Description
The **Smart Kerala Agriculture Portal** is a hackathon MVP designed to empower Kerala's farmers with instant, location-based agricultural intelligence. 

**How it works:**
1. **Location-Based Soil Mapping**: Instead of complex image analysis, the portal uses a curated dataset of Kerala's districts and areas to instantly identify the predominant soil type (e.g., Laterite, Clay, Red Soil).
2. **AI-Powered Insights**: It leverages Google Gemini AI to translate raw soil data into beginner-friendly explanations.
3. **End-to-End Guidance**: Beyond just naming a soil type, the portal generates:
   - **Custom Crop Recommendations**: Based on the identified soil.
   - **Detailed Crop Plans**: AI-generated schedules for planting, nutrient management, and pest control.
   - **Soil Enrichment Advice**: Tailored strategies to improve land health for long-term sustainability.
4. **Interactive Agri-Assistant**: A real-time chat interface where farmers can ask specific follow-up questions.

## Google AI Usage
### Tools / Models Used
- **Model**: `gemini-3-flash-preview`
- **SDK**: `@google/genai`

### How Google AI Was Used
AI is the "brain" of the portal, integrated across multiple touchpoints:
- **Insight Enhancement**: Gemini takes static soil data and generates natural, easy-to-understand explanations for farmers.
- **Dynamic Plan Generation**: It analyzes the combination of location, soil, and crop to create a structured, professional-grade agricultural roadmap.
- **Expert Advisory**: It acts as a virtual soil scientist, providing specific enrichment tips (like green manure or pH correction) relevant to Kerala's environment.
- **Conversational Support**: Powering the "Agri Assistant" chat to handle diverse queries ranging from "When should I plant coconut?" to "How do I fix acidic soil?".

## Demo Video
[Watch Demo](https://drive.google.com/file/d/1MEs-hqa4bP8Q0_eIQBKHCO5KKxiyt01j/view?usp=drive_link)

## Installation Steps
To run this project locally, follow these steps:

### 1. Clone the repository
```bash
git clone <your-repo-link>
```

### 2. Go to project folder
```bash
cd smart-kerala-agri-portal
```

### 3. Install dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the root directory and add your Gemini API Key:
```env
GEMINI_API_KEY=your_api_key_here
```

### 5. Run the project
```bash
npm run dev
```
