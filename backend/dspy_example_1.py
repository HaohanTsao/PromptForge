# %%
import dspy
from dspy.datasets.gsm8k import GSM8K, gsm8k_metric
# %%
# Set up the LM.
turbo = dspy.OllamaLocal(model='llama3.2', max_tokens=None)
# turbo = dspy.OpenAI(model='gpt-3.5-turbo-instruct', max_tokens=250)
dspy.settings.configure(lm=turbo)

# Load math questions from the GSM8K dataset.
gsm8k = GSM8K()
gsm8k_trainset, gsm8k_devset = gsm8k.train[:5], gsm8k.dev[:5]

print(gsm8k_trainset)

# %%
# Define the Module
class CoT(dspy.Module):
    def __init__(self):
        super().__init__()
        self.prog = dspy.ChainOfThought("question -> answer")
    
    def forward(self, question):
        return self.prog(question=question)
    
# %%
# Compile and Evaluate the Model
from dspy.teleprompt import BootstrapFewShot

# Set up the optimizer: we want to "bootstrap" (i.e., self-generate) 4-shot examples of our CoT program.
config = dict(max_bootstrapped_demos=3, max_labeled_demos=3)

# Optimize! Use the `gsm8k_metric` here. In general, the metric is going to tell the optimizer how well it's doing.
teleprompter = BootstrapFewShot(metric=gsm8k_metric, **config)
optimized_cot = teleprompter.compile(CoT(), trainset=gsm8k_trainset)

# %%
from dspy.evaluate import Evaluate
# Evaluate
# Set up the evaluator, which can be used multiple times.
evaluate = Evaluate(devset=gsm8k_devset, metric=gsm8k_metric, num_threads=4, display_progress=True, display_table=0)

# Evaluate our `optimized_cot` program.
evaluate(optimized_cot)

# %%
# Inspect the Model's History
turbo.inspect_history(n=1)

# %%
# Try
pred = optimized_cot(question='Cameron is printing her thesis in the school library and has 400 A4 pieces of paper. If 40% of the papers did not print out up to her desired quality and she separated them as invalid, calculate the total number of valid documents.')
# %%
print(pred.answer)
# %%
optimized_cot.prog

# %%
cot = CoT()
cot.load('compiled_cot_gsm8k.json')
# %%
print(pred.values)
# %%
