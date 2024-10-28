from pydantic import BaseModel, Field
from typing import Dict, Literal, List, Any

class CreateLMRequest(BaseModel):
    provider: Literal["OpenAI", "Ollama"]
    lm_args: Dict[str, Any] = Field(
        ...,
        example={
            "model_name": "gpt-4o-mini",
            "api_key": "YOUR_API_KEY",
            "max_tokens": None,
            "temperature": 0,
            "cache": False
        }
    )

    def validate_args(self):
        if self.provider == "OpenAI" and "api_key" not in self.lm_args:
            raise ValueError("OpenAI provider requires an api_key")
        elif self.provider == "Ollama" and "api_base" not in self.lm_args:
            raise ValueError("Ollama provider requires an api_base URL")

class TrainingExample(BaseModel):
    input: Dict[str, Any]
    output: Dict[str, Any]

class OptimizePromptRequest(BaseModel):
    system_prompt: str = Field(..., example="You are a helpful assistant that classifies text sentiment.")
    training_data: List[TrainingExample] = Field(
        ...,
        example=[
            {
                "input": {"text": "I love this product!"},
                "output": {"sentiment": "positive"}
            },
            {
                "input": {"text": "This is terrible."},
                "output": {"sentiment": "negative"}
            }
        ]
    )
    module_name: str = Field(..., example="SentimentClassifier")

class TestPromptRequest(BaseModel):
    compiled_module_name: str = Field(..., example="SentimentClassifier")
    test_input: Dict[str, Any] = Field(
        ..., 
        example={
            "text": "This product is amazing!"
        }
    )