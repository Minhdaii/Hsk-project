package com.chaina.hsk.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.ArrowBack
import androidx.compose.material.icons.outlined.Notifications
import androidx.compose.material.icons.outlined.PhotoCamera
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chaina.hsk.R
import com.chaina.hsk.data.DailyReview
import com.chaina.hsk.data.Stats
import com.chaina.hsk.ui.theme.AmberGold
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
import com.chaina.hsk.ui.theme.Paper
import com.chaina.hsk.ui.theme.PaperMuted
import com.chaina.hsk.ui.theme.PaperPure
import com.chaina.hsk.ui.theme.SealVermilion
import java.util.Calendar
import kotlin.math.ceil

/**
 * Crisp exact-size circular icon action button without Material 3 minimum-size overflow overlap.
 */
@Composable
fun CircleActionButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    size: Dp = 38.dp,
    containerColor: Color = PaperMuted,
    borderColor: Color = Color.Transparent,
    content: @Composable () -> Unit,
) {
    Surface(
        modifier = modifier
            .size(size)
            .clip(CircleShape)
            .clickable(onClick = onClick),
        shape = CircleShape,
        color = containerColor,
        border = if (borderColor == Color.Transparent) null else BorderStroke(1.dp, borderColor),
    ) {
        Box(contentAlignment = Alignment.Center) {
            content()
        }
    }
}

/**
 * Clean Badge for Level / Category / Character representation.
 */
@Composable
fun LevelBadge(
    text: String,
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    fontSize: TextUnit = 13.sp,
    solid: Boolean = false,
) {
    Surface(
        modifier = modifier.size(size),
        shape = RoundedCornerShape(12.dp),
        color = if (solid) Brand else BrandSoft,
        border = BorderStroke(1.dp, if (solid) BrandDark else BrandBorder),
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                text = text,
                color = if (solid) Color.White else BrandDark,
                fontSize = fontSize,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
fun RedSeal(
    text: String,
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    fontSize: TextUnit = 14.sp,
    solid: Boolean = false,
) {
    LevelBadge(text = text, modifier = modifier, size = size, fontSize = fontSize, solid = solid)
}

/**
 * Web-matched Bento White Card with soft border & subtle elevation.
 */
@Composable
fun InkCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    backgroundColor: Color = PaperPure,
    borderColor: Color = InkBorder.copy(alpha = 0.7f),
    borderWidth: Dp = 1.dp,
    shapeRadius: Dp = 22.dp,
    content: @Composable () -> Unit,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed && onClick != null) 0.985f else 1f,
        animationSpec = tween(120),
        label = "card-press"
    )

    Card(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .then(
                if (onClick != null) {
                    Modifier.clickable(
                        interactionSource = interactionSource,
                        indication = null,
                        onClick = onClick
                    )
                } else Modifier
            ),
        shape = RoundedCornerShape(shapeRadius),
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        border = if (borderColor == Color.Transparent) null else BorderStroke(borderWidth, borderColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp, pressedElevation = 2.dp),
    ) {
        content()
    }
}

@Composable
fun InkPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    loading: Boolean = false,
    icon: ImageVector? = null,
    backgroundColor: Color = Brand,
    contentColor: Color = Color.White,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.975f else 1f,
        animationSpec = tween(120),
        label = "btn-press"
    )

    Button(
        onClick = onClick,
        enabled = enabled && !loading,
        modifier = modifier
            .height(50.dp)
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            },
        shape = RoundedCornerShape(14.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = backgroundColor,
            contentColor = contentColor,
            disabledContainerColor = if (backgroundColor == Brand) BrandSoft else PaperMuted,
            disabledContentColor = if (backgroundColor == Brand) BrandDark.copy(alpha = 0.55f) else InkLight,
        ),
        elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp, pressedElevation = 1.dp),
        interactionSource = interactionSource,
    ) {
        if (loading) {
            ChainaStrokeLoading(
                mode = ChainaLoadingMode.COMPACT,
                background = if (contentColor == Color.White) ChainaLoadingBackground.DARK else ChainaLoadingBackground.LIGHT,
            )
        } else {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
            ) {
                if (icon != null) {
                    Icon(icon, contentDescription = null, modifier = Modifier.size(19.dp))
                    Spacer(Modifier.width(8.dp))
                }
                Text(
                    text = text,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.1.sp,
                )
            }
        }
    }
}

