# @divizend/companion

## Setup

- In FusionAuth, edit the application and under "Authorized redirect URLs", add `divizend://authcallback`

## Tasks

- make sure that user registration is easy and works (improve FusionAuth styling when on mobile)
- support dark mode
- add FaceID login
- add Apple and Google one-click login
  - TODO: decide whether this should be from FusionAuth or from the app natively (i.e. directly in `app/main.tsx`), but probably from FusionAuth would be better
- add some sort of user interaction (or at least error) tracking (something like Mixpanel)
- do load testing (i.e. whether the AI functionality in the backend still works fine, even with hundreds or thousands of users)
- allow SecAPI import
- make sure that everything also works and looks good on Android

## Possible features

- ask "What do the last financial numbers of this company mean?"
- a new feature shall appear in the main section for a week or so after release, but if the user doesn't use it until then, just hide it and wait until the user actually asks for it
- easter egg: "Tell the fairytale "Goldilocks and the Three Bears" with someone called "{user's name}" ({age} years, from {nationality}) instead of "Goldilocks" as the main character and focus on the "just right" lessons of the story" in a chat where the user doesn't see the prompt
- implement a debugger within the app which gets the current AI_CONTEXT as system message and then let's the user (i.e. the developer) chat with that
- allow sharing goals with others (to get to the "connect to others" functionality, you have to naturally get to a point where that is logical for one of your goals)
- fully automate i18n, i.e. use the ChatGPT API with prompts that include all necessary context (!) to automatically translate the app and the respective prompts in the backend into all the different languages we support
  - there should actually be two supported variants of German: either "du" or "Sie" (i.e. informal or formal addressing) and during onboarding, at least when the user uses the app in German, the user shall be able to select whether they want to be addressed with "du" or "Sie"

## Useful commands

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
