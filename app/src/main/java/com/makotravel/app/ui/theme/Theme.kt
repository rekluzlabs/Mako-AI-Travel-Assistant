package com.makotravel.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val AmberPrimary = Color(0xFFD97706)
val AmberSecondary = Color(0xFFB45309)
val AmberTertiary = Color(0xFFF59E0B)

val WarmBackgroundLight = Color(0xFFFBFBF9)
val WarmSurfaceLight = Color(0xFFFFFFFF)
val StoneDarkText = Color(0xFF1C1917)
val StoneMutedText = Color(0xFF78716C)

private val LightColorScheme = lightColorScheme(
    primary = AmberPrimary,
    secondary = AmberSecondary,
    tertiary = AmberTertiary,
    background = WarmBackgroundLight,
    surface = WarmSurfaceLight,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onBackground = StoneDarkText,
    onSurface = StoneDarkText
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFF59E0B),
    secondary = Color(0xFFFBBF24),
    tertiary = Color(0xFFD97706),
    background = Color(0xFF1C1917),
    surface = Color(0xFF292524),
    onPrimary = Color.Black,
    onSecondary = Color.Black,
    onBackground = Color(0xFFF5F5F4),
    onSurface = Color(0xFFF5F5F4)
)

@Composable
fun MakoTravelTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