/**
 * Custom Lucide-style ArrowUpRight (↗) icon drawn cleanly on Canvas.
 */
@Composable
fun ArrowUpRightIcon(
    tint: Color = InkBlack,
    modifier: Modifier = Modifier.size(18.dp),
) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val stroke = (w * 0.1f).coerceAtLeast(1.6f)
        val p = w * 0.27f
        val r = w * 0.73f
        drawLine(
            color = tint,
            start = Offset(p, r),
            end = Offset(r, p),
            strokeWidth = stroke,
            cap = StrokeCap.Round,
        )
        val path = Path().apply {
            moveTo(w * 0.34f, p)
            lineTo(r, p)
            lineTo(r, h * 0.66f)
        }
        drawPath(
            path = path,
            color = tint,
            style = Stroke(width = stroke, cap = StrokeCap.Round, join = StrokeJoin.Round),
        )
    }
}

/**
 * Custom Lucide-style MessageSquarePlus speech bubble icon matching web TopBar.
 */
@Composable
fun FeedbackBubbleIcon(
    tint: Color = InkMuted,
    modifier: Modifier = Modifier.size(20.dp),
) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height
        val sw = w * 0.088f
        val bubble = Path().apply {
            moveTo(w * 0.875f, h * 0.625f)
            cubicTo(w * 0.875f, h * 0.70f, w * 0.815f, h * 0.75f, w * 0.75f, h * 0.75f)
            lineTo(w * 0.30f, h * 0.75f)
            lineTo(w * 0.125f, h * 0.90f)
            lineTo(w * 0.125f, h * 0.25f)
            cubicTo(w * 0.125f, h * 0.18f, w * 0.18f, h * 0.125f, w * 0.25f, h * 0.125f)
            lineTo(w * 0.75f, h * 0.125f)
            cubicTo(w * 0.82f, h * 0.125f, w * 0.875f, h * 0.18f, w * 0.875f, h * 0.25f)
            close()
        }
        drawPath(
            path = bubble,
            color = tint,
            style = Stroke(width = sw, cap = StrokeCap.Round, join = StrokeJoin.Round),
        )
        // Center "+" inside bubble
        drawLine(
            color = tint,
            start = Offset(w * 0.50f, h * 0.31f),
            end = Offset(w * 0.50f, h * 0.56f),
            strokeWidth = sw,
            cap = StrokeCap.Round,
        )
        drawLine(
            color = tint,
            start = Offset(w * 0.375f, h * 0.435f),
            end = Offset(w * 0.625f, h * 0.435f),
            strokeWidth = sw,
            cap = StrokeCap.Round,
        )
    }
}

/**
 * Multi-layer vector Flame SVG ported identically from web Flame.tsx
 * (never overlaps text inside the flame).
 */
