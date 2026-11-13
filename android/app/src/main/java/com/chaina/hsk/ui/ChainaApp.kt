package com.chaina.hsk.ui

import android.content.Context
import android.speech.tts.TextToSpeech
import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
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
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material.icons.automirrored.rounded.Logout
import androidx.compose.material.icons.automirrored.rounded.MenuBook
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material.icons.outlined.Style
import androidx.compose.material.icons.outlined.Timeline
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.BookmarkBorder
import androidx.compose.material.icons.rounded.CheckCircle
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.Email
import androidx.compose.material.icons.rounded.Face
import androidx.compose.material.icons.rounded.Feedback
import androidx.compose.material.icons.rounded.Gavel
import androidx.compose.material.icons.rounded.Info
import androidx.compose.material.icons.rounded.LocalFireDepartment
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Person
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Schedule
import androidx.compose.material.icons.rounded.School
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.Security
import androidx.compose.material.icons.rounded.Shield
import androidx.compose.material.icons.rounded.TaskAlt
import androidx.compose.material.icons.rounded.Timeline
import androidx.compose.material.icons.rounded.Visibility
import androidx.compose.material.icons.rounded.VisibilityOff
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
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
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chaina.hsk.R
import com.chaina.hsk.data.ActivityData
import com.chaina.hsk.data.ApiClient
import com.chaina.hsk.data.ApiException
import com.chaina.hsk.data.LevelProgress
import com.chaina.hsk.data.Stats
import com.chaina.hsk.data.StudyCard
import com.chaina.hsk.data.StudyOption
import com.chaina.hsk.data.TokenStore
import com.chaina.hsk.data.User
import com.chaina.hsk.data.Word
import androidx.credentials.CredentialManager
import androidx.credentials.CustomCredential
import androidx.credentials.GetCredentialRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import com.chaina.hsk.BuildConfig
import com.google.android.libraries.identity.googleid.GetGoogleIdOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import com.chaina.hsk.ui.components.ArrowUpRightIcon
import com.chaina.hsk.ui.components.ChainaLoadingBackground
import com.chaina.hsk.ui.components.ChainaLoadingMode
import com.chaina.hsk.ui.components.ChainaLoadingSize
import com.chaina.hsk.ui.components.ChainaStrokeLoading
import com.chaina.hsk.ui.components.CircleActionButton
import com.chaina.hsk.ui.components.InkCard
import com.chaina.hsk.ui.components.InkNavItem
import com.chaina.hsk.ui.components.InkPrimaryButton
import com.chaina.hsk.ui.components.InkTopBar
import com.chaina.hsk.ui.components.LevelBadge
import com.chaina.hsk.ui.components.ModernInkBottomBar
import com.chaina.hsk.ui.components.SegmentedPillBar
import com.chaina.hsk.ui.components.VectorFlameCanvas
import com.chaina.hsk.ui.components.WebTopBar
import com.chaina.hsk.ui.components.WebWeeklyChart
import com.chaina.hsk.ui.theme.AmberBorder
import com.chaina.hsk.ui.theme.AmberGold
import com.chaina.hsk.ui.theme.AmberSoft
import com.chaina.hsk.ui.theme.BentoLavenderEnd
import com.chaina.hsk.ui.theme.BentoLavenderStart
import com.chaina.hsk.ui.theme.BentoMintEnd
import com.chaina.hsk.ui.theme.BentoMintStart
import com.chaina.hsk.ui.theme.BentoPeachEnd
import com.chaina.hsk.ui.theme.BentoPeachStart
import com.chaina.hsk.ui.theme.BentoSkyEnd
import com.chaina.hsk.ui.theme.BentoSkyStart
import com.chaina.hsk.ui.theme.Brand
import com.chaina.hsk.ui.theme.BrandBorder
import com.chaina.hsk.ui.theme.BrandDark
import com.chaina.hsk.ui.theme.BrandLavender
import com.chaina.hsk.ui.theme.BrandSoft
import com.chaina.hsk.ui.theme.EmeraldDot
import com.chaina.hsk.ui.theme.FlameBg
import com.chaina.hsk.ui.theme.FlameBorder
import com.chaina.hsk.ui.theme.FlameOrange
import com.chaina.hsk.ui.theme.InkBlack
import com.chaina.hsk.ui.theme.InkBorder
import com.chaina.hsk.ui.theme.InkLight
import com.chaina.hsk.ui.theme.InkMuted
import com.chaina.hsk.ui.theme.InkTheme
import com.chaina.hsk.ui.theme.JadeBorder
import com.chaina.hsk.ui.theme.JadeGreen
import com.chaina.hsk.ui.theme.JadeSoft
import com.chaina.hsk.ui.theme.LineDark
import com.chaina.hsk.ui.theme.Paper
import com.chaina.hsk.ui.theme.PaperMuted
import com.chaina.hsk.ui.theme.PaperPure
import com.chaina.hsk.ui.theme.RedBad
import com.chaina.hsk.ui.theme.RedBorder
import com.chaina.hsk.ui.theme.RedSoft
import com.chaina.hsk.ui.theme.ToneLavenderStart
import com.chaina.hsk.ui.theme.ToneLimeStart
import com.chaina.hsk.ui.theme.ToneSkyStart
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar
import java.util.Locale

private data class DashboardBundle(
    val stats: Stats,
    val levels: List<LevelProgress>,
    val daily: Word?,
    val activity: ActivityData?,
    val leaderboardTop: List<JSONObject>,
)

