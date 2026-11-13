package com.chaina.hsk.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ============================================================================
// CHAINA HSK WEB MOBILE DESIGN SYSTEM
// Matches frontend/app/globals.css & web mobile visual palette
// ============================================================================

val Brand = Color(0xFF7057CF)
val BrandDark = Color(0xFF5B3FD1)      // --lav-ink
val BrandLavender = Color(0xFFB8A2F8)  // --lav
val BrandSoft = Color(0xFFF0EBFF)      // --lav-soft
val BrandBorder = Color(0xFFD6CBFF)

val InkBlack = Color(0xFF292833)       // --ink
val InkCharcoal = Color(0xFF201F29)
val InkMuted = Color(0xFF6F6D7A)       // --ink-2
val InkGray = Color(0xFF6F6D7A)
val InkLight = Color(0xFF9E9BA8)

val Paper = Color(0xFFF5F4F8)          // --bg
val PaperPure = Color(0xFFFFFFFF)      // --surface
val PaperCard = Color(0xFFFFFFFF)
val PaperMuted = Color(0xFFF0EFF4)     // --muted

val Line = Color(0xFFE5E2EC)           // --line
val LineDark = Color(0xFFD3D1DC)
val InkBorder = Color(0xFFE5E2EC)
val InkBorderDark = Color(0xFFD3D1DC)

// Bento pastel card gradients (matching web dashboard ToneCards)
val ToneLavenderStart = Color(0xFFE7E1FF)
val ToneLavenderEnd = Color(0xFFCBD3FF)
val ToneSkyStart = Color(0xFFDAEEFF)
val ToneSkyEnd = Color(0xFFBFE2FB)
val ToneLimeStart = Color(0xFFEAF7C6)
val ToneLimeEnd = Color(0xFFD6F0A8)

// Soft-Pastel Bento Grid Colors (cohesive with Web #F5F4F8 & ToneCards)
val BentoLavenderStart = Color(0xFFEDE8FF)
val BentoLavenderEnd = Color(0xFFDCD3FF)
val BentoSkyStart = Color(0xFFE3F1FF)
val BentoSkyEnd = Color(0xFFCBE3FC)
val BentoLimeStart = Color(0xFFEEF8CE)
val BentoLimeEnd = Color(0xFFD8EFA8)
val BentoRoseStart = Color(0xFFFDECEF)
val BentoRoseEnd = Color(0xFFF8D8DF)
val BentoMintStart = Color(0xFFE4F6EC)
val BentoMintEnd = Color(0xFFC9ECDA)
val BentoPeachStart = Color(0xFFFFF1E2)
val BentoPeachEnd = Color(0xFFFDE0C4)
val BentoIndigoStart = Color(0xFFEAEEFD)
val BentoIndigoEnd = Color(0xFFD5DDF9)
val BentoButterStart = Color(0xFFFCF6DB)
val BentoButterEnd = Color(0xFFF5E8B5)

// Softened Practice aliases matching pastel palette
val PracticeRoseStart = BentoRoseStart
val PracticeRoseEnd = BentoRoseEnd
val PracticeAmberStart = BentoPeachStart
val PracticeAmberEnd = BentoPeachEnd
val PracticeSkyStart = BentoSkyStart
val PracticeSkyEnd = BentoSkyEnd
val PracticeVioletStart = BentoLavenderStart
val PracticeVioletEnd = BentoLavenderEnd
val PracticeJadeStart = BentoMintStart
val PracticeJadeEnd = BentoMintEnd

val JadeGreen = Color(0xFF047857)
val JadeSoft = Color(0xFFEAF8F1)
val JadeBorder = Color(0xFFBBE5CB)

val RedBad = Color(0xFFB91C1C)
val RedSoft = Color(0xFFFEF2F2)
val RedBorder = Color(0xFFFECACA)

val AmberGold = Color(0xFFD97706)
val AmberSoft = Color(0xFFFFFBEB)
val AmberBorder = Color(0xFFFDE68A)

val FlameOrange = Color(0xFFEA580C)
val FlameBg = Color(0xFFFFF7ED)
val FlameBorder = Color(0xFFFED7AA)

val EmeraldDot = Color(0xFF10B981)

// Heritage vermilion dot accent (used sparingly, matching BrandLogo)
val SealVermilion = Color(0xFFC94B3C)

// Legacy aliases routed cleanly to Web Brand tokens so all features stay unified
val Vermilion = Brand
val VermilionDark = BrandDark
val VermilionSoft = BrandSoft
val VermilionBorder = BrandBorder

private val DeployedColorScheme = lightColorScheme(
    primary = Brand,
    onPrimary = Color.White,
    primaryContainer = BrandSoft,
    onPrimaryContainer = BrandDark,
    secondary = InkBlack,
    onSecondary = Color.White,
    secondaryContainer = PaperMuted,
    onSecondaryContainer = InkBlack,
    background = Paper,
    onBackground = InkBlack,
    surface = PaperPure,
    onSurface = InkBlack,
    surfaceVariant = PaperMuted,
    onSurfaceVariant = InkMuted,
    outline = Line,
    outlineVariant = LineDark,
    error = RedBad,
    onError = Color.White,
)

@Composable
fun InkTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DeployedColorScheme,
        content = content,
    )
}
