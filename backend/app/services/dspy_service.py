import dspy
from dspy.teleprompt import BootstrapFewShot
from typing import List
import json
import logging

# Initialize the language model
def create_lm(provider: str, lm_args: dict):
    """
    Initialize a language model using DSPy 2.5's LM class.
    
    Args:
        provider (str): The LM provider ("OpenAI" or "Ollama")
        lm_args (dict): Configuration arguments for the LM
            Required keys:
            - model_name (str): Name of the model to use
            - max_tokens (int, optional): Maximum tokens for generation
            - temperature (float, optional): Sampling temperature
            - api_key (str, optional): API key for OpenAI
            - api_base (str, optional): Base URL for Ollama
    
    Returns:
        dspy.LM: Configured language model instance
    
    Raises:
        ValueError: If provider is not supported or required args are missing
    """
    # Set default values
    max_tokens = lm_args.get("max_tokens", None)
    temperature = lm_args.get("temperature", 0)
    cache = lm_args.get("cache", True)
    
    if provider == "OpenAI":
        if "api_key" not in lm_args:
            raise ValueError("OpenAI requires an API key")
            
        model_prefix = "openai/"
        if not lm_args["model_name"].startswith(model_prefix):
            model_name = f"{model_prefix}{lm_args['model_name']}"
        else:
            model_name = lm_args["model_name"]
            
        lm = dspy.LM(
            model=model_name,
            api_key=lm_args["api_key"],
            max_tokens=max_tokens,
            temperature=temperature,
            cache=cache
        )
    
    elif provider == "Ollama":
            
        model_prefix = "ollama/"
        if not lm_args["model_name"].startswith(model_prefix):
            model_name = f"{model_prefix}{lm_args['model_name']}"
        else:
            model_name = lm_args["model_name"]
            
        lm = dspy.LM(
            model=model_name,
            max_tokens=max_tokens,
            temperature=temperature,
            cache=cache
        )
    
    else:
        raise ValueError(f"Not supported provider: {provider}")
    
    return lm
    
class CoT(dspy.Module):
    def __init__(self):
        super().__init__()
        self.prog = dspy.ChainOfThought("question -> answer")
    
    def forward(self, question):
        return self.prog(question=question)

def optimize_prompt(system_prompt: str, training_data: List[dict], module_name: str):
    # Convert training data to DSPy examples
    trainset = [dspy.Example(question=system_prompt + data['input'], answer=data['output']).with_inputs("question") for data in training_data]
    
    # Set up the optimizer
    config = dict(max_bootstrapped_demos=3, max_labeled_demos=3)
    teleprompter = BootstrapFewShot(metric=dspy.evaluate.answer_exact_match, **config)
    
    # Compile the optimized prompt
    optimizer = CoT()
    optimized_prompt = teleprompter.compile(optimizer, trainset=trainset)
    file_path = f'compiled_modules/{module_name}.json'
    optimized_prompt.save(file_path)
    
    # Log the file has been saved
    logging.info(f"Optimized prompt has been saved to {file_path}")
    
    # Return the content of the saved JSON file
    with open(file_path, 'r') as f:
        saved_content = json.load(f)
    
    return saved_content

def test_prompt(compiled_module_name: str, test_input: str):
    # Use the optimized prompt to generate output
    cot = CoT()
    cot.load(f'compiled_modules/{compiled_module_name}.json')
    result = cot(test_input)
    return result