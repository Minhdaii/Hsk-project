package com.chaina.hsk.ui

import android.content.Context
import android.speech.tts.TextToSpeech
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.AccountCircle
import androidx.compose.material.icons.rounded.AutoStories
import androidx.compose.material.icons.rounded.Bolt
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Email
import androidx.compose.material.icons.rounded.Explore
import androidx.compose.material.icons.rounded.Face
import androidx.compose.material.icons.rounded.Feedback
import androidx.compose.material.icons.rounded.Gavel
import androidx.compose.material.icons.rounded.Home
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Logout
import androidx.compose.material.icons.rounded.MenuBook
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.School
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material.icons.rounded.SportsEsports
import androidx.compose.material.icons.rounded.Star
import androidx.compose.material.icons.rounded.TaskAlt
import androidx.compose.material.icons.rounded.ThumbUp
import androidx.compose.material.icons.rounded.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chaina.hsk.R
import com.chaina.hsk.data.ApiClient
import com.chaina.hsk.data.ApiException
import com.chaina.hsk.data.LevelProgress
import com.chaina.hsk.data.Stats
import com.chaina.hsk.data.StudyCard
import com.chaina.hsk.data.TokenStore
import com.chaina.hsk.data.User
import com.chaina.hsk.data.Word
import com.chaina.hsk.ui.components.AnimatedStreakPill
import com.chaina.hsk.ui.components.InkCard
import com.chaina.hsk.ui.components.InkNavItem
import com.chaina.hsk.ui.components.InkPrimaryButton
import com.chaina.hsk.ui.components.InkTopBar
import com.chaina.hsk.ui.components.LevelBadge
import com.chaina.hsk.ui.components.MetricStatPill
import com.chaina.hsk.ui.components.ModernInkBottomBar
import com.chaina.hsk.ui.theme.AmberGold
import com.chaina.hsk.ui.theme.AmberSoft
import com.chaina.hsk.ui.theme.Brand
import com.chaina.hsk.ui.theme.BrandBorder
import com.chaina.hsk.ui.theme.BrandDark
import com.chaina.hsk.ui.theme.BrandSoft
import java.util.Locale
import com.chaina.hsk.ui.theme.InkBlack
import com.chaina.hsk.ui.theme.InkBorder
import com.chaina.hsk.ui.theme.InkCharcoal
import com.chaina.hsk.ui.theme.InkLight
import com.chaina.hsk.ui.theme.InkMuted
import com.chaina.hsk.ui.theme.InkTheme
import com.chaina.hsk.ui.theme.JadeGreen
import com.chaina.hsk.ui.theme.JadeBorder
import com.chaina.hsk.ui.theme.JadeSoft
import com.chaina.hsk.ui.theme.Paper
import com.chaina.hsk.ui.theme.PaperMuted
import com.chaina.hsk.ui.theme.PaperPure
import com.chaina.hsk.ui.theme.RedBad
import com.chaina.hsk.ui.theme.RedBorder
import com.chaina.hsk.ui.theme.RedSoft
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject

