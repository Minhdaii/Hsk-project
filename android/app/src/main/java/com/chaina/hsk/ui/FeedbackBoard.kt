package com.chaina.hsk.ui

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.CubicBezierEasing
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.gestures.detectHorizontalDragGestures
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.Close
import androidx.compose.material.icons.rounded.Delete
import androidx.compose.material.icons.rounded.Lock
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
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
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import com.chaina.hsk.data.AdminFeedbackItem
import com.chaina.hsk.data.ApiClient
import com.chaina.hsk.data.FeedbackBoardData
import com.chaina.hsk.data.FeedbackNote
import com.chaina.hsk.data.User
import com.chaina.hsk.ui.components.ChainaLoadingMode
import com.chaina.hsk.ui.components.ChainaLoadingSize
import com.chaina.hsk.ui.components.ChainaStrokeLoading
import com.chaina.hsk.ui.components.CircleActionButton
import com.chaina.hsk.ui.components.InkCard
import com.chaina.hsk.ui.components.InkPrimaryButton
import com.chaina.hsk.ui.theme.Brand
import com.chaina.hsk.ui.theme.BrandBorder
import com.chaina.hsk.ui.theme.BrandDark
import com.chaina.hsk.ui.theme.BrandSoft
import com.chaina.hsk.ui.theme.EmeraldDot
import com.chaina.hsk.ui.theme.InkBlack
import com.chaina.hsk.ui.theme.InkBorder
import com.chaina.hsk.ui.theme.InkBorderDark
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
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

private data class NotePalette(val bg: Color, val border: Color, val accent: Color)

private val NOTE_PALETTES = mapOf(
    "yellow" to NotePalette(Color(0xFFFAF7EA), Color(0xFFEFEAD4), Color(0xFF5A5344)),
    "pink" to NotePalette(Color(0xFFFAF0F2), Color(0xFFEEDCE0), Color(0xFF634851)),
    "blue" to NotePalette(Color(0xFFEEF4FA), Color(0xFFD9E5F2), Color(0xFF3E5266)),
    "green" to NotePalette(Color(0xFFEFF6F1), Color(0xFFDAEADC), Color(0xFF3E5A49)),
    "purple" to NotePalette(Color(0xFFF4F0FA), Color(0xFFE4DDF3), Color(0xFF4F4668)),
    "orange" to NotePalette(Color(0xFFFAF3EC), Color(0xFFEFE0D1), Color(0xFF664F3C)),
)

private val COLOR_SWATCHES = listOf(
    "yellow" to Color(0xFFFAF7EA),
    "pink" to Color(0xFFFAF0F2),
    "blue" to Color(0xFFEEF4FA),
    "green" to Color(0xFFEFF6F1),
    "purple" to Color(0xFFF4F0FA),
    "orange" to Color(0xFFFAF3EC),
)

private val CATEGORIES = listOf(
    "all" to "Tất cả",
    "suggestion" to "Tính năng",
    "bug" to "Báo lỗi",
    "content" to "Nội dung",
    "compliment" to "Lời nhắn",
)

private fun categoryTitle(cat: String): String = when (cat) {
    "suggestion" -> "TÍNH NĂNG"
    "bug" -> "BÁO LỖI"
    "content" -> "NỘI DUNG"
    "compliment" -> "LỜI NHẮN"
    else -> "GÓP Ý"
}

private fun formatShortDate(iso: String): String {
    if (iso.length < 10) return "Mới"
    return "${iso.substring(8, 10)}-${iso.substring(5, 7)}"
}

