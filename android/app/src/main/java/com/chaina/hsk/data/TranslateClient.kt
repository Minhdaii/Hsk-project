package com.chaina.hsk.data

import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.ensureActive
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class TranslationResult(
    val sourceZh: String,
    val pinyin: String,
    val translatedVi: String,
    val cached: Boolean = false,
)

fun Char.isHanzi(): Boolean {
    val code = this.code
    return (code in 0x4E00..0x9FFF) ||
        (code in 0x3400..0x4DBF) ||
        (code in 0xF900..0xFAFF)
}

fun String.containsHanzi(): Boolean = any { it.isHanzi() }

/**
 * Keeps only lines containing Chinese characters (Hanzi), filtering out pure English/Latin/number noise
 * while preserving inline numbers or punctuation inside Chinese phrases (e.g. "咖啡 25元").
 */
fun filterChineseOcrLines(rawText: String): String {
    return rawText
        .replace("\r\n", "\n")
        .lineSequence()
        .map { line -> line.replace(Regex("[\\t ]+"), " ").trim() }
        .filter { line -> line.isNotBlank() && line.containsHanzi() }
        .joinToString("\n")
}

/**
 * Extracts a short clean Chinese word/phrase candidate for one-tap dictionary lookup in Chaina.
 */
fun extractDictionaryLookupCandidate(chineseText: String): String? {
    val firstRun = Regex("[\\u4E00-\\u9FFF\\u3400-\\u4DBF\\uF900-\\uFAFF]+")
        .find(chineseText)
        ?.value
        ?: return null
    return firstRun.take(8).takeIf { it.isNotBlank() }
}

/**
 * Free Google Translate client strictly locked to Chinese (Simplified/Traditional) -> Vietnamese.
 */
object TranslateClient {
    private val cacheLock = Any()
    private val lruCache = object : LinkedHashMap<String, TranslationResult>(80, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, TranslationResult>?): Boolean = size > 80
    }

    suspend fun translateZhToVi(chineseText: String): TranslationResult = withContext(Dispatchers.IO) {
        val cleaned = filterChineseOcrLines(chineseText).ifBlank { chineseText.trim() }
            .take(1800)
            .trim()

        if (cleaned.isBlank() || !cleaned.containsHanzi()) {
            throw ApiException("Không phát hiện chữ tiếng Trung để dịch. Hãy chọn hoặc quét vùng có chữ Hán.", 400)
        }

        synchronized(cacheLock) {
            lruCache[cleaned]
        }?.let { hit ->
            return@withContext hit.copy(cached = true)
        }

        val endpoint = "https://translate.googleapis.com/translate_a/single" +
            "?client=gtx&sl=zh-CN&tl=vi&dt=t&dt=rm&dj=1"
        val payload = "q=${URLEncoder.encode(cleaned, Charsets.UTF_8.name())}"

        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = "POST"
            connectTimeout = 10_000
            readTimeout = 12_000
            doOutput = true
            setRequestProperty("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8")
            setRequestProperty("Accept", "application/json")
            setRequestProperty(
                "User-Agent",
                "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
            )
        }

        val completionHandle = coroutineContext[Job]?.invokeOnCompletion { cause ->
            if (cause != null) runCatching { connection.disconnect() }
        }

        try {
            connection.outputStream.use { it.write(payload.toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val body = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()

            if (code == 429) {
                throw ApiException("Google Dịch đang giới hạn lượt truy cập tạm thời. Vui lòng đợi vài giây rồi thử lại.", 429)
            }
            if (code !in 200..299) {
                throw ApiException("Google Dịch trả lỗi ($code). Vui lòng kiểm tra kết nối mạng và thử lại.", code)
            }

            val result = parseGoogleTranslateResponse(cleaned, body)
            synchronized(cacheLock) {
                lruCache[cleaned] = result
            }
            result
        } catch (e: CancellationException) {
            throw e
        } catch (e: ApiException) {
            throw e
        } catch (e: Exception) {
            coroutineContext.ensureActive()
            throw ApiException("Không kết nối được Google Dịch. Hãy kiểm tra Wi-Fi hoặc 4G.", 0)
        } finally {
            completionHandle?.dispose()
            connection.disconnect()
        }
    }

    private fun parseGoogleTranslateResponse(sourceZh: String, rawJson: String): TranslationResult {
        val trimmed = rawJson.trim()
        val transBuilder = StringBuilder()
        val pinyinBuilder = StringBuilder()

        if (trimmed.startsWith("{")) {
            val obj = JSONObject(trimmed)
            val sentences = obj.optJSONArray("sentences")
            if (sentences != null) {
                for (i in 0 until sentences.length()) {
                    val item = sentences.optJSONObject(i) ?: continue
                    if (!item.isNull("trans")) {
                        transBuilder.append(item.optString("trans"))
                    }
                    if (!item.isNull("src_translit")) {
                        val segPinyin = item.optString("src_translit").trim()
                        if (segPinyin.isNotBlank()) {
                            if (pinyinBuilder.isNotEmpty()) pinyinBuilder.append(" ")
                            pinyinBuilder.append(segPinyin)
                        }
                    }
                }
            }
        } else if (trimmed.startsWith("[")) {
            val root = JSONArray(trimmed)
            val rows = root.optJSONArray(0)
            if (rows != null) {
                for (i in 0 until rows.length()) {
                    val seg = rows.optJSONArray(i) ?: continue
                    if (!seg.isNull(0)) {
                        transBuilder.append(seg.optString(0))
                    }
                    if (!seg.isNull(3)) {
                        val segPinyin = seg.optString(3).trim()
                        if (segPinyin.isNotBlank()) {
                            if (pinyinBuilder.isNotEmpty()) pinyinBuilder.append(" ")
                            pinyinBuilder.append(segPinyin)
                        }
                    }
                }
            }
        }

        val translated = transBuilder.toString().trim()
        if (translated.isBlank()) {
            throw ApiException("Không nhận được bản dịch tiếng Việt từ Google Dịch.", 502)
        }

        return TranslationResult(
            sourceZh = sourceZh,
            pinyin = pinyinBuilder.toString().trim(),
            translatedVi = translated,
        )
    }
}
