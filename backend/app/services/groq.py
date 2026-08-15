import os

from dotenv import load_dotenv
from groq import AsyncGroq
from groq import APIConnectionError, APIStatusError, RateLimitError


load_dotenv()

api_key = os.getenv("GROQ_API_KEY")

if not api_key:
    raise RuntimeError("GROQ_API_KEY is not configured")


client = AsyncGroq(api_key=api_key)


SYSTEM_PROMPT = """
You are an expert software engineer and programming language translator.

Your task is to translate code from one programming language
to another programming language.

Rules:
1. Preserve the original functionality.
2. Preserve the program logic.
3. Use idiomatic code for the target language.
4. Do not add explanations.
5. Do not add Markdown code fences.
6. Return ONLY the translated source code.
7. Preserve comments when possible.
8. Handle syntax differences correctly.
9. If a feature does not directly exist in the target language,
   implement the closest reasonable equivalent.
"""


async def translate_code(
    source_language: str,
    target_language: str,
    code: str,
) -> str:

    prompt = f"""
Translate the following code.

Source language:
{source_language}

Target language:
{target_language}

Source code:
{code}
"""

    try:
        response = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.1,
        )

    except RateLimitError as e:
        raise RuntimeError(
            "Groq API rate limit exceeded. Please try again later."
        ) from e

    except APIConnectionError as e:
        raise RuntimeError(
            "Unable to connect to Groq API."
        ) from e

    except APIStatusError as e:
        raise RuntimeError(
            f"Groq API request failed with status {e.status_code}."
        ) from e

    translated_code = response.choices[0].message.content

    if not translated_code:
        raise RuntimeError(
            "Groq returned an empty response."
        )

    return translated_code.strip()