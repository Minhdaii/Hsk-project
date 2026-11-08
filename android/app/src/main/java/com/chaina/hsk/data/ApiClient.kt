package com.chaina.hsk.data

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URLEncoder
import java.net.URL

class ApiException(message: String, val status: Int) : Exception(message)

class ApiClient(baseUrl: String, private val tokens: TokenStore) {
    private val base = baseUrl.trimEnd('/')

    suspend fun login(identifier: String, password: String): Pair<String, User> {
        val result = request("/auth/login", "POST", JSONObject().put("identifier", identifier).put("password", password), authenticated = false)
        return result.getString("accessToken") to User.from(result.getJSONObject("user"))
    }

    suspend fun register(email: String, username: String, fullName: String, chineseName: String?, age: Int?, password: String): Pair<String, User> {
        val body = JSONObject().put("email", email).put("username", username).put("fullName", fullName).put("password", password)
        chineseName?.let { body.put("chineseName", it) }
        age?.let { body.put("age", it) }
        val result = request("/auth/register", "POST", body, authenticated = false)
        return result.getString("accessToken") to User.from(result.getJSONObject("user"))
    }

    suspend fun me(): User = User.from(request("/auth/me").getJSONObjectOrSelf())

    suspend fun updateProfile(body: JSONObject): User = User.from(request("/auth/me", "PATCH", body).getJSONObjectOrSelf())

    suspend fun stats(): Stats = Stats.from(request("/study/stats"))

    suspend fun levels(): List<LevelProgress> {
        val rows = request("/study/levels").optJSONArray("levels") ?: JSONArray()
        return (0 until rows.length()).map { index -> rows.getJSONObject(index).let { LevelProgress(it.optInt("level"), it.optInt("total"), it.optInt("started"), it.optInt("mastered")) } }
    }

    suspend fun words(level: Int, query: String): List<Word> {
        val q = URLEncoder.encode(query.trim(), Charsets.UTF_8.name())
        val result = request("/words?level=$level&q=$q&page=1&limit=50", authenticated = false)
        val rows = result.optJSONArray("items") ?: JSONArray()
        return (0 until rows.length()).map { Word.from(rows.getJSONObject(it)) }
    }

    suspend fun dailyWord(): Word? {
        val result = request("/words/daily", authenticated = false)
        return result.optJSONObject("word")?.let(Word::from)
    }

    suspend fun categoryTree(): JSONArray = request("/categories", authenticated = false).optJSONArray("items") ?: JSONArray()

    suspend fun category(slug: String): JSONObject = request("/categories/${URLEncoder.encode(slug, Charsets.UTF_8.name())}", authenticated = false)

    suspend fun categoryWords(slug: String, level: Int = 0, query: String = ""): JSONArray {
        val q = URLEncoder.encode(query.trim(), Charsets.UTF_8.name())
        val path = "/categories/${URLEncoder.encode(slug, Charsets.UTF_8.name())}/words?level=$level&q=$q&page=1&limit=50"
        return request(path, authenticated = false).optJSONArray("items") ?: JSONArray()
    }

    suspend fun grammar(level: Int = 0): JSONArray = request("/grammar${if (level == 0) "" else "?level=$level"}").optJSONArray("items") ?: JSONArray()

    suspend fun grammarDetail(slug: String): JSONObject = request("/grammar/${URLEncoder.encode(slug, Charsets.UTF_8.name())}")

    suspend fun setGrammarProgress(id: Int, field: String, value: Boolean): JSONObject = request(
        "/grammar/$id/progress", "PUT", JSONObject().put(field, value),
    )

    suspend fun grammarExercises(type: String, level: Int, grammarId: Int = 0, count: Int = 10): JSONArray {
        val path = "/grammar/exercises?type=$type&level=$level&grammarId=$grammarId&count=$count"
        return request(path).optJSONArray("questions") ?: JSONArray()
    }

    suspend fun gradeGrammar(body: JSONObject): JSONObject = request("/grammar/exercises/answer", "POST", body)

    suspend fun favorites(): JSONArray = request("/favorites").optJSONArray("items") ?: JSONArray()

