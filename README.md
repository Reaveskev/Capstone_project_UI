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
- There is a seed file in the database folder
- Open Query Tools and copy and run the following Script:

CREATE TABLE Users (
UserID SERIAL PRIMARY KEY,
Username VARCHAR(50) NOT NULL UNIQUE,
PasswordHash VARCHAR(255) NOT NULL,
Role VARCHAR(30) NOT NULL,
Email VARCHAR(100) UNIQUE,
FirstName VARCHAR(50) NOT NULL DEFAULT '',
LastName VARCHAR(50) NOT NULL DEFAULT ''
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
Category VARCHAR(50),
LowStockThreshold INTEGER NOT NULL DEFAULT 20
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

# Load Demo Data (optional)

The `database/seed.sql` script adds demo customers, products, and sales so the dashboard and reports have something to show. The `SalesBridge` database and the tables above must already exist.

From the repo root, run:

```bash
psql -U postgres -h 127.0.0.1 -d SalesBridge -f database/seed.sql
```

Or in pgAdmin, open `database/seed.sql` in the Query Tool and run it.

When it finishes, it prints a row of counts for customers, products, sales, and sale items.

Notes:

- All the data is fake. Sale dates are relative to the day you run the script.
- It only adds data. Existing rows are kept, and the sales part is skipped if the table already has 10 or more sales, so running it twice is safe.
- It doesn't create login accounts. Register one in the app.
