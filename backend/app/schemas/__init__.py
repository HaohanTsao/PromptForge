from pydantic import BaseModel, Field
from typing import List, Dict

class OptimizePromptRequest(BaseModel):
    system_prompt: str
    training_data: List[Dict[str, str]] = Field(..., example=[{'input': 'INPUT_CONTENT', 'output': 'OUTPUT_CONTENT'}])
    module_name: str

class TestPromptRequest(BaseModel):
    compiled_module_name: str
    test_input: str

class CreateLMRequest(BaseModel):
    provider: str
    lm_args: Dict[str, str] = Field(..., example={'model_name': 'YOUR_MODEL_NAME', 'api_key': 'YOUR_API_KEY_IF_NEEDED'})