@Composable
fun VectorFlameCanvas(
    active: Boolean,
    litToday: Boolean,
    modifier: Modifier = Modifier.size(width = 16.dp, height = 20.dp),
) {
    val inf = rememberInfiniteTransition(label = "flame-breathe")
    val pulse by inf.animateFloat(
        initialValue = 1f,
        targetValue = if (litToday) 1.12f else if (active) 1.05f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(1100, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "flame-pulse",
    )

    Canvas(
        modifier = modifier.graphicsLayer {
            scaleX = pulse
            scaleY = pulse
        }
    ) {
        val sx = size.width / 64f
        val sy = size.height / 80f

        val outer = Path().apply {
            moveTo(32f * sx, 2f * sy)
            cubicTo(35f * sx, 15f * sy, 52f * sx, 24f * sy, 52f * sx, 46f * sy)
            cubicTo(52f * sx, 64f * sy, 43f * sx, 76f * sy, 32f * sx, 76f * sy)
            cubicTo(21f * sx, 76f * sy, 12f * sx, 64f * sy, 12f * sx, 46f * sy)
            cubicTo(12f * sx, 36f * sy, 18f * sx, 30f * sy, 22f * sx, 22f * sy)
            cubicTo(24f * sx, 28f * sy, 27f * sx, 32f * sy, 29f * sx, 33f * sy)
            cubicTo(28f * sx, 22f * sy, 28f * sx, 11f * sy, 32f * sx, 2f * sy)
            close()
        }
        val inner = Path().apply {
            moveTo(32f * sx, 32f * sy)
            cubicTo(35f * sx, 41f * sy, 43f * sx, 47f * sy, 43f * sx, 57f * sy)
            cubicTo(43f * sx, 66f * sy, 38f * sx, 72f * sy, 32f * sx, 72f * sy)
            cubicTo(26f * sx, 72f * sy, 21f * sx, 66f * sy, 21f * sx, 57f * sy)
            cubicTo(21f * sx, 50f * sy, 27f * sx, 45f * sy, 32f * sx, 32f * sy)
            close()
        }
        val core = Path().apply {
            moveTo(32f * sx, 48f * sy)
            cubicTo(34f * sx, 53f * sy, 38f * sx, 56f * sy, 38f * sx, 62f * sy)
            cubicTo(38f * sx, 67f * sy, 35f * sx, 69f * sy, 32f * sx, 69f * sy)
            cubicTo(29f * sx, 69f * sy, 26f * sx, 67f * sy, 26f * sx, 62f * sy)
            cubicTo(26f * sx, 57f * sy, 30f * sx, 53f * sy, 32f * sx, 48f * sy)
            close()
        }

        val outerBrush = if (active) {
            Brush.verticalGradient(listOf(Color(0xFFFFA726), Color(0xFFFF5722), Color(0xFFE63946)))
        } else {
            Brush.verticalGradient(listOf(Color(0xFFD6D3D1), Color(0xFFA8A29E), Color(0xFF78716C)))
        }
        val innerBrush = if (active) {
            Brush.verticalGradient(listOf(Color(0xFFFFF176), Color(0xFFFF9800)))
        } else {
            Brush.verticalGradient(listOf(Color(0xFFE7E5E4), Color(0xFFD6D3D1)))
        }
        drawPath(outer, outerBrush)
        drawPath(inner, innerBrush)
        if (active) {
            drawPath(core, Brush.verticalGradient(listOf(Color.White, Color(0xFFFFF9C4))))
        }
    }
}

/**
 * Web-matched Streak Pill for TopBar: [Flame icon] [Number] [Green dot when studiedToday]
 */
@Composable
fun WebStreakPill(
    streakDays: Int,
    studiedToday: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val active = streakDays > 0 || studiedToday
    Surface(
        modifier = modifier
            .height(36.dp)
            .clip(CircleShape)
            .clickable(onClick = onClick),
        shape = CircleShape,
        color = if (active) FlameBg else PaperPure,
        border = BorderStroke(1.dp, if (active) FlameBorder else InkBorder),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(5.dp),
        ) {
            VectorFlameCanvas(active = active, litToday = studiedToday)
            Text(
                text = "$streakDays",
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                color = if (active) FlameOrange else InkMuted,
                maxLines = 1,
            )
            if (studiedToday) {
                Box(
                    Modifier
                        .size(6.dp)
                        .clip(CircleShape)
                        .background(EmeraldDot)
                )
            }
        }
    }
}

@Composable
fun AnimatedStreakPill(
    streakDays: Int,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(14.dp),
        color = Color.White.copy(alpha = 0.14f),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.22f)),
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 11.dp, vertical = 7.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(7.dp),
        ) {
            VectorFlameCanvas(active = streakDays > 0, litToday = streakDays > 0)
            Column {
                Text(
                    text = "$streakDays ngày",
                    color = Color.White,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.ExtraBold,
                    lineHeight = 15.sp,
                )
                Text(
                    text = "chuỗi học",
                    color = Color.White.copy(alpha = 0.75f),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 11.sp,
                )
            }
        }
    }
}

/**
 * Exact Web Mobile TopBar matching screenshot:
 * Left: Chaina calligraphy wordmark
 * Right: [Streak Pill] [Search] [Camera] [Feedback +] [Notification Bell] [Avatar Circle]
 */
