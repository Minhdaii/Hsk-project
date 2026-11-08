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
    val streak: Int,
    val xp: Int,
) {
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
            streak = json.optInt("streak"),
            xp = json.optInt("xp"),
        )
    }
}

data class Stats(val due: Int, val learned: Int, val xp: Int, val streak: Int, val studiedToday: Boolean) {
    companion object {
        fun from(json: JSONObject) = Stats(
            due = json.optInt("due"), learned = json.optInt("learned"), xp = json.optInt("xp"),
            streak = json.optInt("streak"), studiedToday = json.optBoolean("studiedToday"),
        )
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
            id = json.optInt("id"), hanzi = json.optString("hanzi"), pinyin = json.optString("pinyin"),
            meaningVi = json.optString("meaningVi", json.optString("meaningEn")), hskLevel = json.optInt("hskLevel"),
            hanviet = json.nullableString("hanviet"),
        )
    }
}

data class StudyOption(val text: String, val correct: Boolean)
data class StudyCard(val word: Word, val options: List<StudyOption>, val retry: Boolean = false)
data class QuizQuestion(val word: Word, val options: List<Word>)

internal fun JSONObject.nullableString(key: String): String? = if (isNull(key)) null else optString(key).takeIf(String::isNotBlank)
internal fun JSONObject.nullableInt(key: String): Int? = if (isNull(key) || !has(key)) null else optInt(key)
