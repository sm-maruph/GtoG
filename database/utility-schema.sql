/* CBC Utility Tracker - SQL Server reference schema.
   Integrate UserId and BranchId foreign keys with the portal's core identity tables. */

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'utl')
  EXEC('CREATE SCHEMA utl');
GO

CREATE TABLE utl.BranchSettings (
  BranchId          INT PRIMARY KEY,
  BranchCode        NVARCHAR(30) NOT NULL UNIQUE,
  BranchName        NVARCHAR(180) NOT NULL,
  RegionName        NVARCHAR(120) NULL,
  GeneratorFuelRate DECIMAL(12,4) NOT NULL DEFAULT (3.5),
  IsActive          BIT NOT NULL DEFAULT (1),
  UpdatedUtc        DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT CK_Utility_FuelRate CHECK (GeneratorFuelRate >= 0)
);
GO

CREATE TABLE utl.GeneratorRun (
  GeneratorRunId BIGINT IDENTITY(1,1) PRIMARY KEY,
  BranchId       INT NOT NULL,
  RunDate        DATE NOT NULL,
  StartTime      TIME(0) NOT NULL,
  EndTime        TIME(0) NOT NULL,
  RunHours       DECIMAL(12,2) NOT NULL,
  EstimatedFuel  DECIMAL(18,2) NOT NULL DEFAULT (0),
  ActualFuel     DECIMAL(18,2) NOT NULL DEFAULT (0),
  Remarks        NVARCHAR(1000) NULL,
  EnteredByUserId BIGINT NOT NULL,
  EnteredUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_GeneratorRun_Branch FOREIGN KEY (BranchId) REFERENCES utl.BranchSettings(BranchId),
  CONSTRAINT CK_GeneratorRun_Hours CHECK (RunHours >= 0),
  CONSTRAINT CK_GeneratorRun_Fuel CHECK (EstimatedFuel >= 0 AND ActualFuel >= 0)
);
GO
CREATE INDEX IX_GeneratorRun_Branch_Date ON utl.GeneratorRun(BranchId, RunDate DESC);
GO

CREATE TABLE utl.FuelPurchase (
  FuelPurchaseId BIGINT IDENTITY(1,1) PRIMARY KEY,
  BranchId       INT NOT NULL,
  PurchaseDate   DATE NOT NULL,
  QuantityLitres DECIMAL(18,2) NOT NULL,
  RatePerLitre   DECIMAL(18,2) NOT NULL,
  Amount         AS (QuantityLitres * RatePerLitre) PERSISTED,
  VendorName     NVARCHAR(240) NOT NULL,
  Remarks        NVARCHAR(1000) NULL,
  EnteredByUserId BIGINT NOT NULL,
  EnteredUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_FuelPurchase_Branch FOREIGN KEY (BranchId) REFERENCES utl.BranchSettings(BranchId),
  CONSTRAINT CK_FuelPurchase_QtyRate CHECK (QuantityLitres > 0 AND RatePerLitre > 0)
);
GO
CREATE INDEX IX_FuelPurchase_Branch_Date ON utl.FuelPurchase(BranchId, PurchaseDate DESC);
GO

CREATE TABLE utl.ElectricityBill (
  ElectricityBillId BIGINT IDENTITY(1,1) PRIMARY KEY,
  BranchId          INT NOT NULL,
  BillMonth         DATE NOT NULL,
  ConsumptionKwh    DECIMAL(18,2) NOT NULL,
  RatePerKwh        DECIMAL(18,4) NOT NULL,
  Amount            AS (ConsumptionKwh * RatePerKwh) PERSISTED,
  Remarks           NVARCHAR(1000) NULL,
  EnteredByUserId   BIGINT NOT NULL,
  EnteredUtc        DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_ElectricityBill_Branch FOREIGN KEY (BranchId) REFERENCES utl.BranchSettings(BranchId),
  CONSTRAINT UQ_ElectricityBill_BranchMonth UNIQUE (BranchId, BillMonth),
  CONSTRAINT CK_ElectricityBill_Month CHECK (DAY(BillMonth) = 1),
  CONSTRAINT CK_ElectricityBill_Values CHECK (ConsumptionKwh >= 0 AND RatePerKwh >= 0)
);
GO