@Composable
fun ChainaApp(api: ApiClient, tokens: TokenStore) {
    InkTheme {
        val scope = rememberCoroutineScope()
        var user by remember { mutableStateOf<User?>(null) }
        var booting by remember { mutableStateOf(true) }
        var tab by remember { mutableStateOf(AppDestination.Home) }
        var hskLevel by remember { mutableIntStateOf(1) }
        var refreshKey by remember { mutableIntStateOf(0) }
        var stats by remember { mutableStateOf<Stats?>(null) }
        var levels by remember { mutableStateOf<List<LevelProgress>>(emptyList()) }
        var daily by remember { mutableStateOf<Word?>(null) }
        var dashboardLoading by remember { mutableStateOf(false) }
        var dashboardError by remember { mutableStateOf<String?>(null) }
        var onboarding by remember { mutableStateOf(false) }

        // Practice active minigame mode (match, order, cloze, listen, dialogue, quiz)
        var practiceMode by remember { mutableStateOf<String?>(null) }

        // Vocabulary top tab selector (Tra từ, Chủ đề, Ngữ pháp, Sổ từ)
        var vocabSubTab by remember { mutableIntStateOf(0) }
        // Progress top tab selector (Lộ trình, Thống kê, Xếp hạng)
        var progressSubTab by remember { mutableIntStateOf(0) }

        LaunchedEffect(Unit) {
            val token = withContext(Dispatchers.IO) { tokens.read() }
            if (token != null) {
                try {
                    user = api.me()
                } catch (error: ApiException) {
                    if (error.status == 401) withContext(Dispatchers.IO) { tokens.clear() }
                } catch (_: Exception) { }
            }
            booting = false
        }

        LaunchedEffect(user?.id, refreshKey) {
            if (user == null) return@LaunchedEffect
            dashboardLoading = true
            dashboardError = null
            try {
                val results = withContext(Dispatchers.IO) {
                    val fetchedStats = api.stats()
                    val fetchedLevels = api.levels()
                    val fetchedDaily = runCatching { api.dailyWord() }.getOrNull()
                    Triple(fetchedStats, fetchedLevels, fetchedDaily)
                }
                stats = results.first
                levels = results.second
                daily = results.third
            } catch (error: Exception) {
                dashboardError = error.message ?: "Không tải được dữ liệu học tập"
            }
            dashboardLoading = false
        }

        if (booting) {
            CleanLoadingScreen()
        } else {
            val currentUser = user
            if (currentUser == null) {
                AuthScreen(api = api) { token, signedInUser, isNew ->
                    withContext(Dispatchers.IO) { tokens.save(token) }
                    user = signedInUser
                    onboarding = isNew
                }
            } else {
                val signOut: () -> Unit = {
                    scope.launch {
                        withContext(Dispatchers.IO) { tokens.clear() }
                        user = null
                        stats = null
                        levels = emptyList()
                        daily = null
                        tab = AppDestination.Home
                    }
                }

                // Handle system back navigation gracefully
                val isSubScreen = (tab in listOf(
                    AppDestination.Review,
                    AppDestination.Writing,
                    AppDestination.PinyinBoss,
                    AppDestination.GrammarPractice,
                    AppDestination.Privacy,
                    AppDestination.Credits
                )) || (tab == AppDestination.Practice && practiceMode != null)

                BackHandler(enabled = isSubScreen) {
                    if (tab == AppDestination.Practice && practiceMode != null) {
                        practiceMode = null
                    } else when (tab) {
                        AppDestination.Review -> tab = AppDestination.Home
                        AppDestination.Writing, AppDestination.PinyinBoss, AppDestination.GrammarPractice -> tab = AppDestination.Practice
                        AppDestination.Privacy, AppDestination.Credits -> tab = AppDestination.Account
                        else -> tab = AppDestination.Home
                    }
                }

                val navItems = listOf(
                    InkNavItem("home", "Tổng quan", Icons.Rounded.Home),
                    InkNavItem("vocab", "Học tập", Icons.Rounded.AutoStories),
                    InkNavItem("practice", "Luyện tập", Icons.Rounded.SportsEsports),
                    InkNavItem("progress", "Lộ trình", Icons.Rounded.Explore),
                    InkNavItem("account", "Tài khoản", Icons.Rounded.AccountCircle),
                )

                val currentPrimaryNav = when (tab) {
                    AppDestination.Home, AppDestination.Review -> "home"
                    AppDestination.Words, AppDestination.Categories, AppDestination.Grammar, AppDestination.Favorites -> "vocab"
                    AppDestination.Practice, AppDestination.Writing, AppDestination.PinyinBoss, AppDestination.GrammarPractice -> "practice"
                    AppDestination.Path, AppDestination.Stats, AppDestination.Leaderboard -> "progress"
                    AppDestination.Account, AppDestination.Privacy, AppDestination.Credits -> "account"
                }

                Scaffold(
                    containerColor = Paper,
                    topBar = {
                        val title = when (tab) {
                            AppDestination.Home -> "Chaina HSK"
                            AppDestination.Review -> "Ôn tập SM-2"
                            AppDestination.Words, AppDestination.Categories, AppDestination.Grammar, AppDestination.Favorites -> "Kho từ vựng & Ngữ pháp"
                            AppDestination.Practice -> {
                                if (practiceMode != null) practiceTitle(practiceMode!!) else "Phòng luyện tập"
                            }
                            AppDestination.Writing -> "Luyện viết chữ Hán"
                            AppDestination.PinyinBoss -> "Pinyin Boss"
                            AppDestination.GrammarPractice -> "Luyện ngữ pháp"
                            AppDestination.Path, AppDestination.Stats, AppDestination.Leaderboard -> "Lộ trình & Thành tích"
                            AppDestination.Account -> "Hồ sơ cá nhân"
                            AppDestination.Privacy -> "Quyền riêng tư"
                            AppDestination.Credits -> "Nguồn dữ liệu"
                        }
                        val subtitle = when (tab) {
                            AppDestination.Home -> "Học tiếng Trung HSK 1–3"
                            AppDestination.Review -> "Cấp độ HSK $hskLevel · Lặp lại ngắt quãng"
                            AppDestination.Words, AppDestination.Categories, AppDestination.Grammar, AppDestination.Favorites -> "Tra từ, chủ đề, ngữ pháp và sổ tay"
                            AppDestination.Practice -> {
                                if (practiceMode != null) "Cấp độ HSK $hskLevel" else "Game phản xạ, ghép từ và thử thách"
                            }
                            AppDestination.Writing -> "Tập viết chữ Hán và nhận diện nét"
                            AppDestination.PinyinBoss -> "Thử thách gõ pinyin tốc độ cao · HSK $hskLevel"
                            AppDestination.GrammarPractice -> "Bài tập cấu trúc câu · HSK $hskLevel"
                            AppDestination.Path, AppDestination.Stats, AppDestination.Leaderboard -> "Hành trình và bảng xếp hạng học tập"
                            AppDestination.Account -> currentUser.email
                            else -> null
                        }

                        val onBackAction: (() -> Unit)? = if (tab == AppDestination.Practice && practiceMode != null) {
                            { practiceMode = null }
                        } else if (isSubScreen) {
                            {
                                when (tab) {
                                    AppDestination.Review -> tab = AppDestination.Home
                                    AppDestination.Writing, AppDestination.PinyinBoss, AppDestination.GrammarPractice -> tab = AppDestination.Practice
                                    AppDestination.Privacy, AppDestination.Credits -> tab = AppDestination.Account
                                    else -> tab = AppDestination.Home
                                }
                            }
                        } else null

                        InkTopBar(
                            title = title,
                            subtitle = subtitle,
                            onBack = onBackAction,
                            actions = {
                                if (tab == AppDestination.Home) {
                                    IconButton(
                                        onClick = { refreshKey++ },
                                        modifier = Modifier
                                            .size(38.dp)
                                            .clip(CircleShape)
                                            .background(PaperMuted)
                                    ) {
                                        Icon(
                                            Icons.Rounded.Refresh,
                                            contentDescription = "Tải lại",
                                            tint = InkBlack,
                                            modifier = Modifier.size(19.dp)
                                        )
                                    }
                                }
                            }
                        )
                    },
                    bottomBar = {
                        ModernInkBottomBar(
                            items = navItems,
                            selectedId = currentPrimaryNav,
                            onSelect = { navId ->
                                when (navId) {
                                    "home" -> tab = AppDestination.Home
                                    "vocab" -> {
                                        tab = when (vocabSubTab) {
                                            0 -> AppDestination.Words
                                            1 -> AppDestination.Categories
                                            2 -> AppDestination.Grammar
                                            else -> AppDestination.Favorites
                                        }
                                    }
                                    "practice" -> {
                                        practiceMode = null
                                        tab = AppDestination.Practice
                                    }
                                    "progress" -> {
                                        tab = when (progressSubTab) {
                                            0 -> AppDestination.Path
                                            1 -> AppDestination.Stats
                                            else -> AppDestination.Leaderboard
                                        }
                                    }
                                    "account" -> tab = AppDestination.Account
                                }
                            }
                        )
                    }
                ) { padding ->
                    Box(
                        Modifier
                            .fillMaxSize()
                            .padding(padding)
                    ) {
                        AnimatedContent(
                            targetState = tab,
                            transitionSpec = {
                                (fadeIn(animationSpec = tween(180, easing = LinearOutSlowInEasing)) +
                                        slideInHorizontally(animationSpec = tween(220, easing = FastOutSlowInEasing)) { it / 5 })
                                    .togetherWith(
                                        fadeOut(animationSpec = tween(150)) +
                                                slideOutHorizontally(animationSpec = tween(180)) { -it / 5 }
                                    )
                            },
                            label = "tab-screen-transition"
                        ) { targetTab ->
                            when (targetTab) {
                                AppDestination.Home -> HomeScreen(
                                    user = currentUser,
                                    stats = stats,
                                    levels = levels,
                                    daily = daily,
                                    loading = dashboardLoading,
                                    error = dashboardError,
                                    onRefresh = { refreshKey++ },
                                    onChooseLevel = { hskLevel = it; tab = AppDestination.Review },
                                    onExploreVocab = { tab = AppDestination.Words },
                                    onWriting = { tab = AppDestination.Writing },
                                    onBoss = { tab = AppDestination.PinyinBoss },
                                    onPractice = { tab = AppDestination.Practice },
                                    onFavorites = {
                                        vocabSubTab = 3
                                        tab = AppDestination.Favorites
                                    },
                                    onAccount = { tab = AppDestination.Account }
                                )
                                AppDestination.Words, AppDestination.Categories, AppDestination.Grammar, AppDestination.Favorites -> {
                                    Column(Modifier.fillMaxSize()) {
                                        val vocabTabs = listOf("Tra từ", "Chủ đề", "Ngữ pháp", "Sổ từ")
                                        val currentVocabIndex = when (targetTab) {
                                            AppDestination.Words -> 0
                                            AppDestination.Categories -> 1
                                            AppDestination.Grammar -> 2
                                            AppDestination.Favorites -> 3
                                            else -> 0
                                        }
                                        TabRow(
                                            selectedTabIndex = currentVocabIndex,
                                            containerColor = PaperPure,
                                            contentColor = Brand,
                                            indicator = { tabPositions ->
                                                TabRowDefaults.SecondaryIndicator(
                                                    Modifier.tabIndicatorOffset(tabPositions[currentVocabIndex]),
                                                    color = Brand,
                                                    height = 2.5.dp
                                                )
                                            },
                                            divider = { Box(Modifier.fillMaxWidth().height(1.dp).background(InkBorder)) }
                                        ) {
                                            vocabTabs.forEachIndexed { index, label ->
                                                Tab(
                                                    selected = currentVocabIndex == index,
                                                    onClick = {
                                                        vocabSubTab = index
                                                        tab = when (index) {
                                                            0 -> AppDestination.Words
                                                            1 -> AppDestination.Categories
                                                            2 -> AppDestination.Grammar
                                                            else -> AppDestination.Favorites
                                                        }
                                                    },
                                                    text = {
                                                        Text(
                                                            label,
                                                            fontSize = 13.sp,
                                                            fontWeight = if (currentVocabIndex == index) FontWeight.Bold else FontWeight.Medium,
                                                            color = if (currentVocabIndex == index) Brand else InkMuted,
                                                        )
                                                    }
                                                )
                                            }
                                        }

                                        Box(Modifier.fillMaxSize()) {
                                            when (targetTab) {
                                                AppDestination.Words -> WordsScreen(api)
                                                AppDestination.Categories -> CategoriesFeature(api)
                                                AppDestination.Grammar -> GrammarFeature(api)
                                                AppDestination.Favorites -> FavoritesFeature(api)
                                                else -> WordsScreen(api)
                                            }
                                        }
                                    }
                                }
                                AppDestination.Practice -> PracticeHubFeature(
                                    api = api,
                                    initialLevel = hskLevel,
                                    activeMode = practiceMode,
                                    onModeChange = { practiceMode = it },
                                    onWriting = { tab = AppDestination.Writing },
                                    onBoss = { tab = AppDestination.PinyinBoss },
                                    onGrammar = { tab = AppDestination.GrammarPractice }
                                )
                                AppDestination.Path, AppDestination.Stats, AppDestination.Leaderboard -> {
                                    Column(Modifier.fillMaxSize()) {
                                        val progressTabs = listOf("Lộ trình", "Thống kê", "Xếp hạng")
                                        val currentProgressIndex = when (targetTab) {
                                            AppDestination.Path -> 0
                                            AppDestination.Stats -> 1
                                            AppDestination.Leaderboard -> 2
                                            else -> 0
                                        }
                                        TabRow(
                                            selectedTabIndex = currentProgressIndex,
                                            containerColor = PaperPure,
                                            contentColor = Brand,
                                            indicator = { tabPositions ->
                                                TabRowDefaults.SecondaryIndicator(
                                                    Modifier.tabIndicatorOffset(tabPositions[currentProgressIndex]),
                                                    color = Brand,
                                                    height = 2.5.dp
                                                )
                                            },
                                            divider = { Box(Modifier.fillMaxWidth().height(1.dp).background(InkBorder)) }
                                        ) {
                                            progressTabs.forEachIndexed { index, label ->
                                                Tab(
                                                    selected = currentProgressIndex == index,
                                                    onClick = {
                                                        progressSubTab = index
                                                        tab = when (index) {
                                                            0 -> AppDestination.Path
                                                            1 -> AppDestination.Stats
                                                            else -> AppDestination.Leaderboard
                                                        }
                                                    },
                                                    text = {
                                                        Text(
                                                            label,
                                                            fontSize = 13.sp,
                                                            fontWeight = if (currentProgressIndex == index) FontWeight.Bold else FontWeight.Medium,
                                                            color = if (currentProgressIndex == index) Brand else InkMuted,
                                                        )
                                                    }
                                                )
                                            }
                                        }
                                        Box(Modifier.fillMaxSize()) {
                                            when (targetTab) {
                                                AppDestination.Path -> LearningPathFeature(onPractice = { hskLevel = it; tab = AppDestination.Practice })
                                                AppDestination.Stats -> StatisticsFeature(api)
                                                AppDestination.Leaderboard -> LeaderboardFeature(api)
                                                else -> LearningPathFeature(onPractice = { hskLevel = it; tab = AppDestination.Practice })
                                            }
                                        }
                                    }
                                }
                                AppDestination.Review -> StudyScreen(
                                    api = api,
                                    initialLevel = hskLevel,
                                    onStatsChanged = { refreshKey++ }
                                )
                                AppDestination.GrammarPractice -> GrammarPracticeFeature(api, hskLevel)
                                AppDestination.Writing -> WritingFeature(api)
                                AppDestination.PinyinBoss -> PinyinBossFeature(api, hskLevel)
                                AppDestination.Account -> AccountScreen(
                                    user = currentUser,
                                    api = api,
                                    onSaved = { user = it; refreshKey++ },
                                    onPrivacy = { tab = AppDestination.Privacy },
                                    onCredits = { tab = AppDestination.Credits },
                                    onLogout = signOut
                                )
                                AppDestination.Privacy, AppDestination.Credits -> InformationFeature(targetTab)
                            }
                        }
                    }
                }

                if (onboarding) {
                    OnboardingDialog(
                        api = api,
                        onDone = { updated ->
                            if (updated != null) user = updated
                            onboarding = false
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun CleanLoadingScreen() {
    val infiniteTransition = rememberInfiniteTransition(label = "loading-pulse")
    val bob by infiniteTransition.animateFloat(
        initialValue = -5f,
        targetValue = 5f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cat-bob"
    )

    Box(
        Modifier
            .fillMaxSize()
            .background(Paper)
            .windowInsetsPadding(WindowInsets.safeDrawing),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Image(
                painterResource(R.drawable.cat_head),
                contentDescription = "Đang tải",
                modifier = Modifier
                    .width(200.dp)
                    .graphicsLayer { translationY = bob }
            )
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = Brand,
                strokeWidth = 2.5.dp
            )
        }
    }
}

@Composable
private fun AuthScreen(api: ApiClient, onAuthenticated: suspend (String, User, Boolean) -> Unit) {
    val scope = rememberCoroutineScope()
    var registering by remember { mutableStateOf(false) }
    var identifier by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var fullName by remember { mutableStateOf("") }
    var chineseName by remember { mutableStateOf("") }
    var age by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirm by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    Column(
        Modifier
            .fillMaxSize()
            .background(Paper)
            .windowInsetsPadding(WindowInsets.safeDrawing)
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 22.dp, vertical = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(Modifier.height(20.dp))

        // Clean Official Chaina Logo (No redundant seal added)
        Image(
            painterResource(R.drawable.chaina_wordmark),
            contentDescription = "Chaina",
            modifier = Modifier.width(160.dp).height(52.dp)
        )

        Text(
            text = if (registering) "Tạo tài khoản mới" else "Chào mừng trở lại",
            fontSize = 25.sp,
            fontWeight = FontWeight.ExtraBold,
            color = InkBlack,
            modifier = Modifier.padding(top = 18.dp)
        )
        Text(
            text = if (registering) "Tạo Chaina ID để lưu tiến độ học tập trên mọi thiết bị." else "Đăng nhập để tiếp tục hành trình học tiếng Trung HSK.",
            color = InkMuted,
            fontSize = 13.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp, bottom = 22.dp)
        )

        InkCard(
            modifier = Modifier.widthIn(max = 500.dp).fillMaxWidth(),
            shapeRadius = 22.dp,
        ) {
            Column(
                Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(13.dp)
            ) {
                if (registering) {
                    ModernFormField(fullName, { fullName = it }, "Họ và tên")
                    ModernFormField(username, { username = it }, "Username")
                    ModernFormField(chineseName, { chineseName = it }, "Tên chữ Hán (không bắt buộc)")
                    ModernFormField(age, { age = it.filter(Char::isDigit) }, "Tuổi (không bắt buộc)", keyboard = KeyboardType.Number)
                    ModernFormField(email, { email = it }, "Email", keyboard = KeyboardType.Email)
                } else {
                    ModernFormField(identifier, { identifier = it }, "Email hoặc username")
                }
                ModernFormField(password, { password = it }, "Mật khẩu", password = true)
                if (registering) ModernFormField(confirm, { confirm = it }, "Xác nhận mật khẩu", password = true)

                error?.let { ErrorMessage(it) }

                InkPrimaryButton(
                    text = if (registering) "Tạo tài khoản" else "Đăng nhập",
                    onClick = {
                        scope.launch {
                            error = null
                            if (registering && (fullName.isBlank() || username.isBlank() || email.isBlank())) {
                                error = "Vui lòng nhập họ tên, username và email."; return@launch
                            }
                            if (!registering && identifier.isBlank()) {
                                error = "Vui lòng nhập email hoặc username của bạn."; return@launch
                            }
                            if (password.length < if (registering) 8 else 6) {
                                error = if (registering) "Mật khẩu cần ít nhất 8 ký tự." else "Mật khẩu cần ít nhất 6 ký tự."; return@launch
                            }
                            if (registering && confirm != password) {
                                error = "Mật khẩu xác nhận chưa khớp."; return@launch
                            }
                            val parsedAge = age.toIntOrNull()
                            if (registering && age.isNotBlank() && (parsedAge == null || parsedAge !in 10..100)) {
                                error = "Tuổi cần từ 10 đến 100."; return@launch
                            }
                            busy = true
                            try {
                                val (token, signedIn) = if (registering) {
                                    api.register(email.trim(), username.trim(), fullName.trim(), chineseName.trim().takeIf { it.isNotBlank() }, age.toIntOrNull(), password)
                                } else {
                                    api.login(identifier.trim(), password)
                                }
                                onAuthenticated(token, signedIn, registering)
                            } catch (e: Exception) {
                                error = e.message ?: "Không đăng nhập được."
                            }
                            busy = false
                        }
                    },
                    loading = busy,
                    modifier = Modifier.fillMaxWidth()
                )

                TextButton(
                    onClick = { registering = !registering; error = null },
                    modifier = Modifier.align(Alignment.CenterHorizontally)
                ) {
                    Text(
                        if (registering) "Đã có tài khoản? Đăng nhập ngay" else "Chưa có tài khoản? Đăng ký miễn phí",
                        color = Brand,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp
                    )
                }
            }
        }

        Spacer(Modifier.height(28.dp))
        Text(
            "HỌC TỪNG CHÚT · TIẾN BỘ MỖI NGÀY",
            fontSize = 10.sp,
            letterSpacing = 1.2.sp,
            color = InkMuted,
            fontWeight = FontWeight.Bold
        )
    }
}

data class ChainaAvatar(
    val id: String,
    val name: String,
    val emoji: String,
    val chineseName: String,
    val description: String,
    val isLimited: Boolean = false,
    val tag: String? = null,
    val gradientColors: List<Color>,
)

val AVATAR_COLLECTION = listOf(
    // Limited Editions
    ChainaAvatar("dragon", "Hoàng Long", "🐲", "金龙", "Rồng Vàng Hoàng Gia · Vương giả HSK", isLimited = true, tag = "LIMITED", gradientColors = listOf(Color(0xFFFFD700), Color(0xFFFFA500))),
    ChainaAvatar("phoenix", "Chu Tước", "🔥", "朱雀", "Phượng Hoàng Lửa · Tái sinh & Bất diệt", isLimited = true, tag = "LIMITED", gradientColors = listOf(Color(0xFFFF416C), Color(0xFFFF4B2B))),
    ChainaAvatar("scholar", "Trạng Nguyên", "👑", "状元", "Trạng Nguyên Bảng Nhãn · Đỉnh cao học vấn", isLimited = true, tag = "VIP", gradientColors = listOf(Color(0xFF8E2DE2), Color(0xFF4A00E0))),
    ChainaAvatar("palace", "Cố Cung", "🏯", "紫禁城", "Hoàng Thành Cố Cung · Bản sắc ngàn năm", isLimited = true, tag = "MYTHIC", gradientColors = listOf(Color(0xFFE65C00), Color(0xFFF9D423))),
    ChainaAvatar("monkey", "Mỹ Hầu Vương", "🐵", "美猴王", "Tề Thiên Đại Thánh · Trí dũng vô song", isLimited = true, tag = "EVENT", gradientColors = listOf(Color(0xFFFF8008), Color(0xFFFFC837))),
    ChainaAvatar("moon", "Nguyệt Lão", "🌙", "月老", "Trăng Rằm Viên Mãn · Trí tuệ thấu suốt", isLimited = true, tag = "LIMITED", gradientColors = listOf(Color(0xFF3A1C71), Color(0xFFD76D77))),

    // Mascot & Cultural Editions
    ChainaAvatar("cat", "Chiêu Tài Miêu", "🐱", "招财猫", "Mèo Thần Tài · May mắn & Khởi sắc", gradientColors = listOf(Color(0xFFF093FB), Color(0xFFF5576C))),
    ChainaAvatar("panda", "Bảo Bảo", "🐼", "宝贝熊", "Gấu Trúc Tứ Xuyên · Kiên trì & Đáng yêu", gradientColors = listOf(Color(0xFF43E97B), Color(0xFF38F9D7))),
    ChainaAvatar("fox", "Hồ Ly Tiên", "🦊", "小仙狐", "Linh Hồ Núi Tuyết · Nhanh nhẹn & Thông thái", gradientColors = listOf(Color(0xFFFA709A), Color(0xFFFEE140))),
    ChainaAvatar("brush", "Thư Pháp Sư", "🖌️", "书法家", "Nét Mực Thần Bút · Nền tảng Hán tự", gradientColors = listOf(Color(0xFF30CFD0), Color(0xFF330867))),
    ChainaAvatar("tea", "Trà Đạo Sư", "🍵", "茶艺师", "Bậc Thầy Trà Đạo · Thong dong tĩnh tại", gradientColors = listOf(Color(0xFF0BA360), Color(0xFF3CBA92))),
    ChainaAvatar("bamboo", "Tiểu Trúc Tiên", "🎋", "碧竹仙", "Trúc Xanh Tiết Tháo · Ngay thẳng vươn cao", gradientColors = listOf(Color(0xFF5EE7DF), Color(0xFFB490CA))),
)

fun getUserAvatar(context: Context): ChainaAvatar {
    val id = context.getSharedPreferences("chaina_prefs", Context.MODE_PRIVATE)
        .getString("user_avatar_id", "panda") ?: "panda"
    return AVATAR_COLLECTION.find { it.id == id } ?: AVATAR_COLLECTION[7]
}

fun saveUserAvatar(context: Context, avatarId: String) {
    context.getSharedPreferences("chaina_prefs", Context.MODE_PRIVATE)
        .edit().putString("user_avatar_id", avatarId).apply()
}

@Composable
private fun QuickFeatureCard(
    title: String,
    subtitle: String,
    badge: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    badgeColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    InkCard(
        modifier = modifier,
        onClick = onClick,
        shapeRadius = 18.dp,
        backgroundColor = PaperPure,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    modifier = Modifier.size(38.dp),
                    shape = RoundedCornerShape(12.dp),
                    color = BrandSoft,
                    border = BorderStroke(1.dp, BrandBorder)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = BrandDark,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
                Surface(
                    color = badgeColor.copy(alpha = 0.14f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = badge,
                        color = badgeColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Column(modifier = Modifier.padding(top = 2.dp)) {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = InkBlack,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = InkMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Composable
private fun DailyTaskRow(
    title: String,
    subtitle: String,
    done: Boolean,
    statusText: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick),
        color = if (done) PaperMuted.copy(alpha = 0.5f) else PaperPure,
        border = BorderStroke(1.dp, if (done) InkBorder.copy(alpha = 0.5f) else InkBorder),
        shape = RoundedCornerShape(14.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Surface(
                modifier = Modifier.size(34.dp),
                shape = CircleShape,
                color = if (done) JadeSoft else BrandSoft
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = if (done) Icons.Rounded.CheckCircle else icon,
                        contentDescription = null,
                        tint = if (done) JadeGreen else BrandDark,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = if (done) FontWeight.Medium else FontWeight.SemiBold,
                    color = if (done) InkMuted else InkBlack,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = subtitle,
                    fontSize = 11.sp,
                    color = InkMuted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Surface(
                color = if (done) JadeSoft else BrandSoft,
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = statusText,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (done) JadeGreen else BrandDark,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                )
            }
        }
    }
}

@Composable
private fun HomeScreen(
    user: User,
    stats: Stats?,
    levels: List<LevelProgress>,
    daily: Word?,
    loading: Boolean,
    error: String?,
    onRefresh: () -> Unit,
    onChooseLevel: (Int) -> Unit,
    onExploreVocab: () -> Unit,
    onWriting: () -> Unit,
    onBoss: () -> Unit,
    onPractice: () -> Unit,
    onFavorites: () -> Unit,
    onAccount: () -> Unit,
) {
    val context = LocalContext.current
    val tts = remember(context) { TextToSpeech(context) { } }
    DisposableEffect(tts) {
        onDispose {
            tts.stop()
            tts.shutdown()
        }
    }

    val timeGreeting = remember {
        val cal = java.util.Calendar.getInstance()
        val hour = cal.get(java.util.Calendar.HOUR_OF_DAY)
        val greeting = when (hour) {
            in 5..10 -> "Chào buổi sáng ☀️"
            in 11..13 -> "Chào buổi trưa 🌤️"
            in 14..17 -> "Chào buổi chiều 🍵"
            else -> "Chào buổi tối 🌙"
        }
        val dayOfWeek = when (cal.get(java.util.Calendar.DAY_OF_WEEK)) {
            java.util.Calendar.MONDAY -> "Thứ Hai"
            java.util.Calendar.TUESDAY -> "Thứ Ba"
            java.util.Calendar.WEDNESDAY -> "Thứ Tư"
            java.util.Calendar.THURSDAY -> "Thứ Năm"
            java.util.Calendar.FRIDAY -> "Thứ Sáu"
            java.util.Calendar.SATURDAY -> "Thứ Bảy"
            else -> "Chủ Nhật"
        }
        val dateStr = "$dayOfWeek, ${cal.get(java.util.Calendar.DAY_OF_MONTH)} thg ${cal.get(java.util.Calendar.MONTH) + 1}"
        greeting to dateStr
    }

    val dueCount = stats?.due ?: 0
    val targetLevel = user.targetHskLevel?.coerceIn(1, 3) ?: 1
    val isStudiedToday = stats?.studiedToday == true

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Welcome & Greeting Bar
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = timeGreeting.first,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = BrandDark
                )
                Text(
                    text = user.fullName?.substringBefore(' ')?.ifBlank { user.username } ?: user.username,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = InkBlack,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = "${timeGreeting.second} · Mỗi ngày một chút là đủ để tiến bộ.",
                    color = InkMuted,
                    fontSize = 12.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            val homeAvatar = remember(context) { getUserAvatar(context) }
            Surface(
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .clickable { onAccount() },
                color = Color.Transparent,
                border = BorderStroke(1.5.dp, if (homeAvatar.isLimited) AmberGold else BrandBorder),
                shape = CircleShape
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Brush.linearGradient(homeAvatar.gradientColors)),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = homeAvatar.emoji,
                        fontSize = 24.sp
                    )
                }
            }
        }

        // 2. Hero Action Card (Gradient Brand với hoa văn calligraphy)
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 22.dp,
            backgroundColor = BrandDark,
            borderColor = Color.Transparent,
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(
                        Brush.linearGradient(
                            colors = listOf(BrandDark, Color(0xFF4C33B8), Color(0xFF3F279E))
                        )
                    )
                    .padding(20.dp)
            ) {
                // Chữ Hán mờ nghệ thuật góc thẻ
                Text(
                    text = "学",
                    color = Color.White.copy(alpha = 0.12f),
                    fontSize = 88.sp,
                    fontWeight = FontWeight.Black,
                    lineHeight = 88.sp,
                    modifier = Modifier.align(Alignment.TopEnd)
                )

                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Box(
                                Modifier
                                    .size(7.dp)
                                    .background(Color(0xFF68D391), CircleShape)
                            )
                            Text(
                                "HÀNH TRÌNH HỌC HSK",
                                color = BrandSoft,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                letterSpacing = 1.3.sp
                            )
                        }
                        Text(
                            text = if (isStudiedToday) "Tuyệt vời! Bạn đã học hôm nay 🎉" else "Ôn tập thông minh SM-2 hôm nay",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 19.sp,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                        Text(
                            text = if (isStudiedToday) "Tiếp tục ôn luyện để nâng cao phản xạ tự nhiên." else "Thuật toán lặp lại ngắt quãng củng cố trí nhớ dài hạn.",
                            color = Color.White.copy(alpha = 0.82f),
                            fontSize = 12.sp,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }

                    // Stat pills
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        AnimatedStreakPill(
                            streakDays = stats?.streak ?: user.streak,
                            modifier = Modifier.weight(1f)
                        )
                        MetricStatPill(
                            symbol = "✦",
                            value = "${stats?.xp ?: user.xp}",
                            label = "XP tích lũy",
                            symbolColor = AmberGold,
                            modifier = Modifier.weight(1f)
                        )
                        MetricStatPill(
                            symbol = "⏳",
                            value = "$dueCount",
                            label = "từ đến hạn",
                            symbolColor = BrandSoft,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // CTA Button
                    Button(
                        onClick = { onChooseLevel(targetLevel) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color.White,
                            contentColor = BrandDark
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.PlayArrow,
                                contentDescription = null,
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(
                                text = "Bắt đầu ôn tập HSK $targetLevel ngay",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp
                            )
                        }
                    }
                }
            }
        }

        // 3. Lối tắt luyện tập thông minh (Quick Action Shortcuts - 4 ô bấm)
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            SectionTitle("Luyện tập & Kỹ năng", "Chế độ game và nhận diện tương tác")
            TextButton(onClick = onPractice) {
                Text("Xem tất cả ›", color = Brand, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickFeatureCard(
                title = "Luyện viết chữ Hán",
                subtitle = "Tập viết theo nét chuẩn",
                badge = "AI Canvas",
                icon = Icons.Rounded.Edit,
                badgeColor = Color(0xFF16875D),
                onClick = onWriting,
                modifier = Modifier.weight(1f)
            )
            QuickFeatureCard(
                title = "Pinyin Boss",
                subtitle = "Gõ phiên âm tốc độ",
                badge = "Game tốc độ",
                icon = Icons.Rounded.Bolt,
                badgeColor = AmberGold,
                onClick = onBoss,
                modifier = Modifier.weight(1f)
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            QuickFeatureCard(
                title = "Phòng game",
                subtitle = "Ghép từ, sắp xếp câu",
                badge = "6 dạng game",
                icon = Icons.Rounded.SportsEsports,
                badgeColor = Brand,
                onClick = onPractice,
                modifier = Modifier.weight(1f)
            )
            QuickFeatureCard(
                title = "Sổ từ vựng",
                subtitle = "Từ đánh dấu yêu thích",
                badge = "Sổ tay",
                icon = Icons.Rounded.Bookmark,
                badgeColor = Color(0xFF3182CE),
                onClick = onFavorites,
                modifier = Modifier.weight(1f)
            )
        }

        // 4. Nhiệm vụ hàng ngày (Daily Learning Tasks)
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 20.dp,
            backgroundColor = PaperPure
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                val tasksCompleted = (if (dueCount == 0) 1 else 0) + (if (isStudiedToday) 1 else 0)
                Row(
                    Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            "Nhiệm vụ hôm nay",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkBlack
                        )
                        Text(
                            text = "Duy trì thói quen để tiến bộ mỗi ngày",
                            fontSize = 12.sp,
                            color = InkMuted
                        )
                    }
                    Surface(
                        color = if (tasksCompleted == 2) JadeSoft else BrandSoft,
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            text = "$tasksCompleted / 2 hoàn thành",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (tasksCompleted == 2) JadeGreen else BrandDark,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }

                Box(Modifier.fillMaxWidth().height(1.dp).background(InkBorder))

                DailyTaskRow(
                    title = if (dueCount > 0) "Ôn $dueCount từ vựng đã đến hạn" else "Không có từ nào trễ hạn",
                    subtitle = if (dueCount > 0) "Thuật toán SM-2 nhắc nhở đúng thời điểm" else "Tất cả từ vựng đều được ôn đúng hạn",
                    done = dueCount == 0,
                    statusText = if (dueCount == 0) "Đạt 100%" else "$dueCount từ",
                    icon = Icons.Rounded.TaskAlt,
                    onClick = { onChooseLevel(targetLevel) }
                )

                DailyTaskRow(
                    title = if (isStudiedToday) "Đã duy trì chuỗi học hôm nay" else "Học ít nhất 1 bài để giữ chuỗi 🔥",
                    subtitle = if (isStudiedToday) "Chuỗi học hiện tại: ${stats?.streak ?: user.streak} ngày" else "Học đều đặn để không đứt chuỗi",
                    done = isStudiedToday,
                    statusText = if (isStudiedToday) "Đã xong" else "Cần học",
                    icon = Icons.Rounded.CheckCircle,
                    onClick = { onChooseLevel(targetLevel) }
                )
            }
        }

        // 5. HSK Levels Section
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            SectionTitle("Lộ trình cấp độ", "Chọn cấp để ôn theo thuật toán SM-2")
            TextButton(onClick = onExploreVocab) {
                Text("Kho từ vựng ›", color = Brand, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            (1..3).forEach { level ->
                val progress = levels.find { it.level == level }
                val totalWords = progress?.total ?: when (level) { 1 -> 506; 2 -> 750; else -> 953 }
                val startedWords = progress?.started ?: 0
                val masteredWords = progress?.mastered ?: 0
                val progressPercent = if (totalWords > 0) (masteredWords.toFloat() / totalWords.toFloat()).coerceIn(0f, 1f) else 0f
                val animatedProgress by animateFloatAsState(
                    targetValue = progressPercent,
                    animationSpec = tween(600, easing = FastOutSlowInEasing),
                    label = "level-progress"
                )

                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = { onChooseLevel(level) },
                    shapeRadius = 18.dp,
                ) {
                    Column(
                        Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            LevelBadge(
                                text = "HSK $level",
                                size = 44.dp,
                                fontSize = 12.sp,
                                solid = (level == targetLevel)
                            )
                            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text("Cấp độ HSK $level", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                                    if (level == targetLevel) {
                                        Surface(
                                            color = BrandSoft,
                                            shape = RoundedCornerShape(6.dp),
                                            border = BorderStroke(0.8.dp, BrandBorder)
                                        ) {
                                            Text(
                                                "Mục tiêu",
                                                color = BrandDark,
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                            )
                                        }
                                    }
                                }
                                Text(
                                    if (progress == null) "Đang tải tiến độ…"
                                    else "$startedWords đã học · $masteredWords thuộc (${(progressPercent * 100).toInt()}%)",
                                    fontSize = 12.sp,
                                    color = InkMuted
                                )
                            }
                            Text("›", color = Brand, fontSize = 26.sp, fontWeight = FontWeight.Bold)
                        }

                        LinearProgressIndicator(
                            progress = { animatedProgress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = Brand,
                            trackColor = PaperMuted,
                        )
                    }
                }
            }
        }

        // 6. Interactive Daily Word Card với Audio TTS
        daily?.let { word ->
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                SectionTitle("Chữ Hán hôm nay", "Chạm loa để nghe phát âm chuẩn")
                Surface(
                    color = BrandSoft,
                    shape = RoundedCornerShape(8.dp),
                    border = BorderStroke(1.dp, BrandBorder)
                ) {
                    Text(
                        "HSK ${word.hskLevel}",
                        color = BrandDark,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            InkCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = PaperPure,
                shapeRadius = 20.dp,
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(Modifier.weight(1f)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Text(
                                    text = word.hanzi,
                                    fontSize = 38.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = InkBlack
                                )
                                IconButton(
                                    onClick = {
                                        tts.language = Locale.SIMPLIFIED_CHINESE
                                        tts.speak(word.hanzi, TextToSpeech.QUEUE_FLUSH, null, "daily-tts")
                                    },
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape)
                                        .background(BrandSoft)
                                ) {
                                    Icon(
                                        imageVector = Icons.Rounded.VolumeUp,
                                        contentDescription = "Nghe phát âm",
                                        tint = BrandDark,
                                        modifier = Modifier.size(19.dp)
                                    )
                                }
                            }
                            Text(
                                text = word.pinyin,
                                color = Brand,
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }

                        word.hanviet?.let { hv ->
                            Surface(
                                color = PaperMuted,
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, InkBorder)
                            ) {
                                Text(
                                    text = hv.uppercase(),
                                    color = InkBlack,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                )
                            }
                        }
                    }

                    Box(
                        Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(InkBorder)
                    )

                    Text(
                        text = word.meaningVi.ifBlank { "Chưa có nghĩa tiếng Việt" },
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = InkBlack,
                        lineHeight = 20.sp
                    )
                }
            }
        }

        if (loading) LinearLoading()
        error?.let { ErrorMessage(it) }
        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun WordsScreen(api: ApiClient) {
    var query by remember { mutableStateOf("") }
    var submitted by remember { mutableStateOf("") }
    var level by remember { mutableIntStateOf(0) }
    var words by remember { mutableStateOf<List<Word>>(emptyList()) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var selected by remember { mutableStateOf<Word?>(null) }

    LaunchedEffect(level, submitted) {
        loading = true
        error = null
        try {
            words = api.words(level, submitted)
        } catch (e: Exception) {
            error = e.message ?: "Không tải được từ vựng."
        }
        loading = false
    }

    Column(
        Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.weight(1f),
                singleLine = true,
                shape = RoundedCornerShape(14.dp),
                placeholder = { Text("Tìm chữ Hán, pinyin, nghĩa…", fontSize = 13.sp, color = InkLight) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Brand,
                    unfocusedBorderColor = InkBorder,
                    focusedContainerColor = PaperPure,
                    unfocusedContainerColor = PaperPure,
                ),
                trailingIcon = {
                    if (query.isNotEmpty()) {
                        IconButton(onClick = { query = ""; submitted = "" }) {
                            Icon(Icons.Rounded.Close, contentDescription = "Xóa", tint = InkMuted, modifier = Modifier.size(18.dp))
                        }
                    }
                }
            )
            Spacer(Modifier.width(8.dp))
            Button(
                onClick = { submitted = query },
                contentPadding = PaddingValues(0.dp),
                modifier = Modifier.size(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Brand)
            ) {
                Icon(Icons.Rounded.Search, contentDescription = "Tìm", tint = Color.White)
            }
        }

        Row(
            Modifier.padding(top = 10.dp, bottom = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf(0 to "Tất cả", 1 to "HSK 1", 2 to "HSK 2", 3 to "HSK 3").forEach { (valLevel, label) ->
                val isSelected = level == valLevel
                FilterChip(
                    selected = isSelected,
                    onClick = { level = valLevel },
                    label = { Text(label, fontSize = 12.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = BrandSoft,
                        selectedLabelColor = BrandDark,
                        containerColor = PaperPure,
                        labelColor = InkMuted,
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = isSelected,
                        borderColor = if (isSelected) BrandBorder else InkBorder,
                    ),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        }

        error?.let { ErrorMessage(it) }

        if (loading && words.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Brand, strokeWidth = 2.5.dp)
            }
        } else if (!loading && words.isEmpty() && error == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Chưa tìm thấy từ phù hợp với từ khóa.", color = InkMuted, fontSize = 14.sp)
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(9.dp),
                contentPadding = PaddingValues(top = 4.dp, bottom = 20.dp)
            ) {
                items(words, key = { it.id }) { word ->
                    WordRow(word, Modifier.fillMaxWidth().clickable { selected = word })
                }
                if (loading) {
                    item { LinearLoading() }
                }
            }
        }
    }

    selected?.let { word ->
        AlertDialog(
            onDismissRequest = { selected = null },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(word.hanzi, fontSize = 40.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    LevelBadge("HSK ${word.hskLevel}", size = 32.dp, fontSize = 10.sp)
                }
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(word.pinyin, color = Brand, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                    Text(word.meaningVi.ifBlank { "Chưa có nghĩa tiếng Việt." }, fontSize = 15.sp, color = InkBlack)
                    word.hanviet?.let {
                        Text("Âm Hán Việt: $it", color = InkMuted, fontSize = 13.sp)
                    }
                    Text("Cấp độ: HSK ${word.hskLevel}", color = InkMuted, fontSize = 12.sp)
                }
            },
            confirmButton = {
                TextButton(onClick = { selected = null }) {
                    Text("Đóng", color = Brand, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = PaperPure,
            shape = RoundedCornerShape(20.dp),
        )
    }
}

@Composable
private fun StudyScreen(api: ApiClient, initialLevel: Int, onStatsChanged: () -> Unit) {
    var level by remember { mutableIntStateOf(initialLevel.coerceIn(1, 3)) }
    var key by remember { mutableIntStateOf(0) }
    var deck by remember { mutableStateOf<List<StudyCard>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var selected by remember { mutableIntStateOf(-1) }
    var answeredCorrect by remember { mutableStateOf<Boolean?>(null) }
    var retryCard by remember { mutableStateOf<StudyCard?>(null) }
    var completed by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(level, key) {
        loading = true
        error = null
        deck = emptyList()
        selected = -1
        answeredCorrect = null
        retryCard = null
        completed = 0
        try {
            deck = api.studySession(level)
        } catch (e: Exception) {
            error = e.message ?: "Không tải được phiên ôn tập."
        }
        loading = false
    }

    val card = deck.firstOrNull()

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        Row(
            Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                (1..3).forEach { lvl ->
                    val isSelected = level == lvl
                    FilterChip(
                        selected = isSelected,
                        onClick = { level = lvl },
                        label = { Text("HSK $lvl", fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = BrandSoft,
                            selectedLabelColor = BrandDark,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isSelected) BrandBorder else InkBorder,
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
            IconButton(
                onClick = { key++ },
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(PaperMuted)
            ) {
                Icon(Icons.Rounded.Refresh, contentDescription = "Làm mới", tint = InkBlack, modifier = Modifier.size(19.dp))
            }
        }

        if (loading) {
            Box(Modifier.fillMaxWidth().height(280.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = Brand, strokeWidth = 2.5.dp)
            }
        } else if (error != null) {
            ErrorMessage(error!!)
            InkPrimaryButton(text = "Thử lại", onClick = { key++ })
        } else if (card == null) {
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 22.dp
            ) {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(26.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("🎉", fontSize = 42.sp)
                    Text(
                        if (completed > 0) "Hoàn thành phiên học!" else "Hôm nay đã ôn hết rồi",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkBlack
                    )
                    Text(
                        if (completed > 0) "Bạn đã hoàn thành $completed thẻ. Lịch lặp lại ngắt quãng đã được cập nhật." else "Tất cả các từ đến hạn đã được ôn tập. Hãy nghỉ ngơi hoặc luyện tập thêm các minigame.",
                        color = InkMuted,
                        fontSize = 13.sp,
                        textAlign = TextAlign.Center
                    )
                    InkPrimaryButton(
                        text = "Tải phiên học mới",
                        onClick = { key++ },
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                    )
                }
            }
        } else {
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 24.dp,
            ) {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            color = BrandSoft,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(0.8.dp, BrandBorder)
                        ) {
                            Text(
                                "CÒN ${deck.size} THẺ",
                                color = BrandDark,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                letterSpacing = 1.1.sp,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                            )
                        }
                        LevelBadge("HSK $level", size = 28.dp, fontSize = 9.sp, solid = false)
                    }

                    Text(
                        card.word.hanzi,
                        fontSize = 64.sp,
                        fontWeight = FontWeight.Medium,
                        color = InkBlack,
                        modifier = Modifier.padding(top = 16.dp, bottom = 4.dp)
                    )
                    Text(
                        card.word.pinyin,
                        color = Brand,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        "Chọn nghĩa tiếng Việt đúng",
                        color = InkMuted,
                        fontSize = 13.sp,
                        modifier = Modifier.padding(top = 8.dp, bottom = 14.dp)
                    )

                    val options = card.options.ifEmpty {
                        listOf(
                            com.chaina.hsk.data.StudyOption("Tôi nhớ từ này", true),
                            com.chaina.hsk.data.StudyOption("Tôi chưa nhớ", false)
                        )
                    }

                    options.forEachIndexed { index, option ->
                        val chosen = selected == index
                        val isCorrect = option.correct
                        val resultBorder = when {
                            answeredCorrect == null -> InkBorder
                            chosen && answeredCorrect == true -> JadeGreen
                            chosen && answeredCorrect == false -> RedBad
                            answeredCorrect == false && isCorrect -> JadeGreen
                            else -> InkBorder
                        }
                        val resultBg = when {
                            answeredCorrect == null -> PaperPure
                            chosen && answeredCorrect == true -> JadeSoft
                            chosen && answeredCorrect == false -> RedSoft
                            answeredCorrect == false && isCorrect -> JadeSoft
                            else -> PaperPure
                        }

                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 5.dp)
                                .clickable(enabled = !busy && answeredCorrect == null) {
                                    selected = index
                                    busy = true
                                    scope.launch {
                                        try {
                                            val correct = option.correct
                                            val rating = if (!correct) 0 else if (card.retry) 1 else 2
                                            api.review(card.word.id, rating)
                                            answeredCorrect = correct
                                            if (!correct) retryCard = card.copy(retry = true)
                                            if (correct) completed++
                                            onStatsChanged()
                                        } catch (e: Exception) {
                                            error = e.message ?: "Không lưu được lượt ôn."
                                            selected = -1
                                        }
                                        busy = false
                                    }
                                },
                            shape = RoundedCornerShape(14.dp),
                            color = resultBg,
                            border = BorderStroke(if (chosen || (answeredCorrect == false && isCorrect)) 1.8.dp else 1.dp, resultBorder),
                            shadowElevation = if (chosen) 2.dp else 0.dp
                        ) {
                            Row(
                                Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 13.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Surface(
                                    color = if (chosen || (answeredCorrect == false && isCorrect)) Color.White else PaperMuted,
                                    shape = CircleShape,
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            "${'A' + index}",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (chosen && answeredCorrect == true) JadeGreen else if (chosen && answeredCorrect == false) RedBad else BrandDark
                                        )
                                    }
                                }
                                Text(
                                    option.text,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = InkBlack,
                                    modifier = Modifier.padding(start = 12.dp)
                                )
                            }
                        }
                    }

                    if (busy) {
                        CircularProgressIndicator(
                            Modifier.padding(top = 10.dp).size(22.dp),
                            strokeWidth = 2.2.dp,
                            color = Brand
                        )
                    }

                    if (answeredCorrect != null) {
                        Text(
                            if (answeredCorrect == true) "Chính xác! Đã cập nhật lịch ôn." else "Chưa chính xác. Từ này sẽ xuất hiện lại cuối phiên học.",
                            color = if (answeredCorrect == true) JadeGreen else RedBad,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp,
                            modifier = Modifier.padding(top = 10.dp)
                        )
                        InkPrimaryButton(
                            text = if (deck.size == 1) "Hoàn tất phiên học" else "Tiếp tục thẻ tiếp theo ›",
                            onClick = {
                                val rest = deck.drop(1).toMutableList()
                                retryCard?.let(rest::add)
                                deck = rest
                                selected = -1
                                answeredCorrect = null
                                retryCard = null
                                error = null
                            },
                            modifier = Modifier.fillMaxWidth().padding(top = 10.dp)
                        )
                    }

                    error?.let { ErrorMessage(it) }
                }
            }
        }
    }
}

