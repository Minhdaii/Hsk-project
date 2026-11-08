package com.chaina.hsk.ui

import android.graphics.Bitmap
import android.graphics.Paint as AndroidPaint
import android.graphics.RectF
import android.speech.tts.TextToSpeech
import android.util.Base64
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
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
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.ArrowBack
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.EmojiEvents
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Search
import androidx.compose.material.icons.rounded.VolumeUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chaina.hsk.data.ApiClient
import com.chaina.hsk.data.LevelProgress
import com.chaina.hsk.data.Stats
import com.chaina.hsk.data.Word
import com.chaina.hsk.ui.components.InkCard
import com.chaina.hsk.ui.components.InkPrimaryButton
import com.chaina.hsk.ui.components.LevelBadge
import com.chaina.hsk.ui.components.RedSeal
import com.chaina.hsk.ui.theme.AmberGold
import com.chaina.hsk.ui.theme.AmberSoft
import com.chaina.hsk.ui.theme.Brand
import com.chaina.hsk.ui.theme.BrandBorder
import com.chaina.hsk.ui.theme.BrandDark
import com.chaina.hsk.ui.theme.BrandSoft
import com.chaina.hsk.ui.theme.InkBlack
import com.chaina.hsk.ui.theme.InkBorder
import com.chaina.hsk.ui.theme.InkBorderDark
import com.chaina.hsk.ui.theme.InkCharcoal
import com.chaina.hsk.ui.theme.InkGray
import com.chaina.hsk.ui.theme.InkLight
import com.chaina.hsk.ui.theme.InkMuted
import com.chaina.hsk.ui.theme.JadeBorder
import com.chaina.hsk.ui.theme.JadeGreen
import com.chaina.hsk.ui.theme.JadeSoft
import com.chaina.hsk.ui.theme.Paper
import com.chaina.hsk.ui.theme.PaperCard
import com.chaina.hsk.ui.theme.PaperMuted
import com.chaina.hsk.ui.theme.PaperPure
import com.chaina.hsk.ui.theme.RedBad
import com.chaina.hsk.ui.theme.RedBorder
import com.chaina.hsk.ui.theme.RedSoft
import com.chaina.hsk.ui.theme.Vermilion
import com.chaina.hsk.ui.theme.VermilionBorder
import com.chaina.hsk.ui.theme.VermilionDark
import com.chaina.hsk.ui.theme.VermilionSoft
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.ByteArrayOutputStream
import java.text.Normalizer
import java.util.Locale

internal enum class AppDestination(val label: String) {
    Home("Tổng quan"), Categories("Chủ đề"), Words("Từ vựng"), Practice("Luyện tập"), Path("Lộ trình"),
    Grammar("Ngữ pháp"), GrammarPractice("Luyện ngữ pháp"), Favorites("Sổ từ"), Review("Ôn tập"), Stats("Thống kê"), Leaderboard("Xếp hạng"),
    Writing("Luyện viết"), PinyinBoss("Pinyin Boss"), Account("Tài khoản"), Privacy("Quyền riêng tư"), Credits("Nguồn dữ liệu"),
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
                InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 18.dp) {
                    Row(
                        Modifier.padding(16.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        RedSeal("${index + 1}", size = 32.dp, fontSize = 14.sp)
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
                    shapeRadius = 18.dp,
                    onClick = { runCatching { context.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url))) } }
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text(title, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = InkBlack)
                        Text(url, color = Vermilion, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 4.dp))
                    }
                }
            }
            Text("Các tài nguyên và giấy phép mã nguồn mở được tôn trọng và ghi nhận đầy đủ theo chuẩn học thuật.", color = InkMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 8.dp))
        }
    }
}

