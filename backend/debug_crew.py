from crew_app import SentinelCrew
import sys

try:
    crew = SentinelCrew("Hello", "No content found.", True)
    result = crew.run()
    print("SUCCESS:", result)
except Exception as e:
    print("ERROR:", e)
    import traceback
    traceback.print_exc()
