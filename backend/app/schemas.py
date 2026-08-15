from typing import Literal

from pydantic import (
    BaseModel,
    Field,
    field_validator,
    model_validator,
)


SupportedLanguage = Literal[
    "Python",
    "JavaScript",
    "TypeScript",
    "Java",
    "C",
    "C++",
    "C#",
    "Go",
    "Rust",
    "PHP",
    "Ruby",
    "Kotlin",
    "Swift",
]


class CodeTranslationRequest(BaseModel):

    source_language: SupportedLanguage

    target_language: SupportedLanguage

    code: str = Field(
        ...,
        min_length=1,
        max_length=50000,
    )

    @field_validator("code")
    @classmethod
    def validate_code(cls, value: str):

        value = value.strip()

        if not value:
            raise ValueError("Code cannot be empty.")

        return value

    @model_validator(mode="after")
    def validate_languages(self):

        if self.source_language == self.target_language:
            raise ValueError(
                "Source and target languages must be different."
            )

        return self


class CodeTranslationResponse(BaseModel):
    source_language: str
    target_language: str
    translated_code: str