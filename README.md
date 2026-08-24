# Capstone_project_UI

React code for Capstone_project_UI

# Software Requirements

$ node -v
v24.18.1

$ npm -v
11.16.0

$ npm create vite@latest capstone_UI

- install Vite
- select "React" as framework
- select "Typescript" as variant
- select "ESlist" as linter
- run project with "npm run dev"
- go to "localhost:5173/" to view it locally

# Database SetUp

- Create a Database called "SalesBridge"
- Open Query Tools and copy and run the following Script:

CREATE TABLE Users (
UserID SERIAL PRIMARY KEY,
Username VARCHAR(50) NOT NULL UNIQUE,
PasswordHash VARCHAR(255) NOT NULL,
Role VARCHAR(30) NOT NULL,
Email VARCHAR(100) UNIQUE
);

CREATE TABLE Customers (
CustomerID SERIAL PRIMARY KEY,
Name VARCHAR(100) NOT NULL,
Email VARCHAR(100) UNIQUE,
Phone VARCHAR(20),
RewardPointsBalance INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE Products (
SKU VARCHAR(20) PRIMARY KEY,
ProductName VARCHAR(150) NOT NULL,
Price NUMERIC(10,2) NOT NULL CHECK (Price >= 0),
StockLevel INTEGER NOT NULL DEFAULT 0 CHECK (StockLevel >= 0),
Category VARCHAR(50)
);

CREATE TABLE Sales (
SaleID SERIAL PRIMARY KEY,
SaleDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
TotalAmount NUMERIC(10,2) NOT NULL CHECK (TotalAmount >= 0),
CustomerID INTEGER REFERENCES Customers(CustomerID),
UserID INTEGER REFERENCES Users(UserID)
);

CREATE TABLE SaleItems (
SaleID INTEGER NOT NULL REFERENCES Sales(SaleID),
LineNo INTEGER NOT NULL,
Quantity INTEGER NOT NULL CHECK (Quantity > 0),
UnitPrice NUMERIC(10,2) NOT NULL CHECK (UnitPrice >= 0),
SKU VARCHAR(20) NOT NULL REFERENCES Products(SKU),
PRIMARY KEY (SaleID, LineNo)
);

CREATE TABLE RewardTransactions (
RewardTxnID SERIAL PRIMARY KEY,
CustomerID INTEGER NOT NULL REFERENCES Customers(CustomerID),
SaleID INTEGER REFERENCES Sales(SaleID),
PointsChange INTEGER NOT NULL,
TransactionDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
Type VARCHAR(20) NOT NULL
);

CREATE TABLE BackupLogs (
BackupID SERIAL PRIMARY KEY,
"Timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
PerformedBy INTEGER REFERENCES Users(UserID),
Status VARCHAR(20) NOT NULL
);