CREATE TABLE utl.WasaBill (
  WasaBillId       BIGINT IDENTITY(1,1) PRIMARY KEY,
  BranchId        INT NOT NULL,
  BillMonth       DATE NOT NULL,
  ConsumptionUnit DECIMAL(18,2) NOT NULL,
  RatePerUnit     DECIMAL(18,4) NOT NULL,
  Amount          AS (ConsumptionUnit * RatePerUnit) PERSISTED,
  Remarks         NVARCHAR(1000) NULL,
  EnteredByUserId BIGINT NOT NULL,
  EnteredUtc      DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_WasaBill_Branch FOREIGN KEY (BranchId) REFERENCES utl.BranchSettings(BranchId),
  CONSTRAINT UQ_WasaBill_BranchMonth UNIQUE (BranchId, BillMonth),
  CONSTRAINT CK_WasaBill_Month CHECK (DAY(BillMonth) = 1),
  CONSTRAINT CK_WasaBill_Values CHECK (ConsumptionUnit >= 0 AND RatePerUnit >= 0)
);
GO

CREATE TABLE utl.DrinkingWaterDelivery (
  DeliveryId      BIGINT IDENTITY(1,1) PRIMARY KEY,
  BranchId       INT NOT NULL,
  DeliveryDate   DATE NOT NULL,
  QuantityLitres DECIMAL(18,2) NOT NULL,
  VendorName     NVARCHAR(240) NOT NULL,
  Remarks        NVARCHAR(1000) NULL,
  EnteredByUserId BIGINT NOT NULL,
  EnteredUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_WaterDelivery_Branch FOREIGN KEY (BranchId) REFERENCES utl.BranchSettings(BranchId),
  CONSTRAINT CK_WaterDelivery_Qty CHECK (QuantityLitres > 0)
);
GO
CREATE INDEX IX_WaterDelivery_Branch_Date ON utl.DrinkingWaterDelivery(BranchId, DeliveryDate DESC);
GO

CREATE TABLE utl.DrinkingWaterBill (
  WaterBillId     BIGINT IDENTITY(1,1) PRIMARY KEY,
  BranchId       INT NOT NULL,
  BillMonth      DATE NOT NULL,
  QuantityLitres DECIMAL(18,2) NOT NULL,
  Amount         DECIMAL(19,2) NOT NULL,
  Remarks        NVARCHAR(1000) NULL,
  EnteredByUserId BIGINT NOT NULL,
  EnteredUtc     DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_WaterBill_Branch FOREIGN KEY (BranchId) REFERENCES utl.BranchSettings(BranchId),
  CONSTRAINT UQ_WaterBill_BranchMonth UNIQUE (BranchId, BillMonth),
  CONSTRAINT CK_WaterBill_Month CHECK (DAY(BillMonth) = 1),
  CONSTRAINT CK_WaterBill_Values CHECK (QuantityLitres > 0 AND Amount >= 0)
);
GO

CREATE TABLE utl.UserBranchAssignment (
  AssignmentId BIGINT IDENTITY(1,1) PRIMARY KEY,
  UserId       BIGINT NOT NULL,
  EmployeeId   NVARCHAR(40) NOT NULL,
  FullName     NVARCHAR(180) NOT NULL,
  Email        NVARCHAR(320) NOT NULL,
  RoleCode     NVARCHAR(30) NOT NULL,
  BranchId     INT NULL,
  IsActive     BIT NOT NULL DEFAULT (1),
  CreatedUtc   DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc   DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_UtilityAssignment_Branch FOREIGN KEY (BranchId) REFERENCES utl.BranchSettings(BranchId),
  CONSTRAINT UQ_UtilityAssignment UNIQUE (UserId, BranchId, RoleCode)
);
GO

CREATE TABLE utl.AuditLog (
  AuditId       BIGINT IDENTITY(1,1) PRIMARY KEY,
  OccurredUtc   DATETIME2(0) NOT NULL DEFAULT (SYSUTCDATETIME()),
  UserId        BIGINT NULL,
  UserEmail     NVARCHAR(320) NOT NULL,
  ActionCode    NVARCHAR(80) NOT NULL,
  EntityType    NVARCHAR(80) NULL,
  EntityId      NVARCHAR(100) NULL,
  Detail        NVARCHAR(2000) NOT NULL,
  CorrelationId UNIQUEIDENTIFIER NOT NULL DEFAULT (NEWID())
);
GO
CREATE INDEX IX_UtilityAudit_Occurred ON utl.AuditLog(OccurredUtc DESC);
GO
