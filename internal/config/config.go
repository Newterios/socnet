package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	DatabasePath    string
	ServerPort      string
	JWTSecret       string
	SessionDuration time.Duration
	MaxUploadSize   int64
	RateLimitPerMin int
	CleanupInterval time.Duration
}

func Load() *Config {
	return &Config{
		DatabasePath:    getEnv("DB_PATH", "socialnet.db"),
		ServerPort:      getEnv("SERVER_PORT", "8080"),
		JWTSecret:       getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		SessionDuration: getDuration("SESSION_DURATION", 24*time.Hour),
		MaxUploadSize:   getInt64("MAX_UPLOAD_SIZE", 10*1024*1024),
		RateLimitPerMin: getInt("RATE_LIMIT_PER_MIN", 60),
		CleanupInterval: getDuration("CLEANUP_INTERVAL", 1*time.Hour),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getInt64(key string, defaultValue int64) int64 {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.ParseInt(value, 10, 64); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getDuration(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
