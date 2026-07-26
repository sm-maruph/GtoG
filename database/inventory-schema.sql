/*
  SQL Server reference schema for the Inventory Requisition module.
  Adjust employee/user foreign keys to match your existing identity database.
*/

IF NOT EXISTS (SELECT 1 FROM sys.schemas WHERE name = 'inv')
  EXEC('CREATE SCHEMA inv');
GO

CREATE TABLE inv.ItemCategory (
  CategoryId       INT IDENTITY(1,1) PRIMARY KEY,
  CategoryName     NVARCHAR(120) NOT NULL UNIQUE,
  IsActive         BIT NOT NULL CONSTRAINT DF_ItemCategory_IsActive DEFAULT (1),
  CreatedUtc       DATETIME2(0) NOT NULL CONSTRAINT DF_ItemCategory_CreatedUtc DEFAULT (SYSUTCDATETIME())
);
GO

CREATE TABLE inv.Item (
  ItemId           INT IDENTITY(1,1) PRIMARY KEY,
  ItemCode         NVARCHAR(40) NOT NULL UNIQUE,
  ItemName         NVARCHAR(180) NOT NULL,
  CategoryId       INT NOT NULL,
  UnitOfMeasure    NVARCHAR(40) NOT NULL,
  CurrentStock     DECIMAL(18,2) NOT NULL CONSTRAINT DF_Item_CurrentStock DEFAULT (0),
  ReorderLevel     DECIMAL(18,2) NOT NULL CONSTRAINT DF_Item_ReorderLevel DEFAULT (0),
  IsActive         BIT NOT NULL CONSTRAINT DF_Item_IsActive DEFAULT (1),
  CreatedUtc       DATETIME2(0) NOT NULL CONSTRAINT DF_Item_CreatedUtc DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc       DATETIME2(0) NOT NULL CONSTRAINT DF_Item_UpdatedUtc DEFAULT (SYSUTCDATETIME()),
  RowVersion       ROWVERSION,
  CONSTRAINT FK_Item_Category FOREIGN KEY (CategoryId) REFERENCES inv.ItemCategory(CategoryId),
  CONSTRAINT CK_Item_CurrentStock CHECK (CurrentStock >= 0),
  CONSTRAINT CK_Item_ReorderLevel CHECK (ReorderLevel >= 0)
);
GO

CREATE TABLE inv.Requisition (
  RequisitionId              BIGINT IDENTITY(1,1) PRIMARY KEY,
  RequisitionNo              NVARCHAR(30) NOT NULL UNIQUE,
  RequisitionMonth           DATE NOT NULL,
  Status                     VARCHAR(30) NOT NULL,

  RequesterUserId            BIGINT NOT NULL,
  RequesterEmployeeId        NVARCHAR(40) NOT NULL,
  RequesterDisplayName       NVARCHAR(180) NOT NULL,
  RequesterDepartmentName    NVARCHAR(180) NULL,
  RequesterBranchName        NVARCHAR(180) NULL,

  RouteType                  VARCHAR(10) NOT NULL,
  RouteBranchId              INT NULL,
  RouteDepartmentId          INT NULL,

  Purpose                    NVARCHAR(500) NOT NULL,
  RequesterNotes             NVARCHAR(2000) NULL,

  CreatedUtc                 DATETIME2(0) NOT NULL CONSTRAINT DF_Requisition_CreatedUtc DEFAULT (SYSUTCDATETIME()),
  SubmittedUtc               DATETIME2(0) NULL,

  ManagerApprovedByUserId    BIGINT NULL,
  ManagerApprovedByName      NVARCHAR(180) NULL,
  ManagerApprovedUtc         DATETIME2(0) NULL,
  ManagerNotes               NVARCHAR(2000) NULL,
  ReturnReason               NVARCHAR(2000) NULL,

  ProcurementProcessedById  BIGINT NULL,
  ProcurementProcessedByName NVARCHAR(180) NULL,
  ProcurementProcessedUtc   DATETIME2(0) NULL,
  ProcurementNotes          NVARCHAR(2000) NULL,
  DeclineReason              NVARCHAR(2000) NULL,

  CancelledUtc               DATETIME2(0) NULL,
  UpdatedUtc                 DATETIME2(0) NOT NULL CONSTRAINT DF_Requisition_UpdatedUtc DEFAULT (SYSUTCDATETIME()),
  RowVersion                 ROWVERSION,

  CONSTRAINT CK_Requisition_Status CHECK (Status IN (
    'DRAFT','PENDING','RETURNED','PENDING_ADMIN','PARTIALLY_ISSUED',
    'ISSUED','REJECTED','DECLINED','CANCELLED'
  )),
  CONSTRAINT CK_Requisition_RouteType CHECK (RouteType IN ('BRANCH','DEPT')),
  CONSTRAINT CK_Requisition_Route CHECK (
    (RouteType = 'BRANCH' AND RouteBranchId IS NOT NULL AND RouteDepartmentId IS NULL)
    OR
    (RouteType = 'DEPT' AND RouteDepartmentId IS NOT NULL AND RouteBranchId IS NULL)
  ),
  CONSTRAINT CK_Requisition_MonthFirstDay CHECK (DAY(RequisitionMonth) = 1)
);
GO

