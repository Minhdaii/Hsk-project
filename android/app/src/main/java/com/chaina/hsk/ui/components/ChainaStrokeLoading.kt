package com.chaina.hsk.ui.components

import android.graphics.Paint as NativePaint
import android.graphics.Typeface
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawing
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathMeasure
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.graphics.vector.PathParser
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.chaina.hsk.ui.theme.InkBlack
import com.chaina.hsk.ui.theme.InkBorder
import com.chaina.hsk.ui.theme.InkMuted
import com.chaina.hsk.ui.theme.Paper
import com.chaina.hsk.ui.theme.PaperPure
import com.chaina.hsk.ui.theme.RedBad
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlin.math.max
import kotlin.math.min
import kotlin.math.pow

enum class ChainaLoadingMode {
    FULL_SCREEN,
    INLINE,
    COMPACT,
    PAGE,
    OVERLAY,
}

enum class ChainaLoadingState {
    LOADING,
    SUCCESS,
    ERROR,
}

enum class ChainaLoadingBackground {
    PAPER,
    LIGHT,
    DARK,
    TRANSPARENT,
}

enum class ChainaLoadingSize {
    XS,
    SM,
    MD,
    LG,
    XL,
}

private data class StrokeSpec(
    val id: String,
    val d: String,
    val width: Float,
    val startPct: Float,
    val endPct: Float,
    val isRedDot: Boolean = false,
    val isHsk: Boolean = false,
    val isSignature: Boolean = false,
)

private data class HanziStrokeSpec(
    val d: String,
    val width: Float,
    val dx: Float = 0f,
)

private data class SubContour(
    val path: Path,
    val measure: PathMeasure,
    val length: Float,
)

private data class CompiledBrandStroke(
    val spec: StrokeSpec,
    val contours: List<SubContour>,
    val totalLength: Float,
    val firstPoint: Offset,
)

private data class CompiledHanziStroke(
    val contours: List<SubContour>,
    val totalLength: Float,
    val width: Float,
    val dx: Float,
    val startPct: Float,
    val endPct: Float,
)

private val HANZI_WATERMARK_SPECS = listOf(
    // Character 汉 (Hán - 5 strokes)
    HanziStrokeSpec("M 28 36 C 35 41 42 47 46 53", 5.5f),
    HanziStrokeSpec("M 20 68 C 28 73 35 79 39 85", 5.5f),
    HanziStrokeSpec("M 22 128 C 29 116 38 100 46 86", 5.5f),
    HanziStrokeSpec("M 58 46 L 108 42 C 102 78 84 108 52 130", 6.0f),
    HanziStrokeSpec("M 62 60 C 78 82 98 110 124 130", 6.0f),
    // Character 语 (Ngữ - 9 strokes, dx = 115)
    HanziStrokeSpec("M 24 32 C 30 37 35 43 38 49", 5.0f, 115f),
    HanziStrokeSpec("M 12 64 L 34 60 L 34 116 L 46 102", 5.0f, 115f),
    HanziStrokeSpec("M 56 38 L 106 35", 5.0f, 115f),
    HanziStrokeSpec("M 78 38 L 68 82", 5.0f, 115f),
    HanziStrokeSpec("M 56 60 L 98 57 L 94 80", 5.0f, 115f),
    HanziStrokeSpec("M 48 83 L 114 80", 5.0f, 115f),
    HanziStrokeSpec("M 60 98 L 62 128", 5.0f, 115f),
    HanziStrokeSpec("M 60 98 L 102 95 L 98 125", 5.0f, 115f),
    HanziStrokeSpec("M 62 126 L 100 125", 5.0f, 115f),
)

