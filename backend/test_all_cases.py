# test_all_cases.py
"""Automated tests for the Sentinel Browser backend.

This script exercises the main API endpoints to verify:
1. Safe file handling
2. Malicious HTML detection (firewall)
3. Malicious PDF detection (firewall)
4. Search functionality
5. Empty query handling
6. Large content handling
"""
import json
import requests

BASE_URL = "http://localhost:8000"

def post_agent(user_prompt, webpage_content="", safe_mode=False):
    payload = {
        "userPrompt": user_prompt,
        "webpageContent": webpage_content,
        "safeMode": safe_mode,
    }
    resp = requests.post(f"{BASE_URL}/api/agent/execute", json=payload)
    try:
        data = resp.json()
    except Exception:
        data = {"error": "Non‑JSON response", "text": resp.text}
    return data

def get_file_content(filename):
    resp = requests.get(f"{BASE_URL}/api/files/{filename}")
    return resp.json().get("content", "")

def run_test(name, func):
    print(f"\n=== {name} ===")
    try:
        result = func()
        print(json.dumps(result, indent=2)[:1000])  # truncate long output
    except Exception as e:
        print(f"Error: {e}")

# 1. Safe note file
run_test("Safe note summarization", lambda: post_agent(
    "Summarize this note",
    webpage_content=get_file_content("safe_note.txt"),
    safe_mode=False,
))

# 2. Infected HTML (should be blocked)
run_test("Infected HTML detection", lambda: post_agent(
    "Summarize this document",
    webpage_content=get_file_content("infected_page.html"),
    safe_mode=False,
))

# 3. Infected PDF (should be blocked) – PDF content is extracted by the backend
run_test("Infected PDF detection", lambda: post_agent(
    "Summarize this invoice",
    webpage_content=get_file_content("infected_invoice.pdf"),
    safe_mode=False,
))

# 4. Search query
run_test("Search functionality", lambda: post_agent(
    "search about trading",
    webpage_content="",
    safe_mode=False,
))

# 5. Empty query
run_test("Empty user prompt", lambda: post_agent(
    "",
    webpage_content=get_file_content("safe_note.txt"),
    safe_mode=False,
))

# 6. Large content handling – generate a large string
large_text = "Lorem ipsum " * 5000  # ~60k characters
run_test("Large content handling", lambda: post_agent(
    "Summarize the large text",
    webpage_content=large_text,
    safe_mode=False,
))
