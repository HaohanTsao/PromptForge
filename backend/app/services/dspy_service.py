import dspy
from dspy.teleprompt import BootstrapFewShot
from typing import List
import json
import logging

# Initialize the language model
def create_lm(provider: str, lm_args: dict):
    if provider == "OpenAI":
        llm = dspy.OpenAI(
            model=lm_args["model_name"],
            api_key=lm_args["api_key"],
            max_tokens=None
        )
    
    elif provider == "Ollama":
        llm = dspy.OllamaLocal(
            model=lm_args["model_name"],
            max_tokens=None
        )
    
    else:
        raise ValueError(f"Not supported provider: {provider}")
    
    return llm
    
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