@Composable
internal fun CategoriesFeature(api: ApiClient) {
    var groups by remember { mutableStateOf<List<JSONObject>?>(null) }
    var query by remember { mutableStateOf("") }
    var slug by remember { mutableStateOf<String?>(null) }
    var category by remember { mutableStateOf<JSONObject?>(null) }
    var words by remember { mutableStateOf<List<Word>>(emptyList()) }
    var selectedWord by remember { mutableStateOf<Word?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        try {
            groups = api.categoryTree().objects()
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
            category = api.category(slug!!)
            words = api.categoryWords(slug!!).objects().mapNotNull { runCatching { Word.from(it) }.getOrNull() }
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
                    Icon(Icons.Rounded.ArrowBack, contentDescription = null, tint = InkBlack, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(6.dp))
                    Text("Tất cả chủ đề", color = InkBlack, fontSize = 13.sp)
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
            error?.let { FeatureError(it) }
            if (loading) FeatureLoading()

            groups?.forEach { group ->
                val categories = group.optJSONArray("categories").objects()
                Text(
                    group.optString("nameVi", group.optString("name")),
                    fontWeight = FontWeight.Bold,
                    fontSize = 17.sp,
                    color = InkBlack,
                    modifier = Modifier.padding(top = 8.dp)
                )
                categories.forEach { cat ->
                    InkCard(
                        modifier = Modifier.fillMaxWidth(),
                        shapeRadius = 18.dp,
                        onClick = { slug = cat.optString("slug") }
                    ) {
                        Row(
                            Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            RedSeal(
                                text = cat.optString("icon", cat.optString("name").take(1)),
                                size = 42.dp,
                                fontSize = 18.sp,
                                solid = false
                            )
                            Column(Modifier.weight(1f)) {
                                Text(
                                    cat.optString("nameVi", cat.optString("name")),
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = InkBlack
                                )
                                Text(
                                    "${cat.optInt("wordCount")} từ vựng chuẩn HSK",
                                    color = InkMuted,
                                    fontSize = 12.sp,
                                    modifier = Modifier.padding(top = 2.dp)
                                )
                            }
                            Text("›", color = Vermilion, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        } else {
            error?.let { FeatureError(it) }
            if (loading) FeatureLoading()
            words.forEach { word ->
                FeatureWordRow(word) { selectedWord = word }
            }
            if (!loading && words.isEmpty() && error == null) {
                FeatureEmpty("Chủ đề này chưa có từ vựng.")
            }
        }
    }
    selectedWord?.let { FeatureWordDialog(it) { selectedWord = null } }
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
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            (0..3).forEach { l ->
                val isSelected = level == l
                FilterChip(
                    selected = isSelected,
                    onClick = { level = l },
                    label = { Text(if (l == 0) "Tất cả" else "HSK $l", fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium) },
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = VermilionSoft,
                        selectedLabelColor = VermilionDark,
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        enabled = true,
                        selected = isSelected,
                        borderColor = if (isSelected) VermilionBorder else InkBorder,
                    ),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        }

        notice?.let { Text(it, color = JadeGreen, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) }
        error?.let { FeatureError(it) }
        if (loading) FeatureLoading()

        items.groupBy { it.optInt("level") }.toSortedMap().forEach { (lv, points) ->
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                RedSeal("HSK$lv", size = 26.dp, fontSize = 10.sp)
                Text("Cấp độ HSK $lv", fontWeight = FontWeight.Bold, color = InkBlack, fontSize = 15.sp)
            }

            points.forEach { grammar ->
                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    shapeRadius = 18.dp,
                    onClick = {
                        selected = grammar
                        scope.launch {
                            try {
                                detail = api.grammarDetail(grammar.optString("slug").ifBlank { grammar.optString("id") })
                            } catch (e: Exception) {
                                error = e.message
                            }
                        }
                    }
                ) {
                    Column(Modifier.padding(16.dp)) {
                        Text(grammar.optString("title"), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                        Surface(
                            color = PaperMuted,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.padding(top = 6.dp)
                        ) {
                            Text(
                                grammar.optString("pattern"),
                                fontSize = 13.sp,
                                color = VermilionDark,
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
                        color = VermilionSoft,
                        shape = RoundedCornerShape(8.dp),
                        border = BorderStroke(0.8.dp, VermilionBorder)
                    ) {
                        Text(
                            data.optString("pattern"),
                            color = VermilionDark,
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
                                    Text(it, color = Vermilion, fontSize = 12.sp, fontWeight = FontWeight.Medium)
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
                        } catch (e: Exception) {
                            notice = e.message ?: "Không lưu được tiến độ."
                        }
                    }
                }) {
                    Text(if (learned) "Đã học ✓" else "Đánh dấu đã học", color = if (learned) JadeGreen else Vermilion, fontWeight = FontWeight.Bold)
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

@Composable
internal fun GrammarPracticeFeature(api: ApiClient, initialLevel: Int) {
    val kinds = listOf(
        "order" to "Sắp xếp câu",
        "cloze" to "Điền chỗ trống",
        "choose" to "Chọn câu đúng",
        "fix" to "Sửa lỗi sai",
        "match" to "Ghép cấu trúc",
        "translate" to "Dịch câu"
    )
    var kind by remember { mutableStateOf("order") }
    var level by remember { mutableIntStateOf(initialLevel) }
    var count by remember { mutableIntStateOf(10) }
    var round by remember { mutableIntStateOf(0) }
    var questions by remember { mutableStateOf<List<JSONObject>>(emptyList()) }
    var index by remember { mutableIntStateOf(0) }
    var tokens by remember { mutableStateOf<List<String>>(emptyList()) }
    var picked by remember { mutableStateOf<List<String>>(emptyList()) }
    var answer by remember { mutableStateOf<JSONObject?>(null) }
    var loading by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var score by remember { mutableIntStateOf(0) }
    val scope = rememberCoroutineScope()

    fun start() {
        scope.launch {
            loading = true
            error = null
            answer = null
            try {
                questions = api.grammarExercises(kind, level, count = count).objects()
                if (questions.isEmpty()) error = "Chưa có câu cho dạng bài này ở cấp HSK $level. Hãy thử dạng khác hoặc chọn Tất cả."
                index = 0
                score = 0
                round++
            } catch (e: Exception) {
                error = e.message ?: "Không tải được bài ngữ pháp."
            }
            loading = false
        }
    }

    val q = questions.getOrNull(index)

    LaunchedEffect(round, index, q) {
        tokens = q?.optJSONArray("tokens").strings().shuffled()
        picked = emptyList()
        answer = null
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        if (questions.isEmpty()) {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                (0..3).forEach { lv ->
                    val isSelected = level == lv
                    FilterChip(
                        selected = isSelected,
                        onClick = { level = lv },
                        label = { Text(if (lv == 0) "Tất cả" else "HSK $lv") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = VermilionSoft,
                            selectedLabelColor = VermilionDark,
                        ),
                        border = FilterChipDefaults.filterChipBorder(
                            enabled = true,
                            selected = isSelected,
                            borderColor = if (isSelected) VermilionBorder else InkBorder,
                        ),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }

            Text("Chọn dạng bài tập", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = InkBlack)
            kinds.forEach { (id, label) ->
                val isSelected = kind == id
                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    shapeRadius = 14.dp,
                    backgroundColor = if (isSelected) VermilionSoft else PaperPure,
                    borderColor = if (isSelected) VermilionBorder else InkBorder,
                    onClick = { kind = id }
                ) {
                    Row(
                        Modifier.padding(horizontal = 14.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(label, fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium, color = if (isSelected) VermilionDark else InkBlack)
                    }
                }
            }

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf(5, 10, 15).forEach { n ->
                    FilterChip(
                        selected = count == n,
                        onClick = { count = n },
                        label = { Text("$n câu") },
                        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = VermilionSoft, selectedLabelColor = VermilionDark),
                        border = FilterChipDefaults.filterChipBorder(enabled = true, selected = count == n, borderColor = if (count == n) VermilionBorder else InkBorder),
                        shape = RoundedCornerShape(12.dp)
                    )
                }
            }

            error?.let { FeatureError(it) }
            InkPrimaryButton(text = if (loading) "Đang tạo bài tập…" else "Bắt đầu làm bài", onClick = ::start, modifier = Modifier.fillMaxWidth())
        } else {
            val total = questions.size.coerceAtLeast(1)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("CÂU ${index + 1} / $total", color = Vermilion, fontWeight = FontWeight.Bold, fontSize = 12.sp, letterSpacing = 1.sp)
                Text("Đúng $score câu", color = JadeGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
            }
            LinearProgressIndicator(
                progress = { (index + 1).toFloat() / total },
                modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
                color = Vermilion,
                trackColor = PaperMuted
            )

            q?.let { question ->
                InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 22.dp) {
                    Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text(question.optString("prompt", "Sắp xếp các từ thành câu đúng:"), fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                        question.optString("meaningVi").takeIf(String::isNotBlank)?.let {
                            Text(it, color = InkMuted, fontSize = 13.sp)
                        }

                        // Answer Box
                        Surface(
                            Modifier.fillMaxWidth(),
                            color = PaperMuted,
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, InkBorder)
                        ) {
                            Text(
                                if (picked.isEmpty()) "Chạm các từ bên dưới để ghép câu…" else picked.joinToString(" "),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = if (picked.isEmpty()) InkLight else InkBlack,
                                modifier = Modifier.padding(14.dp)
                            )
                        }

                        // Word Bank
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            tokens.forEachIndexed { i, token ->
                                Surface(
                                    modifier = Modifier.clickable {
                                        tokens = tokens.filterIndexed { idx, _ -> idx != i }
                                        picked = picked + token
                                    },
                                    color = PaperPure,
                                    shape = RoundedCornerShape(10.dp),
                                    border = BorderStroke(1.dp, InkBorder)
                                ) {
                                    Text(token, fontSize = 16.sp, modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp), color = InkBlack)
                                }
                            }
                        }

                        if (answer == null) {
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(
                                    onClick = { tokens = q.optJSONArray("tokens").strings().shuffled(); picked = emptyList() },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(12.dp),
                                    border = BorderStroke(1.dp, InkBorder)
                                ) {
                                    Text("Làm lại", color = InkMuted)
                                }
                                InkPrimaryButton(
                                    text = "Kiểm tra",
                                    onClick = {
                                        scope.launch {
                                            loading = true
                                            try {
                                                val body = JSONObject()
                                                    .put("type", question.optString("type", "order"))
                                                    .put("grammarId", question.optInt("grammarId"))
                                                    .put("answer", picked.joinToString(""))
                                                val res = api.gradeGrammar(body)
                                                answer = res
                                                if (res.optBoolean("correct")) score++
                                            } catch (e: Exception) {
                                                error = e.message
                                            }
                                            loading = false
                                        }
                                    },
                                    enabled = picked.isNotEmpty(),
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        } else {
                            val correct = answer!!.optBoolean("correct")
                            Text(
                                if (correct) "Chính xác! Bạn làm rất tốt." else "Chưa đúng. Đáp án: ${answer!!.optString("correctAnswer", "Xem giải thích")}",
                                color = if (correct) JadeGreen else Vermilion,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp
                            )
                            InkPrimaryButton(
                                text = if (index + 1 >= questions.size) "Xem tổng kết" else "Câu tiếp theo ›",
                                onClick = {
                                    if (index + 1 >= questions.size) questions = emptyList()
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
        if (loading) FeatureLoading()
        else if (words.isEmpty() && error == null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    RedSeal("藏", size = 42.dp, fontSize = 20.sp, solid = false)
                    Text("Sổ tay của bạn đang trống.", color = InkMuted, fontSize = 14.sp)
                    Text("Lưu các từ khó nhớ khi tra cứu để ôn lại sau.", color = InkLight, fontSize = 12.sp)
                }
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                items(words, key = { it.id }) { word ->
                    WordRow(word, Modifier.fillMaxWidth().clickable { selectedWord = word })
                }
            }
        }
    }
    selectedWord?.let { FeatureWordDialog(it) { selectedWord = null } }
}

@Composable
internal fun StatisticsFeature(api: ApiClient) {
    var stats by remember { mutableStateOf<Stats?>(null) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        loading = true
        try {
            stats = api.stats()
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
        if (loading) FeatureLoading()
        error?.let { FeatureError(it) }

        stats?.let { s ->
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = InkCharcoal,
                borderColor = Color.Transparent,
                shapeRadius = 24.dp,
            ) {
                Column(Modifier.padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text("TỔNG QUAN THÀNH TÍCH", color = VermilionSoft, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.3.sp)
                        RedSeal("绩", size = 26.dp, fontSize = 12.sp)
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Surface(Modifier.weight(1f), shape = RoundedCornerShape(14.dp), color = Color.White.copy(alpha = 0.12f)) {
                            Column(Modifier.padding(12.dp)) {
                                Text("Chuỗi ngày", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                                Text("${s.streak} ngày 🔥", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        Surface(Modifier.weight(1f), shape = RoundedCornerShape(14.dp), color = Color.White.copy(alpha = 0.12f)) {
                            Column(Modifier.padding(12.dp)) {
                                Text("Điểm kinh nghiệm", color = Color.White.copy(alpha = 0.7f), fontSize = 11.sp)
                                Text("${s.xp} XP ✦", color = AmberGold, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            Text("Chi tiết tiến độ học tập", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = InkBlack)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FeatureMetric("Đã học", "${s.learned}", "từ", Modifier.weight(1f))
                FeatureMetric("Đến hạn ôn", "${s.due}", "từ", Modifier.weight(1f))
            }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                FeatureMetric("Chuỗi ngày", "${s.streak}", "ngày", Modifier.weight(1f))
                FeatureMetric("Hôm nay", if (s.studiedToday) "Đã hoàn thành" else "Chưa ôn", "", Modifier.weight(1f))
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
        if (loading) FeatureLoading()
        else {
            val seals = listOf("冠", "亚", "季")
            rows.forEachIndexed { index, row ->
                val isTop3 = index < 3
                val medalBg = when (index) {
                    0 -> AmberSoft
                    1 -> PaperMuted
                    2 -> VermilionSoft
                    else -> PaperPure
                }

                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    shapeRadius = 18.dp,
                    backgroundColor = medalBg,
                    borderColor = if (index == 0) AmberGold else InkBorder,
                ) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (isTop3) {
                            RedSeal(seals[index], size = 36.dp, fontSize = 15.sp, solid = (index == 0))
                        } else {
                            Surface(
                                shape = CircleShape,
                                color = PaperMuted,
                                modifier = Modifier.size(36.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Text("${index + 1}", fontWeight = FontWeight.Bold, color = InkMuted, fontSize = 13.sp)
                                }
                            }
                        }

                        Column(Modifier.weight(1f).padding(start = 14.dp)) {
                            Text(row.optString("name", "Người học"), fontWeight = FontWeight.Bold, fontSize = 15.sp, color = InkBlack)
                            Text("Chuỗi ${row.optInt("streak")} ngày 🔥", color = InkMuted, fontSize = 12.sp)
                        }

                        Surface(
                            color = PaperPure,
                            shape = RoundedCornerShape(10.dp),
                            border = BorderStroke(1.dp, InkBorder)
                        ) {
                            Text(
                                "${row.optInt("xp")} XP",
                                color = if (index == 0) AmberGold else InkBlack,
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
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
                shapeRadius = 20.dp,
                onClick = { selected = index }
            ) {
                Row(
                    Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    RedSeal(stage.first, size = 46.dp, fontSize = 20.sp, solid = (index == 0))
                    Column(Modifier.weight(1f)) {
                        Text("CHẶNG ${index + 1} · HSK $level", color = Vermilion, fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp)
                        Text(stage.second, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = InkBlack, modifier = Modifier.padding(top = 2.dp))
                        Text(stage.third, fontSize = 12.sp, color = InkMuted, maxLines = 2, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 2.dp))
                    }
                    Text("›", color = Vermilion, fontSize = 24.sp, fontWeight = FontWeight.Bold)
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
                    RedSeal(stage.first, size = 30.dp, fontSize = 14.sp)
                    Text(stage.second, fontWeight = FontWeight.Bold, color = InkBlack)
                }
            },
            text = {
                Text("${stage.third}\n\nBạn có thể luyện từ vựng, flashcard và bài tập tương ứng ở cấp độ HSK $level.", fontSize = 14.sp, color = InkBlack)
            },
            confirmButton = {
                Button(
                    onClick = { selected = null; onPractice(level) },
                    colors = ButtonDefaults.buttonColors(containerColor = Vermilion),
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

@Composable
internal fun PracticeHubFeature(
    api: ApiClient,
    initialLevel: Int,
    activeMode: String?,
    onModeChange: (String?) -> Unit,
    onWriting: () -> Unit,
    onBoss: () -> Unit,
    onGrammar: () -> Unit,
) {
    var level by remember { mutableIntStateOf(initialLevel.coerceIn(1, 3)) }
    var count by remember { mutableIntStateOf(10) }
    var round by remember { mutableIntStateOf(0) }

    if (activeMode == null) {
        Column(
            Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Bộ tùy chọn luyện tập: Cấp độ HSK & Số câu hỏi (Responsive segmented controls - Không bao giờ bị squish chữ)
            InkCard(
                modifier = Modifier.fillMaxWidth(),
                shapeRadius = 20.dp,
                backgroundColor = PaperPure
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Cấp độ HSK
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "CẤP ĐỘ HSK",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = InkMuted,
                                letterSpacing = 0.8.sp
                            )
                            Text(
                                text = "Đang chọn HSK $level",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Brand
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            (1..3).forEach { lvl ->
                                val isSelected = level == lvl
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(40.dp)
                                        .clickable { level = lvl },
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (isSelected) BrandSoft else PaperMuted,
                                    border = BorderStroke(1.dp, if (isSelected) BrandBorder else InkBorder)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = "HSK $lvl",
                                            fontSize = 13.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                            color = if (isSelected) BrandDark else InkBlack
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Box(
                        Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(InkBorder.copy(alpha = 0.6f))
                    )

                    // Số câu hỏi mỗi lượt
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "SỐ LƯỢNG CÂU HỎI",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = InkMuted,
                                letterSpacing = 0.8.sp
                            )
                            Text(
                                text = "$count câu / lượt",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Brand
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            listOf(5, 10, 15).forEach { n ->
                                val isSelected = count == n
                                Surface(
                                    modifier = Modifier
                                        .weight(1f)
                                        .height(40.dp)
                                        .clickable { count = n },
                                    shape = RoundedCornerShape(12.dp),
                                    color = if (isSelected) BrandSoft else PaperMuted,
                                    border = BorderStroke(1.dp, if (isSelected) BrandBorder else InkBorder)
                                ) {
                                    Box(contentAlignment = Alignment.Center) {
                                        Text(
                                            text = "$n câu",
                                            fontSize = 13.sp,
                                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                            color = if (isSelected) BrandDark else InkBlack
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            val games = listOf(
                "writing" to ("Giấy luyện viết chữ Hán" to "Tự viết nét bút và thử nhận diện."),
                "boss" to ("Pinyin Boss" to "Gõ pinyin thần tốc trước khi boss trốn thoát."),
                "match" to ("Ghép từ với nghĩa" to "Luyện phản xạ nhớ mặt chữ và nghĩa."),
                "order" to ("Sắp xếp câu" to "Ghép các từ thành câu đúng ngữ pháp."),
                "cloze" to ("Điền từ còn thiếu" to "Chọn từ chuẩn xác để hoàn chỉnh câu."),
                "listen" to ("Nghe và nhận diện" to "Nghe phát âm chuẩn rồi chọn chữ Hán."),
                "dialogue" to ("Tình huống giao tiếp" to "Chọn câu đáp phù hợp với ngữ cảnh thực tế."),
                "quiz" to ("Quiz từ vựng" to "Trắc nghiệm nhanh chọn nghĩa tiếng Việt."),
                "grammar" to ("Luyện ngữ pháp" to "Sáu dạng bài tập củng cố cấu trúc câu."),
            )

            val badges = listOf("写", "拼", "配", "排", "填", "听", "话", "测", "语")

            games.forEachIndexed { index, (gameId, info) ->
                InkCard(
                    modifier = Modifier.fillMaxWidth(),
                    shapeRadius = 20.dp,
                    onClick = {
                        when (gameId) {
                            "writing" -> onWriting()
                            "boss" -> onBoss()
                            "grammar" -> onGrammar()
                            else -> onModeChange(gameId)
                        }
                    }
                ) {
                    Row(
                        Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        LevelBadge(
                            text = badges[index],
                            size = 44.dp,
                            fontSize = 19.sp,
                            solid = (index < 2)
                        )
                        Column(Modifier.weight(1f)) {
                            Text(info.first, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = InkBlack)
                            Text(info.second, color = InkMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 2.dp))
                        }
                        Text("›", color = Brand, fontSize = 24.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    } else {
        // Redundant sub-header removed: Scaffold InkTopBar handles title, subtitle & back navigation!
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

/**
 * Traditional Rice-Paper Calligraphy Grid (米字格 - Mi Zi Ge) & Ink Canvas.
 */
@Composable
internal fun WritingFeature(api: ApiClient) {
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
        Text("Dùng ngón tay viết chữ Hán vào ô kẻ 米字格 (Mễ tự cách) để nhận diện nét bút.", fontSize = 13.sp, color = InkMuted)

        // Traditional Xuan Paper Mi-Grid Box
        Box(
            Modifier
                .fillMaxWidth()
                .height(320.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(Paper)
                .border(2.dp, VermilionBorder, RoundedCornerShape(22.dp))
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
                val gridColor = Color(0xFFE2DDD4)
                val strokeDash = Stroke(width = 1.2.dp.toPx(), pathEffect = PathEffect.dashPathEffect(floatArrayOf(10f, 10f), 0f))
                val solidBorder = Stroke(width = 1.dp.toPx())

                // Inner border
                val pad = 12.dp.toPx()
                val w = size.width - pad * 2
                val h = size.height - pad * 2
                drawRect(gridColor, Offset(pad, pad), androidx.compose.ui.geometry.Size(w, h), style = solidBorder)

                // Cross lines (+)
                drawLine(gridColor, Offset(size.width / 2f, pad), Offset(size.width / 2f, size.height - pad), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)
                drawLine(gridColor, Offset(pad, size.height / 2f), Offset(size.width - pad, size.height / 2f), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)

                // Diagonal lines (X)
                drawLine(gridColor, Offset(pad, pad), Offset(size.width - pad, size.height - pad), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)
                drawLine(gridColor, Offset(size.width - pad, pad), Offset(pad, size.height - pad), strokeDash.width, strokeDash.cap, strokeDash.pathEffect)

                // Drawn Ink Strokes
                (strokes.toList() + listOfNotNull(current.takeIf { it.isNotEmpty() })).forEach { points ->
                    points.zipWithNext().forEach { (a, b) ->
                        drawLine(InkBlack, a, b, 8.5.dp.toPx(), cap = StrokeCap.Round)
                    }
                }
            }

            if (strokes.isEmpty() && current.isEmpty()) {
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    RedSeal("书", size = 44.dp, fontSize = 20.sp, solid = false)
                    Text("Viết chữ Hán tại đây", color = InkLight, fontSize = 14.sp, fontWeight = FontWeight.Medium)
                }
            }
        }

        // Action Buttons
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
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 20.dp) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Kết quả nhận diện tự động", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = InkBlack)
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
                                RedSeal(char, size = 44.dp, fontSize = 22.sp)
                                Text(char, fontSize = 26.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                            }
                            Surface(
                                color = VermilionSoft,
                                shape = RoundedCornerShape(10.dp),
                                border = BorderStroke(1.dp, VermilionBorder)
                            ) {
                                Text(
                                    "$scorePct% khớp",
                                    color = VermilionDark,
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
internal fun PinyinBossFeature(api: ApiClient, level: Int) {
    var words by remember(level) { mutableStateOf<List<Word>>(emptyList()) }
    var index by remember(level) { mutableIntStateOf(0) }
    var input by remember { mutableStateOf("") }
    var hp by remember { mutableIntStateOf(5) }
    var feedback by remember { mutableStateOf<String?>(null) }
    var complete by remember { mutableStateOf(false) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    val scope = rememberCoroutineScope()

    LaunchedEffect(level) {
        loading = true
        try {
            words = api.words(level, "").filter { it.pinyin.isNotBlank() && it.hanzi.isNotBlank() }.shuffled().take(12)
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
        if (loading) FeatureLoading()
        error?.let { FeatureError(it) }

        if (complete) {
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 24.dp) {
                Column(
                    Modifier.padding(26.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    RedSeal("胜", size = 60.dp, fontSize = 28.sp)
                    Text("Đã hạ gục Pinyin Boss!", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    Text("Bạn đã gõ chính xác toàn bộ pinyin của lượt này.", color = InkMuted, fontSize = 13.sp)
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
                        Surface(color = VermilionSoft, shape = RoundedCornerShape(8.dp), border = BorderStroke(0.8.dp, VermilionBorder)) {
                            Text("BOSS HSK $level", color = VermilionDark, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp))
                        }
                        Text("Mục tiêu ${index + 1} / ${words.size}", color = InkMuted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    }

                    // Boss HP bar
                    Column {
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("MÁU QUÁI VẬT", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Vermilion, letterSpacing = 1.sp)
                            Text("$hp / 5 ❤️", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Vermilion)
                        }
                        LinearProgressIndicator(
                            progress = { animatedHp },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp)
                                .clip(CircleShape)
                                .padding(top = 4.dp),
                            color = Vermilion,
                            trackColor = PaperMuted
                        )
                    }

                    // Target Hanzi
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

                    // Pinyin Input
                    OutlinedTextField(
                        value = input,
                        onValueChange = { input = it; feedback = null },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        shape = RoundedCornerShape(14.dp),
                        placeholder = { Text("Gõ pinyin có dấu (vd: nǐ hǎo)", fontSize = 13.sp, color = InkLight) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Vermilion,
                            unfocusedBorderColor = InkBorder,
                            focusedContainerColor = PaperPure,
                            unfocusedContainerColor = PaperPure,
                        )
                    )

                    InkPrimaryButton(
                        text = "Tấn công ⚔️",
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
                                feedback = "Chưa trúng! Kiểm tra lại thanh điệu pinyin."
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )

                    feedback?.let {
                        Text(
                            it,
                            color = if (it.startsWith("Chính xác")) JadeGreen else Vermilion,
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
                "match" -> words = api.words(level, "").filter { it.meaningVi.isNotBlank() }.take(count).shuffled()
                "order" -> questions = api.exerciseOrder(level, count).objects()
                "cloze" -> questions = api.exerciseCloze(level, count).objects()
                "listen", "quiz" -> questions = JSONArray().apply {
                    api.quiz(level, count).forEach { q ->
                        put(JSONObject().put("hanzi", q.word.hanzi).put("pinyin", q.word.pinyin).put("meaningVi", q.word.meaningVi).put("options", JSONArray(q.options.map { JSONObject().put("hanzi", it.hanzi).put("meaningVi", it.meaningVi) })))
                    }
                }.objects()
                "dialogue" -> questions = dialogueQuestions()
            }
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
    }

    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        if (loading) { FeatureLoading(); return@Column }
        error?.let { FeatureError(it); InkPrimaryButton(text = "Thử lại", onClick = onAgain); return@Column }

        if (complete || (mode == "match" && words.isNotEmpty() && matched.size == words.size)) {
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 24.dp) {
                Column(Modifier.padding(26.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    RedSeal("完", size = 56.dp, fontSize = 24.sp)
                    Text("Hoàn thành bài luyện tập!", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    Text("Đúng $score / ${if (mode == "match") words.size else questions.size} câu", color = Brand, fontSize = 18.sp, fontWeight = FontWeight.Bold)
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
                Text("${matched.size} / ${words.size} cặp", color = Brand, fontWeight = FontWeight.Bold, fontSize = 12.sp)
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
            Text("CÂU ${index + 1} / $total", color = Brand, fontWeight = FontWeight.Bold, fontSize = 11.sp, letterSpacing = 1.sp)
            Text("Đúng $score câu", color = JadeGreen, fontWeight = FontWeight.Bold, fontSize = 12.sp)
        }
        LinearProgressIndicator(
            progress = { (index + 1).toFloat() / total },
            modifier = Modifier.fillMaxWidth().height(6.dp).clip(CircleShape),
            color = Brand,
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
                        // Vùng hiển thị câu đang ghép (Target area)
                        Surface(
                            modifier = Modifier.fillMaxWidth(),
                            color = PaperMuted,
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, if (picked.isNotEmpty()) BrandBorder else InkBorder)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(14.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                if (picked.isEmpty()) {
                                    Text(
                                        text = "Chạm các từ bên dưới để ghép câu…",
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Normal,
                                        color = InkLight,
                                        modifier = Modifier.padding(vertical = 4.dp)
                                    )
                                } else {
                                    FlowRow(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                                        verticalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        picked.forEachIndexed { pIdx, token ->
                                            Surface(
                                                modifier = Modifier.clickable {
                                                    // Nhấn vào từ đã chọn để gỡ ra trả về kho từ
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
                                                    Text(
                                                        text = token,
                                                        fontSize = 18.sp,
                                                        fontWeight = FontWeight.SemiBold,
                                                        color = BrandDark
                                                    )
                                                    if (answer == null) {
                                                        Text("✕", fontSize = 10.sp, color = InkMuted)
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // Kho từ vựng có sẵn (FlowRow tự động xuống hàng thông minh)
                        if (bank.isNotEmpty() && answer == null) {
                            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = "Từ vựng có sẵn:",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = InkMuted,
                                    letterSpacing = 0.5.sp
                                )
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
                                            Text(
                                                text = token,
                                                fontSize = 18.sp,
                                                fontWeight = FontWeight.Medium,
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                                                color = InkBlack
                                            )
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
                            modifier = Modifier.fillMaxWidth().padding(vertical = 10.dp).height(48.dp),
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, BrandBorder),
                            colors = ButtonDefaults.outlinedButtonColors(containerColor = BrandSoft)
                        ) {
                            Icon(Icons.Rounded.VolumeUp, null, tint = BrandDark)
                            Spacer(Modifier.width(8.dp))
                            Text("Phát âm lại từ này", color = BrandDark, fontWeight = FontWeight.Bold)
                        }
                    }
                    "quiz" -> {
                        Text(q.optString("hanzi"), fontSize = 54.sp, fontWeight = FontWeight.Medium, textAlign = TextAlign.Center, color = InkBlack, modifier = Modifier.fillMaxWidth())
                        Text(q.optString("pinyin"), color = Brand, fontSize = 19.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
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

private fun dialogueQuestions() = listOf(
    JSONObject().put("scenario", "Lần đầu gặp bạn mới").put("prompt", "你好！很高兴认识你。").put("promptVi", "Xin chào, rất vui được gặp bạn.").put("answer", "我也很高兴认识你。").put("options", JSONArray(listOf(JSONObject().put("hanzi", "我也很高兴认识你。"), JSONObject().put("hanzi", "我不吃米饭。"), JSONObject().put("hanzi", "现在三点。")))).put("explanation", "Đây là câu đáp tự nhiên khi làm quen."),
    JSONObject().put("scenario", "Bạn nhận được lời cảm ơn").put("prompt", "谢谢你帮我！").put("promptVi", "Cảm ơn bạn đã giúp tôi!").put("answer", "不客气！").put("options", JSONArray(listOf(JSONObject().put("hanzi", "不客气！"), JSONObject().put("hanzi", "你几岁？"), JSONObject().put("hanzi", "我去学校。")))).put("explanation", "不客气 là câu đáp lịch sự cho lời cảm ơn."),
    JSONObject().put("scenario", "Gọi đồ uống tại quán").put("prompt", "你想喝什么？").put("promptVi", "Bạn muốn uống gì?").put("answer", "我想喝茶。").put("options", JSONArray(listOf(JSONObject().put("hanzi", "我想喝茶。"), JSONObject().put("hanzi", "我姓王。"), JSONObject().put("hanzi", "今天星期一。")))).put("explanation", "我想喝茶 nghĩa là tôi muốn uống trà."),
)

@Composable
internal fun FeatureWordRow(word: Word, modifier: Modifier = Modifier, onClick: () -> Unit) {
    InkCard(modifier = modifier, shapeRadius = 18.dp, onClick = onClick) {
        Row(
            Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 13.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(Modifier.width(96.dp)) {
                Text(word.hanzi, fontSize = 26.sp, fontWeight = FontWeight.Medium, color = InkBlack)
                Text(word.pinyin, color = Vermilion, fontWeight = FontWeight.Bold, fontSize = 12.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Box(Modifier.height(36.dp).width(1.dp).background(InkBorder))
            Column(Modifier.weight(1f).padding(start = 12.dp)) {
                Text(word.meaningVi.ifBlank { "Chưa có nghĩa" }, fontSize = 13.sp, fontWeight = FontWeight.Medium, color = InkBlack, maxLines = 2, overflow = TextOverflow.Ellipsis)
                Text("HSK ${word.hskLevel}", color = InkMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
            }
            Text("›", color = Vermilion, fontSize = 24.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun FeatureWordDialog(word: Word, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(word.hanzi, fontSize = 40.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                RedSeal("HSK${word.hskLevel}", size = 32.dp, fontSize = 11.sp)
            }
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(word.pinyin, color = Vermilion, fontWeight = FontWeight.Bold, fontSize = 20.sp)
                Text(word.meaningVi.ifBlank { "Chưa có nghĩa tiếng Việt." }, fontSize = 15.sp, color = InkBlack)
                word.hanviet?.let { Text("Âm Hán Việt: $it", color = InkMuted, fontSize = 13.sp) }
                Text("Cấp độ: HSK ${word.hskLevel}", color = InkMuted, fontSize = 12.sp)
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text("Đóng", color = Vermilion, fontWeight = FontWeight.Bold) }
        },
        containerColor = PaperPure,
        shape = RoundedCornerShape(22.dp)
    )
}

@Composable
private fun FeatureMetric(label: String, value: String, unit: String, modifier: Modifier = Modifier) {
    InkCard(modifier = modifier, shapeRadius = 16.dp) {
        Column(Modifier.padding(horizontal = 14.dp, vertical = 12.dp)) {
            Text(label, color = InkMuted, fontSize = 11.sp, fontWeight = FontWeight.Medium)
            Text(value, fontSize = 22.sp, fontWeight = FontWeight.Bold, color = InkBlack, modifier = Modifier.padding(top = 2.dp))
            Text(unit, color = Vermilion, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun FeatureLoading() {
    Box(Modifier.fillMaxWidth().height(120.dp), contentAlignment = Alignment.Center) {
        CircularProgressIndicator(color = Vermilion, strokeWidth = 2.5.dp)
    }
}

@Composable
private fun FeatureError(text: String) {
    Surface(
        Modifier.fillMaxWidth(),
        color = VermilionSoft,
        shape = RoundedCornerShape(14.dp),
        border = BorderStroke(1.dp, VermilionBorder)
    ) {
        Text(text, color = VermilionDark, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.padding(13.dp))
    }
}

@Composable
private fun FeatureEmpty(text: String) {
    InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 16.dp) {
        Text(text, color = InkMuted, fontSize = 13.sp, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(22.dp))
    }
}

private fun JSONArray?.objects(): List<JSONObject> = if (this == null) emptyList() else (0 until length()).mapNotNull { optJSONObject(it) }
private fun JSONArray?.strings(): List<String> = if (this == null) emptyList() else (0 until length()).map { optString(it) }
