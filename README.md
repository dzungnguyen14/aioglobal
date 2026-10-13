# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact


### When install new library native
run command
cd ios/
rm -rf pods
pod install --repo-update



### Run before build 
 npx expo prebuild --platform android --clean
 npx expo prebuild --platform ios --clean


### Clean space Xcode 
# check storage
df -h /

sudo killall -9 node xcodebuild
rm -rf ~/.expo

rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf ~/Library/Developer/Xcode/Archives
rm -rf ~/Library/Developer/Xcode/iOS\ DeviceSupport
rm -rf ~/Library/Caches/expo

rm -rf ios/build
rm -rf android/build

# build apk locally 
./gradlew assembleRelease --rerun-tasks
./gradlew bundleRelease

# clearn project
npx react-native-clean-project --remove-build --remove-cache --keep-node-modules


# fix bug callkeep 
https://github.com/react-native-webrtc/react-native-callkeep/pull/854/commits/30543ab831f276e16eb8074c213fc5630a1d4a49

rm -rf ~/Library/Developer/CoreSimulator

cd /Applications/MAMP/htdocs/app_aioglobal/android && ./gradlew --stop

rm -rf ~/.gradle/caches/8.14.3/groovy-dsl/87cec5c605d90746510f470759c6a495
      
rm -rf ~/.gradle/caches/8.14.3/groovy-dsl

./gradlew clean assembleDebug

adb install abc.apk