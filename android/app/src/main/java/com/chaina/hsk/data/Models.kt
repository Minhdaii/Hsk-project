package com.chaina.hsk.data

import org.json.JSONObject

data class User(
    val id: Int,
    val email: String,
    val username: String,
    val fullName: String?,
    val chineseName: String?,
    val age: Int?,
    val targetHskLevel: Int?,
    val learningExperience: String?,
    val studyPurpose: String?,
    val dailyStudyMinutes: Int?,
    val avatarUrl: String? = null,
    val streak: Int,
    val xp: Int,
    val role: String = "user",
) {
    val isAdmin: Boolean get() = role.equals("admin", ignoreCase = true)

    companion object {
        fun from(json: JSONObject) = User(
            id = json.optInt("id"),
            email = json.optString("email"),
            username = json.optString("username"),
            fullName = json.nullableString("fullName"),
            chineseName = json.nullableString("chineseName"),
            age = json.nullableInt("age"),
            targetHskLevel = json.nullableInt("targetHskLevel"),
            learningExperience = json.nullableString("learningExperience"),
            studyPurpose = json.nullableString("studyPurpose"),
            dailyStudyMinutes = json.nullableInt("dailyStudyMinutes"),
            avatarUrl = json.nullableString("avatarUrl"),
            streak = json.optInt("streak"),
            xp = json.optInt("xp"),
            role = json.nullableString("role") ?: "user",
        )
    }
}

data class Stats(
    val due: Int,
    val learned: Int,
    val xp: Int,
    val streak: Int,
    val studiedToday: Boolean,
    val atRisk: Boolean = false,
    val brokenStreak: Int = 0,
) {
    companion object {
        fun from(json: JSONObject) = Stats(
            due = json.optInt("due"),
            learned = json.optInt("learned"),
            xp = json.optInt("xp"),
            streak = json.optInt("streak"),
            studiedToday = json.optBoolean("studiedToday"),
            atRisk = json.optBoolean("atRisk", false),
            brokenStreak = json.optInt("brokenStreak", 0),
        )
    }
}

data class DailyReview(val date: String, val reviews: Int)

data class ActivityData(
    val goal: Int,
    val today: Int,
    val days: List<DailyReview>,
) {
    companion object {
        fun from(json: JSONObject): ActivityData {
            val arr = json.optJSONArray("days")
            val list = buildList {
                if (arr != null) {
                    for (i in 0 until arr.length()) {
                        val obj = arr.optJSONObject(i) ?: continue
                        add(DailyReview(obj.optString("date"), obj.optInt("reviews")))
                    }
                }
            }
            return ActivityData(
                goal = json.optInt("goal", 20).coerceAtLeast(1),
                today = json.optInt("today", 0),
                days = list,
            )
        }
    }
}

data class LevelProgress(val level: Int, val total: Int, val started: Int, val mastered: Int)

data class Word(
    val id: Int,
    val hanzi: String,
    val pinyin: String,
    val meaningVi: String,
    val hskLevel: Int,
    val hanviet: String?,
) {
    companion object {
        fun from(json: JSONObject) = Word(
            id = json.optInt("id"),
            hanzi = json.optString("hanzi"),
            pinyin = json.optString("pinyin"),
            meaningVi = json.optString("meaningVi", json.optString("meaningEn")),
            hskLevel = json.optInt("hskLevel"),
            hanviet = json.nullableString("hanviet"),
        )
    }
}

data class StudyOption(val text: String, val correct: Boolean)
data class StudyCard(val word: Word, val options: List<StudyOption>, val retry: Boolean = false)
data class QuizQuestion(val word: Word, val options: List<Word>)

data class FeedbackNote(
    val id: Int,
    val category: String,
    val color: String,
    val rotation: Float,
    val posX: Float,
    val posY: Float,
    val pinType: String,
    val status: String,
    val createdAt: String,
    val isMine: Boolean,
    val author: String,
    val content: String?,
) {
    companion object {
        fun from(json: JSONObject) = FeedbackNote(
            id = json.optInt("id"),
            category = json.optString("category", "suggestion"),
            color = json.optString("color", "yellow"),
            rotation = json.optDouble("rotation", 0.0).toFloat(),
            posX = json.optDouble("posX", 50.0).toFloat(),
            posY = json.optDouble("posY", 50.0).toFloat(),
            pinType = json.optString("pinType", "tape"),
            status = json.optString("status", "pending"),
            createdAt = json.optString("createdAt", ""),
            isMine = json.optBoolean("isMine", false),
            author = json.optString("author", "Học viên"),
            content = json.nullableString("content"),
        )
    }
}

data class FeedbackBoardData(
    val totalCount: Int,
    val categoryCounts: Map<String, Int>,
    val items: List<FeedbackNote>,
) {
    companion object {
        fun from(json: JSONObject): FeedbackBoardData {
            val countsJson = json.optJSONObject("categoryCounts")
            val counts = mutableMapOf<String, Int>()
            if (countsJson != null) {
                countsJson.keys().forEach { k -> counts[k] = countsJson.optInt(k, 0) }
            }
            val arr = json.optJSONArray("items")
            val notes = buildList {
                if (arr != null) {
                    for (i in 0 until arr.length()) {
                        arr.optJSONObject(i)?.let { add(FeedbackNote.from(it)) }
                    }
                }
            }
            return FeedbackBoardData(
                totalCount = json.optInt("totalCount", notes.size),
                categoryCounts = counts,
                items = notes,
            )
        }
    }
}

data class AdminFeedbackItem(
    val id: Int,
    val category: String,
    val color: String,
    val status: String,
    val authorLabel: String,
    val authorEmail: String?,
    val content: String,
    val adminNote: String?,
    val createdAt: String,
) {
    companion object {
        fun from(json: JSONObject): AdminFeedbackItem {
            val userObj = json.optJSONObject("user")
            val username = userObj?.nullableString("username")
            val email = userObj?.nullableString("email")
            val displayName = json.nullableString("name") ?: username ?: "Học viên ẩn danh"
            return AdminFeedbackItem(
                id = json.optInt("id"),
                category = json.optString("category", "suggestion"),
                color = json.optString("color", "yellow"),
                status = json.optString("status", "pending"),
                authorLabel = displayName,
                authorEmail = email,
                content = json.optString("content", ""),
                adminNote = json.nullableString("adminNote"),
                createdAt = json.optString("createdAt", ""),
            )
        }
    }
}

internal fun JSONObject.nullableString(key: String): String? = if (isNull(key)) null else optString(key).takeIf(String::isNotBlank)
internal fun JSONObject.nullableInt(key: String): Int? = if (isNull(key) || !has(key)) null else optInt(key)
