package handler

import (
	"encoding/json"
	"net/http"
	"socialnet/internal/model"
	"socialnet/internal/security"
	"socialnet/internal/service"
	"time"
)

type AuthHandler struct {
	authService *service.AuthService
	jwtSecret   string
	jwtDuration time.Duration
}

func NewAuthHandler(authService *service.AuthService, jwtSecret string, jwtDuration time.Duration) *AuthHandler {
	return &AuthHandler{
		authService: authService,
		jwtSecret:   jwtSecret,
		jwtDuration: jwtDuration,
	}
}

func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var reg model.UserRegistration
	if err := json.NewDecoder(r.Body).Decode(&reg); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	user, err := h.authService.Register(&reg)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(user)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var login model.UserLogin
	if err := json.NewDecoder(r.Body).Decode(&login); err != nil {
		http.Error(w, "invalid request", http.StatusBadRequest)
		return
	}

	user, err := h.authService.Login(&login)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	token, err := security.GenerateToken(user.ID, user.IsAdmin, h.jwtSecret, h.jwtDuration)
	if err != nil {
		http.Error(w, "failed to generate token", http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"token": token,
		"user":  user,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
