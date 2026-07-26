/*
  CBC Enterprise Portal - SQL Server reference schema for Super Admin,
  granular permissions, organization directory, and global audit logging.

  The current frontend demonstration stores these records in localStorage.
  Integrate this schema with the organization's actual identity provider before production.
*/

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'core')
  EXEC('CREATE SCHEMA core');
GO

CREATE TABLE core.Branch (
  BranchId       INT IDENTITY(1,1) PRIMARY KEY,
  BranchCode     NVARCHAR(30) NOT NULL UNIQUE,
  BranchName     NVARCHAR(180) NOT NULL,
  BranchType     NVARCHAR(30) NOT NULL DEFAULT ('BRANCH'),
  Status         NVARCHAR(20) NOT NULL DEFAULT ('ACTIVE'),
  CreatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT CK_CoreBranch_Type CHECK (BranchType IN ('HEAD_OFFICE','BRANCH','SUB_BRANCH','SME')),
  CONSTRAINT CK_CoreBranch_Status CHECK (Status IN ('ACTIVE','INACTIVE'))
);
GO

CREATE TABLE core.Department (
  DepartmentId   INT IDENTITY(1,1) PRIMARY KEY,
  DepartmentCode NVARCHAR(30) NOT NULL,
  DepartmentName NVARCHAR(180) NOT NULL,
  BranchId       INT NOT NULL,
  Status         NVARCHAR(20) NOT NULL DEFAULT ('ACTIVE'),
  CreatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_CoreDepartment_Branch FOREIGN KEY (BranchId) REFERENCES core.Branch(BranchId),
  CONSTRAINT UQ_CoreDepartment_Code UNIQUE (BranchId, DepartmentCode),
  CONSTRAINT CK_CoreDepartment_Status CHECK (Status IN ('ACTIVE','INACTIVE'))
);
GO

CREATE TABLE core.PortalModule (
  ModuleId       INT IDENTITY(1,1) PRIMARY KEY,
  ModuleCode     NVARCHAR(20) NOT NULL UNIQUE,
  ModuleName     NVARCHAR(160) NOT NULL,
  RoutePath      NVARCHAR(180) NOT NULL,
  SortOrder      INT NOT NULL DEFAULT (0),
  IsActive       BIT NOT NULL DEFAULT (1)
);
GO

CREATE TABLE core.Permission (
  PermissionId   INT IDENTITY(1,1) PRIMARY KEY,
  ModuleId       INT NOT NULL,
  PermissionCode NVARCHAR(100) NOT NULL UNIQUE,
  PermissionName NVARCHAR(180) NOT NULL,
  CONSTRAINT FK_CorePermission_Module FOREIGN KEY (ModuleId) REFERENCES core.PortalModule(ModuleId)
);
GO

CREATE TABLE core.PortalRole (
  RoleId         INT IDENTITY(1,1) PRIMARY KEY,
  RoleCode       NVARCHAR(50) NOT NULL UNIQUE,
  RoleName       NVARCHAR(140) NOT NULL,
  Description    NVARCHAR(500) NULL,
  IsSystemRole   BIT NOT NULL DEFAULT (0),
  IsActive       BIT NOT NULL DEFAULT (1),
  CreatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME())
);
GO

CREATE TABLE core.RolePermission (
  RoleId         INT NOT NULL,
  PermissionId   INT NOT NULL,
  ScopeType      NVARCHAR(20) NOT NULL DEFAULT ('SELF'),
  PRIMARY KEY (RoleId, PermissionId),
  CONSTRAINT FK_CoreRolePermission_Role FOREIGN KEY (RoleId) REFERENCES core.PortalRole(RoleId),
  CONSTRAINT FK_CoreRolePermission_Permission FOREIGN KEY (PermissionId) REFERENCES core.Permission(PermissionId),
  CONSTRAINT CK_CoreRolePermission_Scope CHECK (ScopeType IN ('SELF','DEPT','BRANCH','GLOBAL'))
);
GO

CREATE TABLE core.PortalUser (
  UserId         BIGINT IDENTITY(1,1) PRIMARY KEY,
  EmployeeId     NVARCHAR(40) NOT NULL UNIQUE,
  SamAccountName NVARCHAR(100) NOT NULL UNIQUE,
  DisplayName    NVARCHAR(180) NOT NULL,
  Email          NVARCHAR(240) NULL,
  BranchId       INT NULL,
  DepartmentId   INT NULL,
  IsSuperAdmin   BIT NOT NULL DEFAULT (0),
  Status         NVARCHAR(20) NOT NULL DEFAULT ('ACTIVE'),
  PasswordHash   VARBINARY(512) NULL,
  CreatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_CorePortalUser_Branch FOREIGN KEY (BranchId) REFERENCES core.Branch(BranchId),
  CONSTRAINT FK_CorePortalUser_Department FOREIGN KEY (DepartmentId) REFERENCES core.Department(DepartmentId),
  CONSTRAINT CK_CorePortalUser_Status CHECK (Status IN ('ACTIVE','INACTIVE','LOCKED'))
);
GO

