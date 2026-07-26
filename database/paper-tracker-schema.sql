/*
  CBC Paper Usage Tracker - SQL Server reference schema.
  Tracks monthly printer counters, paper balance, requisition requirement,
  branch/department ownership, master data, and audit-ready history.
*/

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'ppr')
  EXEC('CREATE SCHEMA ppr');
GO

CREATE TABLE ppr.PaperType (
  PaperTypeId     INT IDENTITY(1,1) PRIMARY KEY,
  PaperCode       NVARCHAR(40) NOT NULL UNIQUE,
  PaperName       NVARCHAR(120) NOT NULL,
  DefaultUnit     NVARCHAR(30) NOT NULL DEFAULT ('Rim'),
  SheetsPerRim    INT NOT NULL DEFAULT (500),
  IsActive        BIT NOT NULL DEFAULT (1),
  CreatedUtc      DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc      DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT CK_PaperType_SheetsPerRim CHECK (SheetsPerRim > 0)
);
GO

CREATE TABLE ppr.Printer (
  PrinterId       INT IDENTITY(1,1) PRIMARY KEY,
  PrinterCode     NVARCHAR(50) NOT NULL UNIQUE,
  PrinterName     NVARCHAR(180) NOT NULL,
  BranchId        INT NOT NULL,
  DepartmentId    INT NULL,
  LocationText    NVARCHAR(250) NULL,
  IsActive        BIT NOT NULL DEFAULT (1),
  CreatedUtc      DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc      DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_PaperPrinter_Branch FOREIGN KEY (BranchId) REFERENCES core.Branch(BranchId),
  CONSTRAINT FK_PaperPrinter_Department FOREIGN KEY (DepartmentId) REFERENCES core.Department(DepartmentId)
);
GO

CREATE TABLE ppr.PaperUsageEntry (
  PaperUsageEntryId BIGINT IDENTITY(1,1) PRIMARY KEY,
  UsageMonth      DATE NOT NULL,
  ScopeType       NVARCHAR(40) NOT NULL,
  BranchId        INT NOT NULL,
  DepartmentId    INT NULL,
  PrinterId       INT NOT NULL,
  PaperTypeId     INT NOT NULL,
  StartingPageCount BIGINT NOT NULL,
  EndingPageCount BIGINT NOT NULL,
  TotalPagesUsed  AS (EndingPageCount - StartingPageCount) PERSISTED,
  PaperInHandQty  DECIMAL(14,2) NOT NULL DEFAULT (0),
  PaperInHandUnit NVARCHAR(30) NOT NULL DEFAULT ('Rim'),
  NextMonthRequisitionQty DECIMAL(14,2) NOT NULL DEFAULT (0),
  RequisitionUnit NVARCHAR(30) NOT NULL DEFAULT ('Rim'),
  Remarks         NVARCHAR(1000) NULL,
  EntryStatus     NVARCHAR(30) NOT NULL DEFAULT ('SUBMITTED'),
  RecordedBy      BIGINT NOT NULL,
  CreatedUtc      DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc      DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  RowVersion      ROWVERSION,
  CONSTRAINT FK_PaperUsage_Branch FOREIGN KEY (BranchId) REFERENCES core.Branch(BranchId),
  CONSTRAINT FK_PaperUsage_Department FOREIGN KEY (DepartmentId) REFERENCES core.Department(DepartmentId),
  CONSTRAINT FK_PaperUsage_Printer FOREIGN KEY (PrinterId) REFERENCES ppr.Printer(PrinterId),
  CONSTRAINT FK_PaperUsage_PaperType FOREIGN KEY (PaperTypeId) REFERENCES ppr.PaperType(PaperTypeId),
  CONSTRAINT FK_PaperUsage_RecordedBy FOREIGN KEY (RecordedBy) REFERENCES core.PortalUser(UserId),
  CONSTRAINT CK_PaperUsage_Counts CHECK (StartingPageCount >= 0 AND EndingPageCount >= StartingPageCount),
  CONSTRAINT CK_PaperUsage_Quantities CHECK (PaperInHandQty >= 0 AND NextMonthRequisitionQty >= 0),
  CONSTRAINT CK_PaperUsage_Scope CHECK (ScopeType IN ('HEAD_OFFICE_DEPARTMENT','BRANCH_DEPARTMENT','WHOLE_BRANCH')),
  CONSTRAINT CK_PaperUsage_Status CHECK (EntryStatus IN ('DRAFT','SUBMITTED','VERIFIED','LOCKED')),
  CONSTRAINT UQ_PaperUsage_MonthPrinterPaper UNIQUE (UsageMonth, PrinterId, PaperTypeId)
);
GO

CREATE INDEX IX_PaperUsage_Month ON ppr.PaperUsageEntry(UsageMonth DESC);
CREATE INDEX IX_PaperUsage_BranchDeptMonth ON ppr.PaperUsageEntry(BranchId, DepartmentId, UsageMonth DESC);
CREATE INDEX IX_PaperUsage_PaperTypeMonth ON ppr.PaperUsageEntry(PaperTypeId, UsageMonth DESC);
GO

/* Optional monthly report view. */
CREATE VIEW ppr.vw_MonthlyPaperUsage
AS
SELECT
  e.PaperUsageEntryId,
  e.UsageMonth,
  b.BranchCode,
  b.BranchName,
  d.DepartmentCode,
  d.DepartmentName,
  p.PrinterCode,
  p.PrinterName,
  t.PaperCode,
  t.PaperName,
  e.StartingPageCount,
  e.EndingPageCount,
  e.TotalPagesUsed,
  e.PaperInHandQty,
  e.PaperInHandUnit,
  e.NextMonthRequisitionQty,
  e.RequisitionUnit,
  e.Remarks,
  e.EntryStatus,
  e.CreatedUtc,
  e.UpdatedUtc
FROM ppr.PaperUsageEntry e
JOIN core.Branch b ON b.BranchId = e.BranchId
LEFT JOIN core.Department d ON d.DepartmentId = e.DepartmentId
JOIN ppr.Printer p ON p.PrinterId = e.PrinterId
JOIN ppr.PaperType t ON t.PaperTypeId = e.PaperTypeId;
GO
