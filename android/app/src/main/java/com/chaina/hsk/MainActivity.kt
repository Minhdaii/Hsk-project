package com.chaina.hsk

import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.chaina.hsk.data.ApiClient
import com.chaina.hsk.data.TokenStore
import com.chaina.hsk.ui.ChainaApp

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge(
            statusBarStyle = SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT),
            navigationBarStyle = SystemBarStyle.light(Color.TRANSPARENT, Color.TRANSPARENT),
        )
        super.onCreate(savedInstanceState)
        val tokens = TokenStore(applicationContext)
        val api = ApiClient(BuildConfig.API_BASE_URL, tokens)
        setContent { ChainaApp(api = api, tokens = tokens) }
    }
}