@Composable
internal fun FeedbackBoardScreen(
    api: ApiClient,
    user: User,
) {
    val scope = rememberCoroutineScope()
    var board by remember { mutableStateOf(FeedbackBoardData(0, emptyMap(), emptyList())) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var activeCategory by remember { mutableStateOf("all") }
    var viewMode by remember { mutableStateOf("board") } // "board" or "grid"
    var newlyPinnedId by remember { mutableStateOf<Int?>(null) }

    var showDraft by remember { mutableStateOf(false) }
    var showAdmin by remember { mutableStateOf(false) }
    var activeNote by remember { mutableStateOf<FeedbackNote?>(null) }
    var reloadKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(reloadKey) {
        loading = true
        error = null
        try {
            board = api.feedbackBoard()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Exception) {
            error = e.message ?: "Không tải được dữ liệu góp ý."
        }
        loading = false
    }

    val filtered = remember(board.items, activeCategory) {
        if (activeCategory == "all") board.items
        else board.items.filter { it.category == activeCategory }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        // Architectural header badge
        Surface(
            shape = CircleShape,
            color = PaperMuted,
            border = BorderStroke(1.dp, InkBorder),
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 5.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                Box(Modifier.size(7.dp).clip(CircleShape).background(EmeraldDot))
                Text(
                    text = "HÒM THƯ Ý KIẾN & ĐÓNG GÓP",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.8.sp,
                    color = InkMuted,
                )
            }
        }

        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                text = "Khung ghi chú góp ý",
                fontSize = 24.sp,
                fontWeight = FontWeight.ExtraBold,
                color = InkBlack,
                letterSpacing = (-0.5).sp,
            )
            Text(
                text = "Chia sẻ ý kiến tính năng, báo lỗi hoặc lời nhắn. Nội dung được bảo mật kín — chỉ bạn và quản trị viên mới đọc được.",
                fontSize = 13.sp,
                color = InkMuted,
                lineHeight = 19.sp,
            )
        }

        // Toolbar card: count + action buttons + view toggle
        InkCard(
            modifier = Modifier.fillMaxWidth(),
            shapeRadius = 20.dp,
            backgroundColor = PaperPure,
        ) {
            Column(
                modifier = Modifier.padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.Bottom,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Text(
                                text = "${board.totalCount}",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = InkBlack,
                            )
                            Text(
                                text = "ghi chú trên khung",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = InkMuted,
                                modifier = Modifier.padding(bottom = 3.dp),
                            )
                        }
                        Text(
                            text = "Nội dung được bảo mật riêng tư",
                            fontSize = 11.sp,
                            color = InkLight,
                        )
                    }

                    Button(
                        onClick = { showDraft = true },
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = InkBlack,
                            contentColor = Color.White,
                        ),
                        contentPadding = PaddingValues(horizontal = 14.dp, vertical = 10.dp),
                    ) {
                        Icon(Icons.Rounded.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(Modifier.width(5.dp))
                        Text("Dán ghi chú", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }

                HorizontalDivider(color = InkBorder.copy(alpha = 0.7f))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    // Toggle Khung dán vs Danh sách
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = PaperMuted,
                        border = BorderStroke(1.dp, InkBorder),
                    ) {
                        Row(Modifier.padding(3.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            listOf("board" to "Khung dán", "grid" to "Danh sách").forEach { (id, label) ->
                                val selected = viewMode == id
                                Surface(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(9.dp))
                                        .clickable { viewMode = id },
                                    shape = RoundedCornerShape(9.dp),
                                    color = if (selected) PaperPure else Color.Transparent,
                                    shadowElevation = if (selected) 1.dp else 0.dp,
                                ) {
                                    Text(
                                        text = label,
                                        fontSize = 12.sp,
                                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                                        color = if (selected) InkBlack else InkMuted,
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                    )
                                }
                            }
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp), verticalAlignment = Alignment.CenterVertically) {
                        if (user.isAdmin) {
                            Surface(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .clickable { showAdmin = true },
                                shape = RoundedCornerShape(10.dp),
                                color = BrandSoft,
                                border = BorderStroke(1.dp, BrandBorder),
                            ) {
                                Text(
                                    text = "Quản trị (${board.totalCount})",
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandDark,
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp),
                                )
                            }
                        }
                        Surface(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .clickable { reloadKey++ },
                            shape = CircleShape,
                            color = PaperMuted,
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(Icons.Rounded.Refresh, contentDescription = "Tải lại", tint = InkMuted, modifier = Modifier.size(16.dp))
                            }
                        }
                    }
                }
            }
        }

        // Category filters
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .horizontalScroll(rememberScrollState()),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            CATEGORIES.forEach { (id, label) ->
                val count = if (id == "all") board.totalCount else (board.categoryCounts[id] ?: 0)
                val selected = activeCategory == id
                Surface(
                    modifier = Modifier
                        .clip(CircleShape)
                        .clickable { activeCategory = id },
                    shape = CircleShape,
                    color = if (selected) InkBlack else PaperPure,
                    border = BorderStroke(1.dp, if (selected) InkBlack else InkBorder),
                ) {
                    Text(
                        text = "$label ($count)",
                        fontSize = 12.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                        color = if (selected) Color.White else InkMuted,
                        maxLines = 1,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                    )
                }
            }
        }

        if (loading) {
            Box(Modifier.fillMaxWidth().height(240.dp), contentAlignment = Alignment.Center) {
                ChainaStrokeLoading(
                    mode = ChainaLoadingMode.INLINE,
                    size = ChainaLoadingSize.MD,
                    message = "Đang tải khung góp ý…",
                )
            }
        } else if (error != null) {
            InkCard(modifier = Modifier.fillMaxWidth(), backgroundColor = RedSoft, borderColor = RedBorder) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Không tải được khung góp ý", fontWeight = FontWeight.Bold, fontSize = 14.sp, color = RedBad)
                    Text(error!!, fontSize = 12.sp, color = InkBlack)
                    OutlinedButton(onClick = { reloadKey++ }, shape = CircleShape) {
                        Text("Thử lại", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else if (filtered.isEmpty()) {
            ArchitecturalFrameBox {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 56.dp, horizontal = 20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Text(
                        text = "Chưa có ghi chú nào trong mục này",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkBlack,
                    )
                    Text(
                        text = "Hãy là người đầu tiên dán ghi chú góp ý lên khung để chia sẻ ý tưởng với đội ngũ phát triển.",
                        fontSize = 12.5.sp,
                        color = InkMuted,
                        textAlign = TextAlign.Center,
                    )
                    Spacer(Modifier.height(4.dp))
                    Button(
                        onClick = { showDraft = true },
                        shape = CircleShape,
                        colors = ButtonDefaults.buttonColors(containerColor = InkBlack),
                    ) {
                        Text("Dán ghi chú đầu tiên", fontSize = 12.5.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        } else if (viewMode == "board") {
            // Architectural dot-grid Khung dán canvas
            ArchitecturalFrameBox {
                Column(Modifier.fillMaxWidth()) {
                    // Header inside architectural frame
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFFAF9F6).copy(alpha = 0.92f))
                            .padding(horizontal = 14.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Box(Modifier.size(6.dp).clip(RoundedCornerShape(2.dp)).background(InkBlack.copy(alpha = 0.7f)))
                            Text(
                                text = "KHÔNG GIAN LƯU TRỮ Ý KIẾN",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 0.8.sp,
                                color = InkMuted,
                            )
                        }
                        Text(
                            text = "Vuốt nhẹ giấy · chạm để mở",
                            fontSize = 10.5.sp,
                            color = InkLight,
                        )
                    }
                    HorizontalDivider(color = InkBorder.copy(alpha = 0.6f))

                    // Canvas with safe note layout (supports many notes cleanly on mobile scroll)
                    val notesToShow = filtered.take(36)
                    val rowHeight = 165.dp
                    val canvasHeight = (rowHeight * ((notesToShow.size + 1) / 2) + 48.dp).coerceAtLeast(420.dp)

                    BoxWithConstraints(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(canvasHeight)
                            .padding(14.dp)
                    ) {
                        val wPx = with(LocalDensity.current) { maxWidth.toPx() }
                        val noteWidth = (maxWidth * 0.47f).coerceIn(145.dp, 185.dp)
                        val noteWidthPx = with(LocalDensity.current) { noteWidth.toPx() }

                        notesToShow.forEachIndexed { idx, note ->
                            val col = idx % 2
                            val row = idx / 2
                            // Blend subtle randomness from backend posX with readable mobile grid slots
                            val jitterX = ((note.posX - 50f) / 50f) * 14f
                            val slotX = if (col == 0) 0f else (wPx - noteWidthPx).coerceAtLeast(0f)
                            val xPx = (slotX + jitterX).coerceIn(0f, (wPx - noteWidthPx).coerceAtLeast(0f))
                            val yDp = (row * 165f + ((note.posY % 14f) - 7f)).coerceAtLeast(4f).dp
                            val yPx = with(LocalDensity.current) { yDp.toPx() }

                            Box(
                                modifier = Modifier
                                    .offset { IntOffset(xPx.roundToInt(), yPx.roundToInt()) }
                                    .width(noteWidth)
                                    .zIndex(if (note.id == newlyPinnedId) 20f else (notesToShow.size - idx).toFloat())
                            ) {
                                MobileStickyNoteCard(
                                    note = note,
                                    isAdmin = user.isAdmin,
                                    isNewlyPinned = note.id == newlyPinnedId,
                                    animatePhysics = true,
                                    onClick = { activeNote = note },
                                )
                            }
                        }
                    }
                }
            }
        } else {
            // Grid / List mode: crisp 2-column or stacked cards
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                filtered.chunked(2).forEach { pair ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                    ) {
                        pair.forEach { note ->
                            Box(Modifier.weight(1f)) {
                                MobileStickyNoteCard(
                                    note = note,
                                    isAdmin = user.isAdmin,
                                    isNewlyPinned = note.id == newlyPinnedId,
                                    animatePhysics = true,
                                    onClick = { activeNote = note },
                                )
                            }
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }

        Spacer(Modifier.height(14.dp))
    }

    // Static Note Detail Dialog (disableAnimation matches web behavior)
    activeNote?.let { note ->
        val canRead = note.isMine || user.isAdmin
        AlertDialog(
            onDismissRequest = { activeNote = null },
            containerColor = PaperPure,
            shape = RoundedCornerShape(24.dp),
            title = {
                Text("Ghi chú #${note.id}", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = InkBlack)
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(14.dp)) {
                    // Completely static note preview inside dialog
                    MobileStickyNoteCard(
                        note = note,
                        isAdmin = user.isAdmin,
                        isNewlyPinned = false,
                        animatePhysics = false,
                        onClick = {},
                    )
                    Surface(
                        shape = RoundedCornerShape(14.dp),
                        color = PaperMuted,
                        border = BorderStroke(1.dp, InkBorder),
                    ) {
                        Text(
                            text = if (canRead) {
                                "Trạng thái: ${when (note.status) { "resolved" -> "Đã xử lý xong"; "reviewed" -> "Đội ngũ đã xem"; else -> "Đang chờ tiếp nhận" }}"
                            } else {
                                "Nội dung được bảo mật: Để bảo vệ quyền riêng tư, chỉ người gửi và quản trị viên mới có thể đọc."
                            },
                            fontSize = 12.sp,
                            color = InkMuted,
                            lineHeight = 17.sp,
                            modifier = Modifier.padding(12.dp),
                        )
                    }
                }
            },
            confirmButton = {
                OutlinedButton(onClick = { activeNote = null }, shape = RoundedCornerShape(12.dp)) {
                    Text("Đóng", color = InkBlack, fontWeight = FontWeight.Bold)
                }
            },
        )
    }

    if (showDraft) {
        FeedbackDraftDialog(
            api = api,
            defaultName = user.fullName ?: user.username,
            onDismiss = { showDraft = false },
            onPinned = { newNote ->
                showDraft = false
                newlyPinnedId = newNote.id
                board = board.copy(
                    totalCount = board.totalCount + 1,
                    categoryCounts = board.categoryCounts.toMutableMap().apply {
                        put(newNote.category, (get(newNote.category) ?: 0) + 1)
                    },
                    items = listOf(newNote) + board.items,
                )
            },
        )
    }

    if (showAdmin && user.isAdmin) {
        FeedbackAdminDialog(
            api = api,
            onDismiss = {
                showAdmin = false
                reloadKey++
            },
        )
    }
}

@Composable
private fun ArchitecturalFrameBox(content: @Composable () -> Unit) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(24.dp),
        color = Color(0xFFFAF9F6),
        border = BorderStroke(1.dp, InkBorderDark),
        shadowElevation = 1.dp,
    ) {
        Box(Modifier.fillMaxWidth()) {
            // Subtle architectural dot grid
            Canvas(Modifier.matchParentSize()) {
                val step = 22.dp.toPx()
                val radius = 1.dp.toPx()
                var x = step / 2f
                while (x < size.width) {
                    var y = step / 2f
                    while (y < size.height) {
                        drawCircle(Color(0xFFDAD6CC), radius = radius, center = Offset(x, y))
                        y += step
                    }
                    x += step
                }
            }
            content()
        }
    }
}