private val BRAND_STROKE_SPECS = listOf(
    StrokeSpec("c", "M 142 125 C 122 95, 62 96, 56 164 C 50 226, 114 236, 138 197", 12.5f, 0.00f, 0.13f),
    StrokeSpec("h-stem", "M 177 104 C 175 142, 173 184, 172 224", 12.5f, 0.11f, 0.20f),
    StrokeSpec("h-arch", "M 174 172 C 184 146, 232 146, 234 182 C 235 198, 234 212, 234 224", 12.5f, 0.18f, 0.29f),
    StrokeSpec("a1-bowl", "M 318 175 C 312 148, 262 148, 260 189 C 258 228, 312 228, 319 194", 12.5f, 0.27f, 0.38f),
    StrokeSpec("a1-stem", "M 320 162 C 318 188, 319 216, 336 223", 12.5f, 0.36f, 0.43f),
    StrokeSpec("i-stem", "M 369 160 C 367 182, 365 204, 364 224", 12.5f, 0.41f, 0.48f),
    StrokeSpec("i-dot", "M 368 128 C 374 126, 381 131, 377 136 C 373 140, 365 136, 368 128", 13.5f, 0.46f, 0.51f, isRedDot = true),
    StrokeSpec("n-stem", "M 408 159 C 407 180, 406 202, 405 224", 12.5f, 0.49f, 0.55f),
    StrokeSpec("n-arch", "M 407 175 C 417 147, 469 147, 471 182 C 472 198, 471 212, 471 224", 12.5f, 0.53f, 0.63f),
    StrokeSpec("a2-bowl", "M 556 175 C 550 148, 500 148, 498 189 C 496 228, 550 228, 557 194", 12.5f, 0.61f, 0.71f),
    StrokeSpec("a2-stem", "M 558 162 C 556 188, 557 216, 574 223", 12.5f, 0.69f, 0.76f),
    StrokeSpec("accent", "M 571 153 C 579 155, 584 160, 586 167", 8.5f, 0.74f, 0.78f),
    StrokeSpec("H", "M 632 134 L 632 222 M 632 178 L 680 178 M 680 134 L 680 222", 10.0f, 0.77f, 0.85f, isHsk = true),
    StrokeSpec("S", "M 754 148 C 742 130, 706 132, 706 155 C 706 182, 758 174, 758 202 C 758 224, 718 228, 704 209", 10.0f, 0.80f, 0.88f, isHsk = true),
    StrokeSpec("K", "M 784 134 L 784 222 M 834 136 L 786 180 L 838 222", 10.0f, 0.86f, 0.93f, isHsk = true),
    StrokeSpec(
        id = "sig-by",
        d = "M 702 246 L 701 263 C 704 256, 711 256, 711 261 C 711 265, 704 265, 701 262 M 716 256 L 720 263 M 724 256 L 717 270",
        width = 2.1f,
        startPct = 0.91f,
        endPct = 0.95f,
        isSignature = true,
    ),
    StrokeSpec(
        id = "sig-minh",
        d = "M 735 264 L 736 248 L 743 261 L 750 248 L 751 264 M 757 256 L 757 264 M 757 251 L 757.5 251.5 M 763 264 L 763 256 C 765 254, 771 254, 771 258 L 771 264 M 777 247 L 777 264 C 779 255, 786 255, 786 260 L 786 264",
        width = 2.1f,
        startPct = 0.94f,
        endPct = 0.98f,
        isSignature = true,
    ),
    StrokeSpec(
        id = "sig-dai",
        d = "M 798 248 L 798 264 M 797 248 C 809 247, 811 264, 797 264 M 823 257 C 821 254, 814 254, 814 260 C 814 265, 821 265, 823 260 L 824 264 M 830 256 L 830 264",
        width = 2.1f,
        startPct = 0.97f,
        endPct = 1.00f,
        isSignature = true,
    ),
    StrokeSpec("sig-dot", "M 830 251 L 830.6 251.4", 3.2f, 0.99f, 1.00f, isRedDot = true, isSignature = true),
)

private val COMPILED_BRAND_STROKES: List<CompiledBrandStroke> by lazy {
    BRAND_STROKE_SPECS.map { spec ->
        val contours = compileContours(spec.d)
        val firstPt = contours.firstOrNull()?.let { c ->
            if (c.length > 0f) c.measure.getPosition(0f) else Offset.Zero
        } ?: Offset.Zero
        CompiledBrandStroke(
            spec = spec,
            contours = contours,
            totalLength = contours.sumOf { it.length.toDouble() }.toFloat().coerceAtLeast(1f),
            firstPoint = firstPt,
        )
    }
}

private val COMPILED_HANZI_STROKES: List<CompiledHanziStroke> by lazy {
    val total = HANZI_WATERMARK_SPECS.size
    val span = 0.80f / total
    HANZI_WATERMARK_SPECS.mapIndexed { idx, spec ->
        val contours = compileContours(spec.d)
        val startPct = 0.15f + idx * span * 0.85f
        val endPct = min(0.98f, startPct + span * 1.35f)
        CompiledHanziStroke(
            contours = contours,
            totalLength = contours.sumOf { it.length.toDouble() }.toFloat().coerceAtLeast(1f),
            width = spec.width,
            dx = spec.dx,
            startPct = startPct,
            endPct = endPct,
        )
    }
}