@Composable
private fun AccountSectionCard(
    title: String,
    content: @Composable ColumnScope.() -> Unit,
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = title.uppercase(),
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            color = InkMuted,
            letterSpacing = 1.1.sp,
            modifier = Modifier.padding(start = 4.dp, bottom = 2.dp)
        )
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 20.dp,
            backgroundColor = PaperPure
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 6.dp),
                content = content
            )
        }
    }
}

@Composable
private fun AccountMenuItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconBg: Color = BrandSoft,
    iconTint: Color = BrandDark,
    title: String,
    subtitle: String? = null,
    trailingBadge: String? = null,
    trailingBadgeColor: Color = Brand,
    onClick: () -> Unit,
) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick),
        color = Color.Transparent
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 10.dp, horizontal = 2.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Surface(
                modifier = Modifier.size(38.dp),
                shape = RoundedCornerShape(10.dp),
                color = iconBg,
                border = BorderStroke(1.dp, iconBg.copy(alpha = 0.5f))
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        tint = iconTint,
                        modifier = Modifier.size(19.dp)
                    )
                }
            }

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = InkBlack,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        fontSize = 11.sp,
                        color = InkMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            if (trailingBadge != null) {
                Surface(
                    color = trailingBadgeColor.copy(alpha = 0.12f),
                    shape = RoundedCornerShape(6.dp)
                ) {
                    Text(
                        text = trailingBadge,
                        color = trailingBadgeColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Text(
                text = "›",
                color = InkMuted,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun AvatarPickerDialog(
    currentAvatarId: String,
    onSelect: (ChainaAvatar) -> Unit,
    onDismiss: () -> Unit,
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val filteredAvatars = remember(selectedTab) {
        when (selectedTab) {
            1 -> AVATAR_COLLECTION.filter { it.isLimited }
            2 -> AVATAR_COLLECTION.filter { !it.isLimited }
            else -> AVATAR_COLLECTION
        }
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Bộ sưu tập Avatar", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = InkBlack)
                    Surface(color = AmberGold.copy(alpha = 0.15f), shape = RoundedCornerShape(8.dp)) {
                        Text("LIMITED ✨", color = AmberGold, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                    }
                }
                Text("Chọn ảnh đại diện thể hiện cá tính của bạn.", color = InkMuted, fontSize = 12.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Filter tabs
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("Tất cả (12)", "⭐ Giới hạn (6)", "🎋 Linh vật (6)").forEachIndexed { index, title ->
                        val isSelected = selectedTab == index
                        FilterChip(
                            selected = isSelected,
                            onClick = { selectedTab = index },
                            label = { Text(title, fontSize = 11.sp, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = BrandSoft,
                                selectedLabelColor = BrandDark
                            ),
                            shape = RoundedCornerShape(10.dp)
                        )
                    }
                }

                // Avatar Cards Grid (2 columns)
                val chunked = filteredAvatars.chunked(2)
                chunked.forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        pair.forEach { avatar ->
                            val isChosen = avatar.id == currentAvatarId
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(16.dp))
                                    .clickable { onSelect(avatar) },
                                color = if (isChosen) BrandSoft.copy(alpha = 0.6f) else PaperPure,
                                border = BorderStroke(
                                    if (isChosen) 2.dp else 1.dp,
                                    if (isChosen) Brand else if (avatar.isLimited) AmberGold.copy(alpha = 0.5f) else InkBorder
                                ),
                                shape = RoundedCornerShape(16.dp)
                            ) {
                                Column(
                                    modifier = Modifier.padding(10.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(54.dp)
                                            .clip(CircleShape)
                                            .background(Brush.linearGradient(avatar.gradientColors)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(avatar.emoji, fontSize = 28.sp)
                                    }

                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                                        ) {
                                            Text(
                                                avatar.name,
                                                fontSize = 12.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = InkBlack,
                                                maxLines = 1,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                        }
                                        Text(
                                            avatar.chineseName,
                                            fontSize = 10.sp,
                                            color = Brand,
                                            fontWeight = FontWeight.Bold
                                        )
                                        if (avatar.isLimited) {
                                            Surface(
                                                color = AmberGold.copy(alpha = 0.15f),
                                                shape = RoundedCornerShape(4.dp),
                                                modifier = Modifier.padding(top = 2.dp)
                                            ) {
                                                Text(
                                                    avatar.tag ?: "LIMITED",
                                                    fontSize = 8.sp,
                                                    fontWeight = FontWeight.ExtraBold,
                                                    color = AmberGold,
                                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 1.dp)
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        if (pair.size == 1) {
                            Spacer(Modifier.weight(1f))
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Đóng", fontWeight = FontWeight.Bold, color = Brand)
            }
        }
    )
}

@Composable
private fun ChangePasswordDialog(
    api: ApiClient,
    onDismiss: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var successMessage by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        title = {
            Column {
                Text("Đổi mật khẩu", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = InkBlack)
                Text("Bảo vệ tài khoản bằng mật khẩu an toàn", color = InkMuted, fontSize = 12.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ModernFormField(currentPassword, { currentPassword = it }, "Mật khẩu hiện tại", password = true)
                ModernFormField(newPassword, { newPassword = it }, "Mật khẩu mới (ít nhất 8 ký tự)", password = true)
                ModernFormField(confirmPassword, { confirmPassword = it }, "Xác nhận mật khẩu mới", password = true)

                error?.let { ErrorMessage(it) }
                successMessage?.let { Text(it, color = JadeGreen, fontSize = 13.sp, fontWeight = FontWeight.Bold) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    scope.launch {
                        error = null
                        successMessage = null
                        if (currentPassword.isBlank() || newPassword.length < 8) {
                            error = "Mật khẩu mới phải có ít nhất 8 ký tự."
                            return@launch
                        }
                        if (newPassword != confirmPassword) {
                            error = "Mật khẩu xác nhận không khớp."
                            return@launch
                        }
                        busy = true
                        try {
                            api.changePassword(currentPassword, newPassword)
                            successMessage = "Đổi mật khẩu thành công!"
                            kotlinx.coroutines.delay(900)
                            onDismiss()
                        } catch (e: Exception) {
                            error = e.message ?: "Không thể đổi mật khẩu. Hãy kiểm tra lại mật khẩu cũ."
                        }
                        busy = false
                    }
                },
                enabled = !busy,
                colors = ButtonDefaults.buttonColors(containerColor = Brand)
            ) {
                Text(if (busy) "Đang lưu…" else "Cập nhật", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !busy) {
                Text("Hủy", color = InkMuted)
            }
        }
    )
}

@Composable
private fun EditProfileDialog(
    user: User,
    api: ApiClient,
    onSaved: (User) -> Unit,
    onDismiss: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var fullName by remember { mutableStateOf(user.fullName.orEmpty()) }
    var username by remember { mutableStateOf(user.username) }
    var chineseName by remember { mutableStateOf(user.chineseName.orEmpty()) }
    var age by remember { mutableStateOf(user.age?.toString().orEmpty()) }
    var experience by remember { mutableStateOf(user.learningExperience ?: "new") }
    var purpose by remember { mutableStateOf(user.studyPurpose ?: "conversation") }
    var target by remember { mutableStateOf((user.targetHskLevel ?: 1).toString()) }
    var minutes by remember { mutableStateOf((user.dailyStudyMinutes ?: 20).toString()) }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        title = {
            Column {
                Text("Chỉnh sửa hồ sơ học tập", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = InkBlack)
                Text("Cập nhật thông tin và mục tiêu HSK", color = InkMuted, fontSize = 12.sp)
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                ModernFormField(fullName, { fullName = it }, "Họ và tên")
                ModernFormField(username, { username = it }, "Tên tài khoản (username)")
                ModernFormField(chineseName, { chineseName = it }, "Tên chữ Hán (nếu có)")
                ModernFormField(age, { age = it.filter(Char::isDigit) }, "Tuổi", keyboard = KeyboardType.Number)
                SelectField("Mục tiêu HSK", target, (1..6).map { it.toString() to "HSK $it" }) { target = it }
                SelectField("Thời gian học mỗi ngày", minutes, listOf("10" to "10 phút", "20" to "20 phút", "30" to "30 phút", "45" to "45 phút", "60" to "60 phút")) { minutes = it }
                SelectField("Kinh nghiệm học", experience, listOf("new" to "Chưa học bao giờ", "pinyin" to "Biết pinyin và vài từ", "basic" to "Đã học cơ bản", "intermediate" to "Có nền tảng", "advanced" to "Khá vững")) { experience = it }
                SelectField("Mục tiêu học", purpose, listOf("exam" to "Thi chứng chỉ HSK", "conversation" to "Giao tiếp hàng ngày", "travel" to "Du lịch Trung Quốc", "work" to "Công việc / Du học", "interest" to "Vì đam mê văn hóa")) { purpose = it }

                error?.let { ErrorMessage(it) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    scope.launch {
                        busy = true
                        error = null
                        try {
                            val body = JSONObject()
                                .put("fullName", fullName.trim())
                                .put("username", username.trim())
                                .put("chineseName", chineseName.trim().takeIf { it.isNotBlank() } ?: JSONObject.NULL)
                                .put("age", age.toIntOrNull() ?: JSONObject.NULL)
                                .put("learningExperience", experience)
                                .put("studyPurpose", purpose)
                                .put("targetHskLevel", target.toInt())
                                .put("dailyStudyMinutes", minutes.toInt())
                            val updated = api.updateProfile(body)
                            onSaved(updated)
                            onDismiss()
                        } catch (e: Exception) {
                            error = e.message ?: "Không lưu được hồ sơ."
                        }
                        busy = false
                    }
                },
                enabled = !busy,
                colors = ButtonDefaults.buttonColors(containerColor = Brand)
            ) {
                Text(if (busy) "Đang lưu…" else "Lưu thay đổi", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !busy) {
                Text("Hủy", color = InkMuted)
            }
        }
    )
}

@Composable
private fun LegalInfoDialog(
    type: String, // "privacy" | "terms" | "credits" | "about"
    onDismiss: () -> Unit,
) {
    val title = when (type) {
        "privacy" -> "Chính sách quyền riêng tư"
        "terms" -> "Bản quyền & Điều khoản dịch vụ"
        "credits" -> "Nguồn dữ liệu từ vựng HSK"
        else -> "Về nền tảng Chaina HSK"
    }

    val content = when (type) {
        "privacy" -> """
            1. Thu thập dữ liệu tối thiểu
            Chaina HSK chỉ lưu trữ thông tin cần thiết: email đăng nhập, tên hiển thị và dữ liệu tiến độ học tập (chuỗi học, từ vựng đã nhớ theo thuật toán SM-2).
            
            2. Bảo mật phần cứng Android
            Mọi phiên đăng nhập và token xác thực được mã hóa bằng chip bảo mật phần cứng AndroidKeyStore (AES-GCM 128-bit).
            
            3. Không chia sẻ dữ liệu
            Chúng tôi cam kết không bán, không chia sẻ dữ liệu học tập cá nhân cho bất kỳ bên thứ ba nào. Mọi kết nối mạng đều được mã hóa chuẩn HTTPS / TLS.
        """.trimIndent()
        "terms" -> """
            1. Quyền sở hữu trí tuệ
            Toàn bộ giao diện, thiết kế Modern Ink Editorial, mã nguồn ứng dụng Android và hệ thống nhận diện thương hiệu Chaina thuộc bản quyền của dự án Chaina HSK.
            
            2. Mục đích phi thương mại & Giáo dục
            Nền tảng được phát triển nhằm mục đích phục vụ cộng đồng người học tiếng Trung tại Việt Nam học tập hiệu quả, ghi nhớ từ vựng sâu sắc.
            
            3. Trách nhiệm người dùng
            Người dùng cam kết không sử dụng ứng dụng vào các hành vi can thiệp trái phép, tấn công hệ thống hoặc khai thác dịch vụ ngoài mục đích học tập.
        """.trimIndent()
        "credits" -> """
            Chaina HSK trân trọng ghi nhận và tri ân các dự án nguồn mở và dữ liệu chuẩn mực:
            
            • CC-CEDICT: Cơ sở dữ liệu từ điển Hán - Anh toàn diện nhất.
            • CVDICT (ph0ngp): Dự án từ điển Hán - Việt mã nguồn mở.
            • Hanzi Writer: Thuật toán và dữ liệu nét bút chữ Hán chuẩn nét.
            • Tatoeba Project: Ngân hàng câu ví dụ song ngữ ngữ cảnh thực tế.
            • Complete HSK Vocabulary: Bộ từ vựng HSK 1–3 chuẩn hóa.
        """.trimIndent()
        else -> """
            Chaina HSK — Ứng dụng học tiếng Trung theo phong cách Modern Ink Editorial.
            
            • Phiên bản: 1.0.0 (Release)
            • Ngôn ngữ: Kotlin, Jetpack Compose, Material 3
            • Thuật toán ôn tập: SM-2 Spaced Repetition
            • AI Canvas: Nhận diện nét viết thư pháp
            
            Chúc bạn có một hành trình chinh phục tiếng Trung tràn đầy cảm hứng và hiệu quả!
        """.trimIndent()
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = InkBlack) },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                Text(content, fontSize = 13.sp, color = InkBlack, lineHeight = 20.sp)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Đã hiểu", fontWeight = FontWeight.Bold, color = Brand)
            }
        }
    )
}

@Composable
private fun FeedbackDialog(onDismiss: () -> Unit) {
    var content by remember { mutableStateOf("") }
    var sent by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Column {
                Text("Đóng góp ý kiến & Báo lỗi", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = InkBlack)
                Text("Ý kiến của bạn giúp Chaina HSK ngày càng tốt hơn", color = InkMuted, fontSize = 12.sp)
            }
        },
        text = {
            if (sent) {
                Column(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("🎉", fontSize = 42.sp)
                    Text("Cảm ơn đóng góp của bạn!", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = InkBlack)
                    Text("Đội ngũ phát triển đã nhận được phản hồi và sẽ xử lý sớm nhất.", fontSize = 12.sp, color = InkMuted, textAlign = TextAlign.Center)
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = content,
                        onValueChange = { content = it },
                        placeholder = { Text("Nhập phản hồi, góp ý tính năng hoặc lỗi bạn gặp phải…", fontSize = 13.sp) },
                        modifier = Modifier.fillMaxWidth().height(140.dp),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }
        },
        confirmButton = {
            if (sent) {
                Button(onClick = onDismiss, colors = ButtonDefaults.buttonColors(containerColor = Brand)) {
                    Text("Đóng")
                }
            } else {
                Button(
                    onClick = { if (content.isNotBlank()) sent = true },
                    enabled = content.isNotBlank(),
                    colors = ButtonDefaults.buttonColors(containerColor = Brand)
                ) {
                    Text("Gửi phản hồi")
                }
            }
        },
        dismissButton = {
            if (!sent) {
                TextButton(onClick = onDismiss) { Text("Hủy", color = InkMuted) }
            }
        }
    )
}

@Composable
private fun AccountScreen(
    user: User,
    api: ApiClient,
    onSaved: (User) -> Unit,
    onPrivacy: () -> Unit,
    onCredits: () -> Unit,
    onLogout: () -> Unit,
) {
    val context = LocalContext.current
    var avatarKey by remember { mutableIntStateOf(0) }
    var currentAvatar by remember(avatarKey) { mutableStateOf(getUserAvatar(context)) }

    var showAvatarPicker by remember { mutableStateOf(false) }
    var showChangePassword by remember { mutableStateOf(false) }
    var showEditProfile by remember { mutableStateOf(false) }
    var showLegalDialog by remember { mutableStateOf<String?>(null) }
    var showFeedbackDialog by remember { mutableStateOf(false) }
    var showLogoutConfirm by remember { mutableStateOf(false) }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Thẻ thông tin người dùng với Avatar lớn & Huy hiệu
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 22.dp,
            backgroundColor = PaperPure
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Avatar tương tác bấm để đổi
                    Box(
                        modifier = Modifier
                            .size(68.dp)
                            .clip(CircleShape)
                            .clickable { showAvatarPicker = true }
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Brush.linearGradient(currentAvatar.gradientColors)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentAvatar.emoji,
                                fontSize = 34.sp
                            )
                        }

                        // Edit icon badge
                        Box(
                            modifier = Modifier
                                .size(22.dp)
                                .clip(CircleShape)
                                .background(Color.White)
                                .border(1.dp, BrandBorder, CircleShape)
                                .align(Alignment.BottomEnd),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Rounded.Edit,
                                contentDescription = "Đổi avatar",
                                tint = BrandDark,
                                modifier = Modifier.size(12.dp)
                            )
                        }
                    }

                    Column(modifier = Modifier.weight(1f)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = user.fullName?.ifBlank { user.username } ?: user.username,
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = InkBlack,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            if (currentAvatar.isLimited) {
                                Surface(
                                    color = AmberGold.copy(alpha = 0.15f),
                                    shape = RoundedCornerShape(6.dp),
                                    border = BorderStroke(0.8.dp, AmberGold)
                                ) {
                                    Text(
                                        text = currentAvatar.tag ?: "LIMITED",
                                        color = AmberGold,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                    )
                                }
                            }
                        }

                        Text(
                            text = "${currentAvatar.name} (${currentAvatar.chineseName}) · ${user.email}",
                            color = InkMuted,
                            fontSize = 12.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis
                        )

                        Row(
                            modifier = Modifier.padding(top = 4.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Surface(
                                color = BrandSoft,
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(0.8.dp, BrandBorder)
                            ) {
                                Text(
                                    text = "Mục tiêu HSK ${user.targetHskLevel ?: 1}",
                                    color = BrandDark,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                            Surface(
                                color = JadeSoft,
                                shape = RoundedCornerShape(6.dp),
                                border = BorderStroke(0.8.dp, JadeBorder)
                            ) {
                                Text(
                                    text = "${user.streak} ngày streak 🔥",
                                    color = JadeGreen,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                }

                OutlinedButton(
                    onClick = { showAvatarPicker = true },
                    modifier = Modifier.fillMaxWidth().height(42.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, BrandBorder),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = BrandSoft.copy(alpha = 0.5f))
                ) {
                    Icon(Icons.Rounded.Face, contentDescription = null, tint = BrandDark, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Đổi Avatar & Xem Avatar Giới Hạn", color = BrandDark, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // 2. Nhóm: Cá nhân hóa & Học tập
        AccountSectionCard(title = "Cá nhân hóa & Lộ trình học") {
            AccountMenuItem(
                icon = Icons.Rounded.Face,
                iconBg = AmberSoft,
                iconTint = AmberGold,
                title = "Bộ sưu tập Avatar",
                subtitle = "12 Avatar đa phong cách & 6 Avatar Limited",
                trailingBadge = "LIMITED",
                trailingBadgeColor = AmberGold,
                onClick = { showAvatarPicker = true }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.Person,
                title = "Chỉnh sửa hồ sơ học viên",
                subtitle = "Tên, tuổi, cấp độ HSK mục tiêu",
                onClick = { showEditProfile = true }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.Schedule,
                title = "Thời gian học mỗi ngày",
                subtitle = "${user.dailyStudyMinutes ?: 20} phút mỗi ngày",
                onClick = { showEditProfile = true }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.School,
                title = "Mục đích & Kinh nghiệm học",
                subtitle = if (user.studyPurpose == "conversation") "Giao tiếp đời sống" else "Luyện thi HSK",
                onClick = { showEditProfile = true }
            )
        }

        // 3. Nhóm: Bảo mật tài khoản
        AccountSectionCard(title = "Bảo mật & Đăng nhập") {
            AccountMenuItem(
                icon = Icons.Rounded.Lock,
                title = "Đổi mật khẩu tài khoản",
                subtitle = "Cập nhật mật khẩu bảo vệ an toàn",
                trailingBadge = "BẢO MẬT",
                trailingBadgeColor = Brand,
                onClick = { showChangePassword = true }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.Email,
                title = "Email đăng nhập",
                subtitle = user.email,
                onClick = { }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.Security,
                iconBg = JadeSoft,
                iconTint = JadeGreen,
                title = "Mã hóa phần cứng Keystore",
                subtitle = "AES-GCM 128-bit bảo vệ phiên đăng nhập",
                trailingBadge = "ĐANG BẬT",
                trailingBadgeColor = JadeGreen,
                onClick = { }
            )
        }

        // 4. Nhóm: Bản quyền & Pháp lý
        AccountSectionCard(title = "Bản quyền, Pháp lý & Dữ liệu") {
            AccountMenuItem(
                icon = Icons.Rounded.Shield,
                title = "Chính sách quyền riêng tư",
                subtitle = "Cam kết bảo mật dữ liệu học tập cá nhân",
                onClick = { showLegalDialog = "privacy" }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.Gavel,
                title = "Bản quyền & Điều khoản dịch vụ",
                subtitle = "Bản quyền nội dung & thiết kế Chaina HSK",
                onClick = { showLegalDialog = "terms" }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.MenuBook,
                title = "Nguồn dữ liệu từ vựng HSK",
                subtitle = "CC-CEDICT, CVDICT, HanziWriter, Tatoeba",
                onClick = { showLegalDialog = "credits" }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.Info,
                title = "Giới thiệu nền tảng Chaina HSK",
                subtitle = "Phiên bản v1.0.0 (Modern Ink Editorial)",
                onClick = { showLegalDialog = "about" }
            )
        }

        // 5. Nhóm: Hỗ trợ & Đóng góp
        AccountSectionCard(title = "Hỗ trợ & Cộng đồng") {
            AccountMenuItem(
                icon = Icons.Rounded.Feedback,
                title = "Góp ý & Báo lỗi ứng dụng",
                subtitle = "Gửi ý kiến để chúng tôi cải thiện tốt hơn",
                onClick = { showFeedbackDialog = true }
            )
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.6f)))
            AccountMenuItem(
                icon = Icons.Rounded.ThumbUp,
                iconBg = AmberSoft,
                iconTint = AmberGold,
                title = "Đánh giá ứng dụng Chaina HSK",
                subtitle = "Tặng 5 sao trên cửa hàng ứng dụng",
                trailingBadge = "5.0 ★",
                trailingBadgeColor = AmberGold,
                onClick = { showFeedbackDialog = true }
            )
        }

        // 6. Đăng xuất tài khoản
        OutlinedButton(
            onClick = { showLogoutConfirm = true },
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(14.dp),
            border = BorderStroke(1.dp, RedBorder),
            colors = ButtonDefaults.outlinedButtonColors(containerColor = RedSoft)
        ) {
            Icon(Icons.Rounded.Logout, contentDescription = null, tint = RedBad, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Đăng xuất tài khoản", color = RedBad, fontWeight = FontWeight.Bold)
        }

        Spacer(Modifier.height(10.dp))
    }

    // Modal Dialogs
    if (showAvatarPicker) {
        AvatarPickerDialog(
            currentAvatarId = currentAvatar.id,
            onSelect = { selected ->
                saveUserAvatar(context, selected.id)
                currentAvatar = selected
                avatarKey++
                showAvatarPicker = false
            },
            onDismiss = { showAvatarPicker = false }
        )
    }

    if (showChangePassword) {
        ChangePasswordDialog(
            api = api,
            onDismiss = { showChangePassword = false }
        )
    }

    if (showEditProfile) {
        EditProfileDialog(
            user = user,
            api = api,
            onSaved = onSaved,
            onDismiss = { showEditProfile = false }
        )
    }

    showLegalDialog?.let { type ->
        LegalInfoDialog(
            type = type,
            onDismiss = { showLegalDialog = null }
        )
    }

    if (showFeedbackDialog) {
        FeedbackDialog(onDismiss = { showFeedbackDialog = false })
    }

    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            title = { Text("Xác nhận đăng xuất", fontWeight = FontWeight.Bold, color = InkBlack) },
            text = { Text("Bạn có chắc chắn muốn đăng xuất khỏi tài khoản ${user.email}?", fontSize = 14.sp) },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutConfirm = false
                        onLogout()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = RedBad)
                ) {
                    Text("Đăng xuất", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showLogoutConfirm = false }) {
                    Text("Hủy", color = InkMuted)
                }
            }
        )
    }
}

