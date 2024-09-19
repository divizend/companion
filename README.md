# @divizend/companion

## Tasks

- make sure that user registration is easy and works
- add FaceID login
- do fully automated i18n (incl. duzen/siezen for German)
- add some sort of user interaction (or at least error) tracking
- onboarding: duzen/siezen, birthday (to have the age for the global AI context), language (?)
- allow sharing generated learning material
- rename app on home screen to Companion
- implement a debugger within the app which gets the current AI_CONTEXT as system message and then let's the user (i.e. the developer) chat with that
- easter egg: "Tell the fairytale "Goldilocks and the Three Bears" with someone called "Herbert" (42 years, from Germany) instead of "Goldilocks" as the main character and focus on the "just right" lessons of the story" in a chat where the user doesn't see the prompt
- to get to the "connect to others" functionality, you have to naturally get to a point where that is logical for one of your goals
- test that, in backend, MAX_QUESTIONS, MAX_INSIGHTS and MAX_GOALS work

## Possible features

- ask "What do the last financial numbers of this company mean?"
- a new feature shall appear in the main section for a week or so after release, but if the user doesn't use it until then, just hide it and wait until the user actually asks for it

## Next steps

1. Also ask the user for their age in the onboarding
2. Instead of immediately specifying learning goals, first turn all insights into goals
   a. Create a "goal configurator"
   b. "For now, don't think at all about how to realize this goal yet. Just make sure that the goal we formulate here is one you actually want to follow. It can be anything"
   c. always ask "What's wrong with this goal?"
3. "hide" specifiying custom goals behind an "advanced" section
4. Prompt-engineer the creation of "sub-goals"/"steps" so that they form a **causal** chain

## Instructions

Normal development:

```
npx expo run:ios
```

Preview build (internal distribution):

```
eas build --profile preview --platform ios
```

Production build:

```
eas build --profile production --platform ios
eas submit --platform ios
```

Register a new device and build for internal distribution (https://docs.expo.dev/build/internal-distribution/):

```
eas device:create
eas build --profile preview --platform ios
```

## Insights questions

Visions: What are your financial goals, dreams and aspirations?
Reality: What is your current financial situation?
Motivation: Why do you want to learn more about finance?
Emotions: How do financial topics currently make you feel?
Knowledge: What do you already know about finance?
Values: Which values guide your financial decision-making?
Interests: Which financial topics are you interested in?
Security: What do you need to feel financially secure?
Independence: In which areas of your financial life do you want to be more independent?
Habits: Which financial habits do you want to cultivate?
