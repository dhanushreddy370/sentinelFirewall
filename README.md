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
- **Sentinel Prompt Firewall (SPF)** – implements **Dynamic Context Delimiter** and **Role Separation** to deterministically block Indirect Prompt Injection (IPI) attacks.
- **Human-in-the-Loop (HITL) Logic** - Detects sensitive actions (e.g., financial transfers) and forces user confirmation before proceeding.
- **CrewAI orchestration** – agents communicate via defined tasks, with optional safe‑mode.
- **OpenRouter LLM** – uses the `tngtech/deepseek-r1t-chimera:free` model via OpenRouter.
- **Responsive UI** – modern design with glass‑morphism, dark mode, smooth animations, and dedicated Threat Alerts (Red/Green/Yellow).
- **App Mode** - Runs as a standalone desktop application window.

---

## Prerequisites

- **Windows 10/11**.
- **Python 3.12+**.
- **Node.js 20+**.
- **Git**.
- An **OpenRouter API key** (in `.env`).

---

## Setup & Run (The Easy Way)

1. **Clone the repository**
   ```bash
   git clone https://github.com/dhanushreddy370/sentinelFirewall.git
   cd sentinelFirewall/sentinel
   ```

2. **Setup Environment**
   - Create a virtual environment `myenv` and install dependencies:
     ```bash
     python -m venv myenv
     myenv\Scripts\activate
     pip install -r backend/requirements.txt
     ```
   - Create `.env` in `backend/` with `OPENROUTER_API_KEY=your_key`.

3. **Launch the App**
   - Double-click the **Sentinel** shortcut (if created) or run:
     ```bash
     sentinel.bat
     ```
   - This builds the frontend (if needed), starts the backend covertly, and launches the Sentinel Browser in a dedicated app window.

---

## Usage Guide

- **Safe Browsing**: Type a URL or query (e.g., "Search about cyber attacks").
- **Threat Detection**:
  - Load `attack_test.html` and ask "Summarize this".
  - **Result**: The firewall will detect hidden attacks and show a **Green "THREAT NEUTRALIZED"** alert while still providing the safe summary.
- **Human-in-the-Loop (HITL)**:
  - Load `attack_test.html` (which now contains a fake financial transfer instruction).
  - Ask "Summarize this page".
  - **Result**: The agent will pause and show a **Yellow "ACTION CONFIRMATION REQUIRED"** alert.
  - You must click **Authorize Action** to proceed or **Deny** to stop.

---

## Testing & Security

- **Test files** in `sentinel/test_data`:
  - `attack_test.html` – Comprehensive test suite with:
    - Hidden text injection ("white-on-white").
    - Fake system prompts.
    - Financial action triggers (for HITL demo).
  - `infected_invoice.pdf` – PDF with hidden payloads.

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
