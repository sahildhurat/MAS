from langchain_google_genai import ChatGoogleGenerativeAI
from src.config import settings
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def main():
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", api_key=os.environ.get("GOOGLE_API_KEY"))
        res = await llm.ainvoke("Hello")
        print("gemini-1.5-flash SUCCESS:", res.content)
    except Exception as e:
        print("gemini-1.5-flash ERROR:", type(e), str(e))
        
    try:
        llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", api_key=os.environ.get("GOOGLE_API_KEY"))
        res = await llm.ainvoke("Hello")
        print("gemini-1.5-pro SUCCESS:", res.content)
    except Exception as e:
        print("gemini-1.5-pro ERROR:", type(e), str(e))

if __name__ == "__main__":
    asyncio.run(main())
