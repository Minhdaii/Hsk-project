package com.chaina.hsk.ui

import android.Manifest
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.ImageDecoder
import android.graphics.Matrix
import android.graphics.Rect
import android.media.ExifInterface
import android.net.Uri
import android.os.Build
import android.os.SystemClock
import android.speech.tts.TextToSpeech
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageCapture
import androidx.camera.core.ImageCaptureException
import androidx.camera.core.ImageProxy
import androidx.camera.mlkit.vision.MlKitAnalyzer
import androidx.camera.view.CameraController
import androidx.camera.view.LifecycleCameraController
import androidx.camera.view.PreviewView
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.rounded.VolumeUp
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.CameraAlt
import androidx.compose.material.icons.rounded.Check
import androidx.compose.material.icons.rounded.ContentCopy
import androidx.compose.material.icons.rounded.Edit
import androidx.compose.material.icons.rounded.FlashOff
import androidx.compose.material.icons.rounded.FlashOn
import androidx.compose.material.icons.rounded.PhotoLibrary
import androidx.compose.material.icons.rounded.Refresh
import androidx.compose.material.icons.rounded.Translate
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.LocalLifecycleOwner
import com.chaina.hsk.data.TranslateClient
import com.chaina.hsk.data.TranslationResult
import com.chaina.hsk.data.containsHanzi
import com.chaina.hsk.data.extractDictionaryLookupCandidate
import com.chaina.hsk.data.filterChineseOcrLines
import com.chaina.hsk.ui.components.ArrowUpRightIcon
import com.chaina.hsk.ui.components.ChainaLoadingBackground
import com.chaina.hsk.ui.components.ChainaLoadingMode
import com.chaina.hsk.ui.components.ChainaLoadingSize
import com.chaina.hsk.ui.components.ChainaStrokeLoading
import com.chaina.hsk.ui.components.CircleActionButton
import com.chaina.hsk.ui.components.InkCard
import com.chaina.hsk.ui.components.InkPrimaryButton
import com.chaina.hsk.ui.theme.Brand
import com.chaina.hsk.ui.theme.BrandBorder
import com.chaina.hsk.ui.theme.BrandDark
import com.chaina.hsk.ui.theme.BrandLavender
import com.chaina.hsk.ui.theme.BrandSoft
import com.chaina.hsk.ui.theme.InkBlack
import com.chaina.hsk.ui.theme.InkBorder
import com.chaina.hsk.ui.theme.InkLight
import com.chaina.hsk.ui.theme.InkMuted
import com.chaina.hsk.ui.theme.JadeBorder
import com.chaina.hsk.ui.theme.JadeGreen
import com.chaina.hsk.ui.theme.JadeSoft
import com.chaina.hsk.ui.theme.PaperMuted
import com.chaina.hsk.ui.theme.PaperPure
import com.chaina.hsk.ui.theme.RedBad
import com.chaina.hsk.ui.theme.RedBorder
import com.chaina.hsk.ui.theme.RedSoft
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.Text
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.chinese.ChineseTextRecognizerOptions
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import java.util.Locale
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException
import kotlin.math.min
import kotlin.math.roundToInt

private data class DetectedChineseBlock(
    val text: String,
    val box: Rect,
)

private data class ScanHistoryItem(
    val result: TranslationResult,
    val sourceLabel: String,
)

