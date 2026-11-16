# MERCY PROMPTER
Offline teleprompter: React + TS + Vite + Tailwind, Electron (Windows), Capacitor (Android).

## Run
    npm install
    npm run dev            # browser
    npm run electron:dev   # desktop window

## Windows EXE (build on Windows)
    npm run dist:win       # installer in /release or /dist (electron-builder output)

## Android APK (needs Android Studio + JDK 17)
    npx cap add android    # first time only
    # in android/app/src/main/AndroidManifest.xml add:
    #   <uses-permission android:name="android.permission.CAMERA"/>
    #   <uses-permission android:name="android.permission.RECORD_AUDIO"/>
    #   <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS"/>
    npm run apk            # android/app/build/outputs/apk/debug/app-debug.apk

## Shortcuts
Space play/pause · ↑/↓ speed · Home restart · End jump to end · tap screen to toggle controls

## Troubleshooting
Camera denied: allow it in OS/app settings, then press Retry. Recording uses MediaRecorder (WebM); the button only shows where supported.
Not yet implemented: voice-following, current-paragraph highlight, virtualized rendering (very large scripts render as plain paragraphs).

## Get the APK without Android Studio
1. Create a free GitHub account and a new repository.
2. Upload every file in this folder (including the hidden `.github` folder).
3. Open the Actions tab, wait about 5 minutes for "Build APK" to finish, open the run, and download `MERCY-PROMPTER-apk` under Artifacts.
4. Unzip it, copy `app-debug.apk` to your phone, and install it (allow "install unknown apps").

## Floating widget (over other apps)
Android only. Tap "Floating" in the editor or studio. First time, allow "Display over other apps". The widget has drag bar, minimise, camera shortcut, close, play/pause, speed -/+, settings (A-/A+/BG/mirror) and expand. Native code lives in `native/` and is copied in by the GitHub workflow.