CREATE TABLE core.UserRole (
  UserId         BIGINT NOT NULL,
  RoleId         INT NOT NULL,
  AssignedUtc    DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  AssignedBy     BIGINT NULL,
  PRIMARY KEY (UserId, RoleId),
  CONSTRAINT FK_CoreUserRole_User FOREIGN KEY (UserId) REFERENCES core.PortalUser(UserId),
  CONSTRAINT FK_CoreUserRole_Role FOREIGN KEY (RoleId) REFERENCES core.PortalRole(RoleId),
  CONSTRAINT FK_CoreUserRole_AssignedBy FOREIGN KEY (AssignedBy) REFERENCES core.PortalUser(UserId)
);
GO

/*
  A direct override has precedence over role-derived permissions.
  Effect='ALLOW' grants or narrows access. Effect='DENY' explicitly removes it.
*/
CREATE TABLE core.UserPermissionOverride (
  UserPermissionOverrideId BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId         BIGINT NOT NULL,
  PermissionId   INT NOT NULL,
  Effect         NVARCHAR(10) NOT NULL,
  ScopeType      NVARCHAR(20) NOT NULL DEFAULT ('SELF'),
  BranchId       INT NULL,
  DepartmentId   INT NULL,
  CreatedUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CreatedBy      BIGINT NULL,
  CONSTRAINT FK_CoreUserPermission_User FOREIGN KEY (UserId) REFERENCES core.PortalUser(UserId),
  CONSTRAINT FK_CoreUserPermission_Permission FOREIGN KEY (PermissionId) REFERENCES core.Permission(PermissionId),
  CONSTRAINT FK_CoreUserPermission_Branch FOREIGN KEY (BranchId) REFERENCES core.Branch(BranchId),
  CONSTRAINT FK_CoreUserPermission_Department FOREIGN KEY (DepartmentId) REFERENCES core.Department(DepartmentId),
  CONSTRAINT FK_CoreUserPermission_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES core.PortalUser(UserId),
  CONSTRAINT CK_CoreUserPermission_Effect CHECK (Effect IN ('ALLOW','DENY')),
  CONSTRAINT CK_CoreUserPermission_Scope CHECK (ScopeType IN ('SELF','DEPT','BRANCH','GLOBAL')),
  CONSTRAINT UQ_CoreUserPermission UNIQUE (UserId, PermissionId)
);
GO

CREATE TABLE core.AuditLog (
  AuditId        BIGINT IDENTITY(1,1) PRIMARY KEY,
  EventUtc       DATETIME2(3) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CorrelationId  UNIQUEIDENTIFIER NOT NULL DEFAULT (NEWID()),
  UserId         BIGINT NULL,
  EmployeeId     NVARCHAR(40) NULL,
  UserName       NVARCHAR(180) NULL,
  UserEmail      NVARCHAR(240) NULL,
  ModuleCode     NVARCHAR(20) NOT NULL,
  ActionCode     NVARCHAR(100) NOT NULL,
  ActionStatus   NVARCHAR(20) NOT NULL DEFAULT ('SUCCESS'),
  EntityType     NVARCHAR(80) NULL,
  EntityId       NVARCHAR(100) NULL,
  Detail         NVARCHAR(MAX) NULL,
  IpAddress      NVARCHAR(64) NULL,
  UserAgent      NVARCHAR(800) NULL,
  BranchId       INT NULL,
  DepartmentId   INT NULL,
  CONSTRAINT FK_CoreAudit_User FOREIGN KEY (UserId) REFERENCES core.PortalUser(UserId),
  CONSTRAINT CK_CoreAudit_Status CHECK (ActionStatus IN ('SUCCESS','FAILED','WARNING'))
);
GO

CREATE INDEX IX_CoreAudit_EventUtc ON core.AuditLog(EventUtc DESC);
CREATE INDEX IX_CoreAudit_User_Action ON core.AuditLog(UserId, ActionCode, EventUtc DESC);
CREATE INDEX IX_CoreAudit_Module_Action ON core.AuditLog(ModuleCode, ActionCode, EventUtc DESC);
GO
