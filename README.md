# @divizend/companion

## Tasks

- make sure that user registration is easy and works
- add FaceID login
- add userId MongoDB index to AIChat and CompanionProfile
- do fully automated i18n
- add some sort of user interaction tracking
- onboarding: duzen/siezen, language

## Possible features

- ask "What do the last financial numbers of this company mean?"

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
