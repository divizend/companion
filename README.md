# @divizend/companion

## Setup

- Copy `.env.example` to `.env`, fill in your ip and fusion auth configuration
- In FusionAuth, edit the application and under "Authorized redirect URLs", add `divizend://authcallback`

## Tasks

- [x] make sure that user registration is easy and works (improve FusionAuth styling when on mobile)
- [x] make logout work
- [x] support dark mode (probably through the color-related hooks in the `hooks` directory)
- [ ] during onboarding allow setting up FaceID, so that every time the user wants to open the Companion, they need to use FaceID (and some equivalent of that on Android)
  - [ ] just like many other apps, when setting up FaceID, the user should additionally also set up a four-digit code which they need to enter when they want to access the app, but FaceID is not available
- [ ] add Apple and Google one-click login
  - [ ] TODO: decide whether this should be from FusionAuth or from the app natively (i.e. directly in `app/main.tsx`), but probably from FusionAuth would be better
- [ ] add some sort of user interaction (or at least error) tracking (something like Mixpanel; maybe also Sentry. See which are the most modern offerings on the market for this)
- [ ] do load testing (i.e. whether the AI functionality in the backend still works fine, even with hundreds or thousands of users)
- [ ] allow SecAPI import
- [x] make sure that everything also works and looks good on Android
- [ ] implement AI-based feedback mechanism
- [ ] in ChatModal, resize content area appropriately when keyboard is shown
  - [ ] allow tapping down arrow while scrolling
  - [x] make streaming a lot smoother
  - [x] use Markdown, i.e. styling identical to ChatGPT
- [x] research best practices for in-app purchases in Expo
  - [x] also research https://developer.apple.com/help/app-store-connect/manage-subscriptions/manage-streamlined-purchasing to preferably use our existing subscription solution

## Possible features

- ask "What do the last financial numbers of this company mean?"
- a new feature shall appear in the main section for a week or so after release, but if the user doesn't use it until then, just hide it and wait until the user actually asks for it
- easter egg: "Tell the fairytale "Goldilocks and the Three Bears" with someone called "{user's name}" ({age} years, from {nationality}) instead of "Goldilocks" as the main character and focus on the "just right" lessons of the story" in a chat where the user doesn't see the prompt
- implement a debugger within the app which gets the current AI_CONTEXT as system message and then let's the user (i.e. the developer) chat with that
- allow sharing goals with others (to get to the "connect to others" functionality, you have to naturally get to a point where that is logical for one of your goals)
- fully automate i18n, i.e. use the ChatGPT API with prompts that include all necessary context (!) to automatically translate the app and the respective prompts in the backend into all the different languages we support
  - there should actually be two supported variants of German: either "du" or "Sie" (i.e. informal or formal addressing) and during onboarding, at least when the user uses the app in German, the user shall be able to select whether they want to be addressed with "du" or "Sie"
- on the backend, execute "Gib mir Fragen, die Leute häufig über {{company}} stellen" ("Give me questions which people often ask about {{company}}") and show these questions in the app
- intro email upon registering (similar to Perplexity, see https://drive.google.com/file/d/1_vdD8S_P3NhtUGdzhDHVYawmAl0GrH7P/view)

## Prompt engineering

- Ask me clarifying questions until you are 95% confident you can complete the task successfully.
- Remember to search the internet for up-to-date information.
- What's something most people wouldn't think of related to this topic?
- List 10 uncommon desires and fears people have about this topic?
- Now, take a deep breath and think it through step-by-step.

## Useful commands

Normal development:

```
npx expo run:ios
```

Alternatively, just start the Expo server and choose the device or simulator using Shift+I to run at afterwards:

```
npx expo start -c
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

Terminate the Companion running in the iOS simulator:

```
xcrun simctl terminate booted com.divizend.companion
```