@Composable
fun WebTopBar(
    userInitial: String,
    stats: Stats?,
    feedbackActive: Boolean,
    searchActive: Boolean = false,
    cameraActive: Boolean = false,
    noticesActive: Boolean = false,
    onLogoClick: () -> Unit,
    onStreakClick: () -> Unit,
    onSearchClick: () -> Unit,
    onCameraClick: () -> Unit = {},
    onFeedbackClick: () -> Unit,
    onNoticesClick: () -> Unit,
    onAvatarClick: () -> Unit,
) {
    val hasNotice = stats != null && (stats.due > 0 || (stats.atRisk && !stats.studiedToday))
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = PaperPure,
        shadowElevation = 0.dp,
    ) {
        Column(Modifier.statusBarsPadding()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(58.dp)
                    .padding(horizontal = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .clickable(onClick = onLogoClick)
                        .padding(vertical = 4.dp, horizontal = 2.dp),
                    contentAlignment = Alignment.CenterStart,
                ) {
                    Image(
                        painter = painterResource(R.drawable.chaina_wordmark),
                        contentDescription = "Chaina",
                        modifier = Modifier.width(76.dp).height(26.dp),
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(3.dp),
                ) {
                    WebStreakPill(
                        streakDays = stats?.streak ?: 0,
                        studiedToday = stats?.studiedToday == true,
                        onClick = onStreakClick,
                    )

                    CircleActionButton(
                        onClick = onSearchClick,
                        size = 34.dp,
                        containerColor = if (searchActive) BrandSoft else Color.Transparent,
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Search,
                            contentDescription = "Tìm từ vựng",
                            tint = if (searchActive) BrandDark else InkMuted,
                            modifier = Modifier.size(19.dp),
                        )
                    }

                    CircleActionButton(
                        onClick = onCameraClick,
                        size = 34.dp,
                        containerColor = if (cameraActive) BrandSoft else Color.Transparent,
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.PhotoCamera,
                            contentDescription = "Dịch Camera Trung - Việt",
                            tint = if (cameraActive) BrandDark else InkMuted,
                            modifier = Modifier.size(19.dp),
                        )
                    }

                    CircleActionButton(
                        onClick = onFeedbackClick,
                        size = 34.dp,
                        containerColor = if (feedbackActive) BrandSoft else Color.Transparent,
                    ) {
                        FeedbackBubbleIcon(
                            tint = if (feedbackActive) BrandDark else InkMuted,
                            modifier = Modifier.size(18.dp),
                        )
                    }

                    Box(modifier = Modifier.size(34.dp), contentAlignment = Alignment.Center) {
                        CircleActionButton(
                            onClick = onNoticesClick,
                            size = 34.dp,
                            containerColor = if (noticesActive) BrandSoft else Color.Transparent,
                        ) {
                            Icon(
                                imageVector = Icons.Outlined.Notifications,
                                contentDescription = "Thông báo",
                                tint = if (noticesActive) BrandDark else InkMuted,
                                modifier = Modifier.size(19.dp),
                            )
                        }
                        if (hasNotice) {
                            Box(
                                Modifier
                                    .align(Alignment.TopEnd)
                                    .padding(top = 5.dp, end = 5.dp)
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(SealVermilion)
                            )
                        }
                    }

                    Surface(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .clickable(onClick = onAvatarClick),
                        shape = CircleShape,
                        color = BrandLavender,
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(
                                text = userInitial.uppercase().take(1).ifBlank { "C" },
                                color = InkBlack,
                                fontSize = 13.5.sp,
                                fontWeight = FontWeight.ExtraBold,
                            )
                        }
                    }
                }
            }
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.7f)))
        }
    }
}

/**
 * Clean Editorial Sub-Screen TopBar with Back arrow pill + Title.
 */
