import json

def generate_dummy_response():
    sentence = "Ich lerne Deutsch."
    words = sentence.split()
    translations = ["I", "am", "learning", "German"]
    grammar_components = [
        {"word": "Ich", "component": "subject"},
        {"word": "lerne", "component": "verb"},
        {"word": "Deutsch", "component": "object"}
    ]

    word_audio = {
        "Ich": "https://example.com/audio/ich.mp3",
        "lerne": "https://example.com/audio/lerne.mp3",
        "Deutsch": "https://example.com/audio/deutsch.mp3"
    }

    complete_translation = "I am learning German."
    complete_translation_audio = "https://example.com/audio/ich_lerne_deutsch.mp3"
      
    response = {
        "text_reply": words,
        "translation": translations,
        "grammar_component": grammar_components,
        "audio": {
            "word_audio": [
                {"word": word, "audio_url": word_audio.get(word, "")} for word in words
            ],
            "complete_translation_audio": complete_translation_audio
        },
        "complete_translation": complete_translation
    }
    return response