@Composable
fun ChainaApp(api: ApiClient, tokens: TokenStore) {
    InkTheme {
        val scope = rememberCoroutineScope()
        var user by remember { mutableStateOf<User?>(null) }
        var booting by remember { mutableStateOf(true) }
        var tab by remember { mutableStateOf(AppDestination.Home) }
        var returnTab by remember { mutableStateOf(AppDestination.Home) }
        var hskLevel by remember { mutableIntStateOf(1) }
        var refreshKey by remember { mutableIntStateOf(0) }

        var stats by remember { mutableStateOf<Stats?>(null) }
        var levels by remember { mutableStateOf<List<LevelProgress>>(emptyList()) }
        var daily by remember { mutableStateOf<Word?>(null) }
        var activity by remember { mutableStateOf<ActivityData?>(null) }
        var leaderboardTop by remember { mutableStateOf<List<JSONObject>>(emptyList()) }
        var dashboardLoading by remember { mutableStateOf(false) }
        var dashboardError by remember { mutableStateOf<String?>(null) }
        var onboarding by remember { mutableStateOf(false) }

        // TopBar interactive panels
        var showTopSearch by remember { mutableStateOf(false) }
        var topSearchText by remember { mutableStateOf("") }
        var pendingWordSearch by remember { mutableStateOf("") }
        var wordSearchTrigger by remember { mutableIntStateOf(0) }
        var showStreakDialog by remember { mutableStateOf(false) }
        var showNoticePanel by remember { mutableStateOf(false) }
        var showAvatarMenu by remember { mutableStateOf(false) }

        // Sub-navigation & Practice session configuration states
        var practiceMode by remember { mutableStateOf<String?>(null) }
        var practiceLevel by remember { mutableIntStateOf(1) }
        var practiceCount by remember { mutableIntStateOf(10) }
        var vocabSubTab by remember { mutableIntStateOf(0) }
        var progressSubTab by remember { mutableIntStateOf(0) }

        fun openSubScreen(target: AppDestination) {
            showTopSearch = false
            showNoticePanel = false
            showAvatarMenu = false
            if (tab !in listOf(
                    AppDestination.Account,
                    AppDestination.Feedback,
                    AppDestination.Writing,
                    AppDestination.PinyinBoss,
                    AppDestination.GrammarPractice,
                    AppDestination.CameraTranslate,
                    AppDestination.Privacy,
                    AppDestination.Credits,
                )
            ) {
                returnTab = tab
            }
            tab = target
        }

        fun jumpToWordSearch(query: String) {
            pendingWordSearch = query.trim()
            wordSearchTrigger++
            vocabSubTab = 0
            showTopSearch = false
            showNoticePanel = false
            tab = AppDestination.Words
        }

        LaunchedEffect(Unit) {
            val token = withContext(Dispatchers.IO) { tokens.read() }
            if (token != null) {
                try {
                    user = api.me()
                } catch (error: CancellationException) {
                    throw error
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
                val bundle = withContext(Dispatchers.IO) {
                    val fetchedStats = api.stats()
                    val fetchedLevels = api.levels()
                    val fetchedDaily = runCatching { api.dailyWord() }.getOrNull()
                    val fetchedActivity = runCatching { api.activityData() }.getOrNull()
                    val fetchedLb = runCatching { api.leaderboard() }.getOrNull()
                    val top3 = buildList {
                        if (fetchedLb != null) {
                            for (i in 0 until minOf(3, fetchedLb.length())) {
                                fetchedLb.optJSONObject(i)?.let(::add)
                            }
                        }
                    }
                    DashboardBundle(fetchedStats, fetchedLevels, fetchedDaily, fetchedActivity, top3)
                }
                stats = bundle.stats
                levels = bundle.levels
                daily = bundle.daily
                activity = bundle.activity
                leaderboardTop = bundle.leaderboardTop
            } catch (error: CancellationException) {
                throw error
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
                        activity = null
                        leaderboardTop = emptyList()
                        practiceMode = null
                        showTopSearch = false
                        showNoticePanel = false
                        showAvatarMenu = false
                        tab = AppDestination.Home
                    }
                }

                val isFocusedSubScreen = (tab in listOf(
                    AppDestination.Account,
                    AppDestination.Feedback,
                    AppDestination.Writing,
                    AppDestination.PinyinBoss,
                    AppDestination.GrammarPractice,
                    AppDestination.CameraTranslate,
                    AppDestination.Privacy,
                    AppDestination.Credits,
                )) || (tab == AppDestination.Practice && practiceMode != null)

                val navigateBack: () -> Unit = {
                    if (tab == AppDestination.Practice && practiceMode != null) {
                        practiceMode = null
                    } else {
                        when (tab) {
                            AppDestination.Writing,
                            AppDestination.PinyinBoss,
                            AppDestination.GrammarPractice -> tab = if (returnTab == AppDestination.Home) AppDestination.Home else AppDestination.Practice
                            AppDestination.Privacy,
                            AppDestination.Credits -> tab = AppDestination.Account
                            AppDestination.Account,
                            AppDestination.CameraTranslate,
                            AppDestination.Feedback -> tab = returnTab
                            else -> tab = AppDestination.Home
                        }
                    }
                }

                BackHandler(enabled = isFocusedSubScreen || showTopSearch || showNoticePanel) {
                    when {
                        showNoticePanel -> showNoticePanel = false
                        showTopSearch -> showTopSearch = false
                        else -> navigateBack()
                    }
                }

                // 5-Tab Mobile-Optimized Bottom Nav (Ôn tập SM-2 centered as core mobile habit)
                val navItems = listOf(
                    InkNavItem("home", "Tổng quan", Icons.Outlined.Home),
                    InkNavItem("vocab", "Từ vựng", Icons.AutoMirrored.Outlined.MenuBook),
                    InkNavItem("review", "Ôn tập", Icons.Outlined.Style, badgeCount = stats?.due ?: 0),
                    InkNavItem("practice", "Luyện tập", Icons.Outlined.SportsEsports),
                    InkNavItem("progress", "Tiến độ", Icons.Outlined.Timeline),
                )

                val currentPrimaryNav = when (tab) {
                    AppDestination.Home -> "home"
                    AppDestination.Words, AppDestination.Categories, AppDestination.Grammar, AppDestination.Favorites -> "vocab"
                    AppDestination.Review -> "review"
                    AppDestination.Practice, AppDestination.Writing, AppDestination.PinyinBoss, AppDestination.GrammarPractice -> "practice"
                    AppDestination.Path, AppDestination.Stats, AppDestination.Leaderboard -> "progress"
                    AppDestination.CameraTranslate, AppDestination.Account, AppDestination.Feedback, AppDestination.Privacy, AppDestination.Credits -> "home"
                }

                val userInitial = (currentUser.fullName?.trim()?.takeIf { it.isNotEmpty() } ?: currentUser.username)
                    .firstOrNull()?.uppercase() ?: "C"

                Scaffold(
                    containerColor = Paper,
                    topBar = {
                        Column {
                            if (isFocusedSubScreen) {
                                val title = when (tab) {
                                    AppDestination.Practice -> if (practiceMode != null) practiceTitle(practiceMode!!) else "Phòng luyện tập"
                                    AppDestination.Writing -> "Luyện viết chữ Hán"
                                    AppDestination.PinyinBoss -> "Pinyin Boss"
                                    AppDestination.GrammarPractice -> "Luyện ngữ pháp"
                                    AppDestination.CameraTranslate -> "Dịch qua Máy ảnh"
                                    AppDestination.Feedback -> "Khung góp ý"
                                    AppDestination.Account -> "Hồ sơ cá nhân"
                                    AppDestination.Privacy -> "Quyền riêng tư"
                                    AppDestination.Credits -> "Nguồn dữ liệu"
                                    else -> "Chaina"
                                }
                                val subtitle = when (tab) {
                                    AppDestination.Practice -> "HSK $practiceLevel · $practiceCount ${if (practiceMode == "match") "cặp từ" else "câu"}"
                                    AppDestination.Writing -> "HSK $practiceLevel · $practiceCount chữ mẫu · Ô kẻ Mễ"
                                    AppDestination.PinyinBoss -> "HSK $practiceLevel · $practiceCount từ · Phiên âm"
                                    AppDestination.GrammarPractice -> "HSK $practiceLevel · $practiceCount câu ngữ pháp"
                                    AppDestination.CameraTranslate -> "Chỉ dịch Tiếng Trung (简体/繁體) → Tiếng Việt"
                                    AppDestination.Feedback -> "Nội dung bảo mật riêng tư"
                                    AppDestination.Account -> currentUser.email
                                    else -> null
                                }
                                InkTopBar(
                                    title = title,
                                    subtitle = subtitle,
                                    onBack = navigateBack,
                                )
                            } else {
                                Box {
                                    WebTopBar(
                                        userInitial = userInitial,
                                        stats = stats,
                                        feedbackActive = tab == AppDestination.Feedback,
                                        searchActive = showTopSearch,
                                        cameraActive = tab == AppDestination.CameraTranslate,
                                        noticesActive = showNoticePanel,
                                        onLogoClick = {
                                            practiceMode = null
                                            showTopSearch = false
                                            showNoticePanel = false
                                            showAvatarMenu = false
                                            tab = AppDestination.Home
                                        },
                                        onStreakClick = {
                                            showNoticePanel = false
                                            showTopSearch = false
                                            showStreakDialog = true
                                        },
                                        onSearchClick = {
                                            showNoticePanel = false
                                            showAvatarMenu = false
                                            showTopSearch = !showTopSearch
                                        },
                                        onCameraClick = {
                                            openSubScreen(AppDestination.CameraTranslate)
                                        },
                                        onFeedbackClick = {
                                            showTopSearch = false
                                            showNoticePanel = false
                                            openSubScreen(AppDestination.Feedback)
                                        },
                                        onNoticesClick = {
                                            showTopSearch = false
                                            showAvatarMenu = false
                                            showNoticePanel = !showNoticePanel
                                        },
                                        onAvatarClick = {
                                            showNoticePanel = false
                                            showTopSearch = false
                                            showAvatarMenu = true
                                        },
                                    )

                                    Box(modifier = Modifier.align(Alignment.BottomEnd).padding(end = 14.dp)) {
                                        DropdownMenu(
                                            expanded = showAvatarMenu,
                                            onDismissRequest = { showAvatarMenu = false },
                                            modifier = Modifier.background(PaperPure).widthIn(min = 210.dp),
                                        ) {
                                            Column(Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
                                                Text(
                                                    text = currentUser.fullName?.ifBlank { currentUser.username } ?: currentUser.username,
                                                    fontWeight = FontWeight.Bold,
                                                    fontSize = 14.sp,
                                                    color = InkBlack,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis,
                                                )
                                                Text(
                                                    text = currentUser.email,
                                                    fontSize = 11.5.sp,
                                                    color = InkMuted,
                                                    maxLines = 1,
                                                    overflow = TextOverflow.Ellipsis,
                                                )
                                                if (currentUser.isAdmin) {
                                                    Surface(
                                                        color = BrandSoft,
                                                        shape = CircleShape,
                                                        modifier = Modifier.padding(top = 6.dp),
                                                    ) {
                                                        Text(
                                                            "Quản trị viên",
                                                            fontSize = 10.sp,
                                                            fontWeight = FontWeight.Bold,
                                                            color = BrandDark,
                                                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                                        )
                                                    }
                                                }
                                            }
                                            HorizontalDivider(color = InkBorder.copy(alpha = 0.7f))
                                            DropdownMenuItem(
                                                text = { Text("Tài khoản & Hồ sơ", fontSize = 13.5.sp, color = InkBlack, fontWeight = FontWeight.Medium) },
                                                leadingIcon = { Icon(Icons.Rounded.Person, null, tint = InkMuted, modifier = Modifier.size(18.dp)) },
                                                onClick = { showAvatarMenu = false; openSubScreen(AppDestination.Account) },
                                            )
                                            DropdownMenuItem(
                                                text = { Text("Thống kê tiến độ", fontSize = 13.5.sp, color = InkBlack, fontWeight = FontWeight.Medium) },
                                                leadingIcon = { Icon(Icons.Rounded.Timeline, null, tint = InkMuted, modifier = Modifier.size(18.dp)) },
                                                onClick = {
                                                    showAvatarMenu = false
                                                    progressSubTab = 1
                                                    tab = AppDestination.Stats
                                                },
                                            )
                                            DropdownMenuItem(
                                                text = { Text("Khung ghi chú góp ý", fontSize = 13.5.sp, color = InkBlack, fontWeight = FontWeight.Medium) },
                                                leadingIcon = { Icon(Icons.Rounded.Feedback, null, tint = BrandDark, modifier = Modifier.size(18.dp)) },
                                                onClick = { showAvatarMenu = false; openSubScreen(AppDestination.Feedback) },
                                            )
                                            HorizontalDivider(color = InkBorder.copy(alpha = 0.7f))
                                            DropdownMenuItem(
                                                text = { Text("Đăng xuất", fontSize = 13.5.sp, color = RedBad, fontWeight = FontWeight.SemiBold) },
                                                leadingIcon = { Icon(Icons.AutoMirrored.Rounded.Logout, null, tint = RedBad, modifier = Modifier.size(18.dp)) },
                                                onClick = signOut,
                                            )
                                        }
                                    }
                                }
                            }

                            AnimatedVisibility(
                                visible = showTopSearch && !isFocusedSubScreen,
                                enter = expandVertically() + fadeIn(),
                                exit = shrinkVertically() + fadeOut(),
                            ) {
                                Surface(
                                    modifier = Modifier.fillMaxWidth(),
                                    color = PaperPure,
                                ) {
                                    Column {
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .padding(horizontal = 14.dp, vertical = 10.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        ) {
                                            PillSearchInput(
                                                value = topSearchText,
                                                onValueChange = { topSearchText = it },
                                                placeholder = "Tra nhanh chữ Hán, pinyin, nghĩa...",
                                                onSubmit = { jumpToWordSearch(topSearchText) },
                                                modifier = Modifier.weight(1f),
                                            )
                                            CircleActionButton(
                                                onClick = { openSubScreen(AppDestination.CameraTranslate) },
                                                size = 38.dp,
                                                containerColor = BrandSoft,
                                                borderColor = BrandBorder,
                                            ) {
                                                Icon(Icons.Outlined.PhotoCamera, contentDescription = "Dịch Camera", tint = BrandDark, modifier = Modifier.size(19.dp))
                                            }
                                            CircleActionButton(
                                                onClick = { showTopSearch = false },
                                                size = 36.dp,
                                                containerColor = PaperMuted,
                                            ) {
                                                Icon(Icons.Rounded.Close, contentDescription = "Đóng tìm kiếm", tint = InkMuted, modifier = Modifier.size(18.dp))
                                            }
                                        }
                                        HorizontalDivider(color = InkBorder.copy(alpha = 0.7f))
                                    }
                                }
                            }
                        }
                    },
                    bottomBar = {
                        if (!isFocusedSubScreen) {
                            ModernInkBottomBar(
                                items = navItems,
                                selectedId = currentPrimaryNav,
                                onSelect = { navId ->
                                    practiceMode = null
                                    showTopSearch = false
                                    showNoticePanel = false
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
                                        "review" -> tab = AppDestination.Review
                                        "practice" -> tab = AppDestination.Practice
                                        "progress" -> {
                                            tab = when (progressSubTab) {
                                                0 -> AppDestination.Path
                                                1 -> AppDestination.Stats
                                                else -> AppDestination.Leaderboard
                                            }
                                        }
                                    }
                                }
                            )
                        }
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
                                (fadeIn(animationSpec = tween(170, easing = LinearOutSlowInEasing)) +
                                        slideInHorizontally(animationSpec = tween(200, easing = FastOutSlowInEasing)) { it / 7 })
                                    .togetherWith(
                                        fadeOut(animationSpec = tween(140)) +
                                                slideOutHorizontally(animationSpec = tween(170)) { -it / 7 }
                                    )
                            },
                            label = "tab-screen-transition"
                        ) { targetTab ->
                            when (targetTab) {
                                AppDestination.Home -> HomeScreen(
                                    api = api,
                                    user = currentUser,
                                    stats = stats,
                                    levels = levels,
                                    daily = daily,
                                    activity = activity,
                                    leaderboardTop = leaderboardTop,
                                    loading = dashboardLoading,
                                    error = dashboardError,
                                    onRefresh = { refreshKey++ },
                                    onChooseLevel = { lvl -> hskLevel = lvl; tab = AppDestination.Review },
                                    onOpenPath = { progressSubTab = 0; tab = AppDestination.Path },
                                    onLeaderboard = { progressSubTab = 2; tab = AppDestination.Leaderboard },
                                    onStats = { progressSubTab = 1; tab = AppDestination.Stats },
                                )

                                AppDestination.Words,
                                AppDestination.Categories,
                                AppDestination.Grammar,
                                AppDestination.Favorites -> {
                                    val currentVocabIndex = when (targetTab) {
                                        AppDestination.Words -> 0
                                        AppDestination.Categories -> 1
                                        AppDestination.Grammar -> 2
                                        AppDestination.Favorites -> 3
                                        else -> 0
                                    }
                                    Column(Modifier.fillMaxSize()) {
                                        SegmentedPillBar(
                                            items = listOf("Tra từ", "Chủ đề", "Ngữ pháp", "Sổ từ"),
                                            selectedIndex = currentVocabIndex,
                                            onSelect = { index ->
                                                vocabSubTab = index
                                                tab = when (index) {
                                                    0 -> AppDestination.Words
                                                    1 -> AppDestination.Categories
                                                    2 -> AppDestination.Grammar
                                                    else -> AppDestination.Favorites
                                                }
                                            },
                                        )
                                        Box(Modifier.fillMaxSize()) {
                                            when (targetTab) {
                                                AppDestination.Words -> WordsScreen(
                                                    api = api,
                                                    externalQuery = pendingWordSearch,
                                                    searchTrigger = wordSearchTrigger,
                                                    onOpenCamera = { openSubScreen(AppDestination.CameraTranslate) },
                                                )
                                                AppDestination.Categories -> CategoriesFeature(api)
                                                AppDestination.Grammar -> GrammarFeature(api)
                                                AppDestination.Favorites -> FavoritesFeature(api)
                                                else -> WordsScreen(
                                                    api = api,
                                                    externalQuery = pendingWordSearch,
                                                    searchTrigger = wordSearchTrigger,
                                                    onOpenCamera = { openSubScreen(AppDestination.CameraTranslate) },
                                                )
                                            }
                                        }
                                    }
                                }

                                AppDestination.Review -> StudyScreen(
                                    api = api,
                                    initialLevel = hskLevel,
                                    onStatsChanged = { refreshKey++ },
                                )

                                AppDestination.Practice -> PracticeHubFeature(
                                    api = api,
                                    initialLevel = hskLevel,
                                    activeMode = practiceMode,
                                    onModeChange = { practiceMode = it },
                                    onLevelCountSelected = { lvl, cnt ->
                                        hskLevel = lvl
                                        practiceLevel = lvl
                                        practiceCount = cnt
                                    },
                                    onLaunchWriting = { lvl, cnt ->
                                        hskLevel = lvl
                                        practiceLevel = lvl
                                        practiceCount = cnt
                                        openSubScreen(AppDestination.Writing)
                                    },
                                    onLaunchBoss = { lvl, cnt ->
                                        hskLevel = lvl
                                        practiceLevel = lvl
                                        practiceCount = cnt
                                        openSubScreen(AppDestination.PinyinBoss)
                                    },
                                    onLaunchGrammar = { lvl, cnt ->
                                        hskLevel = lvl
                                        practiceLevel = lvl
                                        practiceCount = cnt
                                        openSubScreen(AppDestination.GrammarPractice)
                                    },
                                )

                                AppDestination.Path,
                                AppDestination.Stats,
                                AppDestination.Leaderboard -> {
                                    val currentProgressIndex = when (targetTab) {
                                        AppDestination.Path -> 0
                                        AppDestination.Stats -> 1
                                        AppDestination.Leaderboard -> 2
                                        else -> 0
                                    }
                                    Column(Modifier.fillMaxSize()) {
                                        SegmentedPillBar(
                                            items = listOf("Lộ trình", "Thống kê", "Xếp hạng"),
                                            selectedIndex = currentProgressIndex,
                                            onSelect = { index ->
                                                progressSubTab = index
                                                tab = when (index) {
                                                    0 -> AppDestination.Path
                                                    1 -> AppDestination.Stats
                                                    else -> AppDestination.Leaderboard
                                                }
                                            },
                                        )
                                        Box(Modifier.fillMaxSize()) {
                                            when (targetTab) {
                                                AppDestination.Path -> LearningPathFeature(onPractice = { hskLevel = it; practiceLevel = it; tab = AppDestination.Practice })
                                                AppDestination.Stats -> StatisticsFeature(api)
                                                AppDestination.Leaderboard -> LeaderboardFeature(api)
                                                else -> LearningPathFeature(onPractice = { hskLevel = it; practiceLevel = it; tab = AppDestination.Practice })
                                            }
                                        }
                                    }
                                }

                                AppDestination.GrammarPractice -> GrammarPracticeFeature(
                                    api = api,
                                    initialLevel = practiceLevel,
                                    initialCount = practiceCount,
                                    autoStart = true,
                                )
                                AppDestination.Writing -> WritingFeature(
                                    api = api,
                                    initialLevel = practiceLevel,
                                    initialCount = practiceCount,
                                )
                                AppDestination.PinyinBoss -> PinyinBossFeature(
                                    api = api,
                                    level = practiceLevel,
                                    count = practiceCount,
                                )
                                AppDestination.CameraTranslate -> CameraTranslateScreen(
                                    onLookupWord = { query -> jumpToWordSearch(query) },
                                )
                                AppDestination.Feedback -> FeedbackBoardScreen(api, currentUser)
                                AppDestination.Account -> AccountScreen(
                                    user = currentUser,
                                    stats = stats,
                                    api = api,
                                    onSaved = { user = it; refreshKey++ },
                                    onFeedback = { openSubScreen(AppDestination.Feedback) },
                                    onPrivacy = { openSubScreen(AppDestination.Privacy) },
                                    onCredits = { openSubScreen(AppDestination.Credits) },
                                    onLogout = signOut,
                                )
                                AppDestination.Privacy, AppDestination.Credits -> InformationFeature(targetTab)
                            }
                        }

                        // Pull-down Top Notification Sheet (anchored below WebTopBar, no centered pop-up)
                        AnimatedVisibility(
                            visible = showNoticePanel && !isFocusedSubScreen,
                            enter = fadeIn(tween(180)),
                            exit = fadeOut(tween(150)),
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .background(Color.Black.copy(alpha = 0.28f))
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null,
                                    ) { showNoticePanel = false }
                            )
                        }

                        AnimatedVisibility(
                            visible = showNoticePanel && !isFocusedSubScreen,
                            enter = expandVertically(
                                expandFrom = Alignment.Top,
                                animationSpec = tween(220, easing = FastOutSlowInEasing),
                            ) + fadeIn(tween(170)),
                            exit = shrinkVertically(
                                shrinkTowards = Alignment.Top,
                                animationSpec = tween(180, easing = FastOutSlowInEasing),
                            ) + fadeOut(tween(140)),
                        ) {
                            val s = stats
                            val due = s?.due ?: 0
                            val atRisk = s?.atRisk == true && s.studiedToday == false
                            val broken = (s?.brokenStreak ?: 0) > 0 && s?.studiedToday == false
                            val noticeCount = (if (due > 0) 1 else 0) + (if (atRisk) 1 else 0) + (if (broken) 1 else 0)

                            Surface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null,
                                    ) {},
                                color = PaperPure,
                                shape = RoundedCornerShape(bottomStart = 26.dp, bottomEnd = 26.dp),
                                shadowElevation = 12.dp,
                            ) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 16.dp)
                                        .padding(top = 14.dp, bottom = 10.dp),
                                    verticalArrangement = Arrangement.spacedBy(12.dp),
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Row(
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        ) {
                                            Text(
                                                "Thông báo học tập",
                                                fontSize = 17.sp,
                                                fontWeight = FontWeight.ExtraBold,
                                                color = InkBlack,
                                            )
                                            if (noticeCount > 0) {
                                                Surface(
                                                    shape = CircleShape,
                                                    color = BrandSoft,
                                                    border = BorderStroke(1.dp, BrandBorder),
                                                ) {
                                                    Text(
                                                        "$noticeCount mới",
                                                        fontSize = 11.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        color = BrandDark,
                                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp),
                                                    )
                                                }
                                            }
                                        }
                                        CircleActionButton(
                                            onClick = { showNoticePanel = false },
                                            size = 32.dp,
                                            containerColor = PaperMuted,
                                        ) {
                                            Icon(
                                                Icons.Rounded.Close,
                                                contentDescription = "Đóng thông báo",
                                                tint = InkMuted,
                                                modifier = Modifier.size(16.dp),
                                            )
                                        }
                                    }

                                    Column(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .heightIn(max = 360.dp)
                                            .verticalScroll(rememberScrollState()),
                                        verticalArrangement = Arrangement.spacedBy(10.dp),
                                    ) {
                                        if (due > 0) {
                                            Surface(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(16.dp))
                                                    .clickable {
                                                        showNoticePanel = false
                                                        hskLevel = currentUser.targetHskLevel?.coerceIn(1, 3) ?: 1
                                                        tab = AppDestination.Review
                                                    },
                                                shape = RoundedCornerShape(16.dp),
                                                color = BrandSoft,
                                                border = BorderStroke(1.dp, BrandBorder),
                                            ) {
                                                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                                    Row(
                                                        Modifier.fillMaxWidth(),
                                                        horizontalArrangement = Arrangement.SpaceBetween,
                                                        verticalAlignment = Alignment.CenterVertically,
                                                    ) {
                                                        Text("Ôn tập SM-2 đến hạn", fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = BrandDark)
                                                        Text("Ôn ngay ›", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = BrandDark)
                                                    }
                                                    Text("Bạn có $due từ cần ôn lại hôm nay để giữ trí nhớ dài hạn.", fontSize = 12.5.sp, color = InkBlack, lineHeight = 18.sp)
                                                }
                                            }
                                        }
                                        if (atRisk) {
                                            Surface(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(16.dp))
                                                    .clickable {
                                                        showNoticePanel = false
                                                        hskLevel = currentUser.targetHskLevel?.coerceIn(1, 3) ?: 1
                                                        tab = AppDestination.Review
                                                    },
                                                shape = RoundedCornerShape(16.dp),
                                                color = FlameBg,
                                                border = BorderStroke(1.dp, FlameBorder),
                                            ) {
                                                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                                    Row(
                                                        Modifier.fillMaxWidth(),
                                                        horizontalArrangement = Arrangement.SpaceBetween,
                                                        verticalAlignment = Alignment.CenterVertically,
                                                    ) {
                                                        Text("Giữ chuỗi ${s?.streak ?: 0} ngày", fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = FlameOrange)
                                                        Text("Ôn ngay ›", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = FlameOrange)
                                                    }
                                                    Text("Bạn chưa học hôm nay. Ôn ít nhất 1 từ để không mất chuỗi!", fontSize = 12.5.sp, color = InkBlack, lineHeight = 18.sp)
                                                }
                                            }
                                        }
                                        if (broken) {
                                            Surface(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(16.dp))
                                                    .clickable {
                                                        showNoticePanel = false
                                                        hskLevel = currentUser.targetHskLevel?.coerceIn(1, 3) ?: 1
                                                        tab = AppDestination.Review
                                                    },
                                                shape = RoundedCornerShape(16.dp),
                                                color = RedSoft,
                                                border = BorderStroke(1.dp, RedBorder),
                                            ) {
                                                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                                    Text("Chuỗi ${s?.brokenStreak ?: 0} ngày đã tạm dừng", fontSize = 13.5.sp, fontWeight = FontWeight.Bold, color = RedBad)
                                                    Text("Hãy học 1 bài hôm nay để khởi động lại chuỗi mới.", fontSize = 12.5.sp, color = InkBlack, lineHeight = 18.sp)
                                                }
                                            }
                                        }
                                        if (due == 0 && !atRisk && !broken) {
                                            Surface(
                                                modifier = Modifier.fillMaxWidth(),
                                                shape = RoundedCornerShape(16.dp),
                                                color = PaperMuted,
                                            ) {
                                                Text(
                                                    text = "Không có thông báo mới. Bạn đang giữ nhịp độ học tập rất ổn định.",
                                                    fontSize = 13.sp,
                                                    color = InkMuted,
                                                    modifier = Modifier.padding(14.dp),
                                                    lineHeight = 19.sp,
                                                )
                                            }
                                        }
                                    }

                                    Box(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .clickable(
                                                interactionSource = remember { MutableInteractionSource() },
                                                indication = null,
                                            ) { showNoticePanel = false }
                                            .padding(top = 4.dp),
                                        contentAlignment = Alignment.Center,
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .width(42.dp)
                                                .height(4.dp)
                                                .clip(CircleShape)
                                                .background(LineDark)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Streak Dialog from WebTopBar flame pill
                if (showStreakDialog) {
                    val s = stats
                    val days = s?.streak ?: currentUser.streak
                    val studied = s?.studiedToday == true
                    val broken = s?.brokenStreak ?: 0
                    val headline = when {
                        studied -> "Chuỗi $days ngày đã được thắp sáng hôm nay"
                        days > 0 -> "Chuỗi $days ngày đang chờ bạn giữ lửa"
                        broken > 0 -> "Chuỗi $broken ngày đã tắt · Bắt đầu lại hôm nay"
                        else -> "Chưa có chuỗi · Học 1 bài để khởi động"
                    }
                    val detailCopy = when {
                        studied -> "Hoàn thành ít nhất một thẻ nhớ mỗi ngày để nối dài chuỗi học tập."
                        days > 0 -> "Ôn tập ít nhất một từ vựng ngay hôm nay để chuỗi không bị đứt vào cuối ngày."
                        else -> "Ôn tập một từ bất kỳ để khởi tạo lại ngọn lửa chuỗi học tập của bạn."
                    }

                    AlertDialog(
                        onDismissRequest = { showStreakDialog = false },
                        containerColor = PaperPure,
                        shape = RoundedCornerShape(24.dp),
                        title = {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                Surface(
                                    shape = CircleShape,
                                    color = if (days > 0 || studied) FlameBg else PaperMuted,
                                    border = BorderStroke(1.dp, if (days > 0 || studied) FlameBorder else InkBorder),
                                    modifier = Modifier.size(40.dp),
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        VectorFlameCanvas(active = days > 0 || studied, litToday = studied, modifier = Modifier.size(width = 18.dp, height = 22.dp))
                                    }
                                }
                                Text("Chuỗi học tập", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            }
                        },
                        text = {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text(headline, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = if (studied) JadeGreen else FlameOrange)
                                Text(detailCopy, fontSize = 13.sp, color = InkMuted, lineHeight = 19.sp)
                                Surface(shape = RoundedCornerShape(14.dp), color = PaperMuted) {
                                    Row(
                                        Modifier.fillMaxWidth().padding(12.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically,
                                    ) {
                                        Text("Tổng XP tích lũy", fontSize = 12.5.sp, color = InkMuted)
                                        Text("${s?.xp ?: currentUser.xp} XP", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                                    }
                                }
                            }
                        },
                        confirmButton = {
                            if (!studied) {
                                Button(
                                    onClick = {
                                        showStreakDialog = false
                                        hskLevel = currentUser.targetHskLevel?.coerceIn(1, 3) ?: 1
                                        tab = AppDestination.Review
                                    },
                                    shape = CircleShape,
                                    colors = ButtonDefaults.buttonColors(containerColor = InkBlack),
                                ) {
                                    Text("Ôn ngay", fontWeight = FontWeight.Bold)
                                }
                            } else {
                                TextButton(onClick = { showStreakDialog = false }) {
                                    Text("Đóng", color = InkBlack, fontWeight = FontWeight.Bold)
                                }
                            }
                        },
                        dismissButton = {
                            if (!studied) {
                                TextButton(onClick = { showStreakDialog = false }) {
                                    Text("Để sau", color = InkMuted)
                                }
                            }
                        },
                    )
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
private fun PillSearchInput(
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    onSubmit: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.height(48.dp),
        shape = CircleShape,
        color = PaperMuted,
        border = BorderStroke(1.dp, InkBorder.copy(alpha = 0.7f)),
    ) {
        Row(
            modifier = Modifier.fillMaxSize().padding(start = 18.dp, end = 5.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.CenterStart) {
                if (value.isEmpty()) {
                    Text(
                        text = placeholder,
                        color = InkLight,
                        fontSize = 13.5.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                BasicTextField(
                    value = value,
                    onValueChange = onValueChange,
                    singleLine = true,
                    textStyle = TextStyle(color = InkBlack, fontSize = 14.sp, fontWeight = FontWeight.Medium),
                    cursorBrush = SolidColor(Brand),
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Search),
                    keyboardActions = KeyboardActions(onSearch = { onSubmit() }),
                    modifier = Modifier.fillMaxWidth(),
                )
            }
            if (value.isNotEmpty()) {
                CircleActionButton(
                    onClick = { onValueChange("") },
                    size = 30.dp,
                    containerColor = Color.Transparent,
                ) {
                    Icon(Icons.Rounded.Close, contentDescription = "Xóa", tint = InkMuted, modifier = Modifier.size(16.dp))
                }
            }
            Surface(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .clickable(onClick = onSubmit),
                shape = CircleShape,
                color = InkBlack,
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Rounded.Search,
                        contentDescription = "Tìm",
                        tint = Color.White,
                        modifier = Modifier.size(18.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun CleanLoadingScreen() {
    ChainaStrokeLoading(
        mode = ChainaLoadingMode.FULL_SCREEN,
        background = ChainaLoadingBackground.PAPER,
        message = "Đang khởi tạo không gian học tập…",
    )
}

@Composable
private fun AuthScreen(api: ApiClient, onAuthenticated: suspend (String, User, Boolean) -> Unit) {
    val context = LocalContext.current
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
    var googleBusy by remember { mutableStateOf(false) }
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

        Image(
            painterResource(R.drawable.chaina_wordmark),
            contentDescription = "Chaina",
            modifier = Modifier.width(148.dp).height(48.dp)
        )

        Text(
            text = if (registering) "Tạo tài khoản mới" else "Chào mừng trở lại",
            fontSize = 24.sp,
            fontWeight = FontWeight.ExtraBold,
            color = InkBlack,
            modifier = Modifier.padding(top = 18.dp)
        )
        Text(
            text = if (registering) "Tạo Chaina ID để đồng bộ tiến độ học tập." else "Đăng nhập để tiếp tục hành trình HSK.",
            color = InkMuted,
            fontSize = 13.sp,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 4.dp, bottom = 22.dp)
        )

        InkCard(
            modifier = Modifier.widthIn(max = 500.dp).fillMaxWidth(),
            shapeRadius = 24.dp,
        ) {
            Column(
                Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(13.dp)
            ) {
                // Tiếp tục với Google
                GoogleSignInButton(
                    onClick = {
                        scope.launch {
                            error = null
                            val webClientId = BuildConfig.GOOGLE_WEB_CLIENT_ID
                            if (webClientId.isBlank()) {
                                error = "Chưa cấu hình GOOGLE_WEB_CLIENT_ID trong gradle.properties."
                                return@launch
                            }
                            googleBusy = true
                            try {
                                val credentialManager = CredentialManager.create(context)
                                val googleIdOption = GetGoogleIdOption.Builder()
                                    .setFilterByAuthorizedAccounts(false)
                                    .setServerClientId(webClientId)
                                    .setAutoSelectEnabled(false)
                                    .build()
                                val req = GetCredentialRequest.Builder()
                                    .addCredentialOption(googleIdOption)
                                    .build()
                                val response = credentialManager.getCredential(
                                    request = req,
                                    context = context,
                                )
                                val cred = response.credential
                                if (cred is CustomCredential &&
                                    cred.type == GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL
                                ) {
                                    val googleCred = GoogleIdTokenCredential.createFrom(cred.data)
                                    val idToken = googleCred.idToken
                                    val (token, signedIn, isNew) = api.googleAuth(idToken)
                                    onAuthenticated(token, signedIn, isNew)
                                } else {
                                    error = "Không nhận diện được phản hồi xác thực Google."
                                }
                            } catch (e: GetCredentialCancellationException) {
                                // Người dùng bấm huỷ
                            } catch (e: CancellationException) {
                                throw e
                            } catch (e: Exception) {
                                error = e.message ?: "Đăng nhập Google thất bại."
                            } finally {
                                googleBusy = false
                            }
                        }
                    },
                    loading = googleBusy,
                    enabled = !busy && !googleBusy,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    HorizontalDivider(modifier = Modifier.weight(1f), color = InkBorder.copy(alpha = 0.7f))
                    Text(
                        text = if (registering) "hoặc bằng email" else "hoặc bằng tài khoản",
                        color = InkMuted,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 10.dp)
                    )
                    HorizontalDivider(modifier = Modifier.weight(1f), color = InkBorder.copy(alpha = 0.7f))
                }
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
                            } catch (e: CancellationException) {
                                throw e
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
                        color = BrandDark,
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp
                    )
                }
            }
        }

        Spacer(Modifier.height(26.dp))
        Text(
            "HỌC TỪNG CHÚT · TIẾN BỘ MỖI NGÀY",
            fontSize = 10.sp,
            letterSpacing = 1.2.sp,
            color = InkMuted,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun GoogleSignInButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
) {
    Surface(
        onClick = onClick,
        enabled = enabled && !loading,
        shape = RoundedCornerShape(16.dp),
        color = Color.White,
        border = BorderStroke(1.dp, InkBorder),
        shadowElevation = 0.5.dp,
        modifier = modifier.height(48.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxSize().padding(horizontal = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            if (loading) {
                ChainaStrokeLoading(
                    mode = ChainaLoadingMode.COMPACT,
                    widthDp = 22.dp,
                    background = ChainaLoadingBackground.LIGHT,
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = "Đang xác thực với Google…",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = InkBlack
                )
            } else {
                Image(
                    painter = painterResource(R.drawable.ic_google_logo),
                    contentDescription = "Google",
                    modifier = Modifier.size(20.dp)
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = "Tiếp tục với Google",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = InkBlack
                )
            }
        }
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
    ChainaAvatar("dragon", "Hoàng Long", "🐲", "金龙", "Rồng Vàng Hoàng Gia · Vương giả HSK", isLimited = true, tag = "LIMITED", gradientColors = listOf(Color(0xFFFFD700), Color(0xFFFFA500))),
    ChainaAvatar("phoenix", "Chu Tước", "🔥", "朱雀", "Phượng Hoàng Lửa · Tái sinh & Bất diệt", isLimited = true, tag = "LIMITED", gradientColors = listOf(Color(0xFFFF416C), Color(0xFFFF4B2B))),
    ChainaAvatar("scholar", "Trạng Nguyên", "👑", "状元", "Trạng Nguyên Bảng Nhãn · Đỉnh cao học vấn", isLimited = true, tag = "VIP", gradientColors = listOf(Color(0xFF8E2DE2), Color(0xFF4A00E0))),
    ChainaAvatar("palace", "Cố Cung", "🏯", "紫禁城", "Hoàng Thành Cố Cung · Bản sắc ngàn năm", isLimited = true, tag = "MYTHIC", gradientColors = listOf(Color(0xFFE65C00), Color(0xFFF9D423))),
    ChainaAvatar("monkey", "Mỹ Hầu Vương", "🐵", "美猴王", "Tề Thiên Đại Thánh · Trí dũng vô song", isLimited = true, tag = "EVENT", gradientColors = listOf(Color(0xFFFF8008), Color(0xFFFFC837))),
    ChainaAvatar("moon", "Nguyệt Lão", "🌙", "月老", "Trăng Rằm Viên Mãn · Trí tuệ thấu suốt", isLimited = true, tag = "LIMITED", gradientColors = listOf(Color(0xFF3A1C71), Color(0xFFD76D77))),
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
private fun HomeScreen(
    api: ApiClient,
    user: User,
    stats: Stats?,
    levels: List<LevelProgress>,
    daily: Word?,
    activity: ActivityData?,
    leaderboardTop: List<JSONObject>,
    loading: Boolean,
    error: String?,
    onRefresh: () -> Unit,
    onChooseLevel: (Int) -> Unit,
    onOpenPath: () -> Unit,
    onLeaderboard: () -> Unit,
    onStats: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val tts = remember(context) { TextToSpeech(context) { } }
    DisposableEffect(tts) { onDispose { tts.stop(); tts.shutdown() } }

    var dailyFavorite by remember { mutableStateOf(false) }

    LaunchedEffect(daily?.id) {
        val wordId = daily?.id ?: return@LaunchedEffect
        dailyFavorite = runCatching {
            api.favorites().let { arr ->
                (0 until arr.length()).any { i ->
                    val row = arr.optJSONObject(i)
                    val wId = row?.optJSONObject("word")?.optInt("id") ?: row?.optInt("wordId") ?: row?.optInt("id") ?: 0
                    wId == wordId
                }
            }
        }.getOrDefault(false)
    }

    val headerSubtitle = remember(user.fullName, user.username) {
        val cal = Calendar.getInstance()
        val hour = cal.get(Calendar.HOUR_OF_DAY)
        val greeting = when (hour) {
            in 5..10 -> "Chào buổi sáng"
            in 11..13 -> "Chào buổi trưa"
            in 14..17 -> "Chào buổi chiều"
            else -> "Chào buổi tối"
        }
        val dayOfWeek = when (cal.get(Calendar.DAY_OF_WEEK)) {
            Calendar.MONDAY -> "Thứ Hai"
            Calendar.TUESDAY -> "Thứ Ba"
            Calendar.WEDNESDAY -> "Thứ Tư"
            Calendar.THURSDAY -> "Thứ Năm"
            Calendar.FRIDAY -> "Thứ Sáu"
            Calendar.SATURDAY -> "Thứ Bảy"
            else -> "Chủ Nhật"
        }
        val displayName = user.fullName?.trim()?.ifBlank { user.username } ?: user.username
        val day = cal.get(Calendar.DAY_OF_MONTH)
        val month = cal.get(Calendar.MONTH) + 1
        "$greeting, $displayName · $dayOfWeek, $day tháng $month"
    }

    val dueCount = stats?.due ?: 0
    val targetLevel = user.targetHskLevel?.coerceIn(1, 3) ?: 1
    val streakDays = stats?.streak ?: user.streak
    val myXp = stats?.xp ?: user.xp
    val isStudiedToday = stats?.studiedToday == true
    val todayReviews = activity?.today ?: 0
    val dailyGoal = (activity?.goal ?: 20).coerceAtLeast(1)

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        // 1. Header Tổng quan & Mục tiêu cá nhân
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "Dashboard",
                    fontSize = 28.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = InkBlack,
                    letterSpacing = (-0.6).sp,
                )
                Surface(
                    shape = CircleShape,
                    color = BrandSoft,
                    border = BorderStroke(1.dp, BrandBorder),
                ) {
                    Text(
                        text = "Mục tiêu HSK $targetLevel",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = BrandDark,
                        modifier = Modifier.padding(horizontal = 11.dp, vertical = 5.dp),
                    )
                }
            }
            Text(
                text = headerSubtitle,
                fontSize = 13.5.sp,
                color = InkMuted,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        }

        if (loading && stats == null) {
            ChainaStrokeLoading(
                mode = ChainaLoadingMode.INLINE,
                size = ChainaLoadingSize.SM,
                message = "Đang tải tổng quan…",
            )
        }
        error?.let {
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 18.dp,
                backgroundColor = RedSoft,
                borderColor = RedBorder,
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth().padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = it,
                        color = RedBad,
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.weight(1f).padding(end = 10.dp),
                    )
                    OutlinedButton(onClick = onRefresh, shape = CircleShape, border = BorderStroke(1.dp, RedBorder)) {
                        Icon(Icons.Rounded.Refresh, contentDescription = null, modifier = Modifier.size(15.dp), tint = RedBad)
                        Spacer(Modifier.width(4.dp))
                        Text("Thử lại", color = RedBad, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // 2. Chỉ số nhanh hôm nay (3-Tile Pastel Bento Overview Strip)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Max),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            OverviewKpiTile(
                label = "Đến hạn",
                value = "$dueCount",
                unit = "từ",
                caption = if (dueCount > 0) "Cần ôn tập" else "Đã dọn sạch",
                startColor = BentoLavenderStart,
                endColor = BentoLavenderEnd,
                borderColor = BrandBorder,
                onClick = { onChooseLevel(targetLevel) },
                modifier = Modifier.weight(1f).fillMaxHeight(),
            )

            val goalReached = todayReviews >= dailyGoal
            OverviewKpiTile(
                label = "Hôm nay",
                value = "$todayReviews",
                unit = "/$dailyGoal",
                caption = if (goalReached) "Đạt mục tiêu ✓" else "Lượt ôn",
                startColor = if (goalReached) BentoMintStart else BentoSkyStart,
                endColor = if (goalReached) BentoMintEnd else BentoSkyEnd,
                borderColor = if (goalReached) JadeBorder else Color(0xFFBAD8F7),
                onClick = onStats,
                modifier = Modifier.weight(1f).fillMaxHeight(),
            )

            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(20.dp))
                    .background(
                        if (streakDays > 0 || isStudiedToday) {
                            Brush.linearGradient(listOf(BentoPeachStart, BentoPeachEnd))
                        } else {
                            Brush.linearGradient(listOf(PaperPure, PaperPure))
                        }
                    )
                    .border(
                        1.dp,
                        if (streakDays > 0 || isStudiedToday) FlameBorder else InkBorder,
                        RoundedCornerShape(20.dp),
                    )
                    .clickable(onClick = onStats)
                    .padding(horizontal = 12.dp, vertical = 12.dp),
            ) {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    verticalArrangement = Arrangement.SpaceBetween,
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        VectorFlameCanvas(
                            active = streakDays > 0 || isStudiedToday,
                            litToday = isStudiedToday,
                            modifier = Modifier.size(width = 11.dp, height = 14.dp),
                        )
                        Text(
                            text = "Chuỗi",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkMuted,
                        )
                    }
                    Column {
                        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(3.dp)) {
                            Text(
                                text = "$streakDays",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = InkBlack,
                                lineHeight = 24.sp,
                            )
                            Text(
                                text = "ngày",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = InkMuted,
                                modifier = Modifier.padding(bottom = 2.dp),
                            )
                        }
                        Text(
                            text = "$myXp XP",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (streakDays > 0 || isStudiedToday) FlameOrange else InkMuted,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }

        // 3. Nhiệm vụ hôm nay (đồng bộ 3 nhiệm vụ thật từ Web Dashboard)
        val taskGoalDone = todayReviews >= dailyGoal
        val taskDueDone = stats != null && dueCount == 0
        val taskStreakDone = isStudiedToday
        val completedCount = (if (taskGoalDone) 1 else 0) + (if (taskDueDone) 1 else 0) + (if (taskStreakDone) 1 else 0)
        val remainingTasks = 3 - completedCount
        val dueRatio = if (dueCount == 0) 1f else if (todayReviews + dueCount > 0) (todayReviews.toFloat() / (todayReviews + dueCount)).coerceIn(0f, 1f) else 0f

        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 24.dp,
            backgroundColor = PaperPure,
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("Nhiệm vụ hôm nay", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                        Text(
                            text = if (remainingTasks > 0) "Còn $remainingTasks nhiệm vụ · Hết hạn tối nay" else "Bạn đã hoàn thành tất cả",
                            fontSize = 12.sp,
                            color = InkMuted,
                        )
                    }
                    Surface(
                        shape = CircleShape,
                        color = if (completedCount == 3) JadeSoft else PaperMuted,
                        border = BorderStroke(1.dp, if (completedCount == 3) JadeBorder else InkBorder),
                    ) {
                        Text(
                            text = "$completedCount/3 xong",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (completedCount == 3) JadeGreen else InkBlack,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                        )
                    }
                }

                DashboardTaskItem(
                    icon = Icons.Rounded.TaskAlt,
                    title = "Đạt mục tiêu $dailyGoal lượt ôn",
                    progressLabel = "$todayReviews/$dailyGoal",
                    progress = (todayReviews.toFloat() / dailyGoal).coerceIn(0f, 1f),
                    done = taskGoalDone,
                    onClick = { onChooseLevel(targetLevel) },
                )

                DashboardTaskItem(
                    icon = Icons.Rounded.CheckCircle,
                    title = if (dueCount > 0) "Ôn $dueCount từ đã đến hạn" else "Ôn các từ đã đến hạn",
                    progressLabel = if (taskDueDone) "Xong" else "Còn $dueCount",
                    progress = dueRatio,
                    done = taskDueDone,
                    onClick = { onChooseLevel(targetLevel) },
                )

                DashboardTaskItem(
                    icon = Icons.Rounded.LocalFireDepartment,
                    title = if (streakDays > 0) "Giữ chuỗi $streakDays ngày học" else "Bắt đầu chuỗi ngày học",
                    progressLabel = if (taskStreakDone) "Đã giữ" else "Chưa ôn",
                    progress = if (taskStreakDone) 1f else 0f,
                    done = taskStreakDone,
                    onClick = { onChooseLevel(targetLevel) },
                )
            }
        }

        // 4. Tiến độ khóa học HSK 1–3 (thuần xem tiến độ, không kèm thanh tìm kiếm thừa)
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 24.dp,
            backgroundColor = PaperPure,
        ) {
            Column(
                modifier = Modifier.fillMaxWidth().padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Top,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(
                            text = "Khóa học của tôi",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkBlack,
                        )
                        Text(
                            text = "Tiến độ từ vựng theo cấp độ HSK",
                            fontSize = 12.5.sp,
                            color = InkMuted,
                            modifier = Modifier.padding(top = 2.dp),
                        )
                    }
                    Surface(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .clickable(onClick = onOpenPath),
                        shape = CircleShape,
                        color = PaperMuted,
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            ArrowUpRightIcon(tint = InkBlack, modifier = Modifier.size(16.dp))
                        }
                    }
                }

                val numerals = mapOf(1 to "一级", 2 to "二级", 3 to "三级")
                Column(verticalArrangement = Arrangement.spacedBy(13.dp)) {
                    (1..3).forEach { level ->
                        val progress = levels.find { it.level == level }
                        val totalWords = progress?.total ?: when (level) { 1 -> 520; 2 -> 856; else -> 1203 }
                        val startedWords = progress?.started ?: 0
                        val masteredWords = progress?.mastered ?: 0
                        val rawRatio = if (totalWords > 0) (startedWords.toFloat() / totalWords.toFloat()).coerceIn(0f, 1f) else 0f
                        val visualRatio = if (startedWords > 0 && rawRatio < 0.015f) 0.015f else rawRatio
                        val animatedProgress by animateFloatAsState(
                            targetValue = visualRatio,
                            animationSpec = tween(550, easing = FastOutSlowInEasing),
                            label = "course-hsk-$level",
                        )

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(10.dp))
                                .clickable { onChooseLevel(level) }
                                .padding(vertical = 2.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                ) {
                                    Text(
                                        text = numerals[level] ?: "一",
                                        fontSize = 15.sp,
                                        color = InkMuted,
                                    )
                                    Text(
                                        text = "HSK $level",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = InkBlack,
                                    )
                                    if (level == targetLevel) {
                                        Surface(
                                            shape = CircleShape,
                                            color = BrandSoft,
                                            border = BorderStroke(0.8.dp, BrandBorder),
                                        ) {
                                            Text(
                                                text = "Mục tiêu",
                                                color = BrandDark,
                                                fontSize = 9.5.sp,
                                                fontWeight = FontWeight.Bold,
                                                modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp),
                                            )
                                        }
                                    }
                                }
                                Text(
                                    text = "$startedWords/$totalWords từ",
                                    fontSize = 12.sp,
                                    color = InkBlack,
                                    fontWeight = FontWeight.SemiBold,
                                )
                            }

                            CapsuleProgressBar(
                                progress = animatedProgress,
                                color = if (level == targetLevel) Brand else InkBlack,
                                trackColor = PaperMuted,
                            )

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                            ) {
                                Text(
                                    text = "$masteredWords từ đã thuộc vững",
                                    fontSize = 11.sp,
                                    color = InkMuted,
                                )
                                Text(
                                    text = "${(rawRatio * 100).toInt()}%",
                                    fontSize = 11.sp,
                                    color = InkMuted,
                                    fontWeight = FontWeight.SemiBold,
                                )
                            }
                        }
                    }
                }
            }
        }

        // 5. Hiệu suất học tập 7 ngày gần nhất (Weekly Chart)
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 24.dp,
            backgroundColor = PaperPure,
        ) {
            Column(
                modifier = Modifier.padding(18.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text("Hiệu suất học tập", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                        Text(
                            text = if (streakDays > 0) "Chuỗi $streakDays ngày · 7 ngày gần nhất" else "7 ngày gần nhất · Mục tiêu $dailyGoal lượt/ngày",
                            fontSize = 12.sp,
                            color = InkMuted,
                        )
                    }
                    Surface(
                        modifier = Modifier.clip(CircleShape).clickable(onClick = onStats),
                        shape = CircleShape,
                        color = PaperMuted,
                        border = BorderStroke(1.dp, InkBorder),
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                        ) {
                            Text("Chi tiết", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = InkBlack)
                            ArrowUpRightIcon(tint = InkBlack, modifier = Modifier.size(12.dp))
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Box(Modifier.size(8.dp).clip(CircleShape).background(BrandDark))
                        Text("Lượt ôn mỗi ngày", fontSize = 11.5.sp, color = InkMuted)
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        Box(Modifier.width(12.dp).height(1.5.dp).background(BrandDark.copy(alpha = 0.55f)))
                        Text("Mục tiêu $dailyGoal lượt", fontSize = 11.5.sp, color = InkMuted)
                    }
                }

                WebWeeklyChart(
                    days = activity?.days ?: emptyList(),
                    goal = dailyGoal,
                )
            }
        }

        // 6. Bảng xếp hạng Top 3 & Khoảng cách XP của bạn
        if (leaderboardTop.isNotEmpty()) {
            val podiumColors = listOf(ToneLavenderStart, ToneSkyStart, ToneLimeStart)
            val thirdXp = leaderboardTop.getOrNull(2)?.optInt("xp")
            val gap = if (thirdXp != null && myXp < thirdXp) thirdXp - myXp else 0

            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 24.dp,
                backgroundColor = PaperPure,
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text("Bảng xếp hạng", fontSize = 17.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            Text(
                                text = if (gap > 0) "Bạn có $myXp XP · còn $gap XP để vào top 3" else "Bạn đang có $myXp XP",
                                fontSize = 12.sp,
                                color = InkMuted,
                            )
                        }
                        Surface(
                            modifier = Modifier.clip(CircleShape).clickable(onClick = onLeaderboard),
                            shape = CircleShape,
                            color = PaperMuted,
                            border = BorderStroke(1.dp, InkBorder),
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                            ) {
                                Text("Tất cả", fontSize = 11.5.sp, fontWeight = FontWeight.SemiBold, color = InkBlack)
                                ArrowUpRightIcon(tint = InkBlack, modifier = Modifier.size(12.dp))
                            }
                        }
                    }

                    leaderboardTop.forEachIndexed { idx, row ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .clickable(onClick = onLeaderboard)
                                .padding(vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp),
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = podiumColors.getOrElse(idx) { PaperMuted },
                                modifier = Modifier.size(34.dp),
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text(
                                        text = "${row.optInt("rank", idx + 1)}",
                                        fontWeight = FontWeight.ExtraBold,
                                        fontSize = 13.sp,
                                        color = InkBlack,
                                    )
                                }
                            }
                            Column(Modifier.weight(1f)) {
                                Text(
                                    text = row.optString("name", "Học viên"),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = InkBlack,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                                Text(
                                    text = "Chuỗi ${row.optInt("streak")} ngày",
                                    fontSize = 11.5.sp,
                                    color = InkMuted,
                                )
                            }
                            Text(
                                text = "${row.optInt("xp")} XP",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = BrandDark,
                            )
                        }
                    }
                }
            }
        }

        // 7. Chữ Hán hôm nay (1 từ nổi bật trong ngày để xem nhanh)
        daily?.let { word ->
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 24.dp,
                backgroundColor = PaperPure,
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            Text("Chữ Hán hôm nay", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            Surface(
                                color = BrandSoft,
                                shape = CircleShape,
                                border = BorderStroke(0.8.dp, BrandBorder),
                            ) {
                                Text(
                                    text = "HSK ${word.hskLevel}",
                                    color = BrandDark,
                                    fontSize = 10.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                )
                            }
                        }

                        Row(
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            CircleActionButton(
                                onClick = {
                                    tts.language = Locale.SIMPLIFIED_CHINESE
                                    tts.speak(word.hanzi, TextToSpeech.QUEUE_FLUSH, null, "home-daily-tts")
                                },
                                size = 38.dp,
                                containerColor = BrandSoft,
                                borderColor = BrandBorder,
                            ) {
                                Icon(Icons.AutoMirrored.Rounded.VolumeUp, contentDescription = "Nghe phát âm", tint = BrandDark, modifier = Modifier.size(19.dp))
                            }
                            CircleActionButton(
                                onClick = {
                                    scope.launch {
                                        val next = !dailyFavorite
                                        runCatching { api.setFavorite(word.id, next) }.onSuccess { dailyFavorite = next }
                                    }
                                },
                                size = 38.dp,
                                containerColor = if (dailyFavorite) AmberSoft else PaperMuted,
                                borderColor = if (dailyFavorite) AmberBorder else InkBorder,
                            ) {
                                Icon(
                                    imageVector = if (dailyFavorite) Icons.Rounded.Bookmark else Icons.Rounded.BookmarkBorder,
                                    contentDescription = if (dailyFavorite) "Bỏ lưu" else "Lưu sổ từ",
                                    tint = if (dailyFavorite) AmberGold else InkMuted,
                                    modifier = Modifier.size(19.dp),
                                )
                            }
                        }
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom,
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(word.hanzi, fontSize = 36.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            Text(word.pinyin, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = BrandDark)
                        }
                        word.hanviet?.let { hv ->
                            Surface(
                                color = PaperMuted,
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, InkBorder),
                            ) {
                                Text(
                                    text = hv.uppercase(),
                                    color = InkBlack,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = InkBorder.copy(alpha = 0.7f))

                    Text(
                        text = word.meaningVi.ifBlank { "Chưa có nghĩa tiếng Việt" },
                        fontSize = 14.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = InkBlack,
                        lineHeight = 20.sp,
                    )
                }
            }
        }

        Spacer(Modifier.height(10.dp))
    }
}

