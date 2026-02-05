package model

import "time"

type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	FullName     string    `json:"full_name"`
	Bio          string    `json:"bio"`
	AvatarURL    string    `json:"avatar_url"`
	IsAdmin      bool      `json:"is_admin"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserRegistration struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	FullName string `json:"full_name"`
}

type UserLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type UserProfile struct {
	FullName  string `json:"full_name"`
	Bio       string `json:"bio"`
	AvatarURL string `json:"avatar_url"`
}