@Composable
fun InkTopBar(
    title: String,
    subtitle: String? = null,
    onBack: (() -> Unit)? = null,
    actions: @Composable (RowScope.() -> Unit)? = null,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = PaperPure,
    ) {
        Column(modifier = Modifier.statusBarsPadding()) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                if (onBack != null) {
                    Surface(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .clickable(onClick = onBack),
                        shape = CircleShape,
                        color = PaperMuted,
                        border = BorderStroke(1.dp, InkBorder),
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Rounded.ArrowBack,
                                contentDescription = "Quay lại",
                                tint = InkBlack,
                                modifier = Modifier.size(18.dp),
                            )
                        }
                    }
                    Spacer(Modifier.width(10.dp))
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = title,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = InkBlack,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    if (subtitle != null) {
                        Text(
                            text = subtitle,
                            fontSize = 12.sp,
                            color = InkMuted,
                            fontWeight = FontWeight.Medium,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }

                if (actions != null) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        content = actions,
                    )
                }
            }
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder))
        }
    }
}

data class InkNavItem(
    val id: String,
    val label: String,
    val icon: ImageVector,
    val badgeCount: Int = 0,
)

/**
 * Exact Web Mobile Bottom Bar:
 * Pure white surface, 48x28 rounded lavender pill indicator (#F0EBFF), crisp icon & single-line label.
 */
@Composable
fun ModernInkBottomBar(
    items: List<InkNavItem>,
    selectedId: String,
    onSelect: (String) -> Unit,
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = PaperPure,
        shadowElevation = 6.dp,
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .navigationBarsPadding()
        ) {
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(66.dp)
                    .padding(horizontal = 4.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                items.forEach { item ->
                    val isSelected = item.id == selectedId
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null,
                                onClick = { onSelect(item.id) }
                            ),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                    ) {
                        Box(
                            modifier = Modifier
                                .width(50.dp)
                                .height(30.dp)
                                .clip(CircleShape)
                                .background(if (isSelected) BrandSoft else Color.Transparent),
                            contentAlignment = Alignment.Center,
                        ) {
                            Icon(
                                imageVector = item.icon,
                                contentDescription = item.label,
                                tint = if (isSelected) BrandDark else InkMuted,
                                modifier = Modifier.size(20.dp),
                            )
                            if (item.badgeCount > 0 && !isSelected) {
                                Box(
                                    modifier = Modifier
                                        .align(Alignment.TopEnd)
                                        .padding(top = 4.dp, end = 9.dp)
                                        .size(6.dp)
                                        .clip(CircleShape)
                                        .background(Brand)
                                )
                            }
                        }
                        Spacer(Modifier.height(3.dp))
                        Text(
                            text = item.label,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) BrandDark else InkMuted,
                            maxLines = 1,
                            softWrap = false,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }
    }
}

/**
 * Exact Web Pastel Bento ToneCard:
 * Soft 2-color pastel gradient, oversized translucent white Hanzi watermark at top-right,
 * white pill CTA chip bottom-left + white circular ↗ button bottom-right.
 */
@Composable
fun WebToneCard(
    title: String,
    text: String,
    chip: String,
    watermarkGlyph: String,
    startColor: Color,
    endColor: Color,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    compact: Boolean = false,
) {
    val interactionSource = remember { MutableInteractionSource() }
    val isPressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (isPressed) 0.985f else 1f,
        animationSpec = tween(120),
        label = "tone-press"
    )

    Box(
        modifier = modifier
            .graphicsLayer {
                scaleX = scale
                scaleY = scale
            }
            .clip(RoundedCornerShape(24.dp))
            .background(Brush.linearGradient(listOf(startColor, endColor)))
            .clickable(interactionSource = interactionSource, indication = null, onClick = onClick)
    ) {
        Text(
            text = watermarkGlyph,
            color = Color.White.copy(alpha = 0.45f),
            fontSize = if (compact) 74.sp else 112.sp,
            fontWeight = FontWeight.Black,
            lineHeight = if (compact) 74.sp else 112.sp,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .offset(x = if (compact) 4.dp else 2.dp, y = if (compact) (-10).dp else (-18).dp),
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(if (compact) 16.dp else 22.dp),
            verticalArrangement = Arrangement.spacedBy(if (compact) 14.dp else 18.dp),
        ) {
            Column(modifier = Modifier.fillMaxWidth(if (compact) 0.92f else 0.85f)) {
                Text(
                    text = title,
                    fontSize = if (compact) 16.sp else 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = InkBlack,
                    lineHeight = if (compact) 21.sp else 26.sp,
                )
                Text(
                    text = text,
                    fontSize = if (compact) 12.sp else 13.5.sp,
                    color = InkBlack.copy(alpha = 0.72f),
                    lineHeight = if (compact) 17.sp else 19.sp,
                    modifier = Modifier.padding(top = 5.dp),
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.80f),
                ) {
                    Text(
                        text = chip,
                        color = InkBlack,
                        fontSize = if (compact) 11.5.sp else 13.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(horizontal = if (compact) 11.dp else 14.dp, vertical = if (compact) 6.dp else 8.dp),
                    )
                }

                Surface(
                    modifier = Modifier.size(if (compact) 32.dp else 36.dp),
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.85f),
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        ArrowUpRightIcon(
                            tint = InkBlack,
                            modifier = Modifier.size(if (compact) 15.dp else 17.dp),
                        )
                    }
                }
            }
        }
    }
}

