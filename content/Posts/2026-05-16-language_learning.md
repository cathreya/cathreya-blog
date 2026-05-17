---
title: Building a language learning tool that works for me
date: 2026-05-16
tags:
  - AI
  - LLM
  - language
---
I've had a list of things I've wanted to build for ages. Agentic coding tools have enabled me to will these into existence. After giving up multiple times trying to learn a language with Anki, I decided to build something myself.

# Motivation
Learning a new language requires you to balance vocabulary, grammar, and listening and pronunciation. But the biggest issue is actually using what you've learnt in conversation. When I was in high school, I spent 3 years learning German in classes, but spending 3 weeks in Frankfurt at one of Goethe-Institut's cultural programs taught me much more. The biggest part of that was the immersion. Being forced to use the language, however awkwardly, to get around and actually do things in the world really accelerates how quickly you learn.

Unfortunately, an app can't teleport you to Germany. However, another component to immersion is using the language to do things you would regularly. This is the Pareto principle at work. In my opinion, you can communicate 70% of the things you care about with 30% of the language's features. You will see this in a lot of these polyglot videos on YouTube, where a person spends a few weeks learning some basic phrases and can hold basic conversations with strangers they meet on the street. This isn't a cheap trick. If your goal is to communicate in a language, this is one of the best ways to learn a lot very quickly. One of the most common pieces of advice I've seen is to memorize the top X most frequent words in the language. 

The problem is vocabulary isn't the only aspect to learning a language. You need to know how to use that vocabulary in a sentence (grammar), how the vocabulary sounds (listening) and how to actually say those sentences (speaking). The language learners reading this would notice I skipped reading and writing, but my primary goal here is to hold a conversation. So I figured, what better way to learn than to record the things I say in my actual conversations!

# My Solution
So I wanted to build:
1. A way to record sentences I would say in my everyday conversations.
2. Translate them into my target language.
3. Extract the vocabulary I need to know.
4. Generate audio of a native speaker speaking that sentence.
5. Package all this in a way I could practice.
6. And do all this in a way that minimizes friction, because I am extremely lazy and it takes high activation energy for me to start something.

Here's the result:

<div style="display: flex; justify-content: center;">
  <video src="/static/vid/language-learner-demo-final.mp4" autoplay loop muted playsinline controls style="max-width: 360px; width: 100%; height: auto;"></video>
</div>

# Technical Details

The build itself was fully driven by Claude Code. I have my own variant of Gary Tan's GStack, which asks me leading questions and tries to distill the crux of what I wanted to build. Following that was iterating on the major design decisions.

## The Stack
1. The interface - my number one priority was to minimize the amount of time it takes for me to create a card. The reason Anki never worked for me (apart from me not having the discipline to actually do my reviews) was every time I opened the app, the cards would sync and I had to press 3 buttons to actually create a card. I wanted to remove any friction in the recording process. So I wanted something that would load up lightning fast and something I could use and forget. A Telegram bot fit this perfectly. The app would open up very quickly, I could message or send the bot a voice note and I was done. I deliberately separated the capture interface from the actual practice interface so I could keep capture lightning fast.
2. The AI - I decided to run Whisper on Groq for the voice notes. Groq is incredibly fast and has a free tier that is more than enough for my personal use. For the translation itself, I decided to use an LLM: transformers were built for translation after all. I settled on Mistral Large because I was mainly targeting European languages and the experiment tier was way more than my usage. Finally for the text-to-speech, I settled on Google's Cloud TTS, again for the generous free tier.
3. The plumbing - Since I was already using GCP, I settled on Google Cloud Run. Serverless was ideal for the occasional card addition and practice session. I could then use Google Cloud Storage to store the generated audio and Firestore to store the actual cards. For personal use all of this was so lightweight it was well under the generous free tier offering.
## Design Decisions
The logic itself is fairly simple. Telegram calls a webhook which spins up the server. The server pipes the audio to Whisper and retrieves the transcript. If the user texted, the text is directly sent to the server.

The transcript or text is sent to Mistral for processing. The advantage of using an LLM is that along with translation it can also perform the actual processing and transforms. First for the translation itself, Mistral is given a detailed prompt asking it to translate *intent* rather than word by word. An early example of something I ran into: in Italian, it would translate "today morning" as "oggi mattina", but an Italian would instead say "stamattina". Such nuances had to be highlighted in the prompt. This works particularly well for phrases like "it's raining cats and dogs", which translates to "piove a dirotto", roughly "it's raining heavily" in Italian. 

Second, the LLM is also responsible for extracting the vocabulary. This is useful because it can conjugate verbs in context or match the form and tense of words. It also makes the decision of what words to extract into cards. For instance, if it extracted "dormire" from a sentence it would create a vocab card for "dormire -> to sleep", but if it extracted the same word used as "ho dormito", it maintains the context and creates the card "ho dormito -> I slept".
 
The response is structured JSON. At the sentence level, the LLM is able to one-shot not just the translation but also generating the flashcards themselves. The server takes the produced cards and validates and post-processes them so that in the sentence, each word can be tapped to get the gloss.

Flashcards could be English -> Target or Target -> English and contain an example sentence. Each card gets some speech using GCP's TTS, which supports multiple languages natively by default. The generated audio is stored in GCP Cloud Storage, and the URL is attached to the card. Vocabulary cards are deduped to avoid regenerating the same cards, but different forms like "dormire" and "ho dormito" remain separate cards.

Everything for a captured utterance lives in a single Firestore `Capture` document: the transcript, target-language sentence, word translations, generated cards, practice state, status, errors, and audio URLs. That would not be the right schema for a large multi-user product, but for a single-user tool it made the system very easy to reason about. The pipeline is explicitly staged. The state machine looks like `pending -> transcribing -> translating -> tts -> ready/failed`. Any failed stages can be retried.

The practice UI is deliberately boring: FastAPI templates, vanilla HTML, CSS, JS. The cards are scheduled by the FSRS-6 algorithm, which has been an option in Anki since 2023. This is an actively maintained implementation and so I avoided reinventing the wheel here. To practice speaking I added a third type of card called a shadowing card, where you're simply expected to repeat the sentence. After revealing each answer, you rate it on a scale of *Again, Hard, Good, Easy*, and the algorithm schedules it for the next revision appropriately.

Put all together we have a seamless, low-friction capture to practice experience. Now all I have to do is actually use it :).

I’ve put the code on GitHub if you want to poke around or adapt it for your own target language: [language-learner](https://github.com/cathreya/language-learner).