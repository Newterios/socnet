package service

import (
	"errors"
	"socialnet/internal/model"
	"socialnet/internal/repository"
)

type UserService struct {
	userRepo *repository.UserRepository
}

func NewUserService(userRepo *repository.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

func (s *UserService) GetProfile(userID int64) (*model.User, error) {
	return s.userRepo.GetByID(userID)
}

func (s *UserService) UpdateProfile(userID int64, profile *model.UserProfile) error {
	user, err := s.userRepo.GetByID(userID)
	if err != nil {
		return err
	}

	user.FullName = profile.FullName
	user.Bio = profile.Bio
	user.AvatarURL = profile.AvatarURL

	return s.userRepo.Update(user)
}

func (s *UserService) SearchUsers(searchTerm string) ([]*model.User, error) {
	if searchTerm == "" {
		return nil, errors.New("search term is required")
	}
	return s.userRepo.Search(searchTerm, 20)
}