    suspend fun setFavorite(wordId: Int, favorite: Boolean): JSONObject = request(
        "/favorites/$wordId", if (favorite) "POST" else "DELETE",
    )

    suspend fun activity(): JSONObject = request("/study/activity")

    suspend fun leaderboard(): JSONArray = request("/leaderboard", authenticated = false).optJSONArray("items") ?: JSONArray()

    suspend fun exerciseCloze(level: Int, count: Int): JSONArray = request(
        "/exercises/cloze?level=$level&count=$count", authenticated = false,
    ).optJSONArray("questions") ?: JSONArray()

    suspend fun exerciseOrder(level: Int, count: Int): JSONArray = request(
        "/exercises/order?level=$level&count=$count", authenticated = false,
    ).optJSONArray("questions") ?: JSONArray()

    suspend fun recognize(image: String): JSONObject = request(
        "/recognize", "POST", JSONObject().put("image", image), authenticated = false,
    )

    suspend fun studySession(level: Int): List<StudyCard> {
        val rows = request("/study/session?level=$level").optJSONArray("cards") ?: JSONArray()
        return (0 until rows.length()).map { index ->
            val card = rows.getJSONObject(index)
            val word = Word.from(card.getJSONObject("word"))
            val optionsJson = card.optJSONArray("options") ?: JSONArray()
            val options = (0 until optionsJson.length()).map { optionIndex ->
                optionsJson.getJSONObject(optionIndex).let { StudyOption(it.optString("text"), it.optBoolean("correct")) }
            }
            StudyCard(word, options)
        }
    }

    suspend fun quiz(level: Int, count: Int = 10): List<QuizQuestion> {
        val rows = request("/quiz?level=$level&count=$count", authenticated = false).optJSONArray("questions") ?: JSONArray()
        return (0 until rows.length()).map { index ->
            val question = rows.getJSONObject(index)
            val word = Word.from(question.getJSONObject("word"))
            val options = question.optJSONArray("options") ?: JSONArray()
            QuizQuestion(word, (0 until options.length()).map { Word.from(options.getJSONObject(it)) })
        }
    }

    suspend fun review(wordId: Int, rating: Int): JSONObject = request("/study/review", "POST", JSONObject().put("wordId", wordId).put("rating", rating))

    suspend fun changePassword(currentPassword: String, newPassword: String): JSONObject = request(
        "/auth/change-password", "POST", JSONObject().put("currentPassword", currentPassword).put("newPassword", newPassword),
    )

    private suspend fun request(path: String, method: String = "GET", body: JSONObject? = null, authenticated: Boolean = true): JSONObject = withContext(Dispatchers.IO) {
        val connection = (URL(base + path).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 12_000
            readTimeout = 15_000
            setRequestProperty("Accept", "application/json")
            if (authenticated) tokens.read()?.let { setRequestProperty("Authorization", "Bearer $it") }
            if (body != null) {
                doOutput = true
                setRequestProperty("Content-Type", "application/json; charset=utf-8")
            }
        }
        try {
            if (body != null) connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            val code = connection.responseCode
            val stream = if (code in 200..299) connection.inputStream else connection.errorStream
            val text = stream?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }.orEmpty()
            val json = runCatching { JSONObject(text) }.getOrElse { JSONObject() }
            if (code !in 200..299) {
                val error = json.opt("message")
                val message = if (error is JSONArray) (0 until error.length()).joinToString(", ") { error.optString(it) } else error?.toString()
                throw ApiException(message?.takeIf(String::isNotBlank) ?: "Máy chủ trả lỗi $code", code)
            }
            json
        } catch (error: ApiException) {
            throw error
        } catch (error: Exception) {
            throw ApiException(error.message?.takeIf(String::isNotBlank) ?: "Không kết nối được máy chủ. Hãy kiểm tra mạng và backend.", 0)
        } finally {
            connection.disconnect()
        }
    }

    private fun JSONObject.getJSONObjectOrSelf(): JSONObject = optJSONObject("user") ?: this
}
