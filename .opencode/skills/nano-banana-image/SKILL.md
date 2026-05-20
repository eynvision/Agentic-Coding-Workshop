---
name: nano-banana-image
description: Use this skill when the user wants Python code for generating images with Google's Nano Banana / Gemini image generation API. Useful for minimal scripts, examples, or project integration.
---

# Nano Banana Image Generation Skill

When this skill is used, generate minimal, working Python code for creating images with Google's Gemini image model.

## Default assumptions

- Use the `google-genai` Python SDK.
- Use Pillow only for saving the returned image.
- Read the API key from `GEMINI_API_KEY`.
- Default model: `gemini-2.5-flash-image`.
- For Nano Banana 2, use `gemini-3.1-flash-image-preview`.

## Minimal install command

```bash
/home/talha/anaconda3/envs/langchain/bin/python -m pip install google-genai pillow
```

## Minimal Python script

Create or update a file such as `generate_image.py`:

```python
from google import genai
from PIL import Image
from io import BytesIO

client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash-image",
    contents="Generate a cute robot eating a tiny banana in a futuristic city."
)

for part in response.candidates[0].content.parts:
    if part.inline_data:
        image = Image.open(BytesIO(part.inline_data.data))
        image.save("nano_banana.png")
        print("Saved: nano_banana.png")
```

## Environment variable

Tell the user to set:

```bash
export GEMINI_API_KEY="your_api_key_here"
```

For persistent shell config:

```bash
echo 'export GEMINI_API_KEY="your_api_key_here"' >> ~/.zshrc
source ~/.zshrc
```

## Usage

Run:

```bash
/home/talha/anaconda3/envs/langchain/bin/python generate_image.py
```

## Agent behavior

When asked to generate code:

1. Keep the code minimal unless the user asks for production structure.
2. Do not hardcode API keys.
3. Save the generated image as `nano_banana.png` by default.
4. If the user asks for a custom prompt, replace only the `contents` string.
5. If the user asks for Nano Banana 2, change only the model to `gemini-3.1-flash-image-preview`.