private fun compileContours(pathData: String): List<SubContour> {
    val parts = pathData.trim()
        .split(Regex("(?=M)"))
        .map { it.trim() }
        .filter { it.isNotEmpty() }
    return parts.map { part ->
        val path = PathParser().parsePathString(part).toPath()
        val measure = PathMeasure()
        measure.setPath(path, false)
        SubContour(
            path = path,
            measure = measure,
            length = measure.length.coerceAtLeast(0.5f),
        )
    }
}

private fun easeInOutCubic(t: Float): Float =
    if (t < 0.5f) 4f * t * t * t else 1f - (-2f * t + 2f).pow(3) / 2f

private fun resolveTargetWidth(mode: ChainaLoadingMode, size: ChainaLoadingSize?, widthDp: Dp?): Dp {
    if (widthDp != null) return widthDp
    if (size != null) {
        return when (size) {
            ChainaLoadingSize.XS -> 72.dp
            ChainaLoadingSize.SM -> 176.dp
            ChainaLoadingSize.MD -> 240.dp
            ChainaLoadingSize.LG -> 292.dp
            ChainaLoadingSize.XL -> 340.dp
        }
    }
    return when (mode) {
        ChainaLoadingMode.FULL_SCREEN -> 310.dp
        ChainaLoadingMode.PAGE -> 280.dp
        ChainaLoadingMode.OVERLAY -> 240.dp
        ChainaLoadingMode.COMPACT -> 66.dp
        ChainaLoadingMode.INLINE -> 220.dp
    }
}

private fun resolveDefaultBackground(mode: ChainaLoadingMode): ChainaLoadingBackground = when (mode) {
    ChainaLoadingMode.FULL_SCREEN, ChainaLoadingMode.PAGE -> ChainaLoadingBackground.PAPER
    ChainaLoadingMode.OVERLAY -> ChainaLoadingBackground.LIGHT
    ChainaLoadingMode.COMPACT, ChainaLoadingMode.INLINE -> ChainaLoadingBackground.TRANSPARENT
}

/**
 * Chaina HSK Unified Progressive Stroke-Drawing Loading Component (Jetpack Compose).
 * Geometrically and temporally synchronized with Web ChainaStrokeLoading.
 */
