plugins {
    kotlin("jvm") version "1.9.10"
    application
}

repositories {
    mavenCentral()
    maven("https://jitpack.io")
}

val telegramBotVersion = "6.2.0"

dependencies {
    implementation(kotlin("stdlib"))
    implementation("io.github.kotlin-telegram-bot.kotlin-telegram-bot:telegram:$telegramBotVersion")
}

application {
    mainClass.set("MainKt")
}

tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions.jvmTarget = "17"
}