/**
 * Clean Segmented Pill Tab Bar for mobile sub-sections (single-line pills, no squishing).
 */
@Composable
fun SegmentedPillBar(
    items: List<String>,
    selectedIndex: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = PaperPure,
        shadowElevation = 0.dp,
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items.forEachIndexed { index, label ->
                    val selected = index == selectedIndex
                    Surface(
                        modifier = Modifier
                            .weight(1f)
                            .height(38.dp)
                            .clip(CircleShape)
                            .clickable { onSelect(index) },
                        shape = CircleShape,
                        color = if (selected) BrandSoft else PaperMuted,
                        border = BorderStroke(1.dp, if (selected) BrandBorder else Color.Transparent),
                    ) {
                        Box(contentAlignment = Alignment.Center, modifier = Modifier.padding(horizontal = 4.dp)) {
                            Text(
                                text = label,
                                fontSize = 12.sp,
                                fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                                color = if (selected) BrandDark else InkMuted,
                                maxLines = 1,
                                softWrap = false,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                    }
                }
            }
            Box(Modifier.fillMaxWidth().height(0.8.dp).background(InkBorder.copy(alpha = 0.7f)))
        }
    }
}

/**
 * Native Jetpack Compose Cubic Bezier Weekly Activity Chart matching Web WeeklyChart.tsx.
 */