@Composable
private fun OverviewKpiTile(
    label: String,
    value: String,
    unit: String,
    caption: String,
    startColor: Color,
    endColor: Color,
    borderColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.linearGradient(listOf(startColor, endColor)))
            .border(1.dp, borderColor, RoundedCornerShape(20.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 12.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = label,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = InkBlack.copy(alpha = 0.68f),
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
            Column {
                Row(
                    verticalAlignment = Alignment.Bottom,
                    horizontalArrangement = Arrangement.spacedBy(3.dp),
                ) {
                    Text(
                        text = value,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = InkBlack,
                        lineHeight = 24.sp,
                    )
                    Text(
                        text = unit,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = InkBlack.copy(alpha = 0.65f),
                        modifier = Modifier.padding(bottom = 2.dp),
                    )
                }
                Text(
                    text = caption,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = InkBlack.copy(alpha = 0.72f),
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
    }
}

@Composable
private fun DashboardTaskItem(
    icon: ImageVector,
    title: String,
    progressLabel: String,
    progress: Float,
    done: Boolean,
    onClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .clickable(onClick = onClick)
            .padding(vertical = 4.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Surface(
            modifier = Modifier.size(36.dp),
            shape = RoundedCornerShape(10.dp),
            color = if (done) JadeSoft else InkBlack,
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (done) JadeGreen else Color.White,
                    modifier = Modifier.size(18.dp),
                )
            }
        }
        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = title,
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = InkBlack,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f),
                )
                Spacer(Modifier.width(8.dp))
                Text(
                    text = progressLabel,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (done) JadeGreen else InkMuted,
                )
            }
            CapsuleProgressBar(
                progress = progress,
                color = if (done) EmeraldDot else InkBlack,
                trackColor = PaperMuted,
            )
        }
    }
}