@Composable
private fun OnboardingDialog(api: ApiClient, onDone: (User?) -> Unit) {
    val scope = rememberCoroutineScope()
    var experience by remember { mutableStateOf("new") }
    var purpose by remember { mutableStateOf("conversation") }
    var target by remember { mutableStateOf("1") }
    var minutes by remember { mutableStateOf("20") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = { if (!busy) onDone(null) },
        title = {
            Text("Thiết lập hành trình HSK", fontWeight = FontWeight.Bold, color = InkBlack)
        },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("Cho Chaina biết mục tiêu học tập để gợi ý lộ trình phù hợp với bạn.", color = InkMuted, fontSize = 13.sp)
                SelectField("Bạn đã học đến đâu?", experience, listOf("new" to "Mình chưa học", "pinyin" to "Biết pinyin và vài từ", "basic" to "Đã học cơ bản", "intermediate" to "Có nền tảng", "advanced" to "Khá vững")) { experience = it }
                SelectField("Mục tiêu học", purpose, listOf("exam" to "Thi chứng chỉ HSK", "conversation" to "Giao tiếp", "travel" to "Du lịch", "work" to "Công việc / học tập", "interest" to "Vì yêu thích")) { purpose = it }
                SelectField("Mục tiêu HSK", target, (1..6).map { it.toString() to "HSK $it" }) { target = it }
                SelectField("Thời gian học mỗi ngày", minutes, listOf("10" to "10 phút", "20" to "20 phút", "30" to "30 phút", "45" to "45 phút", "60" to "60 phút")) { minutes = it }
                error?.let { ErrorMessage(it) }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    scope.launch {
                        busy = true
                        error = null
                        try {
                            onDone(api.updateProfile(JSONObject().put("learningExperience", experience).put("studyPurpose", purpose).put("targetHskLevel", target.toInt()).put("dailyStudyMinutes", minutes.toInt())))
                        } catch (e: Exception) {
                            error = e.message ?: "Không lưu được lựa chọn."
                        }
                        busy = false
                    }
                },
                enabled = !busy,
                colors = ButtonDefaults.buttonColors(containerColor = Brand),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(if (busy) "Đang lưu…" else "Lưu & Bắt đầu", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = { if (!busy) onDone(null) }) {
                Text("Để sau", color = InkMuted)
            }
        },
        containerColor = PaperPure,
        shape = RoundedCornerShape(20.dp)
    )
}

