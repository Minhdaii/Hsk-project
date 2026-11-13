package com.chaina.hsk.ui

import android.graphics.Bitmap
import android.graphics.Paint as AndroidPaint
import android.speech.tts.TextToSpeech
import android.util.Base64
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.IntrinsicSize
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.Bookmark
import androidx.compose.material.icons.rounded.BookmarkBorder
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.animation.core.tween
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chaina.hsk.data.ActivityData
import com.chaina.hsk.data.ApiClient
import com.chaina.hsk.data.LevelProgress
import com.chaina.hsk.data.Stats
import com.chaina.hsk.data.Word
import com.chaina.hsk.ui.components.ArrowUpRightIcon
import com.chaina.hsk.ui.components.ChainaLoadingMode
import com.chaina.hsk.ui.components.ChainaLoadingSize
import com.chaina.hsk.ui.components.ChainaStrokeLoading
import com.chaina.hsk.ui.components.CircleActionButton
import com.chaina.hsk.ui.components.InkCard
import com.chaina.hsk.ui.components.InkPrimaryButton
import com.chaina.hsk.ui.components.LevelBadge
import com.chaina.hsk.ui.components.VectorFlameCanvas
import com.chaina.hsk.ui.components.WebWeeklyChart
import com.chaina.hsk.ui.theme.AmberBorder
import com.chaina.hsk.ui.theme.AmberGold
import com.chaina.hsk.ui.theme.AmberSoft
import com.chaina.hsk.ui.theme.BentoButterEnd
import com.chaina.hsk.ui.theme.BentoButterStart
import com.chaina.hsk.ui.theme.BentoIndigoEnd
import com.chaina.hsk.ui.theme.BentoIndigoStart
import com.chaina.hsk.ui.theme.BentoLavenderEnd
import com.chaina.hsk.ui.theme.BentoLavenderStart
import com.chaina.hsk.ui.theme.BentoLimeEnd
import com.chaina.hsk.ui.theme.BentoLimeStart
import com.chaina.hsk.ui.theme.BentoMintEnd
import com.chaina.hsk.ui.theme.BentoMintStart
import com.chaina.hsk.ui.theme.BentoPeachEnd
import com.chaina.hsk.ui.theme.BentoPeachStart
import com.chaina.hsk.ui.theme.BentoRoseEnd
import com.chaina.hsk.ui.theme.BentoRoseStart
import com.chaina.hsk.ui.theme.BentoSkyEnd
import com.chaina.hsk.ui.theme.BentoSkyStart
import com.chaina.hsk.ui.theme.Brand
import com.chaina.hsk.ui.theme.BrandBorder
import com.chaina.hsk.ui.theme.BrandDark
import com.chaina.hsk.ui.theme.BrandSoft
import com.chaina.hsk.ui.theme.InkBlack
import com.chaina.hsk.ui.theme.InkBorder
import com.chaina.hsk.ui.theme.InkLight
import com.chaina.hsk.ui.theme.InkMuted
import com.chaina.hsk.ui.theme.JadeBorder
import com.chaina.hsk.ui.theme.JadeGreen
import com.chaina.hsk.ui.theme.JadeSoft
import com.chaina.hsk.ui.theme.Paper
import com.chaina.hsk.ui.theme.PaperMuted
import com.chaina.hsk.ui.theme.PaperPure
import com.chaina.hsk.ui.theme.RedBad
import com.chaina.hsk.ui.theme.RedBorder
import com.chaina.hsk.ui.theme.RedSoft
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.text.Normalizer
import java.util.Locale

internal enum class AppDestination(val label: String) {
    Home("Tổng quan"),
    Categories("Chủ đề"),
    Words("Từ vựng"),
    Practice("Luyện tập"),
    Path("Lộ trình"),
    Grammar("Ngữ pháp"),
    GrammarPractice("Luyện ngữ pháp"),
    Favorites("Sổ từ"),
    Review("Ôn tập"),
    Stats("Thống kê"),
    Leaderboard("Xếp hạng"),
    Writing("Luyện viết"),
    PinyinBoss("Pinyin Boss"),
    CameraTranslate("Dịch Camera"),
    Feedback("Góp ý"),
    Account("Tài khoản"),
    Privacy("Quyền riêng tư"),
    Credits("Nguồn dữ liệu"),
}