CREATE INDEX IX_Requisition_Status ON inv.Requisition(Status, RequisitionMonth);
CREATE INDEX IX_Requisition_BranchScope ON inv.Requisition(RouteBranchId, Status, RequisitionMonth) WHERE RouteBranchId IS NOT NULL;
CREATE INDEX IX_Requisition_DepartmentScope ON inv.Requisition(RouteDepartmentId, Status, RequisitionMonth) WHERE RouteDepartmentId IS NOT NULL;
CREATE INDEX IX_Requisition_Requester ON inv.Requisition(RequesterEmployeeId, CreatedUtc DESC);
GO

CREATE TABLE inv.RequisitionItem (
  RequisitionItemId BIGINT IDENTITY(1,1) PRIMARY KEY,
  RequisitionId     BIGINT NOT NULL,
  ItemId             INT NOT NULL,
  RequestedQty       DECIMAL(18,2) NOT NULL,
  ApprovedQty        DECIMAL(18,2) NULL,
  SuppliedQty        DECIMAL(18,2) NOT NULL CONSTRAINT DF_RequisitionItem_SuppliedQty DEFAULT (0),
  RequesterNote      NVARCHAR(1000) NULL,
  ManagerNote        NVARCHAR(1000) NULL,
  ProcurementNote    NVARCHAR(1000) NULL,
  CreatedUtc         DATETIME2(0) NOT NULL CONSTRAINT DF_RequisitionItem_CreatedUtc DEFAULT (SYSUTCDATETIME()),
  UpdatedUtc         DATETIME2(0) NOT NULL CONSTRAINT DF_RequisitionItem_UpdatedUtc DEFAULT (SYSUTCDATETIME()),
  RowVersion         ROWVERSION,
  CONSTRAINT FK_RequisitionItem_Requisition FOREIGN KEY (RequisitionId) REFERENCES inv.Requisition(RequisitionId),
  CONSTRAINT FK_RequisitionItem_Item FOREIGN KEY (ItemId) REFERENCES inv.Item(ItemId),
  CONSTRAINT UQ_RequisitionItem UNIQUE (RequisitionId, ItemId),
  CONSTRAINT CK_RequisitionItem_Requested CHECK (RequestedQty > 0),
  CONSTRAINT CK_RequisitionItem_Approved CHECK (ApprovedQty IS NULL OR (ApprovedQty >= 0 AND ApprovedQty <= RequestedQty)),
  CONSTRAINT CK_RequisitionItem_Supplied CHECK (SuppliedQty >= 0 AND (ApprovedQty IS NULL OR SuppliedQty <= ApprovedQty))
);
GO

CREATE INDEX IX_RequisitionItem_Requisition ON inv.RequisitionItem(RequisitionId);
CREATE INDEX IX_RequisitionItem_Item ON inv.RequisitionItem(ItemId);
GO