/**
 * Sticky Note card with translucent top tape, peel-and-stick drop entrance animation,
 * and unidirectional breeze sway animation on horizontal drag/swipe (completely static when animatePhysics=false).
 */
@Composable
private fun MobileStickyNoteCard(
    note: FeedbackNote,
    isAdmin: Boolean,
    isNewlyPinned: Boolean,
    animatePhysics: Boolean,
    onClick: () -> Unit,
) {
    val palette = NOTE_PALETTES[note.color] ?: NOTE_PALETTES["yellow"]!!
    val canRead = (note.isMine || isAdmin) && !note.content.isNullOrBlank()
    val scope = rememberCoroutineScope()

    // Peel-and-stick entrance animation when newly pinned
    val stickProgress = remember(note.id, isNewlyPinned) {
        Animatable(if (isNewlyPinned && animatePhysics) 0f else 1f)
    }
    LaunchedEffect(note.id, isNewlyPinned) {
        if (isNewlyPinned && animatePhysics) {
            stickProgress.snapTo(0f)
            stickProgress.animateTo(
                1f,
                animationSpec = tween(720, easing = CubicBezierEasing(0.22f, 1f, 0.36f, 1f)),
            )
        }
    }

    // Unidirectional breeze sway animation driven by horizontal swipe direction
    val windProgress = remember { Animatable(0f) }
    var windDirection by remember { mutableIntStateOf(1) }

    val baseRot = if (animatePhysics) note.rotation else (note.rotation * 0.4f)
    val tStick = stickProgress.value
    val stickScale = 1f + (1f - tStick) * 0.22f
    val stickY = -(1f - tStick) * 70f
    val stickRotX = (1f - tStick) * 18f

    val w = windProgress.value
    // Unidirectional breeze wave peaking at 0.32 and easing gently back to 0 without reverse bounce
    val wave = if (w <= 0f) 0f else kotlin.math.sin(w * kotlin.math.PI).toFloat()
    val windRotZ = if (animatePhysics) wave * windDirection * 7.5f else 0f
    val windRotY = if (animatePhysics) wave * windDirection * 13f else 0f
    val windRotX = if (animatePhysics) wave * 6f else 0f

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer {
                transformOrigin = TransformOrigin(0.5f, 0f)
                cameraDistance = 12f * density
                rotationZ = baseRot + windRotZ
                rotationY = windRotY
                rotationX = stickRotX + windRotX
                scaleX = stickScale
                scaleY = stickScale
                translationY = stickY
                alpha = 0.25f + tStick * 0.75f
            }
            .then(
                if (animatePhysics) {
                    Modifier.pointerInput(note.id) {
                        detectHorizontalDragGestures { _, dragAmount ->
                            if (kotlin.math.abs(dragAmount) > 4f && !windProgress.isRunning) {
                                windDirection = if (dragAmount >= 0f) 1 else -1
                                scope.launch {
                                    windProgress.snapTo(0f)
                                    windProgress.animateTo(
                                        1f,
                                        animationSpec = tween(820, easing = CubicBezierEasing(0.22f, 0.85f, 0.36f, 1f)),
                                    )
                                    windProgress.snapTo(0f)
                                }
                            }
                        }
                    }
                } else Modifier
            )
    ) {
        // Translucent masking tape at top center
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .offset(y = (-6).dp)
                .width(38.dp)
                .height(12.dp)
                .zIndex(2f)
                .clip(RoundedCornerShape(2.dp))
                .background(Color(0xFFE7E4DC).copy(alpha = 0.85f))
                .border(0.5.dp, Color(0xFFD5D0C5), RoundedCornerShape(2.dp))
        )

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clickable(onClick = onClick),
            shape = RoundedCornerShape(
                topStart = 4.dp,
                topEnd = 4.dp,
                bottomStart = 6.dp,
                bottomEnd = if (animatePhysics && wave > 0.15f && windDirection > 0) 20.dp else 6.dp,
            ),
            color = palette.bg,
            border = BorderStroke(1.dp, palette.border),
            shadowElevation = if (wave > 0.1f) 5.dp else 2.dp,
        ) {
            Column(
                modifier = Modifier.padding(13.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = categoryTitle(note.category),
                        fontSize = 9.5.sp,
                        fontWeight = FontWeight.ExtraBold,
                        letterSpacing = 0.6.sp,
                        color = palette.accent,
                    )
                    Text(
                        text = formatShortDate(note.createdAt),
                        fontSize = 10.sp,
                        color = InkLight,
                    )
                }

                HorizontalDivider(color = palette.border.copy(alpha = 0.8f))

                if (canRead) {
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        if (note.isMine) {
                            Surface(
                                shape = CircleShape,
                                color = Color.White.copy(alpha = 0.7f),
                            ) {
                                Text(
                                    text = "Của bạn",
                                    fontSize = 9.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandDark,
                                    modifier = Modifier.padding(horizontal = 7.dp, vertical = 2.dp),
                                )
                            }
                        }
                        Text(
                            text = note.content.orEmpty(),
                            fontSize = 12.5.sp,
                            color = InkBlack,
                            lineHeight = 18.sp,
                            maxLines = if (animatePhysics) 4 else 12,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                } else {
                    // Sealed privacy mask lines + badge
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Column(
                            modifier = Modifier.fillMaxWidth(),
                            verticalArrangement = Arrangement.spacedBy(7.dp),
                        ) {
                            Box(Modifier.fillMaxWidth().height(7.dp).clip(CircleShape).background(palette.border.copy(alpha = 0.85f)))
                            Box(Modifier.fillMaxWidth(0.82f).height(7.dp).clip(CircleShape).background(palette.border.copy(alpha = 0.7f)))
                            Box(Modifier.fillMaxWidth(0.68f).height(7.dp).clip(CircleShape).background(palette.border.copy(alpha = 0.55f)))
                        }
                        Surface(
                            shape = CircleShape,
                            color = Color.White.copy(alpha = 0.92f),
                            border = BorderStroke(1.dp, palette.border),
                            shadowElevation = 1.dp,
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 9.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                            ) {
                                Icon(Icons.Rounded.Lock, contentDescription = null, tint = palette.accent, modifier = Modifier.size(11.dp))
                                Text(
                                    text = "Nội dung bảo mật",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = palette.accent,
                                )
                            }
                        }
                    }
                }

                HorizontalDivider(color = palette.border.copy(alpha = 0.7f))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = note.author,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = InkMuted,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f),
                    )
                    if (note.status == "resolved") {
                        Surface(shape = CircleShape, color = JadeSoft) {
                            Text("Đã xử lý", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = JadeGreen, modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FeedbackDraftDialog(
    api: ApiClient,
    defaultName: String,
    onDismiss: () -> Unit,
    onPinned: (FeedbackNote) -> Unit,
) {
    val scope = rememberCoroutineScope()
    var category by remember { mutableStateOf("suggestion") }
    var color by remember { mutableStateOf("yellow") }
    var name by remember { mutableStateOf(defaultName) }
    var content by remember { mutableStateOf("") }
    var busy by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }

    AlertDialog(
        onDismissRequest = { if (!busy) onDismiss() },
        containerColor = PaperPure,
        shape = RoundedCornerShape(24.dp),
        title = {
            Column {
                Text("Dán ghi chú góp ý mới", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = InkBlack)
                Text("Ghi chú sẽ dán trực tiếp lên khung", fontSize = 12.sp, color = InkMuted)
            }
        },
        text = {
            Column(
                modifier = Modifier.verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                Text("1. DANH MỤC", fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = InkMuted, letterSpacing = 0.7.sp)
                Row(
                    modifier = Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    CATEGORIES.drop(1).forEach { (id, label) ->
                        val selected = category == id
                        Surface(
                            modifier = Modifier.clip(RoundedCornerShape(10.dp)).clickable { category = id },
                            shape = RoundedCornerShape(10.dp),
                            color = if (selected) BrandSoft else PaperMuted,
                            border = BorderStroke(1.dp, if (selected) BrandBorder else InkBorder),
                        ) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                                color = if (selected) BrandDark else InkBlack,
                                modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp),
                            )
                        }
                    }
                }

                Text("2. MÀU GIẤY NHỚ", fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = InkMuted, letterSpacing = 0.7.sp)
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    COLOR_SWATCHES.forEach { (id, swatch) ->
                        val selected = color == id
                        Surface(
                            modifier = Modifier.size(30.dp).clip(CircleShape).clickable { color = id },
                            shape = CircleShape,
                            color = swatch,
                            border = BorderStroke(if (selected) 2.dp else 1.dp, if (selected) BrandDark else InkBorderDark),
                        ) {
                            if (selected) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(Icons.Rounded.Check, contentDescription = null, tint = BrandDark, modifier = Modifier.size(16.dp))
                                }
                            }
                        }
                    }
                }

                Text("3. TÊN HIỂN THỊ (TÙY CHỌN)", fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = InkMuted, letterSpacing = 0.7.sp)
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    singleLine = true,
                    placeholder = { Text("Để trống nếu muốn ẩn danh", fontSize = 13.sp, color = InkLight) },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = Brand, unfocusedBorderColor = InkBorder),
                )

                Text("4. NỘI DUNG GÓP Ý BÍ MẬT", fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = InkMuted, letterSpacing = 0.7.sp)
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it.take(1500) },
                    placeholder = { Text("Chia sẻ ý kiến tính năng, báo lỗi hoặc lời nhắn…", fontSize = 13.sp, color = InkLight) },
                    modifier = Modifier.fillMaxWidth().height(120.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = Brand,
                        unfocusedBorderColor = InkBorder,
                        focusedContainerColor = (NOTE_PALETTES[color]?.bg ?: PaperPure).copy(alpha = 0.55f),
                        unfocusedContainerColor = (NOTE_PALETTES[color]?.bg ?: PaperPure).copy(alpha = 0.55f),
                    ),
                )

                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = PaperMuted,
                    border = BorderStroke(1.dp, InkBorder),
                ) {
                    Text(
                        text = "Cam kết bảo mật: Người khác chỉ thấy ghi chú đã dán ở trạng thái niêm phong, không thể đọc nội dung.",
                        fontSize = 11.5.sp,
                        color = InkMuted,
                        lineHeight = 16.sp,
                        modifier = Modifier.padding(10.dp),
                    )
                }

                error?.let {
                    Text(it, fontSize = 12.sp, color = RedBad, fontWeight = FontWeight.Medium)
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val trimmed = content.trim()
                    if (trimmed.length < 5) {
                        error = "Nội dung góp ý cần tối thiểu 5 ký tự."
                        return@Button
                    }
                    busy = true
                    error = null
                    scope.launch {
                        try {
                            val created = api.createFeedback(
                                category = category,
                                content = trimmed,
                                name = name.trim().takeIf { it.isNotBlank() },
                                color = color,
                                pinType = "tape",
                            )
                            onPinned(created)
                        } catch (e: CancellationException) {
                            throw e
                        } catch (e: Exception) {
                            error = e.message ?: "Không gửi được góp ý."
                        }
                        busy = false
                    }
                },
                enabled = !busy && content.isNotBlank(),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Brand),
            ) {
                Text(if (busy) "Đang dán…" else "Dán lên khung", fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = { if (!busy) onDismiss() }) {
                Text("Hủy", color = InkMuted)
            }
        },
    )
}

