from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    CodeTranslationRequest,
    CodeTranslationResponse,
)

from app.services.groq import translate_code


app = FastAPI(
    title="AI Code Translator API",
    description="Translate code between programming languages using Groq",
    version="1.0.0",
)


# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://code-translator-1.onrender.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "AI Code Translator API is running"
    }


@app.post(
    "/translate",
    response_model=CodeTranslationResponse,
)
async def translate(request: CodeTranslationRequest):

    try:

        translated_code = await translate_code(
            source_language=request.source_language,
            target_language=request.target_language,
            code=request.code,
        )

        return CodeTranslationResponse(
            source_language=request.source_language,
            target_language=request.target_language,
            translated_code=translated_code,
        )

    except RuntimeError as e:

        raise HTTPException(
            status_code=503,
            detail=str(e),
        )

    except Exception:

        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while translating the code.",
        )