CREATE TABLE inv.RequisitionEvent (
  EventId            BIGINT IDENTITY(1,1) PRIMARY KEY,
  RequisitionId      BIGINT NOT NULL,
  EventType          VARCHAR(40) NOT NULL,
  OldStatus          VARCHAR(30) NULL,
  NewStatus          VARCHAR(30) NULL,
  PerformedByUserId  BIGINT NULL,
  PerformedByName    NVARCHAR(180) NOT NULL,
  EventLabel         NVARCHAR(500) NOT NULL,
  EventNote          NVARCHAR(2000) NULL,
  EventUtc           DATETIME2(0) NOT NULL CONSTRAINT DF_RequisitionEvent_EventUtc DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_RequisitionEvent_Requisition FOREIGN KEY (RequisitionId) REFERENCES inv.Requisition(RequisitionId)
);
GO

CREATE INDEX IX_RequisitionEvent_Timeline ON inv.RequisitionEvent(RequisitionId, EventUtc);
GO

CREATE TABLE inv.StockTransaction (
  StockTransactionId BIGINT IDENTITY(1,1) PRIMARY KEY,
  ItemId              INT NOT NULL,
  TransactionType     VARCHAR(30) NOT NULL,
  Quantity             DECIMAL(18,2) NOT NULL,
  RequisitionId       BIGINT NULL,
  RequisitionItemId   BIGINT NULL,
  ReferenceNo         NVARCHAR(100) NULL,
  Remarks             NVARCHAR(1000) NULL,
  PostedByUserId      BIGINT NOT NULL,
  PostedByName        NVARCHAR(180) NOT NULL,
  PostedUtc           DATETIME2(0) NOT NULL CONSTRAINT DF_StockTransaction_PostedUtc DEFAULT (SYSUTCDATETIME()),
  CONSTRAINT FK_StockTransaction_Item FOREIGN KEY (ItemId) REFERENCES inv.Item(ItemId),
  CONSTRAINT FK_StockTransaction_Requisition FOREIGN KEY (RequisitionId) REFERENCES inv.Requisition(RequisitionId),
  CONSTRAINT FK_StockTransaction_RequisitionItem FOREIGN KEY (RequisitionItemId) REFERENCES inv.RequisitionItem(RequisitionItemId),
  CONSTRAINT CK_StockTransaction_Type CHECK (TransactionType IN (
    'OPENING','RECEIPT','ISSUE','RETURN_IN','RETURN_OUT','ADJUSTMENT_IN','ADJUSTMENT_OUT'
  )),
  CONSTRAINT CK_StockTransaction_Quantity CHECK (Quantity > 0)
);
GO

CREATE INDEX IX_StockTransaction_ItemDate ON inv.StockTransaction(ItemId, PostedUtc DESC);
CREATE INDEX IX_StockTransaction_Requisition ON inv.StockTransaction(RequisitionId) WHERE RequisitionId IS NOT NULL;
GO

/* Seed categories and sample items. Remove or replace for production. */
INSERT INTO inv.ItemCategory(CategoryName) VALUES
  ('Stationery'), ('Printer supplies'), ('IT accessories'), ('Hygiene');
GO

INSERT INTO inv.Item(ItemCode, ItemName, CategoryId, UnitOfMeasure, CurrentStock, ReorderLevel)
SELECT 'STA-A4-001', 'A4 Paper', CategoryId, 'Ream', 75, 20 FROM inv.ItemCategory WHERE CategoryName = 'Stationery'
UNION ALL SELECT 'PRN-TNR-085', 'HP 85A Toner Cartridge', CategoryId, 'Piece', 12, 5 FROM inv.ItemCategory WHERE CategoryName = 'Printer supplies'
UNION ALL SELECT 'STA-PEN-010', 'Ball Pen', CategoryId, 'Box', 45, 10 FROM inv.ItemCategory WHERE CategoryName = 'Stationery'
UNION ALL SELECT 'STA-FLD-020', 'File Folder', CategoryId, 'Piece', 120, 30 FROM inv.ItemCategory WHERE CategoryName = 'Stationery'
UNION ALL SELECT 'IT-KBD-001', 'USB Keyboard', CategoryId, 'Piece', 10, 4 FROM inv.ItemCategory WHERE CategoryName = 'IT accessories'
UNION ALL SELECT 'IT-MSE-001', 'USB Mouse', CategoryId, 'Piece', 16, 5 FROM inv.ItemCategory WHERE CategoryName = 'IT accessories';
GO