@Composable
private fun SelectField(label: String, value: String, options: List<Pair<String, String>>, onSelect: (String) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    val selectedLabel = options.firstOrNull { it.first == value }?.second ?: label
    Column {
        Text(label, fontSize = 12.sp, color = InkMuted, fontWeight = FontWeight.SemiBold)
        Box(Modifier.padding(top = 3.dp)) {
            OutlinedButton(
                onClick = { expanded = true },
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, InkBorder)
            ) {
                Text(selectedLabel, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis, color = InkBlack, fontSize = 13.sp)
                Text("⌄", color = InkMuted, fontSize = 16.sp)
            }
            DropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
                modifier = Modifier.background(PaperPure)
            ) {
                options.forEach { (key, title) ->
                    DropdownMenuItem(
                        text = { Text(title, fontSize = 13.sp, color = if (key == value) Brand else InkBlack, fontWeight = if (key == value) FontWeight.Bold else FontWeight.Normal) },
                        onClick = { onSelect(key); expanded = false }
                    )
                }
            }
        }
    }
}

@Composable
internal fun WordRow(word: Word, modifier: Modifier = Modifier) {
    InkCard(
        modifier = modifier,
        shapeRadius = 16.dp,
    ) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(Modifier.widthIn(min = 86.dp, max = 116.dp)) {
                Text(word.hanzi, fontSize = 28.sp, fontWeight = FontWeight.Medium, lineHeight = 32.sp, color = InkBlack)
                Text(word.pinyin, color = Brand, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Spacer(Modifier.width(12.dp))
            Box(
                Modifier
                    .height(36.dp)
                    .width(1.dp)
                    .background(InkBorder)
            )
            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                Text(word.meaningVi.ifBlank { "Chưa có nghĩa" }, fontSize = 13.sp, fontWeight = FontWeight.Medium, maxLines = 2, overflow = TextOverflow.Ellipsis, color = InkBlack)
                Text("HSK ${word.hskLevel}", color = InkMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
            }
            Text("›", color = Brand, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun SectionTitle(title: String, subtitle: String) {
    Column {
        Text(title, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = InkBlack)
        Text(subtitle, fontSize = 12.sp, color = InkMuted)
    }
}

@Composable
private fun ModernFormField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    password: Boolean = false,
    keyboard: KeyboardType = KeyboardType.Text
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label, fontSize = 13.sp) },
        singleLine = true,
        shape = RoundedCornerShape(14.dp),
        keyboardOptions = KeyboardOptions(keyboardType = if (password) KeyboardType.Password else keyboard),
        visualTransformation = if (password) PasswordVisualTransformation() else androidx.compose.ui.text.input.VisualTransformation.None,
        colors = OutlinedTextFieldDefaults.colors(
            focusedBorderColor = Brand,
            unfocusedBorderColor = InkBorder,
            focusedContainerColor = PaperPure,
            unfocusedContainerColor = PaperPure,
        )
    )
}

@Composable
private fun ErrorMessage(text: String) {
    Surface(
        color = RedSoft,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, RedBorder)
    ) {
        Text(
            text,
            color = RedBad,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier.fillMaxWidth().padding(12.dp)
        )
    }
}

@Composable
private fun LinearLoading() {
    Box(Modifier.fillMaxWidth().padding(vertical = 8.dp), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(Modifier.size(22.dp), color = Brand, strokeWidth = 2.5.dp)
    }
}