@Composable
private fun CapsuleProgressBar(
    progress: Float,
    color: Color,
    trackColor: Color = PaperMuted,
) {
    val ratio = progress.coerceIn(0f, 1f)
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(5.dp)
            .clip(CircleShape)
            .background(trackColor),
    ) {
        if (ratio > 0f) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(ratio)
                    .clip(CircleShape)
                    .background(color),
            )
        }
    }
}

@Composable
private fun WordsScreen(
    api: ApiClient,
    externalQuery: String = "",
    searchTrigger: Int = 0,
    onOpenCamera: () -> Unit = {},
) {
    var query by remember { mutableStateOf(externalQuery) }
    var submitted by remember { mutableStateOf(externalQuery) }
    var level by remember { mutableIntStateOf(0) }
    var words by remember { mutableStateOf<List<Word>>(emptyList()) }
    var favoriteIds by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var selected by remember { mutableStateOf<Word?>(null) }

    LaunchedEffect(searchTrigger) {
        if (searchTrigger > 0) {
            query = externalQuery
            submitted = externalQuery
        }
    }

    LaunchedEffect(Unit) {
        favoriteIds = runCatching {
            val arr = api.favorites()
            buildSet {
                for (i in 0 until arr.length()) {
                    val row = arr.optJSONObject(i) ?: continue
                    val wId = row.optJSONObject("word")?.optInt("id") ?: row.optInt("wordId").takeIf { it > 0 } ?: row.optInt("id")
                    if (wId > 0) add(wId)
                }
            }
        }.getOrDefault(emptySet())
    }

    LaunchedEffect(level, submitted) {
        loading = true
        error = null
        try {
            words = api.words(level, submitted)
        } catch (e: CancellationException) {
            throw e
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
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            PillSearchInput(
                value = query,
                onValueChange = {
                    query = it
                    if (it.isBlank()) submitted = ""
                },
                placeholder = "Tìm chữ Hán, pinyin, nghĩa...",
                onSubmit = { submitted = query },
                modifier = Modifier.weight(1f),
            )
            CircleActionButton(
                onClick = onOpenCamera,
                size = 44.dp,
                containerColor = BrandSoft,
                borderColor = BrandBorder,
            ) {
                Icon(
                    imageVector = Icons.Outlined.PhotoCamera,
                    contentDescription = "Dịch bằng máy ảnh",
                    tint = BrandDark,
                    modifier = Modifier.size(21.dp),
                )
            }
        }

        Row(
            Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState())
                .padding(top = 10.dp, bottom = 10.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf(0 to "Tất cả", 1 to "HSK 1", 2 to "HSK 2", 3 to "HSK 3").forEach { (valLevel, label) ->
                val isSelected = level == valLevel
                Surface(
                    modifier = Modifier
                        .clip(CircleShape)
                        .clickable { level = valLevel },
                    shape = CircleShape,
                    color = if (isSelected) InkBlack else PaperPure,
                    border = BorderStroke(1.dp, if (isSelected) InkBlack else InkBorder),
                ) {
                    Text(
                        text = label,
                        fontSize = 12.5.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else InkMuted,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                    )
                }
            }
        }

        error?.let { ErrorMessage(it) }

        if (loading && words.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                ChainaStrokeLoading(
                    mode = ChainaLoadingMode.INLINE,
                    size = ChainaLoadingSize.MD,
                    delayMs = 120L,
                    message = "Đang tải kho từ vựng…",
                )
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
                    FeatureWordRow(word = word) { selected = word }
                }
                if (loading) {
                    item {
                        ChainaStrokeLoading(
                            mode = ChainaLoadingMode.INLINE,
                            size = ChainaLoadingSize.SM,
                        )
                    }
                }
            }
        }
    }

    selected?.let { word ->
        FeatureWordDialog(
            word = word,
            api = api,
            isFavorite = word.id in favoriteIds,
            onFavoriteToggled = { isFav ->
                favoriteIds = if (isFav) favoriteIds + word.id else favoriteIds - word.id
            },
            onDismiss = { selected = null },
        )
    }
}

