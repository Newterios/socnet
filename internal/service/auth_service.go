package service

import (
	"errors"
	"socialnet/internal/model"
	"socialnet/internal/repository"
	"socialnet/internal/security"
)

type AuthService struct {
	userRepo *repository.UserRepository
}

func NewAuthService(userRepo *repository.UserRepository) *AuthService {
	return &AuthService{userRepo: userRepo}
}

func (s *AuthService) Register(reg *model.UserRegistration) (*model.User, error) {
	if err := security.ValidateEmail(reg.Email); err != nil {
		return nil, err
	}
	if err := security.ValidateUsername(reg.Username); err != nil {
		return nil, err
	}
	if err := security.ValidatePassword(reg.Password); err != nil {
		return nil, err
	}

	if _, err := s.userRepo.GetByEmail(reg.Email); err == nil {
		return nil, errors.New("email already exists")
	}

	if _, err := s.userRepo.GetByUsername(reg.Username); err == nil {
		return nil, errors.New("username already exists")
	}

	hashedPassword, err := security.HashPassword(reg.Password)
	if err != nil {
		return nil, err
	}

	user := &model.User{
		Email:        reg.Email,
		Username:     reg.Username,
		PasswordHash: hashedPassword,
		FullName:     reg.FullName,
	}

	id, err := s.userRepo.Create(user)
	if err != nil {
		return nil, err
	}

	user.ID = id
	return user, nil
}

func (s *AuthService) Login(login *model.UserLogin) (*model.User, error) {
	if err := security.ValidateEmail(login.Email); err != nil {
		return nil, err
	}

	user, err := s.userRepo.GetByEmail(login.Email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !security.ComparePassword(user.PasswordHash, login.Password) {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}
