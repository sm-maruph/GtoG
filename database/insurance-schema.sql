/* CBC Insurance Management Tracker - SQL Server reference schema
   The copy-paste frontend currently runs with localStorage demo data.
   Use this schema when implementing the production API. */

CREATE SCHEMA ins;
GO

CREATE TABLE ins.Units (
  UnitId INT IDENTITY PRIMARY KEY,
  UnitCode NVARCHAR(30) NOT NULL UNIQUE,
  UnitName NVARCHAR(160) NOT NULL,
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE TABLE ins.Policies (
  PolicyId BIGINT IDENTITY PRIMARY KEY,
  AcNo NVARCHAR(80) NOT NULL UNIQUE,
  BorrowerName NVARCHAR(200) NOT NULL,
  UnitId INT NOT NULL REFERENCES ins.Units(UnitId),
  InsurancePolicyNo NVARCHAR(120) NULL,
  InsuranceCompany NVARCHAR(200) NOT NULL,
  InsuranceAmount DECIMAL(19,2) NOT NULL CHECK (InsuranceAmount > 0),
  MaturityDate DATE NOT NULL,
  PolicyStatus NVARCHAR(20) NOT NULL CHECK (PolicyStatus IN ('Active','Inactive','Expired','Renewed')),
  RowVersion ROWVERSION,
  CreatedBy INT NOT NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UpdatedBy INT NULL,
  UpdatedAt DATETIME2 NULL
);
GO

CREATE INDEX IX_Policies_Unit_Maturity ON ins.Policies(UnitId, MaturityDate);
CREATE INDEX IX_Policies_Company ON ins.Policies(InsuranceCompany);
GO

CREATE TABLE ins.FollowUps (
  FollowUpId BIGINT IDENTITY PRIMARY KEY,
  FollowUpNo AS ('FU-' + RIGHT('000000' + CONVERT(VARCHAR(6), FollowUpId), 6)) PERSISTED,
  PolicyId BIGINT NOT NULL REFERENCES ins.Policies(PolicyId),
  FollowUpDate DATE NOT NULL,
  FollowUpType NVARCHAR(30) NOT NULL CHECK (FollowUpType IN ('Reminder','Renewal','Complaint','General')),
  ContactMode NVARCHAR(30) NOT NULL CHECK (ContactMode IN ('Phone','Email','In Person','WhatsApp')),
  Summary NVARCHAR(1000) NOT NULL,
  ActionTaken NVARCHAR(1000) NULL,
  NextFollowUpDate DATE NULL,
  FollowUpStatus NVARCHAR(20) NOT NULL CHECK (FollowUpStatus IN ('Open','Pending','Closed')),
  EmailTo NVARCHAR(320) NULL,
  CreatedBy INT NOT NULL,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

CREATE INDEX IX_FollowUps_Policy_Date ON ins.FollowUps(PolicyId, FollowUpDate DESC);
GO

CREATE TABLE ins.UserUnitAssignments (
  AssignmentId BIGINT IDENTITY PRIMARY KEY,
  UserId INT NOT NULL,
  EmployeeId NVARCHAR(40) NOT NULL,
  FullName NVARCHAR(160) NOT NULL,
  Email NVARCHAR(320) NOT NULL,
  RoleCode NVARCHAR(20) NOT NULL CHECK (RoleCode IN ('Admin','User')),
  UnitId INT NULL REFERENCES ins.Units(UnitId),
  IsActive BIT NOT NULL DEFAULT 1,
  CreatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  CONSTRAINT UQ_Insurance_User_Unit UNIQUE(EmployeeId, UnitId),
  CONSTRAINT CK_Insurance_Admin_Unit CHECK ((RoleCode='Admin' AND UnitId IS NULL) OR (RoleCode='User' AND UnitId IS NOT NULL))
);
GO

CREATE TABLE ins.AlertRuns (
  AlertRunId BIGINT IDENTITY PRIMARY KEY,
  SelectedUnitCount INT NOT NULL,
  RecipientCount INT NOT NULL,
  PolicyCount INT NOT NULL,
  RecipientJson NVARCHAR(MAX) NOT NULL,
  UnitJson NVARCHAR(MAX) NOT NULL,
  SentBy INT NOT NULL,
  SentAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  DeliveryStatus NVARCHAR(20) NOT NULL DEFAULT 'QUEUED'
);
GO

CREATE TABLE ins.AuditLog (
  AuditId BIGINT IDENTITY PRIMARY KEY,
  OccurredAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  UserId INT NULL,
  UserEmail NVARCHAR(320) NOT NULL,
  ActionCode NVARCHAR(50) NOT NULL,
  EntityType NVARCHAR(50) NULL,
  EntityId NVARCHAR(80) NULL,
  Detail NVARCHAR(2000) NOT NULL,
  IpAddress NVARCHAR(64) NULL,
  CorrelationId UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID()
);
GO

CREATE INDEX IX_AuditLog_OccurredAt ON ins.AuditLog(OccurredAt DESC);
GO
