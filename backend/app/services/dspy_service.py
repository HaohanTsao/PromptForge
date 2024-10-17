import dspy
from dspy.teleprompt import BootstrapFewShot
from typing import List

# Initialize the language model
turbo = dspy.OllamaLocal(model='llama3.2', max_tokens=None)
dspy.settings.configure(lm=turbo)

class CoT(dspy.Module):
    def __init__(self):
        super().__init__()
        self.prog = dspy.ChainOfThought("input -> output")
    
    def forward(self, input):
        return self.prog(input=input)

def optimize_prompt(system_prompt: str, training_data: List[dict], moudule_name: str):
    # Convert training data to DSPy examples
    trainset = [dspy.Example(input=system_prompt + data['input'], output=data['output']).with_inputs("input") for data in training_data]
    
    # Set up the optimizer
    config = dict(max_bootstrapped_demos=3, max_labeled_demos=3)
    teleprompter = BootstrapFewShot(metric=dspy.evaluate.answer_exact_match, **config)
    
    # Compile the optimized prompt
    optimizer = CoT()
    optimized_prompt = teleprompter.compile(optimizer, trainset=trainset)
    optimized_prompt.save(f'backend/compiled_modules/{moudule_name}.json')
    
    return optimized_prompt.prog

def test_prompt(compiled_module_name: str, test_input: str):
    # Use the optimized prompt to generate output
    cot = CoT()
    cot.load(f'backend/compiled_modules/{compiled_module_name}.json')
    result = cot(test_input)
    return result