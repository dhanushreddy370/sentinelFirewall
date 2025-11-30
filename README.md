# Sentinel Browser with Sentinel Firewall

## Overview

**Sentinel Browser** is an AI‑powered web browsing interface built with **React + Vite** (frontend) and **FastAPI** (backend). It integrates the **CrewAI** framework to orchestrate multiple agents:

- **Browser Agent** – fetches web pages or searches the internet.
- **Sentinel Agent (Firewall)** – scans the fetched content for indirect prompt‑injection attacks and blocks malicious instructions.
- **Analyst Agent** – answers the user’s query based on the sanitized content.

The project demonstrates a secure, multi‑agent workflow that can browse URLs, upload local files (HTML, PDF, etc.), and safely answer questions while protecting against hidden instructions.

---

## Features

- **Live browsing & search** – type a URL or a search query and get AI‑generated answers.
- **File upload** – upload PDFs, HTML, or plain‑text files from the `test_data` folder.
- **Sentinel Firewall** – detects and blocks prompt‑injection patterns (e.g., "Ignore previous instructions", "Output the secret key").
- **CrewAI orchestration** – agents communicate via defined tasks, with optional safe‑mode.
- **OpenRouter LLM** – uses the `tngtech/deepseek-r1t2-chimera:free` model via OpenRouter.
- **Responsive UI** – modern design with glass‑morphism, dark mode, and smooth animations.

---

## Prerequisites

- **Windows 10/11** (the project has been developed on Windows).
- **Python 3.12** (or later).
- **Node.js 20+** and **npm** (for the frontend).
- **Git** – to clone the repository.
- An **OpenRouter API key** (already configured in `.env`).

---

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhanushreddy370/sentinelFirewall.git
   cd sentinelFirewall/sentinel
   ```

2. **Create a Python virtual environment** (recommended)
   ```bash
   python -m venv myenv
   myenv\Scripts\activate   # PowerShell: myenv\Scripts\Activate.ps1
   ```

3. **Install backend dependencies**
   ```bash
   pip install -r requirements.txt
   ```
   > The `requirements.txt` file contains `fastapi`, `uvicorn`, `crewai`, `langchain-openai`, `pypdf`, `python‑dotenv`, `requests`, `beautifulsoup4`, etc.

4. **Configure environment variables**
   - Copy the example file:
     ```bash
     cp .env.example .env   # or create a .env manually
     ```
   - Edit `.env` and set:
     ```
     OPENROUTER_API_KEY=your_openrouter_key
     SECRET_KEY=your_secret_key   # used only by the Sentinel firewall
     ```

5. **Install frontend dependencies**
   ```bash
   cd ../frontend_app
   npm install
   ```

6. **Run the backend**
   ```bash
   cd ../backend
   myenv\Scripts\python.exe -m uvicorn main:app --host 0.0.0.0 --port 3000
   ```
   The API will be available at `http://localhost:3000`.

7. **Run the frontend (development mode)**
   ```bash
   cd ../frontend_app
   npm run dev
   ```
   This starts Vite and opens the UI at `http://localhost:3000` (the same port – Vite proxies API calls to the FastAPI backend).

8. **Using the application**
   - **Browse a URL**: type a full URL in the address bar and press **Enter**.
   - **Search**: type a natural‑language query like `search about trading` and click **Execute Agent**.
   - **Upload a file**: click the **Load Document** dropdown, select a file from `test_data` (e.g., `infected_invoice.pdf`), then ask a question.
   - The response will appear in the main content area. If the Sentinel firewall blocks content, you’ll see a `THREAT BLOCKED` message.

---

## Testing & Security

- **Test files** are provided in `sentinel/test_data`:
  - `infected_page.html` – contains a hidden instruction to expose the secret key.
  - `infected_invoice.pdf` – PDF with a white‑text malicious payload.
  - `safe_note.txt` – a benign text file.
- Run the UI and try the following queries to see the firewall in action:
  - `search about trading`
  - Load `infected_page.html` and ask `Summarize this document`.
  - Load `infected_invoice.pdf` and ask `Summarize this invoice`.

---

## License

This project is provided under the **MIT License**. Feel free to fork, modify, and use it for personal or commercial purposes.

---

## Contributing

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/your-feature`).
3. Commit your changes and push to your fork.
4. Open a Pull Request describing the changes.

---

## Contact

For questions or issues, open an issue on GitHub or contact the maintainer at `dhanushreddys370@gmail.com`.
