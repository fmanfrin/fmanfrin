// ============================================
// Organization & Tenant
// ============================================

export type OrganizationStatus = 'active' | 'blocked' | 'trial' | 'cancelled';
export type OrganizationPlan = 'basic' | 'professional' | 'enterprise';

export interface Organization {
  id: string;
  name: string;
  cnpj?: string;
  logoUrl?: string;
  status: OrganizationStatus;
  plan: OrganizationPlan;
  subscriptionStartsAt?: Date;
  subscriptionEndsAt?: Date;
  maxEmployees: number;
  maxTrainingsPerMonth: number;
  maxAiRequestsPerMonth: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationSettings {
  id: string;
  organizationId: string;
  themePrimaryColor: string;
  themeSecondaryColor: string;
  themeAccentColor: string;
  themeAccentLight: string;
  enableGamification: boolean;
  enablePublicRankings: boolean;
  enableCompetitions: boolean;
  enableCertificates: boolean;
  customLogoUrl?: string;
  customDomain?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// User & Auth
// ============================================

export type UserRole = 'admin_platform' | 'admin_company' | 'manager' | 'employee';

export interface Profile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Membership {
  id: string;
  profileId: string;
  organizationId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrentUser {
  profile: Profile;
  memberships: Membership[];
  currentOrganization?: Organization;
}

// ============================================
// Organization Structure
// ============================================

export type EmployeeStatus = 'active' | 'inactive' | 'on_leave';

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  managerId?: string;
  color: string;
  trainingGoal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  organizationId: string;
  departmentId: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Employee {
  id: string;
  organizationId: string;
  profileId?: string;
  fullName: string;
  email: string;
  cpfHash?: string;
  photoUrl?: string;
  departmentId: string;
  teamId?: string;
  managerId?: string;
  jobTitle?: string;
  admissionDate?: Date;
  status: EmployeeStatus;
  internalId?: string;
  phone?: string;
  city?: string;
  state?: string;
  unit?: string;
  individualGoal?: string;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Content Management
// ============================================

export type ContentType = 'text' | 'pdf' | 'docx' | 'pptx' | 'txt' | 'markdown' | 'url';
export type ContentStatus = 'draft' | 'review' | 'published' | 'archived';

export interface ContentSource {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
  type: ContentType;
  contentText?: string;
  fileUrl?: string;
  fileStoragePath?: string;
  version: number;
  authorId?: string;
  status: ContentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContentSourceVersion {
  id: string;
  contentSourceId: string;
  version: number;
  contentText?: string;
  fileUrl?: string;
  fileStoragePath?: string;
  authorId?: string;
  changeLog?: string;
  createdAt: Date;
}

// ============================================
// Trainings
// ============================================

export type Difficulty = 'basic' | 'intermediate' | 'advanced' | 'expert';
export type TrainingStatus = 'draft' | 'review' | 'published' | 'archived';
export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'case_study' | 'matching' | 'ordering' | 'sales_scenario';

export interface Training {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  areaId?: string;
  difficulty: Difficulty;
  learningObjectives?: string[];
  contentSummary?: string;
  estimatedDurationMinutes?: number;
  version: number;
  authorId?: string;
  status: TrainingStatus;
  isMandatory: boolean;
  minPassScore: number;
  maxAttempts: number;
  timeLimitMinutes?: number;
  maxPoints: number;
  bonusPointsQuickCompletion: number;
  requiresManualApproval: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingQuestion {
  id: string;
  trainingId: string;
  type: QuestionType;
  statement: string;
  options?: unknown;
  correctAnswer: unknown;
  explanation?: string;
  sourceReference?: string;
  difficulty: Difficulty;
  points: number;
  position?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  position?: number;
  createdAt: Date;
}

export interface TrainingAssignment {
  id: string;
  trainingId: string;
  targetType: 'employee' | 'department' | 'team';
  targetId: string;
  assignedAt: Date;
  dueDate?: Date;
  createdAt: Date;
}

export type TrainingAttemptStatus = 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'pending_review';

export interface TrainingAttempt {
  id: string;
  trainingId: string;
  employeeId: string;
  attemptNumber: number;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  maxScore?: number;
  percentageScore?: number;
  status: TrainingAttemptStatus;
  answers?: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrainingAnswer {
  id: string;
  trainingAttemptId: string;
  questionId: string;
  answerValue: unknown;
  isCorrect?: boolean;
  pointsAwarded?: number;
  createdAt: Date;
}

export interface Certificate {
  id: string;
  trainingId: string;
  employeeId: string;
  trainingAttemptId: string;
  certificateUrl?: string;
  certificateNumber: string;
  issuedAt: Date;
  validUntil?: Date;
  createdAt: Date;
}

// ============================================
// Gamification
// ============================================

export interface KnowledgeLevel {
  id: string;
  organizationId: string;
  name: string;
  minPoints: number;
  maxPoints: number;
  icon?: string;
  color?: string;
  description?: string;
  rewards?: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Badge {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  criteria?: unknown;
  icon?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmployeeBadge {
  id: string;
  employeeId: string;
  badgeId: string;
  earnedAt: Date;
}

export interface PointsEvent {
  id: string;
  organizationId: string;
  employeeId: string;
  eventType: string;
  points: number;
  trainingId?: string;
  competitionId?: string;
  description?: string;
  createdAt: Date;
}

export interface EmployeeLevelHistory {
  id: string;
  employeeId: string;
  levelId: string;
  totalPoints: number;
  achievedAt: Date;
}

// ============================================
// Competitions
// ============================================

export type CompetitionCriteria = 'largest_score' | 'best_avg' | 'most_completed' | 'fastest' | 'best_improvement' | 'specific_training';
export type CompetitionStatus = 'draft' | 'scheduled' | 'active' | 'ended' | 'cancelled';

export interface Competition {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  bannerUrl?: string;
  areaId?: string;
  startDate: Date;
  endDate: Date;
  criteria: CompetitionCriteria;
  validTrainings?: string[];
  maxWinners: number;
  status: CompetitionStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionPrize {
  id: string;
  competitionId: string;
  position: number;
  name: string;
  description?: string;
  imageUrl?: string;
  estimatedValue?: number;
  quantity: number;
  deliveryStatus: 'pending' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitionParticipant {
  id: string;
  competitionId: string;
  employeeId: string;
  joinedAt: Date;
}

export interface CompetitionRankSnapshot {
  id: string;
  competitionId: string;
  employeeId: string;
  position: number;
  points: number;
  prizeId?: string;
  createdAt: Date;
}

// ============================================
// Rankings
// ============================================

export type RankingType = 'general' | 'department' | 'team' | 'training' | 'competition' | 'monthly' | 'quarterly' | 'yearly';

export interface EmployeeRanking {
  id: string;
  employeeId: string;
  rankingType: RankingType;
  rankingId?: string;
  position: number;
  points?: number;
  periodStart?: Date;
  periodEnd?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Audit & Logging
// ============================================

export interface AuditLog {
  id: string;
  organizationId: string;
  userId?: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  resourceName?: string;
  changes?: unknown;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  createdAt: Date;
}

export interface AIUsageLog {
  id: string;
  organizationId: string;
  userId?: string;
  action: string;
  modelUsed?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  estimatedCost?: number;
  trainingId?: string;
  contentSourceId?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  createdAt: Date;
}

// ============================================
// Notifications
// ============================================

export interface Notification {
  id: string;
  organizationId: string;
  employeeId: string;
  type: string;
  title: string;
  message?: string;
  relatedResourceType?: string;
  relatedResourceId?: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

// ============================================
// Request/Response DTOs
// ============================================

export interface CreateEmployeeRequest {
  fullName: string;
  email: string;
  cpf?: string;
  departmentId: string;
  jobTitle?: string;
  managerId?: string;
  admissionDate?: Date;
  phone?: string;
  city?: string;
  state?: string;
  unit?: string;
}

export interface CreateTrainingRequest {
  title: string;
  description?: string;
  areaId?: string;
  difficulty: Difficulty;
  contentIds: string[];
  questionCount: number;
  minPassScore?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
  targetEmployees?: string[];
  targetDepartments?: string[];
  targetTeams?: string[];
}

export interface GenerateTrainingWithAIRequest {
  title: string;
  contentIds: string[];
  areaId?: string;
  targetAudience?: string;
  difficulty: Difficulty;
  objectiveDescription?: string;
  questionCount: number;
  questionTypes: QuestionType[];
  minPassScore?: number;
  timeLimitMinutes?: number;
  maxAttempts?: number;
}

export interface SubmitAnswerRequest {
  trainingAttemptId: string;
  questionId: string;
  answerValue: unknown;
}

export interface SubmitTrainingRequest {
  trainingAttemptId: string;
}