@Composable
fun ChainaStrokeLoading(
    modifier: Modifier = Modifier,
    mode: ChainaLoadingMode = ChainaLoadingMode.INLINE,
    size: ChainaLoadingSize? = null,
    widthDp: Dp? = null,
    durationMs: Int? = null,
    autoPlay: Boolean = true,
    loop: Boolean = false,
    showGlow: Boolean = true,
    background: ChainaLoadingBackground? = null,
    loadingState: ChainaLoadingState = ChainaLoadingState.LOADING,
    message: String? = null,
    errorMessage: String? = null,
    onRetry: (() -> Unit)? = null,
    onComplete: (() -> Unit)? = null,
    delayMs: Long = 0L,
    showHanziWatermark: Boolean? = null,
    showSignature: Boolean? = null,
) {
    val effectiveBg = background ?: resolveDefaultBackground(mode)
    val isDark = effectiveBg == ChainaLoadingBackground.DARK
    val targetWidth = resolveTargetWidth(mode, size, widthDp)
    val isCompact = mode == ChainaLoadingMode.COMPACT || targetWidth < 110.dp
    val effectiveDuration = (durationMs ?: if (isCompact) 1500 else 2000).coerceAtLeast(300)
    val renderHanzi = showHanziWatermark ?: !isCompact
    val renderSignature = showSignature ?: !isCompact

    var visible by remember(delayMs) { mutableStateOf(delayMs <= 0L) }
    var holdingGlow by remember { mutableStateOf(false) }

    val progressAnim = remember { Animatable(0f) }
    val latestOnComplete by rememberUpdatedState(onComplete)

    LaunchedEffect(delayMs) {
        if (delayMs > 0L) {
            visible = false
            delay(delayMs)
            visible = true
        } else {
            visible = true
        }
    }

    LaunchedEffect(visible, loadingState, autoPlay, loop, effectiveDuration) {
        if (!visible) return@LaunchedEffect

        when (loadingState) {
            ChainaLoadingState.ERROR -> {
                holdingGlow = false
                progressAnim.stop()
            }

            ChainaLoadingState.SUCCESS -> {
                holdingGlow = false
                if (progressAnim.value < 0.999f) {
                    progressAnim.animateTo(
                        targetValue = 1f,
                        animationSpec = tween(durationMillis = 240, easing = LinearEasing),
                    )
                }
                latestOnComplete?.invoke()
            }

            ChainaLoadingState.LOADING -> {
                holdingGlow = false
                if (!autoPlay) return@LaunchedEffect

                if (loop) {
                    while (isActive) {
                        progressAnim.snapTo(0f)
                        progressAnim.animateTo(
                            targetValue = 1f,
                            animationSpec = tween(durationMillis = effectiveDuration, easing = LinearEasing),
                        )
                        latestOnComplete?.invoke()
                        delay(550L)
                    }
                } else {
                    if (progressAnim.value < 0.999f) {
                        val remainingMs = ((1f - progressAnim.value) * effectiveDuration)
                            .toInt()
                            .coerceAtLeast(180)
                        progressAnim.animateTo(
                            targetValue = 1f,
                            animationSpec = tween(durationMillis = remainingMs, easing = LinearEasing),
                        )
                    }
                    latestOnComplete?.invoke()
                    // Slow loading: hold crisp completed logo with gentle breathing aura
                    holdingGlow = true
                }
            }
        }
    }

    if (!visible) return

    val infiniteTransition = rememberInfiniteTransition(label = "chaina-hold-aura")
    val auraPulse by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1800, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "aura-pulse",
    )

    val containerBg = when (effectiveBg) {
        ChainaLoadingBackground.PAPER -> Paper
        ChainaLoadingBackground.LIGHT -> PaperPure.copy(alpha = 0.92f)
        ChainaLoadingBackground.DARK -> {
            if (mode == ChainaLoadingMode.OVERLAY) Color(0xFF0E0A18).copy(alpha = 0.72f)
            else Color(0xFF0E0A18)
        }
        ChainaLoadingBackground.TRANSPARENT -> Color.Transparent
    }

    val semanticsText = message ?: if (loadingState == ChainaLoadingState.ERROR) "Không thể tải dữ liệu" else "Đang tải"

    // Pre-allocated scratch Paths & NativePaints to ensure zero allocation during 60fps draw
    val scratchSegmentPath = remember { Path() }
    val scratchTrailPath = remember { Path() }
    val sigTextPaint = remember {
        NativePaint(NativePaint.ANTI_ALIAS_FLAG).apply {
            textAlign = NativePaint.Align.RIGHT
            textSize = 11.5f
            letterSpacing = 0.14f
            typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
        }
    }
    val sealTextPaint = remember {
        NativePaint(NativePaint.ANTI_ALIAS_FLAG).apply {
            color = android.graphics.Color.WHITE
            textAlign = NativePaint.Align.CENTER
            textSize = 14f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        }
    }

    val primaryStroke = if (isDark) Color(0xFFEAE3F8) else Color(0xFF26252D)
    val hskStart = if (isDark) Color(0xFFDDD6FE) else Color(0xFF2B2638)
    val hskEnd = if (isDark) Color(0xFFA78BFA) else Color(0xFF5B4688)
    val vermilion = Color(0xFFD84A34)
    val hanziColor = Color(0xFFA78BFA)
    val strokeBoost = if (isCompact) 1.28f else 1f
    val displayError = loadingState == ChainaLoadingState.ERROR

    val hskBrush = remember(isDark) {
        Brush.linearGradient(
            colors = listOf(hskStart, hskEnd),
            start = Offset(632f, 134f),
            end = Offset(838f, 222f),
        )
    }

    val logoStage: @Composable (Modifier) -> Unit = { stageModifier ->
        val p = progressAnim.value.coerceIn(0f, 1f)
        val hidePen = loadingState != ChainaLoadingState.LOADING || (!autoPlay && p == 0f) || p >= 0.992f
        val logoAlpha = if (displayError) 0.58f else 1f

        Column(
            modifier = stageModifier.semantics { contentDescription = semanticsText },
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            BoxWithConstraints(
                modifier = if (isCompact) Modifier else Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center,
            ) {
                val resolvedWidth = if (isCompact) {
                    targetWidth
                } else {
                    val maxAllowed = maxWidth * 0.86f
                    if (maxAllowed > 0.dp && maxAllowed < targetWidth) maxAllowed else targetWidth
                }

                Box(
                    modifier = Modifier
                        .width(resolvedWidth)
                        .aspectRatio(920f / 340f),
                    contentAlignment = Alignment.Center,
                ) {
                    Canvas(modifier = Modifier.fillMaxSize()) {
                        val s = this.size.width / 920f
                        if (s <= 0f) return@Canvas

                        withTransform({
                            scale(scaleX = s, scaleY = s, pivot = Offset.Zero)
                        }) {
                            // Subtle breathing aura when holding completed logo on slow load
                            if (holdingGlow && !isCompact && showGlow && !displayError) {
                                val auraColor = if (isDark) {
                                    Color(0xFFA78BFA).copy(alpha = 0.20f * auraPulse)
                                } else {
                                    Color(0xFF7C3AED).copy(alpha = 0.14f * auraPulse)
                                }
                                drawCircle(
                                    brush = Brush.radialGradient(
                                        colors = listOf(auraColor, Color.Transparent),
                                        center = Offset(460f, 180f),
                                        radius = 390f,
                                    ),
                                    radius = 390f,
                                    center = Offset(460f, 180f),
                                )
                            }

                            // LAYER 1: Calligraphic 汉语 watermark in stroke order
                            if (renderHanzi) {
                                val hanziAlpha = (if (isDark) 0.16f else 0.12f) * logoAlpha
                                withTransform({
                                    translate(left = 655f, top = 22f)
                                    scale(scaleX = 0.95f, scaleY = 0.95f, pivot = Offset.Zero)
                                }) {
                                    for (hs in COMPILED_HANZI_STROKES) {
                                        val rawLocal = (p - hs.startPct) / (hs.endPct - hs.startPct)
                                        if (rawLocal <= 0f) continue
                                        val drawLen = if (rawLocal >= 1f) hs.totalLength else hs.totalLength * easeInOutCubic(rawLocal)

                                        withTransform({
                                            if (hs.dx != 0f) translate(left = hs.dx, top = 0f)
                                        }) {
                                            drawContoursUpTo(
                                                contours = hs.contours,
                                                targetLength = drawLen,
                                                scratchPath = scratchSegmentPath,
                                                drawBlock = { path ->
                                                    drawPath(
                                                        path = path,
                                                        color = hanziColor.copy(alpha = hanziAlpha),
                                                        style = Stroke(
                                                            width = hs.width,
                                                            cap = StrokeCap.Round,
                                                            join = StrokeJoin.Round,
                                                        ),
                                                    )
                                                },
                                            )
                                        }
                                    }
                                }
                            }

                            // LAYER 2: Chaina HSK Brand Monoline Script (19 strokes)
                            var activeCompiled: CompiledBrandStroke? = null
                            var activeEased = 0f

                            for (brand in COMPILED_BRAND_STROKES) {
                                val spec = brand.spec
                                if (!renderSignature && spec.isSignature) continue
                                val rawLocal = (p - spec.startPct) / (spec.endPct - spec.startPct)
                                if (rawLocal <= 0f) continue

                                val baseOpacity = (if (spec.isSignature) 0.72f else 1f) * logoAlpha
                                val strokeWidth = spec.width * strokeBoost
                                val eased = if (rawLocal >= 1f) 1f else easeInOutCubic(rawLocal)
                                if (rawLocal > 0f && rawLocal < 1f) {
                                    activeCompiled = brand
                                    activeEased = eased
                                }

                                val drawLen = brand.totalLength * eased
                                drawContoursUpTo(
                                    contours = brand.contours,
                                    targetLength = drawLen,
                                    scratchPath = scratchSegmentPath,
                                    drawBlock = { path ->
                                        val strokeStyle = Stroke(
                                            width = strokeWidth,
                                            cap = StrokeCap.Round,
                                            join = StrokeJoin.Round,
                                        )
                                        when {
                                            spec.isRedDot -> drawPath(path, vermilion.copy(alpha = baseOpacity), style = strokeStyle)
                                            spec.isHsk -> drawPath(path, hskBrush, alpha = baseOpacity, style = strokeStyle)
                                            else -> drawPath(path, primaryStroke.copy(alpha = baseOpacity), style = strokeStyle)
                                        }
                                    },
                                )
                            }

                            // LAYER 3: Final Polish Underline, '漢' Seal & "by Minh Dai"
                            if (p >= 0.92f) {
                                val polishAlpha = ((p - 0.92f) / 0.08f).coerceIn(0f, 1f) * logoAlpha
                                if (renderSignature) {
                                    drawLine(
                                        brush = hskBrush,
                                        start = Offset(168f, 258f),
                                        end = Offset(678f, 258f),
                                        strokeWidth = 1.5f,
                                        cap = StrokeCap.Round,
                                        alpha = 0.4f * polishAlpha,
                                    )
                                    sigTextPaint.color = primaryStroke.copy(alpha = 0.58f * polishAlpha).toArgb()
                                    drawContext.canvas.nativeCanvas.drawText("by Minh Dai", 836f, 282f, sigTextPaint)
                                }

                                withTransform({
                                    translate(left = 852f, top = 192f)
                                }) {
                                    drawRoundRect(
                                        color = vermilion.copy(alpha = 0.92f * polishAlpha),
                                        topLeft = Offset.Zero,
                                        size = Size(28f, 28f),
                                        cornerRadius = CornerRadius(5f, 5f),
                                    )
                                    sealTextPaint.alpha = (255 * polishAlpha).toInt().coerceIn(0, 255)
                                    drawContext.canvas.nativeCanvas.drawText("漢", 14f, 19f, sealTextPaint)
                                }
                            }

                            // LAYER 4: Luminous Pen Tip & 10-Segment Micro Trail on Active Contour
                            if (showGlow && !hidePen && !displayError) {
                                val haloBaseRadius = if (isCompact) 13f else 10f
                                val coreRadius = if (isCompact) 5.5f else 4.2f
                                val trailStrokeWidth = if (isCompact) 6f else 4.5f

                                if (activeCompiled != null && p > 0.002f) {
                                    val isRed = activeCompiled.spec.isRedDot
                                    val haloColor = when {
                                        isRed -> Color(0xFFFB7185)
                                        isDark -> Color(0xFFC4B5FD)
                                        else -> Color(0xFF7C3AED)
                                    }
                                    val trailColor = when {
                                        isRed -> Color(0xFFFDA4AF)
                                        isDark -> Color(0xFFE9D5FF)
                                        else -> Color(0xFFA78BFA)
                                    }

                                    val tipInfo = locateActiveTipAndTrail(
                                        contours = activeCompiled.contours,
                                        targetLength = activeCompiled.totalLength * activeEased,
                                        totalStrokeLength = activeCompiled.totalLength,
                                        trailPath = scratchTrailPath,
                                    )

                                    if (tipInfo != null) {
                                        val haloAlpha = if (isDark) 0.70f else 0.48f
                                        drawPath(
                                            path = scratchTrailPath,
                                            color = trailColor.copy(alpha = if (isDark) 0.9f else 0.82f),
                                            style = Stroke(width = trailStrokeWidth, cap = StrokeCap.Round, join = StrokeJoin.Round),
                                        )
                                        drawCircle(
                                            brush = Brush.radialGradient(
                                                colors = listOf(haloColor.copy(alpha = haloAlpha), Color.Transparent),
                                                center = tipInfo,
                                                radius = haloBaseRadius * 1.55f,
                                            ),
                                            radius = haloBaseRadius * 1.55f,
                                            center = tipInfo,
                                        )
                                        drawCircle(
                                            color = haloColor.copy(alpha = haloAlpha * 0.72f),
                                            radius = haloBaseRadius * 0.72f,
                                            center = tipInfo,
                                        )
                                        drawCircle(
                                            color = Color.White,
                                            radius = coreRadius,
                                            center = tipInfo,
                                        )
                                    }
                                } else if (p <= 0.002f) {
                                    val firstPt = COMPILED_BRAND_STROKES.first().firstPoint
                                    val haloColor = if (isDark) Color(0xFFC4B5FD) else Color(0xFF7C3AED)
                                    val initAlpha = if (isDark) 0.45f else 0.32f
                                    drawCircle(
                                        brush = Brush.radialGradient(
                                            colors = listOf(haloColor.copy(alpha = initAlpha), Color.Transparent),
                                            center = firstPt,
                                            radius = haloBaseRadius * 1.45f,
                                        ),
                                        radius = haloBaseRadius * 1.45f,
                                        center = firstPt,
                                    )
                                    drawCircle(
                                        color = Color.White.copy(alpha = 0.85f),
                                        radius = coreRadius,
                                        center = firstPt,
                                    )
                                }
                            }
                        }
                    }
                }
            }

            if (!isCompact && !message.isNullOrBlank() && !displayError) {
                Spacer(Modifier.height(10.dp))
                Text(
                    text = message,
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.Medium,
                    color = if (isDark) Color(0xFFD8D0F0) else InkMuted,
                    textAlign = TextAlign.Center,
                )
            }

            if (displayError) {
                Spacer(Modifier.height(10.dp))
                Text(
                    text = errorMessage ?: message ?: "Đã xảy ra lỗi khi tải dữ liệu.",
                    fontSize = 12.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isDark) Color(0xFFFDA4AF) else RedBad,
                    textAlign = TextAlign.Center,
                )
                if (onRetry != null) {
                    Spacer(Modifier.height(8.dp))
                    OutlinedButton(
                        onClick = onRetry,
                        shape = CircleShape,
                        border = BorderStroke(1.dp, if (isDark) Color.White.copy(alpha = 0.3f) else InkBorder),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 6.dp),
                    ) {
                        Text(
                            text = "Thử lại",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isDark) Color.White else InkBlack,
                        )
                    }
                }
            }
        }
    }

    when (mode) {
        ChainaLoadingMode.FULL_SCREEN -> {
            Box(
                modifier = modifier
                    .fillMaxSize()
                    .background(containerBg)
                    .windowInsetsPadding(WindowInsets.safeDrawing)
                    .padding(horizontal = 24.dp),
                contentAlignment = Alignment.Center,
            ) {
                logoStage(Modifier.fillMaxWidth())
            }
        }

        ChainaLoadingMode.PAGE -> {
            Box(
                modifier = modifier
                    .fillMaxSize()
                    .background(containerBg)
                    .padding(horizontal = 20.dp, vertical = 32.dp),
                contentAlignment = Alignment.Center,
            ) {
                logoStage(Modifier.fillMaxWidth())
            }
        }

        ChainaLoadingMode.OVERLAY -> {
            Box(
                modifier = modifier
                    .fillMaxSize()
                    .background(containerBg)
                    .padding(horizontal = 20.dp),
                contentAlignment = Alignment.Center,
            ) {
                logoStage(Modifier.fillMaxWidth())
            }
        }

        ChainaLoadingMode.COMPACT -> {
            Box(
                modifier = modifier.background(containerBg),
                contentAlignment = Alignment.Center,
            ) {
                logoStage(Modifier)
            }
        }

        ChainaLoadingMode.INLINE -> {
            Box(
                modifier = modifier
                    .fillMaxWidth()
                    .background(containerBg)
                    .padding(horizontal = 12.dp, vertical = 20.dp),
                contentAlignment = Alignment.Center,
            ) {
                logoStage(Modifier.fillMaxWidth())
            }
        }
    }
}

