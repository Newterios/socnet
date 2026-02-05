package service

import (
	"errors"
	"socialnet/internal/model"
	"socialnet/internal/repository"
)

type AdminService struct {
	reportRepo  *repository.ReportRepository
	postRepo    *repository.PostRepository
	commentRepo *repository.CommentRepository
	userRepo    *repository.UserRepository
}

func NewAdminService(reportRepo *repository.ReportRepository, postRepo *repository.PostRepository,
	commentRepo *repository.CommentRepository, userRepo *repository.UserRepository) *AdminService {
	return &AdminService{
		reportRepo:  reportRepo,
		postRepo:    postRepo,
		commentRepo: commentRepo,
		userRepo:    userRepo,
	}
}

func (s *AdminService) CreateReport(reporterID int64, create *model.ReportCreate) error {
	report := &model.Report{
		ReporterID: reporterID,
		TargetType: create.TargetType,
		TargetID:   create.TargetID,
		Reason:     create.Reason,
		Status:     model.ReportStatusPending,
	}

	_, err := s.reportRepo.Create(report)
	return err
}

func (s *AdminService) GetReports(status model.ReportStatus) ([]*model.Report, error) {
	reports, err := s.reportRepo.GetAll(status, 100)
	if err != nil {
		return nil, err
	}

	for _, report := range reports {
		reporter, _ := s.userRepo.GetByID(report.ReporterID)
		report.Reporter = reporter
	}

	return reports, nil
}

func (s *AdminService) ReviewReport(reportID int64, status model.ReportStatus) error {
	if status != model.ReportStatusReviewed && status != model.ReportStatusResolved {
		return errors.New("invalid status")
	}

	return s.reportRepo.UpdateStatus(reportID, status)
}

func (s *AdminService) DeleteContent(targetType model.ReportTargetType, targetID int64) error {
	switch targetType {
	case model.ReportTargetPost:
		return s.postRepo.Delete(targetID)
	case model.ReportTargetComment:
		return s.commentRepo.Delete(targetID)
	default:
		return errors.New("unsupported target type")
	}
}