@Composable
private fun FeedbackAdminDialog(
    api: ApiClient,
    onDismiss: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var items by remember { mutableStateOf<List<AdminFeedbackItem>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var filterStatus by remember { mutableStateOf("") }

    fun load() {
        scope.launch {
            loading = true
            error = null
            try {
                items = api.adminFeedback(status = filterStatus)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                error = e.message ?: "Không tải được danh sách quản trị."
            }
            loading = false
        }
    }

    LaunchedEffect(filterStatus) { load() }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = PaperPure,
        shape = RoundedCornerShape(24.dp),
        title = {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("Quản trị góp ý", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = InkBlack)
                CircleActionButton(
                    onClick = onDismiss,
                    size = 32.dp,
                    containerColor = PaperMuted,
                ) {
                    Icon(Icons.Rounded.Close, contentDescription = "Đóng", tint = InkMuted, modifier = Modifier.size(16.dp))
                }
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .heightIn(max = 440.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(10.dp),
            ) {
                Row(Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("" to "Tất cả", "pending" to "Chờ duyệt", "reviewed" to "Đã xem", "resolved" to "Đã xong").forEach { (st, lb) ->
                        val sel = filterStatus == st
                        Surface(
                            modifier = Modifier.clip(CircleShape).clickable { filterStatus = st },
                            shape = CircleShape,
                            color = if (sel) BrandSoft else PaperMuted,
                            border = BorderStroke(1.dp, if (sel) BrandBorder else InkBorder),
                        ) {
                            Text(lb, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = if (sel) BrandDark else InkMuted, modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp))
                        }
                    }
                }

                if (loading) {
                    ChainaStrokeLoading(
                        mode = ChainaLoadingMode.INLINE,
                        size = ChainaLoadingSize.SM,
                        message = "Đang tải danh sách góp ý…",
                    )
                } else if (error != null) {
                    Text(error!!, color = RedBad, fontSize = 12.sp)
                } else if (items.isEmpty()) {
                    Text("Không có góp ý nào trong mục này.", color = InkMuted, fontSize = 13.sp)
                } else {
                    items.forEach { item ->
                        Surface(
                            shape = RoundedCornerShape(14.dp),
                            color = Paper,
                            border = BorderStroke(1.dp, InkBorder),
                        ) {
                            Column(Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                                    Text("${categoryTitle(item.category)} · ${item.authorLabel}", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = BrandDark)
                                    CircleActionButton(
                                        onClick = {
                                            scope.launch {
                                                runCatching { api.deleteAdminFeedback(item.id) }
                                                load()
                                            }
                                        },
                                        size = 28.dp,
                                        containerColor = RedSoft,
                                    ) {
                                        Icon(Icons.Rounded.Delete, contentDescription = "Xóa", tint = RedBad, modifier = Modifier.size(15.dp))
                                    }
                                }
                                Text(item.content, fontSize = 13.sp, color = InkBlack)
                                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    listOf("pending" to "Chờ", "reviewed" to "Đã xem", "resolved" to "Xong").forEach { (st, lb) ->
                                        val isCur = item.status == st
                                        Surface(
                                            modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable {
                                                scope.launch {
                                                    runCatching { api.updateAdminFeedback(item.id, st, item.adminNote) }
                                                    load()
                                                }
                                            },
                                            shape = RoundedCornerShape(8.dp),
                                            color = if (isCur) JadeSoft else PaperPure,
                                            border = BorderStroke(1.dp, if (isCur) JadeBorder else InkBorder),
                                        ) {
                                            Text(lb, fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = if (isCur) JadeGreen else InkMuted, modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Đóng", fontWeight = FontWeight.Bold, color = BrandDark)
            }
        },
    )
}
