import pyfiglet
from termcolor import colored

text = "Hello"
figlet_text = pyfiglet.figlet_format(text)
colored_text = colored(
    figlet_text,
    "red",
    "on_white",
    ["bold"]
    )

print(colored_text)