@Composable
private fun StudyScreen(api: ApiClient, initialLevel: Int, onStatsChanged: () -> Unit) {
    val context = LocalContext.current
    val tts = remember(context) { TextToSpeech(context) { } }
    DisposableEffect(tts) { onDispose { tts.stop(); tts.shutdown() } }

    var level by remember { mutableIntStateOf(initialLevel.coerceIn(1, 3)) }
    LaunchedEffect(initialLevel) {
        level = initialLevel.coerceIn(1, 3)
    }
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
        } catch (e: CancellationException) {
            throw e
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
                    Surface(
                        modifier = Modifier
                            .clip(CircleShape)
                            .clickable { level = lvl },
                        shape = CircleShape,
                        color = if (isSelected) BrandSoft else PaperPure,
                        border = BorderStroke(1.dp, if (isSelected) BrandBorder else InkBorder),
                    ) {
                        Text(
                            text = "HSK $lvl",
                            fontSize = 12.5.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) BrandDark else InkMuted,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                        )
                    }
                }
            }
            CircleActionButton(
                onClick = { key++ },
                size = 38.dp,
                containerColor = PaperPure,
                borderColor = InkBorder,
            ) {
                Icon(Icons.Rounded.Refresh, contentDescription = "Làm mới", tint = InkBlack, modifier = Modifier.size(18.dp))
            }
        }

        if (loading) {
            Box(Modifier.fillMaxWidth().height(280.dp), contentAlignment = Alignment.Center) {
                ChainaStrokeLoading(
                    mode = ChainaLoadingMode.INLINE,
                    size = ChainaLoadingSize.MD,
                    message = "Đang chuẩn bị thẻ flashcard…",
                )
            }
        } else if (error != null) {
            ErrorMessage(error!!)
            InkPrimaryButton(text = "Thử lại", onClick = { key++ })
        } else if (card == null) {
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 24.dp
            ) {
                Column(
                    Modifier
                        .fillMaxWidth()
                        .padding(26.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    LevelBadge("完", size = 56.dp, fontSize = 24.sp, solid = true)
                    Text(
                        if (completed > 0) "Hoàn thành phiên học!" else "Hôm nay đã ôn hết rồi",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkBlack
                    )
                    Text(
                        if (completed > 0) "Bạn đã hoàn thành $completed thẻ. Lịch lặp lại ngắt quãng đã được cập nhật." else "Tất cả các từ đến hạn đã được ôn tập. Bạn có thể chuyển sang tab Luyện tập hoặc tải phiên mới.",
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
                            shape = CircleShape,
                            border = BorderStroke(0.8.dp, BrandBorder)
                        ) {
                            Text(
                                "CÒN ${deck.size} THẺ",
                                color = BrandDark,
                                fontWeight = FontWeight.Bold,
                                fontSize = 10.sp,
                                letterSpacing = 1.sp,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                            CircleActionButton(
                                onClick = {
                                    tts.language = Locale.SIMPLIFIED_CHINESE
                                    tts.speak(card.word.hanzi, TextToSpeech.QUEUE_FLUSH, null, "study-tts-${card.word.id}")
                                },
                                size = 38.dp,
                                containerColor = BrandSoft,
                                borderColor = BrandBorder,
                            ) {
                                Icon(Icons.AutoMirrored.Rounded.VolumeUp, contentDescription = "Nghe phát âm", tint = BrandDark, modifier = Modifier.size(19.dp))
                            }
                            LevelBadge("HSK$level", size = 34.dp, fontSize = 10.sp, solid = false)
                        }
                    }

                    Text(
                        card.word.hanzi,
                        fontSize = 60.sp,
                        fontWeight = FontWeight.Medium,
                        color = InkBlack,
                        modifier = Modifier
                            .padding(top = 14.dp, bottom = 4.dp)
                            .clickable {
                                tts.language = Locale.SIMPLIFIED_CHINESE
                                tts.speak(card.word.hanzi, TextToSpeech.QUEUE_FLUSH, null, "study-tap-${card.word.id}")
                            }
                    )
                    Text(
                        card.word.pinyin,
                        color = BrandDark,
                        fontSize = 19.sp,
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
                            StudyOption("Tôi nhớ từ này", true),
                            StudyOption("Tôi chưa nhớ", false)
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
                                        } catch (e: CancellationException) {
                                            throw e
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
                        Row(
                            modifier = Modifier.padding(top = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            ChainaStrokeLoading(
                                mode = ChainaLoadingMode.COMPACT,
                                widthDp = 56.dp,
                                background = ChainaLoadingBackground.TRANSPARENT,
                            )
                            Text("Đang lưu kết quả…", color = InkMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                        }
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
            shapeRadius = 22.dp,
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
    icon: ImageVector,
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

            ArrowUpRightIcon(tint = InkMuted, modifier = Modifier.size(14.dp))
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
                        Text("LIMITED", color = AmberGold, fontSize = 10.sp, fontWeight = FontWeight.ExtraBold, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
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
                Row(
                    modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    listOf("Tất cả (12)", "Giới hạn (6)", "Linh vật (6)").forEachIndexed { index, title ->
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
                                        Text(
                                            avatar.name,
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = InkBlack,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Text(
                                            avatar.chineseName,
                                            fontSize = 10.sp,
                                            color = BrandDark,
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
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Đóng", fontWeight = FontWeight.Bold, color = BrandDark)
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
                        } catch (e: CancellationException) {
                            throw e
                        } catch (e: Exception) {
                            error = e.message ?: "Không thể đổi mật khẩu. Hãy kiểm tra lại mật khẩu cũ."
                        }
                        busy = false
                    }
                },
                enabled = !busy,
                colors = ButtonDefaults.buttonColors(containerColor = Brand)
            ) {
                if (busy) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ChainaStrokeLoading(mode = ChainaLoadingMode.COMPACT, widthDp = 46.dp, background = ChainaLoadingBackground.DARK)
                        Text("Đang lưu…", fontWeight = FontWeight.Bold)
                    }
                } else {
                    Text("Cập nhật", fontWeight = FontWeight.Bold)
                }
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
                        } catch (e: CancellationException) {
                            throw e
                        } catch (e: Exception) {
                            error = e.message ?: "Không lưu được hồ sơ."
                        }
                        busy = false
                    }
                },
                enabled = !busy,
                colors = ButtonDefaults.buttonColors(containerColor = Brand)
            ) {
                if (busy) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ChainaStrokeLoading(mode = ChainaLoadingMode.COMPACT, widthDp = 46.dp, background = ChainaLoadingBackground.DARK)
                        Text("Đang lưu…", fontWeight = FontWeight.Bold)
                    }
                } else {
                    Text("Lưu thay đổi", fontWeight = FontWeight.Bold)
                }
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
    type: String,
    onDismiss: () -> Unit,
) {
    val title = when (type) {
        "terms" -> "Bản quyền & Điều khoản dịch vụ"
        else -> "Về nền tảng Chaina HSK"
    }

    val content = when (type) {
        "terms" -> """
            1. Quyền sở hữu trí tuệ
            Toàn bộ giao diện, mã nguồn ứng dụng Android và hệ thống nhận diện thương hiệu Chaina thuộc bản quyền của dự án Chaina HSK.
            
            2. Mục đích Giáo dục
            Nền tảng được phát triển nhằm phục vụ cộng đồng người học tiếng Trung học tập hiệu quả và bền bỉ.
            
            3. Trách nhiệm người dùng
            Người dùng cam kết không can thiệp trái phép hoặc khai thác dịch vụ ngoài mục đích học tập.
        """.trimIndent()
        else -> """
            Chaina HSK — Ứng dụng học tiếng Trung & ôn tập SM-2.
            
            • Phiên bản: 1.0.0
            • Nền tảng: Kotlin, Jetpack Compose
            • Thuật toán ôn tập: SM-2 Spaced Repetition
            • AI Canvas: Nhận diện nét viết chữ Hán trên ô Mễ
            
            Học từng chút, tiến bộ mỗi ngày.
        """.trimIndent()
    }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PaperPure,
        shape = RoundedCornerShape(24.dp),
        title = { Text(title, fontWeight = FontWeight.Bold, fontSize = 17.sp, color = InkBlack) },
        text = {
            Column(Modifier.fillMaxWidth().verticalScroll(rememberScrollState())) {
                Text(content, fontSize = 13.sp, color = InkBlack, lineHeight = 20.sp)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Đã hiểu", fontWeight = FontWeight.Bold, color = BrandDark)
            }
        }
    )
}