private inline fun drawContoursUpTo(
    contours: List<SubContour>,
    targetLength: Float,
    scratchPath: Path,
    drawBlock: (Path) -> Unit,
) {
    var remaining = targetLength
    for (contour in contours) {
        if (remaining <= 0f) break
        if (remaining >= contour.length - 0.01f) {
            drawBlock(contour.path)
            remaining -= contour.length
        } else {
            scratchPath.reset()
            if (contour.measure.getSegment(0f, remaining, scratchPath, true)) {
                drawBlock(scratchPath)
            }
            break
        }
    }
}

private fun locateActiveTipAndTrail(
    contours: List<SubContour>,
    targetLength: Float,
    totalStrokeLength: Float,
    trailPath: Path,
): Offset? {
    var remaining = targetLength.coerceAtLeast(0f)
    for (contour in contours) {
        if (remaining <= contour.length || contour === contours.last()) {
            val localLen = remaining.coerceIn(0f, contour.length)
            val tipPos = contour.measure.getPosition(localLen)
            val trailSpan = min(localLen, max(18f, totalStrokeLength * 0.22f))
            trailPath.reset()
            val steps = 10
            for (i in 0..steps) {
                val sampleLen = (localLen - (trailSpan * i) / steps).coerceAtLeast(0f)
                val pt = contour.measure.getPosition(sampleLen)
                if (i == 0) trailPath.moveTo(pt.x, pt.y) else trailPath.lineTo(pt.x, pt.y)
            }
            return tipPos
        }
        remaining -= contour.length
    }
    return null
}