@Composable
fun WebWeeklyChart(
    days: List<DailyReview>,
    goal: Int,
    modifier: Modifier = Modifier,
) {
    val safeDays = remember(days) {
        if (days.isNotEmpty()) days else List(7) { DailyReview("2026-11-0${it + 1}", 0) }
    }
    var selectedIdx by remember(safeDays) { mutableStateOf<Int?>(null) }

    val topVal = remember(safeDays) { safeDays.maxOfOrNull { it.reviews } ?: 0 }
    val stepVal = remember(topVal, goal) {
        val ceiling = maxOf(topVal, goal, 1)
        listOf(1, 2, 5, 10, 20, 25, 50, 100, 200).firstOrNull { it * 4 >= ceiling } ?: ceil(ceiling / 4f).toInt()
    }
    val maxVal = stepVal * 4f

    val weekdayNames = remember(safeDays) {
        val labels = listOf("CN", "T2", "T3", "T4", "T5", "T6", "T7")
        safeDays.map { d ->
            runCatching {
                val parts = d.date.split("-")
                val cal = Calendar.getInstance().apply {
                    set(parts[0].toInt(), parts[1].toInt() - 1, parts[2].toInt())
                }
                val dow = cal.get(Calendar.DAY_OF_WEEK) - 1
                val shortDate = "${parts[2].toInt()}/${parts[1].toInt()}"
                labels.getOrElse(dow) { "" } to shortDate
            }.getOrElse { "" to "" }
        }
    }

    Column(modifier = modifier) {
        selectedIdx?.let { idx ->
            safeDays.getOrNull(idx)?.let { d ->
                val (dayLabel, dateLabel) = weekdayNames.getOrElse(idx) { "" to "" }
                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = InkBlack,
                    modifier = Modifier.padding(bottom = 8.dp),
                ) {
                    Text(
                        text = "$dayLabel ($dateLabel): ${d.reviews} lượt ôn",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                    )
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth().height(170.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(modifier = Modifier.weight(1f).fillMaxHeight()) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height
                    val n = safeDays.size
                    // Grid lines
                    for (k in 0..4) {
                        val y = h * k / 4f
                        drawLine(
                            color = Color(0xFFE5E2EC),
                            start = Offset(0f, y),
                            end = Offset(w, y),
                            strokeWidth = 1.dp.toPx(),
                        )
                    }
                    // Goal dashed line
                    if (goal > 0) {
                        val goalY = (h - (goal / maxVal) * h).coerceIn(0f, h)
                        drawLine(
                            color = BrandDark.copy(alpha = 0.55f),
                            start = Offset(0f, goalY),
                            end = Offset(w, goalY),
                            strokeWidth = 1.2.dp.toPx(),
                            pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 10f)),
                        )
                    }

                    if (n > 0) {
                        val pts = safeDays.mapIndexed { i, d ->
                            Offset(
                                x = ((i + 0.5f) / n) * w,
                                y = (h - (d.reviews / maxVal) * h).coerceIn(4f, h),
                            )
                        }
                        val linePath = Path().apply {
                            moveTo(pts[0].x, pts[0].y)
                            for (i in 1 until pts.size) {
                                val prev = pts[i - 1]
                                val cur = pts[i]
                                val midX = (prev.x + cur.x) / 2f
                                cubicTo(midX, prev.y, midX, cur.y, cur.x, cur.y)
                            }
                        }
                        val areaPath = Path().apply {
                            addPath(linePath)
                            lineTo(pts.last().x, h)
                            lineTo(pts.first().x, h)
                            close()
                        }
                        drawPath(
                            path = areaPath,
                            brush = Brush.verticalGradient(
                                listOf(BrandLavender.copy(alpha = 0.55f), BrandLavender.copy(alpha = 0f))
                            ),
                        )
                        drawPath(
                            path = linePath,
                            color = BrandDark,
                            style = Stroke(width = 2.5.dp.toPx(), cap = StrokeCap.Round, join = StrokeJoin.Round),
                        )

                        pts.forEachIndexed { i, p ->
                            val isSel = selectedIdx == i
                            if (isSel || safeDays[i].reviews > 0) {
                                drawCircle(
                                    color = if (isSel) BrandDark else Color.White,
                                    radius = if (isSel) 5.5.dp.toPx() else 3.5.dp.toPx(),
                                    center = p,
                                )
                                drawCircle(
                                    color = if (isSel) Color.White else BrandDark,
                                    radius = if (isSel) 5.5.dp.toPx() else 3.5.dp.toPx(),
                                    center = p,
                                    style = Stroke(width = 1.8.dp.toPx()),
                                )
                            }
                        }
                    }
                }

                // Touch hitboxes per day
                Row(modifier = Modifier.fillMaxSize()) {
                    safeDays.indices.forEach { i ->
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .fillMaxHeight()
                                .clickable(
                                    interactionSource = remember { MutableInteractionSource() },
                                    indication = null,
                                ) {
                                    selectedIdx = if (selectedIdx == i) null else i
                                }
                        )
                    }
                }

                if (topVal == 0) {
                    Text(
                        text = "Chưa có lượt ôn nào 7 ngày qua",
                        color = InkMuted,
                        fontSize = 12.sp,
                        modifier = Modifier.align(Alignment.Center),
                    )
                }
            }

            Column(
                modifier = Modifier.width(30.dp).fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween,
                horizontalAlignment = Alignment.End,
            ) {
                for (k in 4 downTo 0) {
                    Text(
                        text = "${k * stepVal}",
                        fontSize = 10.sp,
                        color = InkLight,
                        fontWeight = FontWeight.Medium,
                    )
                }
            }
        }

        Spacer(Modifier.height(8.dp))

        Row(
            modifier = Modifier.fillMaxWidth().padding(end = 30.dp),
        ) {
            weekdayNames.forEachIndexed { idx, (dow, _) ->
                Box(modifier = Modifier.weight(1f), contentAlignment = Alignment.Center) {
                    Text(
                        text = dow,
                        fontSize = 11.sp,
                        fontWeight = if (selectedIdx == idx) FontWeight.Bold else FontWeight.Medium,
                        color = if (selectedIdx == idx) BrandDark else InkMuted,
                    )
                }
            }
        }
    }
}
