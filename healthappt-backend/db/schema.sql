-- ===========================================================================
-- Database schema + seed data for the Healthcare Appointment system.
-- Run this ONCE against your Azure SQL database (Portal -> SQL database ->
-- Query editor, sign in, paste, Run).
-- ===========================================================================

CREATE TABLE Users (
  Id            INT IDENTITY PRIMARY KEY,
  EntraOid      UNIQUEIDENTIFIER NOT NULL UNIQUE,  -- Microsoft Entra user id
  DisplayName   NVARCHAR(200),
  Email         NVARCHAR(256),
  Role          NVARCHAR(20) NOT NULL DEFAULT 'Patient',
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Providers (
  Id            INT IDENTITY PRIMARY KEY,
  Name          NVARCHAR(200) NOT NULL,
  Specialty     NVARCHAR(120) NOT NULL,
  Clinic        NVARCHAR(200)
);

CREATE TABLE Slots (
  Id            INT IDENTITY PRIMARY KEY,
  ProviderId    INT NOT NULL REFERENCES Providers(Id),
  StartsAt      DATETIME2 NOT NULL,
  DurationMin   INT NOT NULL DEFAULT 30,
  IsBooked      BIT NOT NULL DEFAULT 0
);

CREATE TABLE Appointments (
  Id            INT IDENTITY PRIMARY KEY,
  SlotId        INT NOT NULL REFERENCES Slots(Id),
  PatientUserId INT NOT NULL REFERENCES Users(Id),
  Status        NVARCHAR(20) NOT NULL DEFAULT 'Booked',  -- Booked | Cancelled
  CreatedAt     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

-- --- Sample data so you have something to demo ------------------------------
INSERT INTO Providers (Name, Specialty, Clinic) VALUES
  (N'Dr. Mira Sen',    N'General Practice', N'Central Clinic'),
  (N'Dr. Jonas Vogel', N'Cardiology',       N'North Clinic');

INSERT INTO Slots (ProviderId, StartsAt) VALUES
  (1, '2026-07-01T09:00:00'),
  (1, '2026-07-01T09:30:00'),
  (1, '2026-07-01T10:00:00'),
  (2, '2026-07-01T11:00:00'),
  (2, '2026-07-01T11:30:00');
