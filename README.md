# @divizend/companion

## Tasks

- fix secure storage in production

- make sure that user registration is easy and works
- allow storing password instead of hiding login dialog immediately
- better styling: https://reactnativeelements.com/docs
- add FaceID login
- react-native-reanimated

## Possible features

- ask "What do the last financial numbers of this company mean?"

## Instructions

Normal development:

```
npx expo run:ios
```

Preview build:

```
eas build --profile preview --platform ios
```

Production build:

```
eas build --profile production --platform ios
eas submit --platform ios
```