@Composable
internal fun InformationFeature(destination: AppDestination) {
    val isPrivacy = destination == AppDestination.Privacy
    val context = LocalContext.current
    val sources = listOf(
        "Từ vựng HSK chuẩn hóa" to "https://github.com/drkameleon/complete-hsk-vocabulary",
        "Nghĩa tiếng Việt · CVDICT" to "https://github.com/ph0ngp/CVDICT",
        "Từ điển CC-CEDICT" to "https://cc-cedict.org",
        "Hanzi Writer · Dữ liệu nét chữ Hán" to "https://hanziwriter.org",
        "Tatoeba · Câu ví dụ ngữ cảnh" to "https://tatoeba.org",
    )
    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (isPrivacy) {
            listOf(
                "Tài khoản học dùng email, tên hiển thị và mục tiêu học do bạn cung cấp." to "Bảo mật tài khoản",
                "Tiến độ ôn tập, lịch ngắt quãng SM-2 và sổ từ được lưu trên máy chủ an toàn." to "Dữ liệu học tập",
                "Bảng xếp hạng chỉ hiển thị tên rút gọn, điểm XP và chuỗi ngày học; email được bảo mật tuyệt đối." to "Bảng xếp hạng minh bạch",
                "Đăng xuất sẽ xóa sạch phiên làm việc trên thiết bị. Yêu cầu xóa vĩnh viễn tài khoản được hỗ trợ bất cứ lúc nào." to "Quyền kiểm soát",
            ).forEachIndexed { index, (copy, title) ->
                InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 20.dp) {
                    Row(
                        Modifier.padding(16.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        LevelBadge("${index + 1}", size = 32.dp, fontSize = 14.sp)
                        Column(Modifier.weight(1f)) {
                            Text(title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = InkBlack)
                            Text(copy, fontSize = 13.sp, color = InkMuted, modifier = Modifier.padding(top = 4.dp))
                        }
                    }
                }
            }
        } else {
            sources.forEach { (title, url) ->
                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    shapeRadius = 20.dp,
                    onClick = { runCatching { context.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))) } }
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text(title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = InkBlack)
                        Text(url, color = BrandDark, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
            Text("Các tài nguyên và giấy phép mã nguồn mở được tôn trọng và ghi nhận đầy đủ theo chuẩn học thuật.", color = InkMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun CategoriesFeature(api: ApiClient) {
    var groups by remember { mutableStateOf<List<JSONObject>?>(null) }
    var query by remember { mutableStateOf("") }
    var slug by remember { mutableStateOf<String?>(null) }
    var category by remember { mutableStateOf<JSONObject?>(null) }
    var words by remember { mutableStateOf<List<Word>>(emptyList()) }
    var selectedWord by remember { mutableStateOf<Word?>(null) }
    var favoriteIds by remember { mutableStateOf<Set<Int>>(emptySet()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        try {
            groups = api.categoryTree().objects()
            favoriteIds = runCatching {
                api.favorites().objects().mapNotNull { row ->
                    val w = row.optJSONObject("word") ?: row
                    w.optInt("id").takeIf { it > 0 }
                }.toSet()
            }.getOrDefault(emptySet())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được chủ đề."
        }
        loading = false
    }

    LaunchedEffect(slug) {
        if (slug == null) {
            category = null
            words = emptyList()
            return@LaunchedEffect
        }
        loading = true
        try {
            val res = api.category(slug!!)
            category = res.optJSONObject("category") ?: res
            words = api.categoryWords(slug!!).objects().mapNotNull { runCatching { Word.from(it) }.getOrNull() }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được từ trong chủ đề."
        }
        loading = false
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (slug != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedButton(
                    onClick = { slug = null },
                    shape = CircleShape,
                    border = BorderStroke(1.dp, InkBorder)
                ) {
                    Icon(Icons.AutoMirrored.Rounded.ArrowBack, contentDescription = null, tint = InkBlack, modifier = Modifier.size(17.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Tất cả chủ đề", color = InkBlack, fontSize = 12.5.sp, fontWeight = FontWeight.SemiBold)
                }
                Spacer(Modifier.width(12.dp))
                category?.let { cat ->
                    Text(
                        cat.optString("nameVi", cat.optString("name")),
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkBlack,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }
        }

        if (slug == null) {
            // Web-style pill search input for filtering topics
            OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                singleLine = true,
                shape = CircleShape,
                placeholder = { Text("Tìm chủ đề đời sống…", fontSize = 13.sp, color = InkLight) },
                leadingIcon = { Icon(Icons.Rounded.Search, contentDescription = null, tint = InkMuted, modifier = Modifier.size(19.dp)) },
                trailingIcon = {
                    if (query.isNotEmpty()) {
                        IconButton(onClick = { query = "" }) {
                            Icon(Icons.Rounded.Close, contentDescription = "Xóa", tint = InkMuted, modifier = Modifier.size(17.dp))
                        }
                    }
                },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = BrandBorder,
                    unfocusedBorderColor = InkBorder,
                    focusedContainerColor = PaperPure,
                    unfocusedContainerColor = PaperPure,
                ),
                modifier = Modifier.fillMaxWidth()
            )

            error?.let { FeatureError(it) }
            if (loading) FeatureLoading("Đang tải chủ đề từ vựng…")

            val needle = query.trim().lowercase()
            groups?.forEach { group ->
                val rawChildren = group.optJSONArray("children") ?: group.optJSONArray("categories")
                val topics = rawChildren.objects().filter { topic ->
                    if (needle.isBlank()) true
                    else {
                        val nameMatch = topic.optString("nameVi", topic.optString("name")).lowercase().contains(needle)
                        val subChildren = (topic.optJSONArray("children") ?: topic.optJSONArray("categories")).objects()
                        nameMatch || subChildren.any { it.optString("nameVi", it.optString("name")).lowercase().contains(needle) }
                    }
                }
                if (topics.isNotEmpty()) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 6.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.Bottom,
                    ) {
                        Text(
                            group.optString("nameVi", group.optString("name")),
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = InkBlack,
                        )
                        val groupCount = group.optInt("wordCount", 0)
                        if (groupCount > 0) {
                            Text("$groupCount từ", fontSize = 12.sp, color = InkMuted)
                        }
                    }

                    topics.forEach { cat ->
                        val catSlug = cat.optString("slug")
                        val catName = cat.optString("nameVi", cat.optString("name"))
                        val count = cat.optInt("wordCount")
                        val subTopics = (cat.optJSONArray("children") ?: cat.optJSONArray("categories"))
                            .objects()
                            .filter { it.optInt("wordCount", 0) > 0 }
                            .take(6)

                        InkCard(
                            modifier = Modifier.fillMaxWidth(),
                            shapeRadius = 20.dp,
                            onClick = { slug = catSlug }
                        ) {
                            Column(
                                Modifier.fillMaxWidth().padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp),
                            ) {
                                Row(
                                    Modifier.fillMaxWidth(),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    LevelBadge(
                                        text = cat.optString("icon").takeIf { it.isNotBlank() } ?: catName.take(1),
                                        size = 42.dp,
                                        fontSize = 17.sp,
                                        solid = false
                                    )
                                    Column(Modifier.weight(1f)) {
                                        Text(
                                            catName,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = InkBlack
                                        )
                                        Text(
                                            if (count > 0) "$count từ vựng" else "Chạm để xem chi tiết",
                                            color = InkMuted,
                                            fontSize = 12.sp,
                                            modifier = Modifier.padding(top = 2.dp)
                                        )
                                    }
                                    ArrowUpRightIcon(tint = BrandDark, modifier = Modifier.size(16.dp))
                                }

                                if (subTopics.isNotEmpty()) {
                                    FlowRow(
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        verticalArrangement = Arrangement.spacedBy(6.dp),
                                    ) {
                                        subTopics.forEach { sub ->
                                            Surface(
                                                modifier = Modifier.clip(CircleShape).clickable { slug = sub.optString("slug") },
                                                shape = CircleShape,
                                                color = PaperMuted,
                                                border = BorderStroke(1.dp, InkBorder),
                                            ) {
                                                Text(
                                                    text = "${sub.optString("nameVi", sub.optString("name"))} · ${sub.optInt("wordCount")}",
                                                    fontSize = 11.sp,
                                                    color = InkMuted,
                                                    fontWeight = FontWeight.Medium,
                                                    modifier = Modifier.padding(horizontal = 9.dp, vertical = 5.dp),
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            error?.let { FeatureError(it) }
            if (loading) FeatureLoading("Đang tải từ vựng chủ đề…")
            words.forEach { word ->
                FeatureWordRow(word) { selectedWord = word }
            }
            if (!loading && words.isEmpty() && error == null) {
                FeatureEmpty("Chủ đề này chưa có từ vựng.")
            }
        }
    }
    selectedWord?.let { w ->
        FeatureWordDialog(
            word = w,
            api = api,
            isFavorite = w.id in favoriteIds,
            onFavoriteToggled = { fav ->
                favoriteIds = if (fav) favoriteIds + w.id else favoriteIds - w.id
            },
            onDismiss = { selectedWord = null }
        )
    }
}

@Composable
internal fun GrammarFeature(api: ApiClient) {
    var level by remember { mutableIntStateOf(0) }
    var items by remember { mutableStateOf<List<JSONObject>>(emptyList()) }
    var selected by remember { mutableStateOf<JSONObject?>(null) }
    var detail by remember { mutableStateOf<JSONObject?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var notice by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(level) {
        loading = true
        error = null
        try {
            items = api.grammar(level).objects()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được ngữ pháp."
        }
        loading = false
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            (0..3).forEach { l ->
                val isSelected = level == l
                Surface(
                    modifier = Modifier.clip(CircleShape).clickable { level = l },
                    shape = CircleShape,
                    color = if (isSelected) BrandSoft else PaperPure,
                    border = BorderStroke(1.dp, if (isSelected) BrandBorder else InkBorder),
                ) {
                    Text(
                        text = if (l == 0) "Tất cả" else "HSK $l",
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) BrandDark else InkMuted,
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                    )
                }
            }
        }

        notice?.let { Text(it, color = JadeGreen, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
        error?.let { FeatureError(it) }
        if (loading) FeatureLoading("Đang tải ngữ pháp HSK…")

        items.groupBy { it.optInt("level") }.toSortedMap().forEach { (lv, points) ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                LevelBadge("HSK$lv", size = 28.dp, fontSize = 10.sp)
                Text("Cấp độ HSK $lv", fontWeight = FontWeight.Bold, color = InkBlack, fontSize = 15.sp)
            }

            points.forEach { grammar ->
                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    shapeRadius = 20.dp,
                    onClick = {
                        selected = grammar
                        scope.launch {
                            try {
                                detail = api.grammarDetail(grammar.optString("slug").ifBlank { grammar.optString("id") })
                            } catch (e: CancellationException) {
                                throw e
                            } catch (e: Exception) {
                                error = e.message
                            }
                        }
                    }
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text(grammar.optString("title"), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                        Surface(
                            color = BrandSoft,
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(0.8.dp, BrandBorder),
                            modifier = Modifier.padding(top = 6.dp)
                        ) {
                            Text(
                                grammar.optString("pattern"),
                                fontSize = 13.sp,
                                color = BrandDark,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                        Text(
                            grammar.optString("explanation"),
                            fontSize = 13.sp,
                            color = InkMuted,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 6.dp)
                        )
                    }
                }
            }
        }

        if (!loading && items.isEmpty() && error == null) {
            FeatureEmpty("Chưa có dữ liệu ngữ pháp.")
        }
    }

    if (selected != null && detail != null) {
        val data = detail!!
        var learned by remember(data.optInt("id")) { mutableStateOf(data.optJSONObject("progress")?.optBoolean("learned") ?: false) }
        var favorite by remember(data.optInt("id")) { mutableStateOf(data.optJSONObject("progress")?.optBoolean("favorite") ?: false) }

        AlertDialog(
            onDismissRequest = { selected = null; detail = null },
            title = {
                Text(data.optString("title"), fontWeight = FontWeight.Bold, color = InkBlack)
            },
            text = {
                Column(
                    Modifier.verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Surface(
                        color = BrandSoft,
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(0.8.dp, BrandBorder)
                    ) {
                        Text(
                            data.optString("pattern"),
                            color = BrandDark,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                    Text(data.optString("explanation"), fontSize = 14.sp, color = InkBlack)
                    data.optString("notes").takeIf(String::isNotBlank)?.let {
                        Text("Lưu ý: $it", color = InkMuted, fontSize = 12.sp)
                    }
                    Text("Ví dụ minh họa:", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = InkBlack)
                    data.optJSONArray("examples").objects().forEach { ex ->
                        Surface(
                            color = PaperMuted,
                            shape = RoundedCornerShape(12.dp),
                            border = BorderStroke(1.dp, InkBorder)
                        ) {
                            Column(Modifier.fillMaxWidth().padding(12.dp)) {
                                Text(ex.optString("hanzi"), fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = InkBlack)
                                ex.optString("pinyin").takeIf(String::isNotBlank)?.let {
                                    Text(it, color = BrandDark, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                                }
                                ex.optString("meaningVi").takeIf(String::isNotBlank)?.let {
                                    Text(it, color = InkMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp))
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    scope.launch {
                        try {
                            api.setGrammarProgress(data.optInt("id"), "learned", !learned)
                            learned = !learned
                            notice = if (learned) "Đã đánh dấu đã học." else "Đã bỏ trạng thái đã học."
                        } catch (e: CancellationException) {
                            throw e
                        } catch (e: Exception) {
                            notice = e.message ?: "Không lưu được tiến độ."
                        }
                    }
                }) {
                    Text(if (learned) "Đã học ✓" else "Đánh dấu đã học", color = if (learned) JadeGreen else BrandDark, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    scope.launch {
                        runCatching { api.setGrammarProgress(data.optInt("id"), "favorite", !favorite) }.onSuccess { favorite = !favorite }
                        selected = null
                        detail = null
                    }
                }) {
                    Text(if (favorite) "Bỏ lưu sổ tay" else "Lưu vào sổ tay", color = InkMuted)
                }
            },
            containerColor = PaperPure,
            shape = RoundedCornerShape(22.dp)
        )
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun GrammarPracticeFeature(
    api: ApiClient,
    initialLevel: Int,
    initialCount: Int = 10,
    autoStart: Boolean = false,
) {
    val kinds = listOf(
        "order" to "Sắp xếp câu",
        "cloze" to "Điền chỗ trống",
        "choose" to "Chọn câu đúng",
        "fix" to "Sửa lỗi sai",
        "translate" to "Dịch câu"
    )
    var kind by remember { mutableStateOf("order") }
    var level by remember { mutableIntStateOf(initialLevel) }
    var count by remember { mutableIntStateOf(initialCount) }
    var round by remember { mutableIntStateOf(0) }
    var questions by remember { mutableStateOf<List<JSONObject>>(emptyList()) }
    var index by remember { mutableIntStateOf(0) }
    var tokens by remember { mutableStateOf<List<String>>(emptyList()) }
    var picked by remember { mutableStateOf<List<String>>(emptyList()) }
    var selectedOption by remember { mutableStateOf<String?>(null) }
    var answer by remember { mutableStateOf<JSONObject?>(null) }
    var loading by remember { mutableStateOf(autoStart) }
    var complete by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var score by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()

    suspend fun loadQuestions(targetKind: String, targetLevel: Int, targetCount: Int) {
        loading = true
        error = null
        answer = null
        complete = false
        try {
            val fetched = api.grammarExercises(targetKind, targetLevel, count = targetCount).objects()
            questions = fetched
            if (fetched.isEmpty()) error = "Chưa có câu cho dạng bài này ở cấp HSK $targetLevel. Hãy thử dạng khác hoặc chọn Tất cả."
            index = 0
            score = 0
            round++
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được bài ngữ pháp."
        }
        loading = false
    }

    LaunchedEffect(initialLevel, initialCount, autoStart) {
        level = initialLevel
        count = initialCount
        if (autoStart) {
            loadQuestions(kind, initialLevel, initialCount)
        }
    }

    val q = questions.getOrNull(index)

    LaunchedEffect(round, index, q) {
        tokens = q?.optJSONArray("tokens").strings().shuffled()
        picked = emptyList()
        selectedOption = null
        answer = null
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Row(
            Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            kinds.forEach { (id, label) ->
                val isSelected = kind == id
                Surface(
                    modifier = Modifier.clip(CircleShape).clickable {
                        if (kind != id) {
                            kind = id
                            if (autoStart || questions.isNotEmpty() || complete) {
                                scope.launch { loadQuestions(id, level, count) }
                            }
                        }
                    },
                    shape = CircleShape,
                    color = if (isSelected) BrandSoft else PaperPure,
                    border = BorderStroke(1.dp, if (isSelected) BrandBorder else InkBorder),
                ) {
                    Text(
                        label,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) BrandDark else InkMuted,
                        modifier = Modifier.padding(horizontal = 13.dp, vertical = 7.dp),
                    )
                }
            }
        }

        if (loading && questions.isEmpty()) {
            FeatureLoading("Đang tạo bài tập ngữ pháp…")
        } else if (complete) {
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 24.dp) {
                Column(
                    Modifier.padding(26.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    LevelBadge("完", size = 56.dp, fontSize = 24.sp, solid = true)
                    Text("Hoàn thành bài ngữ pháp!", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    Text("Đúng $score / ${questions.size.coerceAtLeast(1)} câu", color = BrandDark, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                    InkPrimaryButton(
                        text = "Luyện lượt mới",
                        onClick = { scope.launch { loadQuestions(kind, level, count) } },
                        modifier = Modifier.fillMaxWidth().padding(top = 6.dp)
                    )
                }
            }
        } else if (questions.isEmpty()) {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                (0..3).forEach { lv ->
                    val isSelected = level == lv
                    Surface(
                        modifier = Modifier.clip(CircleShape).clickable { level = lv },
                        shape = CircleShape,
                        color = if (isSelected) BrandSoft else PaperPure,
                        border = BorderStroke(1.dp, if (isSelected) BrandBorder else InkBorder),
                    ) {
                        Text(
                            if (lv == 0) "Tất cả" else "HSK $lv",
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) BrandDark else InkMuted,
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                        )
                    }
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                listOf(5, 10, 15, 20).forEach { n ->
                    val isSelected = count == n
                    Surface(
                        modifier = Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).clickable { count = n },
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) BrandSoft else PaperPure,
                        border = BorderStroke(1.dp, if (isSelected) BrandBorder else InkBorder),
                    ) {
                        Box(Modifier.padding(vertical = 10.dp), contentAlignment = Alignment.Center) {
                            Text("$n câu", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = if (isSelected) BrandDark else InkBlack, maxLines = 1)
                        }
                    }
                }
            }

            error?.let { FeatureError(it) }
            InkPrimaryButton(
                text = "Bắt đầu làm bài",
                loading = loading,
                onClick = { scope.launch { loadQuestions(kind, level, count) } },
                modifier = Modifier.fillMaxWidth()
            )
        } else {
            val total = questions.size.coerceAtLeast(1)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("CÂU ${index + 1} / $total", color = BrandDark, fontWeight = FontWeight.Bold, fontSize = 12.sp, letterSpacing = 1.sp)
                Text("Đúng $score câu", color = JadeGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            LinearProgressIndicator(
                progress = { (index + 1).toFloat() / total },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                color = BrandDark,
                trackColor = PaperMuted
            )

            error?.let { FeatureError(it) }

            q?.let { question ->
                val qType = question.optString("type", kind)
                val qOptions = question.optJSONArray("options").strings()
                val isTokenQuestion = qType in listOf("order", "translate") || qOptions.isEmpty()

                InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 22.dp) {
                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        when (qType) {
                            "cloze" -> {
                                val sentence = "${question.optString("before")} ＿＿ ${question.optString("after")}".trim()
                                Text("Chọn từ đúng điền vào chỗ trống:", fontSize = 13.sp, color = InkMuted, fontWeight = FontWeight.SemiBold)
                                Text(sentence, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                                question.optString("prompt").takeIf { it.isNotBlank() && it != "null" }?.let {
                                    Text(it, color = InkMuted, fontSize = 13.sp)
                                }
                            }
                            "fix" -> {
                                Text("Chọn câu đã sửa lỗi sai cho đúng:", fontSize = 13.sp, color = InkMuted, fontWeight = FontWeight.SemiBold)
                                Surface(color = RedSoft, shape = RoundedCornerShape(12.dp), border = BorderStroke(1.dp, RedBorder)) {
                                    Text("Câu sai: ${question.optString("wrong")}", color = RedBad, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.fillMaxWidth().padding(12.dp))
                                }
                                question.optString("prompt").takeIf { it.isNotBlank() && it != "null" }?.let {
                                    Text(it, color = InkMuted, fontSize = 13.sp)
                                }
                            }
                            "choose" -> {
                                Text("Chọn câu dùng đúng cấu trúc \"${question.optString("prompt")}\":", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            }
                            else -> {
                                Text(question.optString("prompt", "Sắp xếp các từ thành câu đúng:"), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                                question.optString("meaningVi").takeIf { it.isNotBlank() && it != "null" }?.let {
                                    Text(it, color = InkMuted, fontSize = 13.sp)
                                }
                            }
                        }

                        if (isTokenQuestion) {
                            Surface(
                                Modifier.fillMaxWidth(),
                                color = PaperMuted,
                                shape = RoundedCornerShape(14.dp),
                                border = BorderStroke(1.dp, InkBorder)
                            ) {
                                if (picked.isEmpty()) {
                                    Text(
                                        "Chạm các từ bên dưới để ghép câu…",
                                        fontSize = 15.sp,
                                        color = InkLight,
                                        modifier = Modifier.padding(14.dp)
                                    )
                                } else {
                                    FlowRow(
                                        modifier = Modifier.fillMaxWidth().padding(10.dp),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalArrangement = Arrangement.spacedBy(8.dp),
                                    ) {
                                        picked.forEachIndexed { pIdx, tok ->
                                            Surface(
                                                modifier = Modifier.clickable(enabled = answer == null) {
                                                    picked = picked.filterIndexed { i, _ -> i != pIdx }
                                                    tokens = tokens + tok
                                                },
                                                color = PaperPure,
                                                shape = RoundedCornerShape(10.dp),
                                                border = BorderStroke(1.dp, BrandBorder),
                                            ) {
                                                Text(tok, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = BrandDark, modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp))
                                            }
                                        }
                                    }
                                }
                            }

                            FlowRow(
                                Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp),
                            ) {
                                tokens.forEachIndexed { i, token ->
                                    Surface(
                                        modifier = Modifier.clickable(enabled = answer == null) {
                                            tokens = tokens.filterIndexed { idx, _ -> idx != i }
                                            picked = picked + token
                                        },
                                        color = PaperPure,
                                        shape = RoundedCornerShape(10.dp),
                                        border = BorderStroke(1.dp, InkBorder)
                                    ) {
                                        Text(token, fontSize = 16.sp, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), color = InkBlack)
                                    }
                                }
                            }

                            if (answer == null) {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    OutlinedButton(
                                        onClick = { tokens = q.optJSONArray("tokens").strings().shuffled(); picked = emptyList() },
                                        modifier = Modifier.weight(1f).height(48.dp),
                                        shape = RoundedCornerShape(14.dp),
                                        border = BorderStroke(1.dp, InkBorder)
                                    ) {
                                        Text("Làm lại", color = InkMuted)
                                    }
                                    InkPrimaryButton(
                                        text = "Kiểm tra",
                                        loading = loading,
                                        onClick = {
                                            scope.launch {
                                                loading = true
                                                error = null
                                                try {
                                                    val body = JSONObject()
                                                        .put("type", qType)
                                                        .put("grammarId", question.optInt("grammarId"))
                                                        .put("exampleId", question.optInt("exampleId"))
                                                        .put("answer", JSONArray(picked))
                                                    val res = api.gradeGrammar(body)
                                                    answer = res
                                                    if (res.optBoolean("correct")) score++
                                                } catch (e: CancellationException) {
                                                    throw e
                                                } catch (e: Exception) {
                                                    error = e.message ?: "Không chấm được bài."
                                                }
                                                loading = false
                                            }
                                        },
                                        enabled = picked.isNotEmpty() && !loading,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        } else {
                            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                                qOptions.forEach { opt ->
                                    val isPicked = selectedOption == opt
                                    val isRightAns = answer != null && answer!!.optBoolean("correct") && isPicked
                                    GameChoice(
                                        text = opt,
                                        selected = isPicked,
                                        correct = isRightAns,
                                        wrong = answer != null && !answer!!.optBoolean("correct") && isPicked,
                                        onClick = {
                                            if (answer == null && !loading) {
                                                selectedOption = opt
                                                scope.launch {
                                                    loading = true
                                                    error = null
                                                    try {
                                                        val body = JSONObject()
                                                            .put("type", qType)
                                                            .put("grammarId", question.optInt("grammarId"))
                                                            .put("exampleId", question.optInt("exampleId"))
                                                            .put("answer", opt)
                                                        val res = api.gradeGrammar(body)
                                                        answer = res
                                                        if (res.optBoolean("correct")) score++
                                                    } catch (e: CancellationException) {
                                                        throw e
                                                    } catch (e: Exception) {
                                                        error = e.message ?: "Không chấm được bài."
                                                    }
                                                    loading = false
                                                }
                                            }
                                        }
                                    )
                                }
                            }
                        }

                        if (answer != null) {
                            val correct = answer!!.optBoolean("correct")
                            val sol = answer!!.optString("solution", answer!!.optString("correctAnswer"))
                            val exp = answer!!.optString("explanation").takeIf { it.isNotBlank() && it != "null" }
                            Surface(
                                shape = RoundedCornerShape(12.dp),
                                color = if (correct) JadeSoft else RedSoft,
                                border = BorderStroke(1.dp, if (correct) JadeBorder else RedBorder),
                            ) {
                                Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text(
                                        if (correct) "Chính xác! Bạn làm rất tốt." else "Chưa đúng. Đáp án: $sol",
                                        color = if (correct) JadeGreen else RedBad,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp
                                    )
                                    if (exp != null) {
                                        Text(exp, fontSize = 12.sp, color = InkBlack)
                                    }
                                }
                            }
                            InkPrimaryButton(
                                text = if (index + 1 >= questions.size) "Xem tổng kết" else "Câu tiếp theo ›",
                                onClick = {
                                    if (index + 1 >= questions.size) complete = true
                                    else index++
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
internal fun FavoritesFeature(api: ApiClient) {
    var words by remember { mutableStateOf<List<Word>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var selectedWord by remember { mutableStateOf<Word?>(null) }
    val scope = rememberCoroutineScope()

    fun load() {
        scope.launch {
            loading = true
            error = null
            try {
                words = api.favorites().objects().mapNotNull { row ->
                    val w = row.optJSONObject("word") ?: row
                    runCatching { Word.from(w) }.getOrNull()
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                error = e.message ?: "Không tải được sổ từ."
            }
            loading = false
        }
    }

    LaunchedEffect(Unit) { load() }

    Column(
        Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        error?.let { FeatureError(it) }
        if (loading) FeatureLoading("Đang tải sổ tay từ vựng…")
        else if (words.isEmpty() && error == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    LevelBadge("藏", size = 44.dp, fontSize = 20.sp, solid = false)
                    Text("Sổ tay của bạn đang trống.", color = InkBlack, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Text("Chạm biểu tượng đánh dấu khi tra từ để lưu vào sổ tay.", color = InkMuted, fontSize = 12.5.sp, textAlign = TextAlign.Center)
                }
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                items(words, key = { it.id }) { word ->
                    FeatureWordRow(word) { selectedWord = word }
                }
            }
        }
    }
    selectedWord?.let { w ->
        FeatureWordDialog(
            word = w,
            api = api,
            isFavorite = words.any { it.id == w.id },
            onFavoriteToggled = { fav ->
                if (!fav) {
                    words = words.filterNot { it.id == w.id }
                    selectedWord = null
                }
            },
            onDismiss = { selectedWord = null }
        )
    }
}

@Composable
internal fun StatisticsFeature(api: ApiClient) {
    var stats by remember { mutableStateOf<Stats?>(null) }
    var activity by remember { mutableStateOf<ActivityData?>(null) }
    var levels by remember { mutableStateOf<List<LevelProgress>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        try {
            stats = api.stats()
            activity = runCatching { api.activityData() }.getOrNull()
            levels = runCatching { api.levels() }.getOrDefault(emptyList())
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được thống kê."
        }
        loading = false
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (loading) FeatureLoading("Đang tải tiến độ học tập…")
        error?.let { FeatureError(it) }

        stats?.let { s ->
            val started = levels.sumOf { it.started }
            val total = levels.sumOf { it.total }.coerceAtLeast(1)
            val mastered = levels.sumOf { it.mastered }

            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FeatureMetric("Từ đã bắt đầu", "$started", "/ $total từ", Modifier.weight(1f))
                FeatureMetric("Đã thuộc vững", "$mastered", "nhớ sâu SM-2", Modifier.weight(1f))
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FeatureMetric("Điểm kinh nghiệm", "${s.xp}", "XP tích lũy", Modifier.weight(1f))
                FeatureMetric("Chuỗi hiện tại", "${s.streak}", if (s.studiedToday) "Hôm nay đã ôn" else "Cần ôn hôm nay", Modifier.weight(1f))
            }

            // Real Web WeeklyChart card
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 24.dp, backgroundColor = PaperPure) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column {
                            Text("Hiệu suất học tập", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            Text("Lượt ôn tập trong 7 ngày gần nhất", fontSize = 12.sp, color = InkMuted)
                        }
                        Surface(shape = CircleShape, color = PaperMuted, border = BorderStroke(1.dp, InkBorder)) {
                            Text("Mục tiêu ${activity?.goal ?: 20}/ngày", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = InkMuted, modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp))
                        }
                    }
                    WebWeeklyChart(
                        days = activity?.days ?: emptyList(),
                        goal = activity?.goal ?: 20,
                    )
                }
            }

            if (levels.isNotEmpty()) {
                InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 22.dp) {
                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("Tiến độ theo cấp độ HSK", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = InkBlack)
                        levels.forEach { lv ->
                            val pct = if (lv.total > 0) (lv.started.toFloat() / lv.total).coerceIn(0f, 1f) else 0f
                            Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                                    Text("HSK ${lv.level}", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = InkBlack)
                                    Text("${lv.started}/${lv.total} đã học · ${lv.mastered} thuộc", fontSize = 12.sp, color = InkMuted)
                                }
                                LinearProgressIndicator(
                                    progress = { pct },
                                    modifier = Modifier.fillMaxWidth().height(5.dp).clip(CircleShape),
                                    color = InkBlack,
                                    trackColor = PaperMuted,
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
internal fun LeaderboardFeature(api: ApiClient) {
    var rows by remember { mutableStateOf<List<JSONObject>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        try {
            rows = api.leaderboard().objects()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được bảng xếp hạng."
        }
        loading = false
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        error?.let { FeatureError(it) }
        if (loading) FeatureLoading("Đang tải bảng xếp hạng…")
        else {
            val podiumColors = listOf(Color(0xFFE7E1FF), Color(0xFFDAEEFF), Color(0xFFEAF7C6))
            rows.forEachIndexed { index, row ->
                val isTop3 = index < 3
                val circleColor = podiumColors.getOrElse(index) { PaperMuted }

                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    shapeRadius = 20.dp,
                    backgroundColor = PaperPure,
                    borderColor = if (index == 0) BrandBorder else InkBorder,
                ) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = circleColor,
                            modifier = Modifier.size(40.dp)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    text = "${row.optInt("rank", index + 1)}",
                                    fontWeight = FontWeight.ExtraBold,
                                    color = InkBlack,
                                    fontSize = 15.sp,
                                )
                            }
                        }

                        Column(Modifier.weight(1f).padding(start = 14.dp)) {
                            Text(row.optString("name", "Người học"), fontWeight = FontWeight.Bold, fontSize = 15.sp, color = InkBlack)
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                modifier = Modifier.padding(top = 2.dp),
                            ) {
                                val st = row.optInt("streak")
                                VectorFlameCanvas(active = st > 0, litToday = false, modifier = Modifier.size(width = 11.dp, height = 14.dp))
                                Text("Chuỗi $st ngày", color = InkMuted, fontSize = 12.sp)
                            }
                        }

                        Surface(
                            color = if (isTop3) BrandSoft else PaperMuted,
                            shape = CircleShape,
                            border = BorderStroke(1.dp, if (isTop3) BrandBorder else InkBorder)
                        ) {
                            Text(
                                "${row.optInt("xp")} XP",
                                color = if (isTop3) BrandDark else InkBlack,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(horizontal = 11.dp, vertical = 5.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
internal fun LearningPathFeature(onPractice: (Int) -> Unit) {
    val stages = listOf(
        Triple("一", "Làm quen với tiếng Trung", "Pinyin, bốn thanh điệu và nét bút cơ bản."),
        Triple("二", "Chào hỏi và giới thiệu", "Chào hỏi, tên tuổi, quốc tịch và nghề nghiệp."),
        Triple("三", "Số đếm và thời gian", "Số đếm, giờ giấc, ngày tháng và lịch."),
        Triple("四", "Gia đình và mối quan hệ", "Gia đình, bạn bè, đồng nghiệp và tuổi tác."),
        Triple("五", "Ăn uống và mua sắm", "Gọi món, hỏi giá, tiền tệ và thanh toán."),
        Triple("六", "Địa điểm và phương hướng", "Hỏi đường, vị trí và phương tiện đi lại."),
        Triple("七", "Sinh hoạt và sở thích", "Lịch trình, thể thao, giải trí và thói quen."),
        Triple("八", "Sức khỏe và thời tiết", "Cảm xúc, triệu chứng sức khỏe và thời tiết."),
        Triple("九", "Giao tiếp thực tế", "Khách sạn, sân bay, công việc và tình huống đời sống."),
    )
    var selected by remember { mutableStateOf<Int?>(null) }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        stages.forEachIndexed { index, stage ->
            val level = if (index < 4) 1 else if (index < 7) 2 else 3
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 22.dp,
                onClick = { selected = index }
            ) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    LevelBadge(stage.first, size = 46.dp, fontSize = 20.sp, solid = (index == 0))
                    Column(Modifier.weight(1f)) {
                        Text("CHẶNG ${index + 1} · HSK $level", color = BrandDark, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                        Text(stage.second, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack, modifier = Modifier.padding(top = 2.dp))
                        Text(stage.third, fontSize = 12.sp, color = InkMuted, maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 2.dp))
                    }
                    ArrowUpRightIcon(tint = BrandDark, modifier = Modifier.size(16.dp))
                }
            }
        }
    }

    selected?.let { index ->
        val stage = stages[index]
        val level = if (index < 4) 1 else if (index < 7) 2 else 3
        AlertDialog(
            onDismissRequest = { selected = null },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    LevelBadge(stage.first, size = 32.dp, fontSize = 15.sp, solid = true)
                    Text(stage.second, fontWeight = FontWeight.Bold, color = InkBlack)
                }
            },
            text = {
                Text("${stage.third}\n\nBạn có thể luyện từ vựng, flashcard và bài tập tương ứng ở cấp độ HSK $level.", fontSize = 14.sp, color = InkBlack)
            },
            confirmButton = {
                Button(
                    onClick = { selected = null; onPractice(level) },
                    colors = ButtonDefaults.buttonColors(containerColor = Brand),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Mở luyện tập HSK $level", fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { selected = null }) {
                    Text("Đóng", color = InkMuted)
                }
            },
            containerColor = PaperPure,
            shape = RoundedCornerShape(22.dp)
        )
    }
}

private data class BentoPracticeTile(
    val id: String,
    val glyph: String,
    val title: String,
    val desc: String,
    val badge: String,
    val duration: String,
    val unitLabel: String,
    val c1: Color,
    val c2: Color,
    val borderColor: Color,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun PracticeHubFeature(
    api: ApiClient,
    initialLevel: Int,
    activeMode: String?,
    onModeChange: (String?) -> Unit,
    onLevelCountSelected: (Int, Int) -> Unit,
    onLaunchWriting: (Int, Int) -> Unit,
    onLaunchBoss: (Int, Int) -> Unit,
    onLaunchGrammar: (Int, Int) -> Unit,
) {
    var level by remember(initialLevel) { mutableIntStateOf(initialLevel.coerceIn(1, 3)) }
    var count by remember { mutableIntStateOf(10) }
    var round by remember { mutableIntStateOf(0) }
    var pendingTile by remember { mutableStateOf<BentoPracticeTile?>(null) }

    val tileMap = remember {
        listOf(
            BentoPracticeTile(
                id = "match",
                glyph = "配",
                title = "Ghép từ với nghĩa",
                desc = "Chọn từng cặp chữ Hán và nghĩa tiếng Việt tương ứng nhanh tay.",
                badge = "Nên bắt đầu",
                duration = "2–3 phút",
                unitLabel = "cặp từ",
                c1 = BentoRoseStart,
                c2 = BentoRoseEnd,
                borderColor = Color(0xFFF3C6D0),
            ),
            BentoPracticeTile(
                id = "listen",
                glyph = "听",
                title = "Nghe nhận diện",
                desc = "Nghe phát âm chuẩn và chọn đúng mặt chữ Hán.",
                badge = "Nghe hiểu",
                duration = "2–4 phút",
                unitLabel = "câu",
                c1 = BentoSkyStart,
                c2 = BentoSkyEnd,
                borderColor = Color(0xFFBAD8F7),
            ),
            BentoPracticeTile(
                id = "quiz",
                glyph = "测",
                title = "Quiz từ vựng",
                desc = "Trắc nghiệm phản xạ chọn nghĩa tiếng Việt.",
                badge = "Siêu tốc",
                duration = "2 phút",
                unitLabel = "câu",
                c1 = BentoMintStart,
                c2 = BentoMintEnd,
                borderColor = Color(0xFFB5E3CC),
            ),
            BentoPracticeTile(
                id = "writing",
                glyph = "写",
                title = "Viết tay AI",
                desc = "Tập viết từng nét trên ô kẻ 米字格 và chấm nét tự động.",
                badge = "Cảm ứng",
                duration = "Tự chọn",
                unitLabel = "chữ mẫu",
                c1 = BentoLimeStart,
                c2 = BentoLimeEnd,
                borderColor = Color(0xFFC7E38F),
            ),
            BentoPracticeTile(
                id = "boss",
                glyph = "拼",
                title = "Pinyin Boss",
                desc = "Gõ nhanh phiên âm để hạ boss.",
                badge = "Tốc độ",
                duration = "2–3 phút",
                unitLabel = "từ",
                c1 = BentoLavenderStart,
                c2 = BentoLavenderEnd,
                borderColor = Color(0xFFCBBFF7),
            ),
            BentoPracticeTile(
                id = "dialogue",
                glyph = "话",
                title = "Giao tiếp",
                desc = "Chọn câu đáp tự nhiên theo ngữ cảnh.",
                badge = "Đời sống",
                duration = "3–5 phút",
                unitLabel = "tình huống",
                c1 = BentoButterStart,
                c2 = BentoButterEnd,
                borderColor = Color(0xFFEDE0A6),
            ),
            BentoPracticeTile(
                id = "order",
                glyph = "排",
                title = "Sắp xếp từ thành câu",
                desc = "Chạm các thẻ từ theo đúng trật tự ngữ pháp chuẩn tiếng Trung.",
                badge = "Tư duy câu",
                duration = "3–5 phút",
                unitLabel = "câu",
                c1 = BentoIndigoStart,
                c2 = BentoIndigoEnd,
                borderColor = Color(0xFFC2CEEE),
            ),
            BentoPracticeTile(
                id = "cloze",
                glyph = "填",
                title = "Điền từ thiếu",
                desc = "Hoàn chỉnh câu với từ phù hợp nhất.",
                badge = "Ngữ cảnh",
                duration = "3–5 phút",
                unitLabel = "câu",
                c1 = BentoPeachStart,
                c2 = BentoPeachEnd,
                borderColor = Color(0xFFF6D0AB),
            ),
            BentoPracticeTile(
                id = "grammar",
                glyph = "语",
                title = "Ngữ pháp",
                desc = "Sắp xếp & sửa lỗi cấu trúc HSK.",
                badge = "Ngữ pháp",
                duration = "4–6 phút",
                unitLabel = "câu",
                c1 = BentoLavenderStart,
                c2 = BentoRoseStart,
                borderColor = Color(0xFFD9CFF2),
            ),
        ).associateBy { it.id }
    }

    if (activeMode == null) {
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
                Text(
                    "Phòng luyện tập",
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = InkBlack,
                    letterSpacing = (-0.4).sp,
                )
                Text(
                    "Chạm vào một ô Bento để chọn cấp độ HSK & số câu luyện",
                    fontSize = 13.sp,
                    color = InkMuted,
                )
            }

            // Block 1: Full-width Hero Bento Card
            BentoPracticeCard(
                tile = tileMap["match"]!!,
                sizeStyle = BentoCardStyle.WideHero,
                onClick = { pendingTile = tileMap["match"] },
                modifier = Modifier.fillMaxWidth(),
            )

            // Block 2: Balanced 2-Column Pastel Bento Pair
            Row(
                modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Max),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                BentoPracticeCard(
                    tile = tileMap["listen"]!!,
                    sizeStyle = BentoCardStyle.MediumSquare,
                    onClick = { pendingTile = tileMap["listen"] },
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                )
                BentoPracticeCard(
                    tile = tileMap["quiz"]!!,
                    sizeStyle = BentoCardStyle.MediumSquare,
                    onClick = { pendingTile = tileMap["quiz"] },
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                )
            }

            // Block 3: Asymmetric Bento Mosaic (Left Tall Card + Right 2 Stacked Compact Cards)
            Row(
                modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Max),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                BentoPracticeCard(
                    tile = tileMap["writing"]!!,
                    sizeStyle = BentoCardStyle.TallVertical,
                    onClick = { pendingTile = tileMap["writing"] },
                    modifier = Modifier.weight(0.95f).fillMaxHeight(),
                )
                Column(
                    modifier = Modifier.weight(1.05f).fillMaxHeight(),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    BentoPracticeCard(
                        tile = tileMap["boss"]!!,
                        sizeStyle = BentoCardStyle.CompactStack,
                        onClick = { pendingTile = tileMap["boss"] },
                        modifier = Modifier.fillMaxWidth().weight(1f),
                    )
                    BentoPracticeCard(
                        tile = tileMap["dialogue"]!!,
                        sizeStyle = BentoCardStyle.CompactStack,
                        onClick = { pendingTile = tileMap["dialogue"] },
                        modifier = Modifier.fillMaxWidth().weight(1f),
                    )
                }
            }

            // Block 4: Full-width Bento Strip
            BentoPracticeCard(
                tile = tileMap["order"]!!,
                sizeStyle = BentoCardStyle.WideHero,
                onClick = { pendingTile = tileMap["order"] },
                modifier = Modifier.fillMaxWidth(),
            )

            // Block 5: Bottom 2-Column Bento Pair
            Row(
                modifier = Modifier.fillMaxWidth().height(IntrinsicSize.Max),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                BentoPracticeCard(
                    tile = tileMap["cloze"]!!,
                    sizeStyle = BentoCardStyle.MediumSquare,
                    onClick = { pendingTile = tileMap["cloze"] },
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                )
                BentoPracticeCard(
                    tile = tileMap["grammar"]!!,
                    sizeStyle = BentoCardStyle.MediumSquare,
                    onClick = { pendingTile = tileMap["grammar"] },
                    modifier = Modifier.weight(1f).fillMaxHeight(),
                )
            }

            Spacer(Modifier.height(10.dp))
        }

        // On-demand HSK Level & Word/Question Count Picker Bottom Sheet
        pendingTile?.let { tile ->
            var draftLevel by remember(tile.id) { mutableIntStateOf(level) }
            var draftCount by remember(tile.id) { mutableIntStateOf(count) }
            val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

            ModalBottomSheet(
                onDismissRequest = { pendingTile = null },
                sheetState = sheetState,
                containerColor = PaperPure,
                shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp),
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 20.dp)
                        .padding(bottom = 26.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                    ) {
                        Box(
                            modifier = Modifier
                                .size(52.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(Brush.linearGradient(listOf(tile.c1, tile.c2)))
                                .border(1.dp, tile.borderColor, RoundedCornerShape(16.dp)),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(tile.glyph, fontSize = 24.sp, fontWeight = FontWeight.Black, color = InkBlack)
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Text(tile.title, fontSize = 19.sp, fontWeight = FontWeight.ExtraBold, color = InkBlack)
                            Text(tile.desc, fontSize = 12.5.sp, color = InkMuted, maxLines = 2, overflow = TextOverflow.Ellipsis)
                        }
                        CircleActionButton(
                            onClick = { pendingTile = null },
                            size = 34.dp,
                            containerColor = PaperMuted,
                        ) {
                            Icon(Icons.Rounded.Close, contentDescription = "Đóng", tint = InkMuted, modifier = Modifier.size(17.dp))
                        }
                    }

                    HorizontalDivider(color = InkBorder.copy(alpha = 0.7f))

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            "1. CHỌN CẤP ĐỘ HSK",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkMuted,
                            letterSpacing = 0.8.sp,
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            val subLabels = mapOf(1 to "Cơ bản", 2 to "Sơ cấp", 3 to "Trung cấp")
                            (1..3).forEach { lvl ->
                                val selected = draftLevel == lvl
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(14.dp))
                                        .clickable { draftLevel = lvl },
                                    shape = RoundedCornerShape(14.dp),
                                    color = if (selected) BrandSoft else PaperMuted,
                                    border = BorderStroke(if (selected) 1.5.dp else 1.dp, if (selected) Brand else InkBorder),
                                ) {
                                    Column(
                                        modifier = Modifier.padding(vertical = 10.dp),
                                        horizontalAlignment = Alignment.CenterHorizontally,
                                    ) {
                                        Text(
                                            "HSK $lvl",
                                            fontSize = 14.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = if (selected) BrandDark else InkBlack,
                                        )
                                        Text(
                                            subLabels[lvl] ?: "",
                                            fontSize = 10.5.sp,
                                            color = if (selected) BrandDark.copy(alpha = 0.8f) else InkMuted,
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            "2. CHỌN SỐ ${tile.unitLabel.uppercase()}",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkMuted,
                            letterSpacing = 0.8.sp,
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            listOf(5, 10, 15, 20).forEach { n ->
                                val selected = draftCount == n
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(44.dp)
                                        .clip(RoundedCornerShape(14.dp))
                                        .clickable { draftCount = n },
                                    shape = RoundedCornerShape(14.dp),
                                    color = if (selected) InkBlack else PaperMuted,
                                    border = BorderStroke(1.dp, if (selected) InkBlack else InkBorder),
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            "$n ${tile.unitLabel.split(" ").first()}",
                                            fontSize = 12.5.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (selected) Color.White else InkBlack,
                                            maxLines = 1,
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = BrandSoft.copy(alpha = 0.65f),
                        border = BorderStroke(1.dp, BrandBorder),
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Text("Thiết lập đã chọn", fontSize = 12.sp, color = InkMuted, fontWeight = FontWeight.Medium)
                            Text("HSK $draftLevel · $draftCount ${tile.unitLabel}", fontSize = 13.sp, color = BrandDark, fontWeight = FontWeight.Bold)
                        }
                    }

                    InkPrimaryButton(
                        text = "Bắt đầu chơi · HSK $draftLevel ($draftCount ${tile.unitLabel.split(" ").first()})",
                        onClick = {
                            val chosenId = tile.id
                            level = draftLevel
                            count = draftCount
                            onLevelCountSelected(draftLevel, draftCount)
                            pendingTile = null
                            when (chosenId) {
                                "writing" -> onLaunchWriting(draftLevel, draftCount)
                                "boss" -> onLaunchBoss(draftLevel, draftCount)
                                "grammar" -> onLaunchGrammar(draftLevel, draftCount)
                                else -> {
                                    round++
                                    onModeChange(chosenId)
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(),
                    )
                }
            }
        }
    } else {
        Box(Modifier.fillMaxSize().padding(16.dp)) {
            MiniExerciseFeature(
                api = api,
                mode = activeMode,
                level = level,
                count = count,
                round = round,
                onAgain = { round++ },
                onExit = { onModeChange(null) }
            )
        }
    }
}

private enum class BentoCardStyle { WideHero, MediumSquare, TallVertical, CompactStack }

@Composable
private fun BentoPracticeCard(
    tile: BentoPracticeTile,
    sizeStyle: BentoCardStyle,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.98f else 1f,
        animationSpec = tween(120),
        label = "bento-press-${tile.id}",
    )

    val pad = when (sizeStyle) {
        BentoCardStyle.WideHero -> 18.dp
        BentoCardStyle.CompactStack -> 13.dp
        else -> 15.dp
    }
    val glyphSize = when (sizeStyle) {
        BentoCardStyle.WideHero -> 98.sp
        BentoCardStyle.TallVertical -> 96.sp
        BentoCardStyle.CompactStack -> 60.sp
        BentoCardStyle.MediumSquare -> 76.sp
    }

    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(RoundedCornerShape(24.dp))
            .background(Brush.linearGradient(listOf(tile.c1, tile.c2)))
            .border(1.dp, tile.borderColor, RoundedCornerShape(24.dp))
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick)
    ) {
        Text(
            text = tile.glyph,
            color = Color.White.copy(alpha = 0.50f),
            fontSize = glyphSize,
            fontWeight = FontWeight.Black,
            lineHeight = glyphSize,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = 4.dp, y = (-10).dp),
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(pad),
            verticalArrangement = Arrangement.SpaceBetween,
        ) {
            Column(
                modifier = Modifier.fillMaxWidth(if (sizeStyle == BentoCardStyle.WideHero) 0.85f else 0.92f),
                verticalArrangement = Arrangement.spacedBy(5.dp),
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.78f),
                ) {
                    Text(
                        text = tile.badge,
                        color = InkBlack,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                    )
                }

                Text(
                    text = tile.title,
                    fontSize = when (sizeStyle) {
                        BentoCardStyle.WideHero -> 19.sp
                        BentoCardStyle.CompactStack -> 15.sp
                        else -> 16.sp
                    },
                    fontWeight = FontWeight.ExtraBold,
                    color = InkBlack,
                    lineHeight = if (sizeStyle == BentoCardStyle.WideHero) 24.sp else 20.sp,
                )

                Text(
                    text = tile.desc,
                    fontSize = if (sizeStyle == BentoCardStyle.CompactStack) 11.5.sp else 12.5.sp,
                    color = InkBlack.copy(alpha = 0.72f),
                    lineHeight = if (sizeStyle == BentoCardStyle.CompactStack) 15.5.sp else 17.sp,
                    maxLines = when (sizeStyle) {
                        BentoCardStyle.CompactStack -> 2
                        BentoCardStyle.TallVertical -> 4
                        else -> 3
                    },
                    overflow = TextOverflow.Ellipsis,
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.75f),
                ) {
                    Text(
                        text = tile.duration,
                        color = InkBlack,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                    )
                }

                Surface(
                    modifier = Modifier.size(if (sizeStyle == BentoCardStyle.CompactStack) 28.dp else 32.dp),
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.88f),
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        ArrowUpRightIcon(
                            tint = InkBlack,
                            modifier = Modifier.size(if (sizeStyle == BentoCardStyle.CompactStack) 13.dp else 15.dp),
                        )
                    }
                }
            }
        }
    }
}

/**
 * Traditional Rice-Paper Calligraphy Grid (米字格 - Mi Zi Ge) & Ink Canvas.
 */
@Composable
internal fun WritingFeature(
    api: ApiClient,
    initialLevel: Int = 1,
    initialCount: Int = 10,
) {
    val context = LocalContext.current
    val tts = remember(context) { TextToSpeech(context) { } }
    DisposableEffect(tts) { onDispose { tts.stop(); tts.shutdown() } }

    var promptWords by remember(initialLevel, initialCount) { mutableStateOf<List<Word>>(emptyList()) }
    var promptIndex by remember(initialLevel, initialCount) { mutableIntStateOf(0) }
    var freeMode by remember { mutableStateOf(false) }

    LaunchedEffect(initialLevel, initialCount) {
        try {
            promptWords = api.words(initialLevel, "")
                .filter { it.hanzi.isNotBlank() }
                .shuffled()
                .take(initialCount)
            promptIndex = 0
        } catch (e: CancellationException) {
            throw e
        } catch (_: Exception) {
            promptWords = emptyList()
        }
    }

    val currentPrompt = if (!freeMode) promptWords.getOrNull(promptIndex) else null

    val strokes = remember { mutableStateListOf<List<Offset>>() }
    var current by remember { mutableStateOf<List<Offset>>(emptyList()) }
    var canvasSize by remember { mutableStateOf(IntSize.Zero) }
    var result by remember { mutableStateOf<JSONObject?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (promptWords.isNotEmpty()) {
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 20.dp,
                backgroundColor = if (freeMode) PaperMuted else BrandSoft.copy(alpha = 0.55f),
                borderColor = if (freeMode) InkBorder else BrandBorder,
            ) {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text(
                            if (freeMode) "Chế độ viết tự do" else "Từ mẫu ${promptIndex + 1} / ${promptWords.size} · HSK $initialLevel",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (freeMode) InkMuted else BrandDark,
                        )
                        Surface(
                            modifier = Modifier.clip(CircleShape).clickable { freeMode = !freeMode },
                            shape = CircleShape,
                            color = PaperPure,
                            border = BorderStroke(1.dp, InkBorder),
                        ) {
                            Text(
                                if (freeMode) "Theo từ mẫu" else "Viết tự do",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = InkBlack,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                            )
                        }
                    }

                    currentPrompt?.let { promptWord ->
                        Row(
                            Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically,
                        ) {
                            Column(Modifier.weight(1f)) {
                                Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                    Text(promptWord.hanzi, fontSize = 30.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                                    Text(promptWord.pinyin, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = BrandDark, modifier = Modifier.padding(bottom = 3.dp))
                                }
                                Text(promptWord.meaningVi, fontSize = 12.5.sp, color = InkMuted, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            }
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                                CircleActionButton(
                                    onClick = {
                                        tts.language = Locale.SIMPLIFIED_CHINESE
                                        tts.speak(promptWord.hanzi, TextToSpeech.QUEUE_FLUSH, null, "writing-tts-${promptWord.id}")
                                    },
                                    size = 36.dp,
                                    containerColor = PaperPure,
                                    borderColor = BrandBorder,
                                ) {
                                    Icon(Icons.AutoMirrored.Rounded.VolumeUp, contentDescription = "Nghe phát âm", tint = BrandDark, modifier = Modifier.size(18.dp))
                                }
                                Surface(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .clickable {
                                            strokes.clear()
                                            current = emptyList()
                                            result = null
                                            error = null
                                            promptIndex = (promptIndex + 1) % promptWords.size
                                        },
                                    shape = CircleShape,
                                    color = InkBlack,
                                ) {
                                    Text(
                                        "Từ tiếp ›",
                                        fontSize = 11.5.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White,
                                        modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
                                    )
                                }
                            }
                        }
                    }
                }
            }
        } else {
            Text("Dùng ngón tay viết chữ Hán vào ô kẻ 米字格 (Mễ tự cách) để AI nhận diện nét bút.", fontSize = 13.sp, color = InkMuted)
        }

        Box(
            Modifier
                .fillMaxWidth()
                .height(320.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(PaperPure)
                .border(1.5.dp, BrandBorder, RoundedCornerShape(24.dp))
                .onSizeChanged { canvasSize = it }
                .pointerInput(canvasSize) {
                    detectDragGestures(
                        onDragStart = { start -> current = listOf(start); result = null; error = null },
                        onDrag = { change, _ -> current = current + change.position; change.consume() },
                        onDragEnd = { if (current.size > 1) strokes.add(current); current = emptyList() },
                        onDragCancel = { current = emptyList() },
                    )
                },
        ) {
            Canvas(Modifier.fillMaxSize()) {
                val gridColor = BrandDark.copy(alpha = 0.25f)
                val strokeDash = Stroke(width = 1.2.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f))
                val solidBorder = Stroke(width = 1.dp.toPx())

                val pad = 12.dp.toPx()
                val w = size.width - pad * 2
                val h = size.height - pad * 2
                drawRect(InkBorder, Offset(pad, pad), androidx.compose.ui.geometry.Size(w, h), style = solidBorder)

                drawLine(gridColor, Offset(size.width / 2f, pad), Offset(size.width / 2f, size.height - pad), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)
                drawLine(gridColor, Offset(pad, size.height / 2f), Offset(size.width - pad, size.height / 2f), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)
                drawLine(gridColor, Offset(pad, pad), Offset(size.width - pad, size.height - pad), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)
                drawLine(gridColor, Offset(size.width - pad, pad), Offset(pad, size.height - pad), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)

                (strokes.toList() + listOfNotNull(current.takeIf { it.isNotEmpty() })).forEach { points ->
                    points.zipWithNext().forEach { (a, b) ->
                        drawLine(InkBlack, a, b, 9.dp.toPx(), cap = StrokeCap.Round)
                    }
                }
            }

            if (strokes.isEmpty() && current.isEmpty()) {
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    LevelBadge(currentPrompt?.hanzi?.take(1) ?: "书", size = 44.dp, fontSize = 20.sp, solid = false)
                    Text("Viết chữ Hán tại đây", color = InkLight, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            OutlinedButton(
                onClick = { strokes.clear(); current = emptyList(); result = null; error = null },
                modifier = Modifier.weight(1f).height(48.dp),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, InkBorder),
                enabled = strokes.isNotEmpty() || current.isNotEmpty()
            ) {
                Text("Xóa nét", color = InkBlack, fontWeight = FontWeight.SemiBold)
            }

            InkPrimaryButton(
                text = "Nhận diện chữ Hán",
                onClick = {
                    loading = true
                    error = null
                    result = null
                    scope.launch {
                        try {
                            val png = withContext(Dispatchers.Default) {
                                val w = canvasSize.width.coerceAtLeast(1)
                                val h = canvasSize.height.coerceAtLeast(1)
                                Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888).let { bmp ->
                                    val canvas = android.graphics.Canvas(bmp)
                                    canvas.drawColor(android.graphics.Color.WHITE)
                                    val paint = AndroidPaint(AndroidPaint.ANTI_ALIAS_FLAG).apply {
                                        color = android.graphics.Color.rgb(20, 19, 24)
                                        strokeWidth = 20f
                                        style = AndroidPaint.Style.STROKE
                                        strokeCap = AndroidPaint.Cap.ROUND
                                        strokeJoin = AndroidPaint.Join.ROUND
                                    }
                                    strokes.forEach { line ->
                                        val p = android.graphics.Path()
                                        line.firstOrNull()?.let { p.moveTo(it.x, it.y) }
                                        line.drop(1).forEach { p.lineTo(it.x, it.y) }
                                        canvas.drawPath(p, paint)
                                    }
                                    ByteArrayOutputStream().use { out ->
                                        bmp.compress(Bitmap.CompressFormat.PNG, 100, out)
                                        bmp.recycle()
                                        out.toByteArray()
                                    }
                                }
                            }
                            val base64 = withContext(Dispatchers.Default) { Base64.encodeToString(png, Base64.NO_WRAP) }
                            result = api.recognize("data:image/png;base64,$base64")
                        } catch (e: CancellationException) {
                            throw e
                        } catch (e: Exception) {
                            error = e.message ?: "Không nhận diện được chữ viết."
                        }
                        loading = false
                    }
                },
                loading = loading,
                enabled = strokes.isNotEmpty(),
                modifier = Modifier.weight(1f)
            )
        }

        error?.let { FeatureError(it) }

        result?.let { response ->
            val candidates = response.optJSONArray("candidates").objects()
            val matchedPrompt = currentPrompt != null && candidates.any { currentPrompt.hanzi.contains(it.optString("char")) }
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 20.dp) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("Kết quả nhận diện tự động", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = InkBlack)
                        if (matchedPrompt) {
                            Surface(color = JadeSoft, shape = CircleShape, border = BorderStroke(1.dp, JadeBorder)) {
                                Text("Khớp chữ mẫu ✓", color = JadeGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 9.dp, vertical = 3.dp))
                            }
                        }
                    }
                    if (candidates.isEmpty()) {
                        Text("Chưa nhận diện được. Thử viết nét to và cân đối hơn nhé.", color = InkMuted, fontSize = 13.sp)
                    }
                    candidates.forEach { item ->
                        val char = item.optString("char")
                        val scorePct = (item.optDouble("score") * 100).toInt()
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .padding(vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                                LevelBadge(char, size = 44.dp, fontSize = 22.sp)
                                Text(char, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            }
                            Surface(
                                color = BrandSoft,
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, BrandBorder)
                            ) {
                                Text(
                                    "$scorePct% khớp",
                                    color = BrandDark,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
internal fun PinyinBossFeature(
    api: ApiClient,
    level: Int,
    count: Int = 10,
) {
    var words by remember(level, count) { mutableStateOf<List<Word>>(emptyList()) }
    var index by remember(level, count) { mutableIntStateOf(0) }
    var input by remember { mutableStateOf("") }
    var hp by remember { mutableIntStateOf(5) }
    var feedback by remember { mutableStateOf<String?>(null) }
    var complete by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(level, count) {
        loading = true
        error = null
        try {
            words = api.words(level, "")
                .filter { it.pinyin.isNotBlank() && it.hanzi.isNotBlank() }
                .shuffled()
                .take(count)
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được từ vựng."
        }
        loading = false
    }

    val word = words.getOrNull(index)

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        if (loading) FeatureLoading("Đang triệu hồi Pinyin Boss…")
        error?.let { FeatureError(it) }

        if (complete) {
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 24.dp) {
                Column(
                    Modifier.padding(26.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    LevelBadge("胜", size = 60.dp, fontSize = 28.sp, solid = true)
                    Text("Đã hạ gục Pinyin Boss!", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    Text("Bạn đã gõ chính xác toàn bộ ${words.size} từ của lượt này.", color = InkMuted, fontSize = 13.sp)
                    InkPrimaryButton(
                        text = "Thử thách lượt mới",
                        onClick = {
                            index = 0
                            hp = 5
                            input = ""
                            feedback = null
                            complete = false
                            words = words.shuffled()
                        },
                        modifier = Modifier.fillMaxWidth().padding(top = 10.dp)
                    )
                }
            }
        }

        if (word != null && !complete) {
            val animatedHp by animateFloatAsState(targetValue = hp / 5f, label = "hp-bar")

            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 24.dp) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Surface(color = BrandSoft, shape = RoundedCornerShape(8.dp), border = BorderStroke(0.8.dp, BrandBorder)) {
                            Text("BOSS HSK $level", color = BrandDark, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                        }
                        Text("Mục tiêu ${index + 1} / ${words.size}", color = InkMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }

                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("NĂNG LƯỢNG BOSS", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = BrandDark, letterSpacing = 1.sp)
                            Text("$hp / 5 HP", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = BrandDark)
                        }
                        LinearProgressIndicator(
                            progress = { animatedHp },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(CircleShape),
                            color = Brand,
                            trackColor = PaperMuted
                        )
                    }

                    Text(
                        word.hanzi,
                        fontSize = 58.sp,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.Center,
                        color = InkBlack,
                        modifier = Modifier.fillMaxWidth().padding(top = 10.dp)
                    )
                    Text(
                        word.meaningVi,
                        fontSize = 15.sp,
                        color = InkMuted,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = input,
                        onValueChange = { input = it; feedback = null },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        placeholder = { Text("Gõ pinyin (vd: ni hao)", fontSize = 13.sp, color = InkLight) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Brand,
                            unfocusedBorderColor = InkBorder,
                            focusedContainerColor = PaperPure,
                            unfocusedContainerColor = PaperPure,
                        )
                    )

                    InkPrimaryButton(
                        text = "Tấn công mục tiêu",
                        onClick = {
                            val normalizedInput = normalizePinyin(input)
                            val normalizedAnswer = normalizePinyin(word.pinyin)
                            if (normalizedInput.isNotBlank() && normalizedInput == normalizedAnswer) {
                                val remaining = hp - 1
                                feedback = "Chính xác! Đòn đánh trúng mục tiêu."
                                if (remaining <= 0) {
                                    scope.launch {
                                        kotlinx.coroutines.delay(400)
                                        if (index + 1 < words.size) {
                                            index++
                                            hp = 5
                                            input = ""
                                            feedback = null
                                        } else {
                                            hp = 0
                                            complete = true
                                        }
                                    }
                                } else {
                                    hp = remaining
                                    input = ""
                                }
                            } else {
                                feedback = "Chưa trúng! Kiểm tra lại phiên âm pinyin."
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )

                    feedback?.let {
                        Text(
                            it,
                            color = if (it.startsWith("Chính xác")) JadeGreen else RedBad,
                            fontWeight = FontWeight.SemiBold,
                            fontSize = 13.sp,
                            textAlign = TextAlign.Center,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

private fun normalizePinyin(value: String): String = Normalizer.normalize(value.trim().lowercase().replace("ü", "v"), Normalizer.Form.NFD)
    .replace(Regex("\\p{Mn}+"), "").replace(Regex("\\s+"), "")

internal fun practiceTitle(mode: String) = when (mode) {
    "match" -> "Ghép từ"; "order" -> "Sắp xếp câu"; "cloze" -> "Điền từ"; "listen" -> "Nghe và chọn"; "dialogue" -> "Giao tiếp"; else -> "Quiz từ vựng"
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun MiniExerciseFeature(
    api: ApiClient,
    mode: String,
    level: Int,
    count: Int,
    round: Int,
    onAgain: () -> Unit,
    onExit: () -> Unit,
) {
    var words by remember(mode, level, count, round) { mutableStateOf<List<Word>>(emptyList()) }
    var questions by remember(mode, level, count, round) { mutableStateOf<List<JSONObject>>(emptyList()) }
    var loading by remember(mode, level, count, round) { mutableStateOf(true) }
    var error by remember(mode, level, count, round) { mutableStateOf<String?>(null) }
    var index by remember(mode, level, count, round) { mutableIntStateOf(0) }
    var score by remember(mode, level, count, round) { mutableIntStateOf(0) }
    var answer by remember(mode, level, count, round) { mutableStateOf<String?>(null) }
    var selectedHan by remember(mode, level, count, round) { mutableStateOf<Word?>(null) }
    var selectedMeaning by remember(mode, level, count, round) { mutableStateOf<Word?>(null) }
    var matched by remember(mode, level, count, round) { mutableStateOf(setOf<Int>()) }
    var matchError by remember(mode, level, count, round) { mutableStateOf(false) }
    var bank by remember(mode, level, count, round) { mutableStateOf<List<String>>(emptyList()) }
    var picked by remember(mode, level, count, round) { mutableStateOf<List<String>>(emptyList()) }
    var complete by remember(mode, level, count, round) { mutableStateOf(false) }
    val context = LocalContext.current
    val shuffledMatchWords = remember(mode, level, count, round, words) { words.shuffled() }
    val tts = remember(context) { TextToSpeech(context) { } }
    DisposableEffect(tts) { onDispose { tts.stop(); tts.shutdown() } }

    LaunchedEffect(mode, level, count, round) {
        loading = true
        error = null
        try {
            when (mode) {
                "match" -> words = api.words(level, "").filter { it.meaningVi.isNotBlank() }.shuffled().take(count)
                "order" -> questions = api.exerciseOrder(level, count).objects()
                "cloze" -> questions = api.exerciseCloze(level, count).objects()
                "listen", "quiz" -> questions = JSONArray().apply {
                    api.quiz(level, count).forEach { q ->
                        put(JSONObject().put("hanzi", q.word.hanzi).put("pinyin", q.word.pinyin).put("meaningVi", q.word.meaningVi).put("options", JSONArray(q.options.map { JSONObject().put("hanzi", it.hanzi).put("meaningVi", it.meaningVi) })))
                    }
                }.objects()
                "dialogue" -> questions = dialogueQuestions(level, count)
            }
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được bài luyện."
        }
        loading = false
    }

    val q = questions.getOrNull(index)

    LaunchedEffect(mode, index, questions) {
        val tokens = q?.optJSONArray("tokens")
        if (mode == "order" && tokens != null) {
            bank = (0 until tokens.length()).map(tokens::optString).shuffled()
            picked = emptyList()
            answer = null
        }
        if (mode == "listen" && q != null) {
            val target = q.optString("hanzi")
            if (target.isNotBlank()) {
                tts.language = Locale.SIMPLIFIED_CHINESE
                tts.speak(target, TextToSpeech.QUEUE_FLUSH, null, "listen-auto-$index")
            }
        }
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        if (loading) { FeatureLoading("Đang chuẩn bị bài luyện tập…"); return@Column }
        error?.let { FeatureError(it); InkPrimaryButton(text = "Thử lại", onClick = onAgain); return@Column }

        if (complete || (mode == "match" && words.isNotEmpty() && matched.size == words.size)) {
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 24.dp) {
                Column(Modifier.padding(26.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    LevelBadge("完", size = 56.dp, fontSize = 24.sp, solid = true)
                    Text("Hoàn thành bài luyện tập!", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    Text("Đúng $score / ${if (mode == "match") words.size else questions.size} câu", color = BrandDark, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    InkPrimaryButton(text = "Luyện tập lượt khác", onClick = onAgain, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                    TextButton(onClick = onExit) { Text("Quay lại danh mục", color = InkMuted) }
                }
            }
            return@Column
        }

        if (mode == "match") {
            if (words.isEmpty()) { FeatureEmpty("Cấp này chưa có đủ cặp từ."); return@Column }
            val remaining = words.filterNot { it.id in matched }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Ghép chữ Hán với nghĩa đúng", color = InkMuted, fontSize = 13.sp)
                Text("${matched.size} / ${words.size} cặp", color = BrandDark, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("CHỮ HÁN", color = InkMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    remaining.forEach { word ->
                        GameChoice(
                            text = word.hanzi,
                            selected = selectedHan?.id == word.id,
                            wrong = matchError && selectedHan?.id == word.id,
                            onClick = {
                                selectedHan = word
                                if (selectedMeaning != null) {
                                    if (selectedMeaning?.id == word.id) {
                                        matched = matched + word.id
                                        score++
                                    } else matchError = true
                                    selectedHan = null
                                    selectedMeaning = null
                                }
                            }
                        )
                    }
                }
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("NGHĨA TIẾNG VIỆT", color = InkMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                    shuffledMatchWords.filterNot { it.id in matched }.forEach { word ->
                        GameChoice(
                            text = word.meaningVi.take(50),
                            selected = selectedMeaning?.id == word.id,
                            wrong = matchError && selectedMeaning?.id == word.id,
                            onClick = {
                                selectedMeaning = word
                                if (selectedHan != null) {
                                    if (selectedHan?.id == word.id) {
                                        matched = matched + word.id
                                        score++
                                    } else matchError = true
                                    selectedHan = null
                                    selectedMeaning = null
                                }
                            }
                        )
                    }
                }
            }
            if (matchError) Text("Cặp này chưa khớp, hãy chọn lại nhé.", color = RedBad, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            LaunchedEffect(matchError) { if (matchError) { kotlinx.coroutines.delay(650); matchError = false } }
            return@Column
        }

        if (q == null) { FeatureEmpty("Không có câu hỏi ở cấp này."); return@Column }
        val total = questions.size.coerceAtLeast(1)

        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("CÂU ${index + 1} / $total", color = BrandDark, fontWeight = FontWeight.Bold, fontSize = 11.sp, letterSpacing = 1.sp)
            Text("Đúng $score câu", color = JadeGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
        LinearProgressIndicator(
            progress = { (index + 1).toFloat() / total },
            modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
            color = BrandDark,
            trackColor = PaperMuted
        )

        InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 22.dp) {
            Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                when (mode) {
                    "order" -> {
                        Text(
                            text = q.optString("meaningVi", "Sắp xếp thành câu tiếng Trung:"),
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkBlack
                        )
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = PaperMuted,
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, if (picked.isNotEmpty()) BrandBorder else InkBorder)
                        ) {
                            Column(
                                modifier = Modifier.fillMaxWidth().padding(14.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                if (picked.isEmpty()) {
                                    Text("Chạm các từ bên dưới để ghép câu…", fontSize = 15.sp, color = InkLight, modifier = Modifier.padding(vertical = 4.dp))
                                } else {
                                    FlowRow(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        picked.forEachIndexed { pIdx, token ->
                                            Surface(
                                                modifier = Modifier.clickable {
                                                    if (answer == null) {
                                                        picked = picked.filterIndexed { i, _ -> i != pIdx }
                                                        bank = bank + token
                                                    }
                                                },
                                                color = PaperPure,
                                                shape = RoundedCornerShape(10.dp),
                                                border = BorderStroke(1.dp, BrandBorder),
                                                shadowElevation = 1.dp
                                            ) {
                                                Row(
                                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                                                    verticalAlignment = Alignment.CenterVertically,
                                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                                ) {
                                                    Text(token, fontSize = 18.sp, fontWeight = FontWeight.SemiBold, color = BrandDark)
                                                    if (answer == null) Text("✕", fontSize = 10.sp, color = InkMuted)
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (bank.isNotEmpty() && answer == null) {
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text("Từ vựng có sẵn:", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = InkMuted, letterSpacing = 0.5.sp)
                                FlowRow(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    bank.forEachIndexed { i, token ->
                                        Surface(
                                            modifier = Modifier.clickable {
                                                bank = bank.filterIndexed { idx, _ -> idx != i }
                                                picked = picked + token
                                            },
                                            color = PaperPure,
                                            shape = RoundedCornerShape(10.dp),
                                            border = BorderStroke(1.dp, InkBorder),
                                            shadowElevation = 1.dp
                                        ) {
                                            Text(token, fontSize = 18.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp), color = InkBlack)
                                        }
                                    }
                                }
                            }
                        }

                        if (answer == null) {
                            InkPrimaryButton(
                                text = "Kiểm tra đáp án",
                                onClick = {
                                    val target = q.optJSONArray("tokens").strings().joinToString("")
                                    val correct = picked.joinToString("") == target
                                    answer = if (correct) "Đúng rồi!" else "Chưa đúng. Đáp án: $target"
                                    if (correct) score++
                                },
                                enabled = picked.isNotEmpty(),
                                modifier = Modifier.fillMaxWidth().padding(top = 8.dp)
                            )
                        }
                    }
                    "cloze" -> {
                        val sentence = q.optString("sentence").replace("____", "＿＿")
                        Text(sentence, fontSize = 24.sp, fontWeight = FontWeight.SemiBold, textAlign = TextAlign.Center, color = InkBlack, modifier = Modifier.fillMaxWidth().padding(vertical = 12.dp))
                        Text(q.optString("meaningVi"), color = InkMuted, fontSize = 13.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                    }
                    "listen" -> {
                        val target = q.optString("hanzi")
                        Text("Nghe phát âm rồi chọn chữ Hán:", color = InkMuted, fontSize = 13.sp)
                        OutlinedButton(
                            onClick = { tts.language = Locale.SIMPLIFIED_CHINESE; tts.speak(target, TextToSpeech.QUEUE_FLUSH, null, "listen-audio") },
                            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp).height(50.dp),
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, BrandBorder),
                            colors = ButtonDefaults.outlinedButtonColors(containerColor = BrandSoft)
                        ) {
                            Icon(Icons.AutoMirrored.Rounded.VolumeUp, null, tint = BrandDark)
                            Spacer(Modifier.width(8.dp))
                            Text("Nghe phát âm lại", color = BrandDark, fontWeight = FontWeight.Bold)
                        }
                    }
                    "quiz" -> {
                        Text(q.optString("hanzi"), fontSize = 54.sp, fontWeight = FontWeight.Medium, textAlign = TextAlign.Center, color = InkBlack, modifier = Modifier.fillMaxWidth())
                        Text(q.optString("pinyin"), color = BrandDark, fontSize = 19.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                        Text("Chọn nghĩa tiếng Việt đúng:", color = InkMuted, fontSize = 13.sp, modifier = Modifier.padding(top = 6.dp))
                    }
                    "dialogue" -> {
                        Text(q.optString("scenario"), color = InkMuted, fontSize = 12.sp)
                        Text(q.optString("prompt"), fontSize = 22.sp, fontWeight = FontWeight.Bold, color = InkBlack, modifier = Modifier.padding(top = 4.dp))
                        Text(q.optString("promptVi"), color = InkMuted, fontSize = 13.sp)
                    }
                }
            }
        }

        val options = when (mode) {
            "cloze" -> q.optJSONArray("options").objects().map { it.optString("hanzi") }
            "listen", "quiz" -> q.optJSONArray("options").objects().map { if (mode == "listen") it.optString("hanzi") else it.optString("meaningVi") }
            "dialogue" -> q.optJSONArray("options").objects().map { it.optString("hanzi") }
            else -> emptyList()
        }

        if (mode in listOf("cloze", "listen", "quiz", "dialogue")) {
            options.forEach { option ->
                val correct = when (mode) {
                    "cloze" -> option == q.optJSONObject("answer")?.optString("hanzi")
                    "listen" -> option == q.optString("hanzi")
                    "quiz" -> option == q.optString("meaningVi")
                    else -> option == q.optString("answer")
                }
                GameChoice(
                    text = option,
                    selected = answer != null && option == answer,
                    correct = answer != null && correct,
                    onClick = {
                        if (answer == null) {
                            answer = option
                            if (correct) score++
                        }
                    }
                )
            }
        }

        if (answer != null) {
            val correct = when (mode) {
                "cloze" -> answer == q.optJSONObject("answer")?.optString("hanzi")
                "listen" -> answer == q.optString("hanzi")
                "quiz" -> answer == q.optString("meaningVi")
                "order" -> answer == "Đúng rồi!"
                else -> answer == q.optString("answer")
            }
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = if (correct) JadeSoft else RedSoft,
                shape = RoundedCornerShape(12.dp),
                border = BorderStroke(1.dp, if (correct) JadeBorder else RedBorder)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Icon(
                        imageVector = if (correct) Icons.Rounded.Check else Icons.Rounded.Close,
                        contentDescription = null,
                        tint = if (correct) JadeGreen else RedBad,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = if (correct) "Chính xác! Rất tốt." else answer ?: "Chưa chính xác.",
                        color = if (correct) JadeGreen else RedBad,
                        fontWeight = FontWeight.Bold,
                        fontSize = 13.sp,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            InkPrimaryButton(
                text = if (index + 1 >= questions.size) "Xem kết quả" else "Câu tiếp theo ›",
                onClick = {
                    if (index + 1 >= questions.size) complete = true
                    else { index++; answer = null }
                },
                modifier = Modifier.fillMaxWidth().padding(top = 6.dp)
            )
        }
    }
}

@Composable
private fun GameChoice(
    text: String,
    selected: Boolean = false,
    correct: Boolean = false,
    wrong: Boolean = false,
    onClick: () -> Unit
) {
    val bgColor = when {
        correct -> JadeSoft
        wrong -> RedSoft
        selected -> BrandSoft
        else -> PaperPure
    }
    val borderColor = when {
        correct -> JadeGreen
        wrong -> RedBad
        selected -> Brand
        else -> InkBorder
    }

    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        color = bgColor,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(if (selected || correct || wrong) 1.8.dp else 1.dp, borderColor),
        shadowElevation = if (selected) 2.dp else 0.dp
    ) {
        Text(
            text = text,
            fontSize = 15.sp,
            color = if (wrong) RedBad else if (correct) JadeGreen else if (selected) BrandDark else InkBlack,
            fontWeight = if (selected || correct) FontWeight.Bold else FontWeight.Medium,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 13.dp)
        )
    }
}

private fun dialogueQuestions(level: Int, count: Int): List<JSONObject> {
    fun q(lvl: Int, sc: String, pr: String, vi: String, ans: String, d1: String, d2: String) = JSONObject()
        .put("level", lvl)
        .put("scenario", sc)
        .put("prompt", pr)
        .put("promptVi", vi)
        .put("answer", ans)
        .put("options", JSONArray(listOf(ans, d1, d2).shuffled().map { JSONObject().put("hanzi", it) }))
    val pool = listOf(
        q(1, "Lần đầu gặp bạn mới", "你好！很高兴认识你。", "Xin chào, rất vui được gặp bạn.", "我也很高兴认识你。", "我不吃米饭。", "现在三点。"),
        q(1, "Bạn nhận được lời cảm ơn", "谢谢你帮我！", "Cảm ơn bạn đã giúp tôi!", "不客气！", "你几岁？", "我去学校。"),
        q(1, "Gọi đồ uống tại quán", "你想喝什么？", "Bạn muốn uống gì?", "我想喝茶。", "我姓王。", "今天星期一。"),
        q(1, "Hỏi thăm tên tuổi", "你叫什么名字？", "Bạn tên là gì?", "我叫明大。", "今天很冷。", "我在看书。"),
        q(1, "Hỏi giờ hiện tại", "现在几点了？", "Bây giờ là mấy giờ rồi?", "现在上午九点。", "我不认识他。", "这个很好看。"),
        q(2, "Tại cửa hàng quần áo", "这件衣服多少钱？", "Cái áo này bao nhiêu tiền?", "两百块，可以试试。", "我昨天去北京了。", "我也喜欢游泳。"),
        q(2, "Hẹn lịch gặp mặt", "我们星期六去打篮球好吗？", "Thứ Bảy chúng mình đi chơi bóng rổ nhé?", "好的，几点见面？", "因为今天下雨。", "这本书是我的。"),
        q(2, "Hỏi thăm sức khỏe", "你看起来有点累，怎么了？", "Bạn trông hơi mệt, có chuyện gì thế?", "昨晚睡得太晚了。", "我已经吃了午饭。", "他在医院工作。"),
        q(2, "Di chuyển bằng phương tiện", "你怎么去机场？", "Bạn đi sân bay bằng gì?", "我坐地铁去，很快。", "机票已经买好了。", "这件比那件大。"),
        q(2, "Đề nghị giúp đỡ", "门太重了，我帮你拿吧！", "Cửa nặng quá, để mình xách giúp bạn!", "太谢谢你了，麻烦你！", "我每天早上跑步。", "今天比昨天热。"),
        q(3, "Trao đổi lịch trình công việc", "下周的会议安排好时间了吗？", "Cuộc họp tuần sau đã sắp xếp xong thời gian chưa?", "已经决定了，星期三上午开会。", "我把词典忘在教室了。", "外面刮风了。"),
        q(3, "Nhận xét về môi trường mới", "你觉得这个城市的环境怎么样？", "Bạn thấy môi trường của thành phố này thế nào?", "又干净又安静，我非常满意。", "我打算先复习一遍。", "他刚刚走出图书馆。"),
        q(3, "Xin lỗi vì đến muộn", "真抱歉，路上太堵，我迟到了。", "Thật xin lỗi, đường kẹt quá nên mình đến muộn.", "没关系，我们也刚到一会儿。", "请把空调关掉吧。", "这双鞋太小了。"),
        q(3, "Hỏi mượn đồ dùng", "请问，我可以用一下你的电脑吗？", "Xin hỏi tôi có thể dùng nhờ máy tính của bạn một lát không?", "当然可以，密码在桌子上。", "我对音乐很感兴趣。", "他们越跑越快。"),
        q(3, "Bày tỏ thói quen hàng ngày", "周末你一般怎么放松？", "Cuối tuần bạn thường thư giãn thế nào?", "我经常听音乐或者去爬山。", "为了学好中文要多读。", "其实这个问题很简单。"),
    )
    val matching = pool.filter { it.optInt("level") == level }.shuffled()
    val others = pool.filter { it.optInt("level") != level }.shuffled()
    return (matching + others).take(count.coerceAtLeast(1))
}

@Composable
internal fun FeatureWordRow(word: Word, modifier: Modifier = Modifier, onClick: () -> Unit) {
    InkCard(modifier = modifier, shapeRadius = 20.dp, onClick = onClick) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(Modifier.width(96.dp)) {
                Text(word.hanzi, fontSize = 26.sp, fontWeight = FontWeight.Medium, color = InkBlack)
                Text(word.pinyin, color = BrandDark, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Box(Modifier.height(36.dp).width(1.dp).background(InkBorder))
            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                Text(word.meaningVi.ifBlank { "Chưa có nghĩa" }, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = InkBlack, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text("HSK ${word.hskLevel}", color = InkMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
            }
            ArrowUpRightIcon(tint = BrandDark, modifier = Modifier.size(16.dp))
        }
    }
}

/**
 * Shared Interactive Word Detail Dialog with Chinese TTS Audio & Favorite Bookmark Toggle.
 */
@Composable
internal fun FeatureWordDialog(
    word: Word,
    api: ApiClient? = null,
    isFavorite: Boolean = false,
    onFavoriteToggled: ((Boolean) -> Unit)? = null,
    onDismiss: () -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val tts = remember(context) { TextToSpeech(context) { } }
    DisposableEffect(tts) { onDispose { tts.stop(); tts.shutdown() } }

    var fav by remember(word.id, isFavorite) { mutableStateOf(isFavorite) }
    var togglingFav by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(
                Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(word.hanzi, fontSize = 40.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    LevelBadge("HSK${word.hskLevel}", size = 34.dp, fontSize = 10.sp)
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    CircleActionButton(
                        onClick = {
                            tts.language = Locale.SIMPLIFIED_CHINESE
                            tts.speak(word.hanzi, TextToSpeech.QUEUE_FLUSH, null, "word-tts-${word.id}")
                        },
                        size = 38.dp,
                        containerColor = BrandSoft,
                        borderColor = BrandBorder,
                    ) {
                        Icon(Icons.AutoMirrored.Rounded.VolumeUp, contentDescription = "Nghe phát âm", tint = BrandDark, modifier = Modifier.size(19.dp))
                    }
                    if (api != null) {
                        CircleActionButton(
                            onClick = {
                                if (!togglingFav) {
                                    togglingFav = true
                                    scope.launch {
                                        val next = !fav
                                        runCatching { api.setFavorite(word.id, next) }.onSuccess {
                                            fav = next
                                            onFavoriteToggled?.invoke(next)
                                        }
                                        togglingFav = false
                                    }
                                }
                            },
                            size = 38.dp,
                            containerColor = if (fav) AmberSoft else PaperMuted,
                            borderColor = if (fav) AmberBorder else InkBorder,
                        ) {
                            Icon(
                                imageVector = if (fav) Icons.Rounded.Bookmark else Icons.Rounded.BookmarkBorder,
                                contentDescription = if (fav) "Bỏ lưu" else "Lưu sổ từ",
                                tint = if (fav) AmberGold else InkMuted,
                                modifier = Modifier.size(19.dp),
                            )
                        }
                    }
                }
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(word.pinyin, color = BrandDark, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Text(word.meaningVi.ifBlank { "Chưa có nghĩa tiếng Việt." }, fontSize = 15.sp, color = InkBlack)
                word.hanviet?.let { Text("Âm Hán Việt: $it", color = InkMuted, fontSize = 13.sp) }
                Text("Cấp độ: HSK ${word.hskLevel}", color = InkMuted, fontSize = 12.sp)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Đóng", color = BrandDark, fontWeight = FontWeight.Bold) }
        },
        containerColor = PaperPure,
        shape = RoundedCornerShape(22.dp)
    )
}

@Composable
private fun FeatureMetric(label: String, value: String, unit: String, modifier: Modifier = Modifier) {
    InkCard(modifier = modifier, shapeRadius = 18.dp) {
        Column(Modifier.padding(horizontal = 14.dp, vertical = 14.dp)) {
            Text(label, color = InkMuted, fontSize = 11.sp, fontWeight = FontWeight.Medium)
            Text(value, fontSize = 24.sp, fontWeight = FontWeight.ExtraBold, color = InkBlack, modifier = Modifier.padding(top = 2.dp))
            Text(unit, color = BrandDark, fontSize = 10.5.sp, fontWeight = FontWeight.SemiBold)
        }
    }
}

@Composable
private fun FeatureLoading(message: String? = null) {
    ChainaStrokeLoading(
        mode = ChainaLoadingMode.INLINE,
        size = ChainaLoadingSize.SM,
        message = message,
    )
}

@Composable
private fun FeatureError(text: String) {
    Surface(
        Modifier.fillMaxWidth(),
        color = RedSoft,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, RedBorder)
    ) {
        Text(text, color = RedBad, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(13.dp))
    }
}

@Composable
private fun FeatureEmpty(text: String) {
    InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 18.dp) {
        Text(text, color = InkMuted, fontSize = 13.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(22.dp))
    }
}

private fun JSONArray?.objects(): List<JSONObject> = if (this == null) emptyList() else (0 until length()).mapNotNull { optJSONObject(it) }
private fun JSONArray?.strings(): List<String> = if (this == null) emptyList() else (0 until length()).map { optString(it) }