@Composable
internal fun CameraTranslateScreen(
    onLookupWord: (String) -> Unit,
) {
    val context = LocalContext.current
    val lifecycleOwner = LocalLifecycleOwner.current
    val scope = rememberCoroutineScope()
    val density = LocalDensity.current

    val tts = remember(context) {
        var instance: TextToSpeech? = null
        instance = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                runCatching { instance?.language = Locale.SIMPLIFIED_CHINESE }
            }
        }
        instance
    }
    DisposableEffect(tts) {
        onDispose {
            tts.stop()
            tts.shutdown()
        }
    }

    val textRecognizer = remember {
        TextRecognition.getClient(ChineseTextRecognizerOptions.Builder().build())
    }
    DisposableEffect(Unit) {
        onDispose {
            runCatching { textRecognizer.close() }
        }
    }

    val hasCameraHardware = remember(context) {
        context.packageManager.hasSystemFeature(PackageManager.FEATURE_CAMERA_ANY)
    }

    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA) ==
                PackageManager.PERMISSION_GRANTED
        )
    }
    var permissionRequestedOnce by remember { mutableStateOf(false) }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
    ) { granted ->
        hasCameraPermission = granted
    }

    LaunchedEffect(hasCameraHardware) {
        if (hasCameraHardware && !hasCameraPermission && !permissionRequestedOnce) {
            permissionRequestedOnce = true
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    var autoTranslate by remember { mutableStateOf(false) }
    var torchOn by remember { mutableStateOf(false) }
    var hasFlashUnit by remember { mutableStateOf(false) }
    var cameraInitError by remember { mutableStateOf<String?>(null) }

    var previewViewRef by remember { mutableStateOf<PreviewView?>(null) }
    var capturedBitmap by remember { mutableStateOf<Bitmap?>(null) }
    var capturedFromGallery by remember { mutableStateOf(false) }
    var imageBoxSize by remember { mutableStateOf(IntSize.Zero) }

    var liveBlocks by remember { mutableStateOf<List<DetectedChineseBlock>>(emptyList()) }
    var liveCombinedText by remember { mutableStateOf("") }
    var lastLiveUiUpdateMs by remember { mutableLongStateOf(0L) }
    var lastAutoTranslatedText by remember { mutableStateOf("") }

    var photoBlocks by remember { mutableStateOf<List<DetectedChineseBlock>>(emptyList()) }
    var selectedBlockIndex by remember { mutableIntStateOf(-1) } // -1 = all detected Chinese blocks

    var busyCapture by remember { mutableStateOf(false) }
    var busyTranslate by remember { mutableStateOf(false) }
    var translateJob by remember { mutableStateOf<Job?>(null) }
    var translateError by remember { mutableStateOf<String?>(null) }
    var activeSourceLabel by remember { mutableStateOf("Chụp ảnh") }
    var translationResult by remember { mutableStateOf<TranslationResult?>(null) }

    var isEditingSource by remember { mutableStateOf(false) }
    var editableSource by remember { mutableStateOf("") }
    var copyBanner by remember { mutableStateOf<String?>(null) }

    val history = remember { mutableStateListOf<ScanHistoryItem>() }

    LaunchedEffect(copyBanner) {
        if (copyBanner != null) {
            delay(1800)
            copyBanner = null
        }
    }

    fun recordHistory(res: TranslationResult, label: String) {
        history.removeAll { it.result.sourceZh == res.sourceZh }
        history.add(0, ScanHistoryItem(res, label))
        while (history.size > 8) history.removeAt(history.lastIndex)
    }

    fun runTranslation(chinese: String, label: String, syncEditBox: Boolean = true) {
        val cleaned = filterChineseOcrLines(chinese).ifBlank { chinese.trim() }
        if (!cleaned.containsHanzi()) {
            translateJob?.cancel()
            busyTranslate = false
            translateError = "Không phát hiện chữ tiếng Trung để dịch. Hãy chọn hoặc quét vùng chứa chữ Hán."
            translationResult = null
            return
        }
        if (syncEditBox) editableSource = cleaned
        activeSourceLabel = label
        translateError = null
        translateJob?.cancel()
        busyTranslate = true
        translateJob = scope.launch {
            try {
                val res = TranslateClient.translateZhToVi(cleaned)
                translationResult = res
                isEditingSource = false
                recordHistory(res, label)
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                translateError = e.message ?: "Không dịch được văn bản. Vui lòng thử lại."
            } finally {
                busyTranslate = false
            }
        }
    }

    fun analyzeStaticBitmap(bmp: Bitmap, fromGallery: Boolean) {
        capturedBitmap = bmp
        capturedFromGallery = fromGallery
        photoBlocks = emptyList()
        selectedBlockIndex = -1
        translateError = null
        isEditingSource = false
        busyCapture = true

        scope.launch {
            try {
                val visionText = textRecognizer.process(InputImage.fromBitmap(bmp, 0)).awaitTask()
                val chineseBlocks = extractChineseBlocks(visionText)
                photoBlocks = chineseBlocks
                busyCapture = false

                if (chineseBlocks.isEmpty()) {
                    translationResult = null
                    translateError = "Không thấy chữ tiếng Trung trong ảnh. Bạn có thể chụp lại gần hơn hoặc chạm \"Nhập chữ\" để dịch thủ công."
                } else {
                    val combined = chineseBlocks.joinToString("\n") { it.text }
                    runTranslation(
                        chinese = combined,
                        label = if (fromGallery) "Thư viện" else "Ảnh chụp",
                    )
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                busyCapture = false
                translateError = e.message ?: "Không đọc được chữ từ ảnh."
            }
        }
    }

    val galleryLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.PickVisualMedia(),
    ) { uri: Uri? ->
        if (uri == null) return@rememberLauncherForActivityResult
        busyCapture = true
        translateError = null
        scope.launch {
            try {
                val bmp = withContext(Dispatchers.IO) { decodeScaledBitmapFromUri(context, uri, 1600) }
                if (bmp == null) {
                    busyCapture = false
                    translateError = "Không mở được ảnh đã chọn."
                } else {
                    analyzeStaticBitmap(bmp, fromGallery = true)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                busyCapture = false
                translateError = e.message ?: "Lỗi đọc ảnh từ thư viện."
            }
        }
    }

    val cameraController = remember(context) {
        LifecycleCameraController(context).apply {
            cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
            setEnabledUseCases(CameraController.IMAGE_CAPTURE or CameraController.IMAGE_ANALYSIS)
        }
    }

    val isFrozenState by rememberUpdatedState(capturedBitmap != null)
    val isLiveReady by rememberUpdatedState(hasCameraHardware && hasCameraPermission && cameraInitError == null)

    DisposableEffect(isLiveReady, lifecycleOwner, cameraController) {
        if (!isLiveReady) {
            onDispose { }
        } else {
            val analyzer = MlKitAnalyzer(
                listOf(textRecognizer),
                ImageAnalysis.COORDINATE_SYSTEM_VIEW_REFERENCED,
                ContextCompat.getMainExecutor(context),
            ) { analyzerResult ->
                if (isFrozenState) return@MlKitAnalyzer
                val now = SystemClock.elapsedRealtime()
                if (now - lastLiveUiUpdateMs < 240L) return@MlKitAnalyzer
                lastLiveUiUpdateMs = now

                val visionText = analyzerResult?.getValue(textRecognizer)
                val detected = if (visionText != null) extractChineseBlocks(visionText) else emptyList()
                liveBlocks = detected
                liveCombinedText = detected.joinToString("\n") { it.text }
            }

            runCatching {
                cameraController.setImageAnalysisAnalyzer(ContextCompat.getMainExecutor(context), analyzer)
                cameraController.bindToLifecycle(lifecycleOwner)
                cameraInitError = null
            }.onFailure { err ->
                cameraInitError = err.message ?: "Không khởi động được camera."
            }

            onDispose {
                runCatching { cameraController.enableTorch(false) }
                torchOn = false
                runCatching { cameraController.clearImageAnalysisAnalyzer() }
                runCatching { cameraController.unbind() }
            }
        }
    }

    // Live auto-translate (debounced ~950ms + cached so free Google Translate API is never spammed)
    LaunchedEffect(autoTranslate, liveCombinedText, isFrozenState, isEditingSource) {
        if (!autoTranslate || isFrozenState || isEditingSource) return@LaunchedEffect
        val candidate = liveCombinedText
        if (!candidate.containsHanzi()) return@LaunchedEffect
        delay(950L)
        if (candidate == liveCombinedText && candidate != lastAutoTranslatedText && !isFrozenState) {
            lastAutoTranslatedText = candidate
            runTranslation(candidate, label = "Tự động")
        }
    }

    val resetToLiveCamera: () -> Unit = {
        capturedBitmap = null
        capturedFromGallery = false
        photoBlocks = emptyList()
        selectedBlockIndex = -1
        translateError = null
        isEditingSource = false
    }

    val triggerCapture: () -> Unit = {
        if (!busyCapture && isLiveReady) {
            busyCapture = true
            translateError = null
            val executor = ContextCompat.getMainExecutor(context)
            cameraController.takePicture(
                executor,
                object : ImageCapture.OnImageCapturedCallback() {
                    override fun onCaptureSuccess(image: ImageProxy) {
                        scope.launch {
                            val bmp = try {
                                withContext(Dispatchers.Default) {
                                    imageProxyToScaledBitmap(image, 1600)
                                }
                            } finally {
                                image.close()
                            }
                            if (torchOn) {
                                runCatching { cameraController.enableTorch(false) }
                                torchOn = false
                            }
                            analyzeStaticBitmap(bmp, fromGallery = false)
                        }
                    }

                    override fun onError(exception: ImageCaptureException) {
                        val fallbackBmp = previewViewRef?.bitmap?.let { downscaleBitmap(it, 1600) }
                        if (fallbackBmp != null) {
                            analyzeStaticBitmap(fallbackBmp, fromGallery = false)
                        } else {
                            busyCapture = false
                            translateError = exception.message ?: "Không chụp được ảnh. Hãy thử lại."
                        }
                    }
                },
            )
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        // 1. Locked Language Pair Banner + Live Auto Toggle
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Surface(
                shape = CircleShape,
                color = BrandSoft,
                border = BorderStroke(1.dp, BrandBorder),
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Icon(Icons.Rounded.Translate, contentDescription = null, tint = BrandDark, modifier = Modifier.size(15.dp))
                    Text(
                        "Tiếng Trung → Tiếng Việt",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = BrandDark,
                    )
                }
            }

            Surface(
                modifier = Modifier
                    .clip(CircleShape)
                    .clickable {
                        autoTranslate = !autoTranslate
                        if (autoTranslate && capturedBitmap != null) {
                            resetToLiveCamera()
                        }
                    },
                shape = CircleShape,
                color = if (autoTranslate) JadeSoft else PaperPure,
                border = BorderStroke(1.dp, if (autoTranslate) JadeBorder else InkBorder),
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 11.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(5.dp),
                ) {
                    Icon(
                        imageVector = Icons.Rounded.AutoAwesome,
                        contentDescription = null,
                        tint = if (autoTranslate) JadeGreen else InkMuted,
                        modifier = Modifier.size(14.dp),
                    )
                    Text(
                        text = if (autoTranslate) "Tự dịch: BẬT" else "Tự dịch: TẮT",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (autoTranslate) JadeGreen else InkMuted,
                    )
                }
            }
        }

        // 2. Camera / Frozen Image Viewport
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(336.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(Color(0xFF14131A))
                .border(1.dp, InkBorder, RoundedCornerShape(24.dp)),
        ) {
            val frozenBmp = capturedBitmap
            if (isLiveReady) {
                // Keep PreviewView mounted underneath so resuming live camera ("Chụp lại") is instant
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        PreviewView(ctx).apply {
                            implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                            scaleType = PreviewView.ScaleType.FILL_CENTER
                            controller = cameraController
                            previewViewRef = this
                        }
                    },
                    update = { view ->
                        if (view.controller !== cameraController) {
                            view.controller = cameraController
                        }
                        previewViewRef = view
                        hasFlashUnit = cameraController.cameraInfo?.hasFlashUnit() == true
                    },
                )
            }

            if (frozenBmp != null) {
                // Frozen photo / gallery image with interactive detected Chinese block overlays
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color(0xFF14131A))
                        .onSizeChanged { imageBoxSize = it },
                ) {
                    Image(
                        bitmap = frozenBmp.asImageBitmap(),
                        contentDescription = "Ảnh đã chụp",
                        contentScale = ContentScale.Fit,
                        modifier = Modifier.fillMaxSize(),
                    )

                    if (imageBoxSize.width > 0 && imageBoxSize.height > 0 && photoBlocks.isNotEmpty()) {
                        val scale = min(
                            imageBoxSize.width.toFloat() / frozenBmp.width.toFloat(),
                            imageBoxSize.height.toFloat() / frozenBmp.height.toFloat(),
                        )
                        val drawnW = frozenBmp.width * scale
                        val drawnH = frozenBmp.height * scale
                        val offsetX = (imageBoxSize.width - drawnW) / 2f
                        val offsetY = (imageBoxSize.height - drawnH) / 2f

                        photoBlocks.forEachIndexed { idx, block ->
                            val isSelected = selectedBlockIndex == -1 || selectedBlockIndex == idx
                            val leftPx = offsetX + block.box.left * scale
                            val topPx = offsetY + block.box.top * scale
                            val widthPx = (block.box.width() * scale).coerceAtLeast(with(density) { 26.dp.toPx() })
                            val heightPx = (block.box.height() * scale).coerceAtLeast(with(density) { 22.dp.toPx() })

                            val widthDp = with(density) { widthPx.toDp() }
                            val heightDp = with(density) { heightPx.toDp() }

                            Box(
                                modifier = Modifier
                                    .offset { IntOffset(leftPx.roundToInt(), topPx.roundToInt()) }
                                    .size(width = widthDp, height = heightDp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(
                                        if (selectedBlockIndex == idx) Brand.copy(alpha = 0.28f)
                                        else Color.White.copy(alpha = if (isSelected) 0.14f else 0.05f)
                                    )
                                    .border(
                                        width = if (selectedBlockIndex == idx) 2.dp else 1.2.dp,
                                        color = if (selectedBlockIndex == idx) BrandLavender else Color.White.copy(alpha = 0.78f),
                                        shape = RoundedCornerShape(6.dp),
                                    )
                                    .clickable {
                                        if (selectedBlockIndex == idx && photoBlocks.size > 1) {
                                            selectedBlockIndex = -1
                                            runTranslation(
                                                chinese = photoBlocks.joinToString("\n") { it.text },
                                                label = if (capturedFromGallery) "Thư viện" else "Ảnh chụp",
                                            )
                                        } else {
                                            selectedBlockIndex = idx
                                            runTranslation(
                                                chinese = block.text,
                                                label = if (capturedFromGallery) "Thư viện" else "Vùng chọn",
                                            )
                                        }
                                    },
                            )
                        }
                    }

                    // Top frozen controls
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp)
                            .align(Alignment.TopCenter),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Surface(
                            shape = CircleShape,
                            color = Color.Black.copy(alpha = 0.60f),
                        ) {
                            Text(
                                text = if (photoBlocks.isEmpty()) "Không thấy chữ Trung" else "Chạm khung chữ để dịch riêng",
                                color = Color.White,
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(horizontal = 11.dp, vertical = 6.dp),
                            )
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            CircleActionButton(
                                onClick = {
                                    galleryLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                                },
                                size = 36.dp,
                                containerColor = Color.Black.copy(alpha = 0.62f),
                                borderColor = Color.White.copy(alpha = 0.25f),
                            ) {
                                Icon(Icons.Rounded.PhotoLibrary, contentDescription = "Chọn ảnh khác", tint = Color.White, modifier = Modifier.size(18.dp))
                            }
                            if (isLiveReady) {
                                CircleActionButton(
                                    onClick = resetToLiveCamera,
                                    size = 36.dp,
                                    containerColor = Brand,
                                    borderColor = BrandLavender,
                                ) {
                                    Icon(Icons.Rounded.Refresh, contentDescription = "Chụp lại", tint = Color.White, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }

                    if (busyCapture) {
                        ChainaStrokeLoading(
                            mode = ChainaLoadingMode.OVERLAY,
                            size = ChainaLoadingSize.SM,
                            background = ChainaLoadingBackground.DARK,
                            message = "Đang quét chữ Hán…",
                        )
                    }
                }
            } else if (!hasCameraHardware || cameraInitError != null) {
                // Camera hardware unavailable fallback
                CameraPermissionOrFallbackCard(
                    title = if (!hasCameraHardware) "Thiết bị không có máy ảnh" else "Không thể mở máy ảnh",
                    desc = cameraInitError ?: "Bạn vẫn có thể chọn ảnh có chữ tiếng Trung từ thư viện hoặc nhập chữ để Google Dịch sang tiếng Việt.",
                    primaryLabel = "Chọn ảnh từ máy",
                    onPrimaryClick = {
                        galleryLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                    },
                    secondaryLabel = "Nhập chữ Trung",
                    onSecondaryClick = {
                        isEditingSource = true
                    },
                )
            } else if (!hasCameraPermission) {
                CameraPermissionOrFallbackCard(
                    title = "Cần quyền dùng Máy ảnh",
                    desc = "Cho phép Chaina truy cập máy ảnh để quét chữ Hán trên sách, thực đơn, biển hiệu và dịch ngay sang tiếng Việt.",
                    primaryLabel = "Cấp quyền Máy ảnh",
                    onPrimaryClick = { permissionLauncher.launch(Manifest.permission.CAMERA) },
                    secondaryLabel = "Chọn ảnh từ máy",
                    onSecondaryClick = {
                        galleryLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                    },
                )
            } else {
                // Live viewfinder overlays (PreviewView is already mounted above)
                // Bounding box + subtle scan corner reticle Canvas
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val cornerLen = 22.dp.toPx()
                    val strokeW = 2.5.dp.toPx()
                    val insetX = size.width * 0.12f
                    val insetTop = size.height * 0.18f
                    val insetBottom = size.height * 0.24f
                    val rightX = size.width - insetX
                    val bottomY = size.height - insetBottom
                    val reticleColor = Color.White.copy(alpha = 0.65f)

                    // Top-left corner
                    drawLine(reticleColor, Offset(insetX, insetTop), Offset(insetX + cornerLen, insetTop), strokeW, StrokeCap.Round)
                    drawLine(reticleColor, Offset(insetX, insetTop), Offset(insetX, insetTop + cornerLen), strokeW, StrokeCap.Round)
                    // Top-right corner
                    drawLine(reticleColor, Offset(rightX, insetTop), Offset(rightX - cornerLen, insetTop), strokeW, StrokeCap.Round)
                    drawLine(reticleColor, Offset(rightX, insetTop), Offset(rightX, insetTop + cornerLen), strokeW, StrokeCap.Round)
                    // Bottom-left corner
                    drawLine(reticleColor, Offset(insetX, bottomY), Offset(insetX + cornerLen, bottomY), strokeW, StrokeCap.Round)
                    drawLine(reticleColor, Offset(insetX, bottomY), Offset(insetX, bottomY - cornerLen), strokeW, StrokeCap.Round)
                    // Bottom-right corner
                    drawLine(reticleColor, Offset(rightX, bottomY), Offset(rightX - cornerLen, bottomY), strokeW, StrokeCap.Round)
                    drawLine(reticleColor, Offset(rightX, bottomY), Offset(rightX, bottomY - cornerLen), strokeW, StrokeCap.Round)

                    // Highlight detected Chinese blocks from ML Kit
                    liveBlocks.forEach { block ->
                        val rect = block.box
                        if (rect.width() > 0 && rect.height() > 0) {
                            drawRoundRect(
                                color = Brand.copy(alpha = 0.20f),
                                topLeft = Offset(rect.left.toFloat(), rect.top.toFloat()),
                                size = Size(rect.width().toFloat(), rect.height().toFloat()),
                                cornerRadius = CornerRadius(10f, 10f),
                            )
                            drawRoundRect(
                                color = BrandLavender,
                                topLeft = Offset(rect.left.toFloat(), rect.top.toFloat()),
                                size = Size(rect.width().toFloat(), rect.height().toFloat()),
                                cornerRadius = CornerRadius(10f, 10f),
                                style = Stroke(width = 1.8.dp.toPx()),
                            )
                        }
                    }
                }

                // Top floating status + quick tools inside camera frame
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp)
                        .align(Alignment.TopCenter),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Surface(
                        shape = CircleShape,
                        color = Color.Black.copy(alpha = 0.58f),
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(7.dp)
                                    .clip(CircleShape)
                                    .background(if (liveBlocks.isNotEmpty()) BrandLavender else Color.White.copy(alpha = 0.45f)),
                            )
                            Text(
                                text = if (liveBlocks.isNotEmpty()) "Thấy ${liveBlocks.size} cụm chữ Hán" else "Hướng camera vào chữ Trung...",
                                color = Color.White,
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.Medium,
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (hasFlashUnit) {
                            CircleActionButton(
                                onClick = {
                                    val next = !torchOn
                                    runCatching { cameraController.enableTorch(next) }
                                    torchOn = next
                                },
                                size = 36.dp,
                                containerColor = if (torchOn) Brand else Color.Black.copy(alpha = 0.58f),
                                borderColor = Color.White.copy(alpha = 0.25f),
                            ) {
                                Icon(
                                    imageVector = if (torchOn) Icons.Rounded.FlashOn else Icons.Rounded.FlashOff,
                                    contentDescription = "Đèn flash",
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp),
                                )
                            }
                        }

                        CircleActionButton(
                            onClick = {
                                galleryLauncher.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly))
                            },
                            size = 36.dp,
                            containerColor = Color.Black.copy(alpha = 0.58f),
                            borderColor = Color.White.copy(alpha = 0.25f),
                        ) {
                            Icon(Icons.Rounded.PhotoLibrary, contentDescription = "Chọn ảnh thư viện", tint = Color.White, modifier = Modifier.size(18.dp))
                        }

                        CircleActionButton(
                            onClick = { isEditingSource = true },
                            size = 36.dp,
                            containerColor = Color.Black.copy(alpha = 0.58f),
                            borderColor = Color.White.copy(alpha = 0.25f),
                        ) {
                            Icon(Icons.Rounded.Edit, contentDescription = "Nhập chữ Trung", tint = Color.White, modifier = Modifier.size(17.dp))
                        }
                    }
                }

                // Bottom centered Shutter & Instant Scan bar
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 14.dp)
                        .align(Alignment.BottomCenter),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Surface(
                        modifier = Modifier
                            .clip(CircleShape)
                            .clickable(enabled = !busyCapture, onClick = triggerCapture),
                        shape = CircleShape,
                        color = PaperPure,
                        border = BorderStroke(2.dp, BrandLavender),
                        shadowElevation = 6.dp,
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            if (busyCapture) {
                                ChainaStrokeLoading(
                                    mode = ChainaLoadingMode.COMPACT,
                                    widthDp = 52.dp,
                                    background = ChainaLoadingBackground.LIGHT,
                                )
                            } else {
                                Icon(Icons.Rounded.CameraAlt, contentDescription = null, tint = BrandDark, modifier = Modifier.size(20.dp))
                            }
                            Text(
                                text = if (busyCapture) "Đang quét..." else "Chụp & Dịch",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = InkBlack,
                            )
                        }
                    }
                }
            }
        }

        // 3. Clickable detected Chinese block chips when viewing frozen/gallery image
        if (capturedBitmap != null && photoBlocks.size > 1) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                val allSelected = selectedBlockIndex == -1
                Surface(
                    modifier = Modifier
                        .clip(CircleShape)
                        .clickable {
                            selectedBlockIndex = -1
                            runTranslation(
                                chinese = photoBlocks.joinToString("\n") { it.text },
                                label = if (capturedFromGallery) "Thư viện" else "Ảnh chụp",
                            )
                        },
                    shape = CircleShape,
                    color = if (allSelected) InkBlack else PaperPure,
                    border = BorderStroke(1.dp, if (allSelected) InkBlack else InkBorder),
                ) {
                    Text(
                        text = "Tất cả (${photoBlocks.size})",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (allSelected) Color.White else InkBlack,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                    )
                }

                photoBlocks.forEachIndexed { idx, block ->
                    val selected = selectedBlockIndex == idx
                    Surface(
                        modifier = Modifier
                            .clip(CircleShape)
                            .clickable {
                                selectedBlockIndex = idx
                                runTranslation(
                                    chinese = block.text,
                                    label = if (capturedFromGallery) "Thư viện" else "Vùng chọn",
                                )
                            },
                        shape = CircleShape,
                        color = if (selected) BrandSoft else PaperPure,
                        border = BorderStroke(1.dp, if (selected) BrandBorder else InkBorder),
                    ) {
                        Text(
                            text = block.text.replace('\n', ' ').take(16),
                            fontSize = 12.sp,
                            fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                            color = if (selected) BrandDark else InkBlack,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp),
                        )
                    }
                }
            }
        }

        if (busyTranslate) {
            ChainaStrokeLoading(
                mode = ChainaLoadingMode.INLINE,
                size = ChainaLoadingSize.SM,
                message = "Đang dịch sang tiếng Việt…",
            )
        }

        copyBanner?.let { banner ->
            Surface(
                shape = CircleShape,
                color = JadeSoft,
                border = BorderStroke(1.dp, JadeBorder),
                modifier = Modifier.align(Alignment.CenterHorizontally),
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Icon(Icons.Rounded.Check, contentDescription = null, tint = JadeGreen, modifier = Modifier.size(15.dp))
                    Text(banner, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = JadeGreen)
                }
            }
        }

        translateError?.let { err ->
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = RedSoft,
                shape = RoundedCornerShape(16.dp),
                border = BorderStroke(1.dp, RedBorder),
            ) {
                Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(err, color = RedBad, fontSize = 12.5.sp, fontWeight = FontWeight.Medium)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        if (editableSource.containsHanzi()) {
                            OutlinedButton(
                                onClick = { runTranslation(editableSource, activeSourceLabel) },
                                shape = CircleShape,
                                border = BorderStroke(1.dp, RedBorder),
                            ) {
                                Text("Thử dịch lại", color = RedBad, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                        OutlinedButton(
                            onClick = { isEditingSource = true },
                            shape = CircleShape,
                            border = BorderStroke(1.dp, InkBorder),
                        ) {
                            Text("Nhập chữ Trung", color = InkBlack, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        }
                    }
                }
            }
        }

        // 4. Translation Result / Manual Edit Card
        if (isEditingSource) {
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 22.dp) {
                Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        "Chỉnh sửa / Nhập chữ tiếng Trung",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = InkBlack,
                    )
                    OutlinedTextField(
                        value = editableSource,
                        onValueChange = { editableSource = it },
                        modifier = Modifier.fillMaxWidth(),
                        minLines = 2,
                        maxLines = 5,
                        shape = RoundedCornerShape(14.dp),
                        placeholder = { Text("Dán hoặc nhập chữ Hán (简体/繁體)...", fontSize = 13.sp, color = InkLight) },
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = BrandBorder,
                            unfocusedBorderColor = InkBorder,
                            focusedContainerColor = PaperMuted,
                            unfocusedContainerColor = PaperPure,
                        ),
                    )
                    Text(
                        "Hệ thống chỉ dịch văn bản tiếng Trung sang tiếng Việt qua Google Dịch miễn phí.",
                        fontSize = 11.5.sp,
                        color = InkMuted,
                    )
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedButton(
                            onClick = { isEditingSource = false },
                            modifier = Modifier.weight(0.35f).height(48.dp),
                            shape = RoundedCornerShape(14.dp),
                            border = BorderStroke(1.dp, InkBorder),
                        ) {
                            Text("Đóng", color = InkMuted, fontWeight = FontWeight.SemiBold)
                        }
                        InkPrimaryButton(
                            text = "Dịch sang Tiếng Việt",
                            onClick = { runTranslation(editableSource, label = "Nhập tay", syncEditBox = false) },
                            loading = busyTranslate,
                            enabled = editableSource.containsHanzi(),
                            modifier = Modifier.weight(0.65f),
                        )
                    }
                }
            }
        } else if (translationResult != null) {
            val res = translationResult!!
            val lookupCandidate = remember(res.sourceZh) { extractDictionaryLookupCandidate(res.sourceZh) }

            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 22.dp) {
                Column(Modifier.padding(18.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = BrandSoft,
                                border = BorderStroke(1.dp, BrandBorder),
                            ) {
                                Text(
                                    text = activeSourceLabel,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = BrandDark,
                                    modifier = Modifier.padding(horizontal = 9.dp, vertical = 3.dp),
                                )
                            }
                            Surface(
                                shape = CircleShape,
                                color = PaperMuted,
                            ) {
                                Text(
                                    text = "Google Dịch",
                                    fontSize = 10.5.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = InkMuted,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp),
                                )
                            }
                        }

                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            CircleActionButton(
                                onClick = {
                                    tts.language = Locale.SIMPLIFIED_CHINESE
                                    tts.speak(res.sourceZh, TextToSpeech.QUEUE_FLUSH, null, "cam-translate-tts")
                                },
                                size = 36.dp,
                                containerColor = BrandSoft,
                                borderColor = BrandBorder,
                            ) {
                                Icon(Icons.AutoMirrored.Rounded.VolumeUp, contentDescription = "Nghe tiếng Trung", tint = BrandDark, modifier = Modifier.size(18.dp))
                            }
                            CircleActionButton(
                                onClick = {
                                    copyTextToClipboard(context, "Bản dịch Tiếng Việt", res.translatedVi)
                                    copyBanner = "Đã sao chép bản dịch Tiếng Việt"
                                },
                                size = 36.dp,
                                containerColor = PaperMuted,
                                borderColor = InkBorder,
                            ) {
                                Icon(Icons.Rounded.ContentCopy, contentDescription = "Sao chép bản dịch", tint = InkBlack, modifier = Modifier.size(17.dp))
                            }
                            CircleActionButton(
                                onClick = {
                                    editableSource = res.sourceZh
                                    isEditingSource = true
                                },
                                size = 36.dp,
                                containerColor = PaperMuted,
                                borderColor = InkBorder,
                            ) {
                                Icon(Icons.Rounded.Edit, contentDescription = "Chỉnh sửa chữ Hán", tint = InkBlack, modifier = Modifier.size(17.dp))
                            }
                        }
                    }

                    // Source Chinese + Pinyin
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "TIẾNG TRUNG NHẬN DIỆN",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = InkMuted,
                            letterSpacing = 0.8.sp,
                        )
                        SelectionContainer {
                            Text(
                                text = res.sourceZh,
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = InkBlack,
                                lineHeight = 28.sp,
                            )
                        }
                        if (res.pinyin.isNotBlank()) {
                            SelectionContainer {
                                Text(
                                    text = res.pinyin,
                                    fontSize = 13.5.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = BrandDark,
                                    lineHeight = 19.sp,
                                )
                            }
                        }
                    }

                    HorizontalDivider(color = InkBorder.copy(alpha = 0.7f))

                    // Vietnamese Translation
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            text = "NGHĨA TIẾNG VIỆT",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = JadeGreen,
                            letterSpacing = 0.8.sp,
                        )
                        SelectionContainer {
                            Text(
                                text = res.translatedVi,
                                fontSize = 17.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = InkBlack,
                                lineHeight = 25.sp,
                            )
                        }
                    }

                    // Quick Chaina Dictionary + Copy Chinese Row
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(top = 2.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        if (lookupCandidate != null) {
                            Surface(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(12.dp))
                                    .clickable { onLookupWord(lookupCandidate) },
                                shape = RoundedCornerShape(12.dp),
                                color = BrandSoft,
                                border = BorderStroke(1.dp, BrandBorder),
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                ) {
                                    Text(
                                        text = "Tra \"$lookupCandidate\" trong Chaina",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = BrandDark,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis,
                                        modifier = Modifier.weight(1f),
                                    )
                                    ArrowUpRightIcon(tint = BrandDark, modifier = Modifier.size(14.dp))
                                }
                            }
                        }

                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable {
                                    copyTextToClipboard(context, "Chữ Hán", res.sourceZh)
                                    copyBanner = "Đã sao chép chữ Hán"
                                },
                            shape = RoundedCornerShape(12.dp),
                            color = PaperMuted,
                            border = BorderStroke(1.dp, InkBorder),
                        ) {
                            Text(
                                text = "Chép chữ Hán",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = InkBlack,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp),
                            )
                        }
                    }
                }
            }
        } else if (!busyCapture && !busyTranslate && translateError == null) {
            InkCard(modifier = Modifier.fillMaxWidth(), shapeRadius = 20.dp) {
                Column(
                    Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Text("Cách dùng Dịch Camera", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = InkBlack)
                    Text(
                        "• Hướng camera vào sách, bảng hiệu hoặc thực đơn tiếng Trung rồi bấm \"Chụp & Dịch\".\n" +
                            "• Hoặc bật \"Tự dịch\" để máy tự dịch khi bạn giữ camera ổn định (~1 giây).\n" +
                            "• Chọn biểu tượng ảnh để dịch từ ảnh chụp màn hình trong máy.",
                        fontSize = 12.5.sp,
                        color = InkMuted,
                        lineHeight = 19.sp,
                    )
                }
            }
        }

        // 5. Recent Session History
        if (history.isNotEmpty()) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    "Vừa quét gần đây",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = InkBlack,
                )
                history.forEach { item ->
                    InkCard(
                        modifier = Modifier.fillMaxWidth(),
                        shapeRadius = 18.dp,
                        onClick = {
                            translationResult = item.result
                            activeSourceLabel = item.sourceLabel
                            editableSource = item.result.sourceZh
                            translateError = null
                            isEditingSource = false
                        },
                    ) {
                        Column(Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(
                                    text = item.result.sourceZh.replace('\n', ' '),
                                    fontSize = 14.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = InkBlack,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                    modifier = Modifier.weight(1f).padding(end = 8.dp),
                                )
                                Text(
                                    text = item.sourceLabel,
                                    fontSize = 10.5.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = BrandDark,
                                )
                            }
                            Text(
                                text = item.result.translatedVi.replace('\n', ' '),
                                fontSize = 12.5.sp,
                                color = InkMuted,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                            )
                        }
                    }
                }
            }
        }

        Spacer(Modifier.height(12.dp))
    }
}