@Composable
private fun AccountScreen(
    user: User,
    stats: Stats?,
    api: ApiClient,
    onSaved: (User) -> Unit,
    onFeedback: () -> Unit,
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
    var showLogoutConfirm by remember { mutableStateOf(false) }

    val streakDays = stats?.streak ?: user.streak

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 24.dp,
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
                    Box(
                        modifier = Modifier
                            .size(66.dp)
                            .clip(CircleShape)
                            .clickable { showAvatarPicker = true }
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Brush.linearGradient(currentAvatar.gradientColors)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = currentAvatar.emoji, fontSize = 32.sp)
                        }

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
                            if (user.isAdmin) {
                                Surface(
                                    color = BrandSoft,
                                    shape = RoundedCornerShape(6.dp),
                                    border = BorderStroke(0.8.dp, BrandBorder)
                                ) {
                                    Text(
                                        text = "ADMIN",
                                        color = BrandDark,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        modifier = Modifier.padding(horizontal = 5.dp, vertical = 2.dp)
                                    )
                                }
                            } else if (currentAvatar.isLimited) {
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
                            modifier = Modifier.padding(top = 6.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Surface(
                                color = BrandSoft,
                                shape = CircleShape,
                                border = BorderStroke(0.8.dp, BrandBorder)
                            ) {
                                Text(
                                    text = "HSK ${user.targetHskLevel ?: 1}",
                                    color = BrandDark,
                                    fontSize = 10.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                                )
                            }
                            Surface(
                                color = if (streakDays > 0) FlameBg else PaperMuted,
                                shape = CircleShape,
                                border = BorderStroke(0.8.dp, if (streakDays > 0) FlameBorder else InkBorder)
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                                ) {
                                    VectorFlameCanvas(
                                        active = streakDays > 0,
                                        litToday = stats?.studiedToday == true,
                                        modifier = Modifier.size(width = 11.dp, height = 14.dp),
                                    )
                                    Text(
                                        text = "$streakDays ngày",
                                        color = if (streakDays > 0) FlameOrange else InkMuted,
                                        fontSize = 10.5.sp,
                                        fontWeight = FontWeight.Bold,
                                    )
                                }
                            }
                        }
                    }
                }

                OutlinedButton(
                    onClick = { showAvatarPicker = true },
                    modifier = Modifier.fillMaxWidth().height(42.dp),
                    shape = CircleShape,
                    border = BorderStroke(1.dp, BrandBorder),
                    colors = ButtonDefaults.outlinedButtonColors(containerColor = BrandSoft.copy(alpha = 0.5f))
                ) {
                    Icon(Icons.Rounded.Face, contentDescription = null, tint = BrandDark, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Đổi Avatar & Bộ sưu tập", color = BrandDark, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

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
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
            AccountMenuItem(
                icon = Icons.Rounded.Person,
                title = "Chỉnh sửa hồ sơ học viên",
                subtitle = "Tên, tuổi, cấp độ HSK mục tiêu",
                onClick = { showEditProfile = true }
            )
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
            AccountMenuItem(
                icon = Icons.Rounded.Schedule,
                title = "Thời gian học mỗi ngày",
                subtitle = "${user.dailyStudyMinutes ?: 20} phút mỗi ngày",
                onClick = { showEditProfile = true }
            )
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
            AccountMenuItem(
                icon = Icons.Rounded.School,
                title = "Mục đích & Kinh nghiệm học",
                subtitle = if (user.studyPurpose == "conversation") "Giao tiếp đời sống" else "Luyện thi HSK",
                onClick = { showEditProfile = true }
            )
        }

        AccountSectionCard(title = "Bảo mật & Đăng nhập") {
            AccountMenuItem(
                icon = Icons.Rounded.Lock,
                title = "Đổi mật khẩu tài khoản",
                subtitle = "Cập nhật mật khẩu bảo vệ an toàn",
                trailingBadge = "BẢO MẬT",
                trailingBadgeColor = Brand,
                onClick = { showChangePassword = true }
            )
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
            AccountMenuItem(
                icon = Icons.Rounded.Email,
                title = "Email đăng nhập",
                subtitle = user.email,
                onClick = { }
            )
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
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

        AccountSectionCard(title = "Cộng đồng & Đóng góp") {
            AccountMenuItem(
                icon = Icons.Rounded.Feedback,
                title = "Khung ghi chú góp ý",
                subtitle = "Dán ghi chú bảo mật gửi tới quản trị viên",
                onClick = onFeedback,
            )
        }

        AccountSectionCard(title = "Bản quyền, Pháp lý & Dữ liệu") {
            AccountMenuItem(
                icon = Icons.Rounded.Shield,
                title = "Chính sách quyền riêng tư",
                subtitle = "Cam kết bảo mật dữ liệu học tập cá nhân",
                onClick = onPrivacy,
            )
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
            AccountMenuItem(
                icon = Icons.AutoMirrored.Rounded.MenuBook,
                title = "Nguồn dữ liệu từ vựng HSK",
                subtitle = "CC-CEDICT, CVDICT, HanziWriter, Tatoeba",
                onClick = onCredits,
            )
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
            AccountMenuItem(
                icon = Icons.Rounded.Gavel,
                title = "Bản quyền & Điều khoản dịch vụ",
                subtitle = "Bản quyền nội dung & thiết kế Chaina",
                onClick = { showLegalDialog = "terms" }
            )
            HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))
            AccountMenuItem(
                icon = Icons.Rounded.Info,
                title = "Giới thiệu nền tảng Chaina HSK",
                subtitle = "Phiên bản v1.0.0",
                onClick = { showLegalDialog = "about" }
            )
        }

        OutlinedButton(
            onClick = { showLogoutConfirm = true },
            modifier = Modifier.fillMaxWidth().height(48.dp),
            shape = RoundedCornerShape(14.dp),
            border = BorderStroke(1.dp, RedBorder),
            colors = ButtonDefaults.outlinedButtonColors(containerColor = RedSoft)
        ) {
            Icon(Icons.AutoMirrored.Rounded.Logout, contentDescription = null, tint = RedBad, modifier = Modifier.size(18.dp))
            Spacer(Modifier.width(8.dp))
            Text("Đăng xuất tài khoản", color = RedBad, fontWeight = FontWeight.Bold)
        }

        Spacer(Modifier.height(10.dp))
    }

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
        ChangePasswordDialog(api = api, onDismiss = { showChangePassword = false })
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
        LegalInfoDialog(type = type, onDismiss = { showLegalDialog = null })
    }

    if (showLogoutConfirm) {
        AlertDialog(
            onDismissRequest = { showLogoutConfirm = false },
            containerColor = PaperPure,
            shape = RoundedCornerShape(24.dp),
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
        title = { Text("Thiết lập hành trình HSK", fontWeight = FontWeight.Bold, color = InkBlack) },
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
                        } catch (e: CancellationException) {
                            throw e
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
                if (busy) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ChainaStrokeLoading(mode = ChainaLoadingMode.COMPACT, widthDp = 46.dp, background = ChainaLoadingBackground.DARK)
                        Text("Đang lưu…", fontWeight = FontWeight.Bold)
                    }
                } else {
                    Text("Lưu & Bắt đầu", fontWeight = FontWeight.Bold)
                }
            }
        },
        dismissButton = {
            TextButton(onClick = { if (!busy) onDone(null) }) { Text("Để sau", color = InkMuted) }
        },
        containerColor = PaperPure,
        shape = RoundedCornerShape(24.dp)
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
                        text = { Text(title, fontSize = 13.sp, color = if (key == value) BrandDark else InkBlack, fontWeight = if (key == value) FontWeight.Bold else FontWeight.Normal) },
                        onClick = { onSelect(key); expanded = false }
                    )
                }
            }
        }
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
    var passwordVisible by remember { mutableStateOf(false) }
    OutlinedTextField(
        value = value,
        onValueChange = onValueChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text(label, fontSize = 13.sp) },
        singleLine = true,
        shape = RoundedCornerShape(14.dp),
        keyboardOptions = KeyboardOptions(keyboardType = if (password) KeyboardType.Password else keyboard),
        visualTransformation = if (password && !passwordVisible) PasswordVisualTransformation() else VisualTransformation.None,
        trailingIcon = if (password) {
            {
                IconButton(onClick = { passwordVisible = !passwordVisible }) {
                    Icon(
                        imageVector = if (passwordVisible) Icons.Rounded.VisibilityOff else Icons.Rounded.Visibility,
                        contentDescription = if (passwordVisible) "Ẩn mật khẩu" else "Hiện mật khẩu",
                        tint = InkMuted,
                        modifier = Modifier.size(19.dp),
                    )
                }
            }
        } else null,
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
