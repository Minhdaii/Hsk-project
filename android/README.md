# Chaina HSK Android

Native Android client written with Kotlin and Jetpack Compose. It calls the existing NestJS API; it does not embed the website in a WebView.

The native app includes sign in/sign up and learning onboarding; dashboard and HSK progress; vocabulary search, categories, and word details; grammar reference and server-graded grammar practice; flashcard quiz and SM-2 review; matching, sentence order, cloze, listening, dialogue, Pinyin Boss, and handwriting recognition; learning path, saved words, statistics, leaderboard, profile/study-preference editing, password changes, privacy/source information, and sign out. Session game scores stay local and do not fabricate XP or study progress. Account-backed review and grammar progress use the existing API.

## Open in Android Studio

Open this `android/` folder as a project, let Android Studio sync Gradle, then run the `app` configuration on an emulator or device. On Windows, the included `gradlew.bat` fetches the pinned Gradle 8.13 distribution from `services.gradle.org` on first use.

The emulator default API URL is `http://10.0.2.2:4000`, which reaches port 4000 on the development machine. Start the NestJS backend before signing in. A physical phone should use a reachable HTTPS API URL.

To set an API URL for a local build, add this to `android/gradle.properties` (or pass it as a Gradle property):

```properties
hskApiUrl=https://your-api-host.example
```

Cleartext HTTP is allowed only for the Android emulator host alias `10.0.2.2`; production builds should use HTTPS. HSK 1–3 learning data and account/session operations use the existing NestJS API. The handwriting screen sends the user's drawing to the existing recognition endpoint; it does not claim to teach stroke order.