@Composable
private fun CameraPermissionOrFallbackCard(
    title: String,
    desc: String,
    primaryLabel: String,
    onPrimaryClick: () -> Unit,
    secondaryLabel: String,
    onSecondaryClick: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Surface(
            shape = CircleShape,
            color = Brand.copy(alpha = 0.24f),
            border = BorderStroke(1.dp, BrandLavender.copy(alpha = 0.6f)),
            modifier = Modifier.size(54.dp),
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(Icons.Rounded.CameraAlt, contentDescription = null, tint = Color.White, modifier = Modifier.size(26.dp))
            }
        }
        Spacer(Modifier.height(12.dp))
        Text(title, color = Color.White, fontSize = 17.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
        Spacer(Modifier.height(6.dp))
        Text(
            desc,
            color = Color.White.copy(alpha = 0.78f),
            fontSize = 12.5.sp,
            lineHeight = 18.sp,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            InkPrimaryButton(
                text = primaryLabel,
                onClick = onPrimaryClick,
                modifier = Modifier.weight(1f),
            )
            OutlinedButton(
                onClick = onSecondaryClick,
                modifier = Modifier.weight(1f).height(50.dp),
                shape = RoundedCornerShape(14.dp),
                border = BorderStroke(1.dp, Color.White.copy(alpha = 0.35f)),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
            ) {
                Text(secondaryLabel, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
        }
    }
}

private fun extractChineseBlocks(visionText: Text): List<DetectedChineseBlock> {
    return visionText.textBlocks.mapNotNull { block ->
        val filtered = filterChineseOcrLines(block.text)
        if (filtered.isBlank() || !filtered.containsHanzi()) return@mapNotNull null
        val rect = block.boundingBox ?: Rect()
        DetectedChineseBlock(filtered, rect)
    }
}

private suspend fun <T> com.google.android.gms.tasks.Task<T>.awaitTask(): T =
    suspendCancellableCoroutine { cont ->
        addOnSuccessListener { result ->
            if (cont.isActive) cont.resume(result)
        }
        addOnFailureListener { exc ->
            if (cont.isActive) cont.resumeWithException(exc)
        }
        addOnCanceledListener {
            cont.cancel()
        }
    }

private fun imageProxyToScaledBitmap(image: ImageProxy, maxDim: Int): Bitmap {
    val raw = image.toBitmap()
    val rot = image.imageInfo.rotationDegrees
    val rotated = if (rot != 0) {
        val m = Matrix().apply { postRotate(rot.toFloat()) }
        Bitmap.createBitmap(raw, 0, 0, raw.width, raw.height, m, true).also {
            if (it !== raw) raw.recycle()
        }
    } else {
        raw
    }
    return downscaleBitmap(rotated, maxDim)
}

private fun downscaleBitmap(src: Bitmap, maxDim: Int): Bitmap {
    val maxSide = maxOf(src.width, src.height)
    if (maxSide <= maxDim) return src
    val scale = maxDim.toFloat() / maxSide.toFloat()
    val dstW = (src.width * scale).roundToInt().coerceAtLeast(1)
    val dstH = (src.height * scale).roundToInt().coerceAtLeast(1)
    return Bitmap.createScaledBitmap(src, dstW, dstH, true).also {
        if (it !== src) src.recycle()
    }
}

private fun decodeScaledBitmapFromUri(context: Context, uri: Uri, maxDim: Int): Bitmap? {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
        val source = ImageDecoder.createSource(context.contentResolver, uri)
        return ImageDecoder.decodeBitmap(source) { decoder, info, _ ->
            decoder.allocator = ImageDecoder.ALLOCATOR_SOFTWARE
            val maxSide = maxOf(info.size.width, info.size.height)
            if (maxSide > maxDim) {
                val scale = maxDim.toFloat() / maxSide.toFloat()
                decoder.setTargetSize(
                    (info.size.width * scale).roundToInt().coerceAtLeast(1),
                    (info.size.height * scale).roundToInt().coerceAtLeast(1),
                )
            }
        }
    }

    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    var sampleSize = 1
    val maxSide = maxOf(bounds.outWidth, bounds.outHeight)
    while (maxSide / sampleSize > maxDim * 2) sampleSize *= 2

    val opts = BitmapFactory.Options().apply { inSampleSize = sampleSize }
    val decoded = context.contentResolver.openInputStream(uri)?.use {
        BitmapFactory.decodeStream(it, null, opts)
    } ?: return null

    val orientation = context.contentResolver.openInputStream(uri)?.use { stream ->
        runCatching { ExifInterface(stream).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL) }
            .getOrDefault(ExifInterface.ORIENTATION_NORMAL)
    } ?: ExifInterface.ORIENTATION_NORMAL

    val matrix = Matrix()
    when (orientation) {
        ExifInterface.ORIENTATION_ROTATE_90 -> matrix.postRotate(90f)
        ExifInterface.ORIENTATION_ROTATE_180 -> matrix.postRotate(180f)
        ExifInterface.ORIENTATION_ROTATE_270 -> matrix.postRotate(270f)
        ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.preScale(-1f, 1f)
        ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.preScale(1f, -1f)
    }

    val oriented = if (!matrix.isIdentity) {
        Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.height, matrix, true).also {
            if (it !== decoded) decoded.recycle()
        }
    } else {
        decoded
    }
    return downscaleBitmap(oriented, maxDim)
}

private fun copyTextToClipboard(context: Context, label: String, text: String) {
    val cm = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
    cm.setPrimaryClip(ClipData.newPlainText(label, text))
}
