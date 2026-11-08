package com.chaina.hsk.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// ============================================================================
// CHAINA HSK DEPLOYED WEB DESIGN SYSTEM
// Primary Brand Lavender-Blue (#7057CF) · Soft (#EDE8FF) · Deep Ink (#292833) · Paper (#F5F4F8)
// Matches exact CSS variables from deployed web (--lav: 184 162 248 / --lav-ink: 91 63 209)
// ============================================================================

val Brand = Color(0xFF7057CF)
val BrandDark = Color(0xFF5B3FD1)
val BrandSoft = Color(0xFFEDE8FF)
val BrandBorder = Color(0xFFD6CBFF)

val InkBlack = Color(0xFF292833)
val InkCharcoal = Color(0xFF201F29)
val InkMuted = Color(0xFF6F6D7A)
val InkGray = Color(0xFF6F6D7A)
val InkLight = Color(0xFF9E9BA8)

val Paper = Color(0xFFF5F4F8)
val PaperPure = Color(0xFFFFFFFF)
val PaperCard = Color(0xFFFFFFFF)
val PaperMuted = Color(0xFFF0EFF4)

val Line = Color(0xFFE5E2EC)
val LineDark = Color(0xFFD3D1DC)
val InkBorder = Color(0xFFE5E2EC)
val InkBorderDark = Color(0xFFD3D1DC)

val JadeGreen = Color(0xFF16875D)
val JadeSoft = Color(0xFFEAF8F1)
val JadeBorder = Color(0xFFBBE5CB)

val RedBad = Color(0xFFB63C4B)
val RedSoft = Color(0xFFFFF0F1)
val RedBorder = Color(0xFFFFD4D8)

val AmberGold = Color(0xFFD48806)
val AmberSoft = Color(0xFFFEF6E7)

// Backward compatibility mappings
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
