# Dynamic Pricing & Business Rules Engine

A full-stack web application for configuring business pricing rules,
managing products and customers, applying promotions, and calculating
final transaction prices dynamically.

The system combines a **React + TypeScript frontend**, **FastAPI
backend**, **MySQL database**, and **Redis** within a Docker Compose
environment. It provides a centralized platform for defining pricing
logic and evaluating that logic consistently at transaction time.

------------------------------------------------------------------------

## Overview

Dynamic pricing is often driven by multiple business factors such as:

-   Customer type
-   Product category
-   Product price
-   Purchase quantity
-   Order subtotal
-   Location
-   Promotional campaigns
-   Rule priority and combination behavior

Managing these conditions directly in application code can make pricing
logic difficult to maintain. This project addresses that problem by
providing a configurable **Business Rules Engine** where pricing
conditions and actions are represented as data.

The application allows administrators to manage pricing-related master
data and create reusable pricing rules. During a calculation, the
backend evaluates applicable rules for each transaction item, applies
eligible discounts and charges, and optionally applies a promotion
before returning the final calculated price.

------------------------------------------------------------------------

## Key Features

### Authentication & Authorization

-   User registration and login
-   JWT-based authentication
-   Protected application routes
-   Role-aware application behavior
-   Administrative capabilities for pricing configuration

### Dashboard

The dashboard provides a high-level view of the pricing system,
including:

-   Total products
-   Total categories
-   Total customers
-   Total pricing rules
-   Total promotions
-   Total pricing calculations
-   Recent calculation activity

### Category Management

-   Create and manage product categories
-   Maintain category descriptions
-   Activate or deactivate categories
-   Associate products with categories

### Product Management

-   Create products
-   Update product information
-   Search and filter products
-   Manage product status
-   Associate products with categories
-   Store SKU and base price information

### Customer Management

-   Create and manage customers
-   Customer type classification
-   Customer category information
-   Location-based customer information
-   Search and filtering
-   Active/inactive status management

Supported customer types include:

-   `REGULAR`
-   `PREMIUM`
-   `BUSINESS`
-   `WHOLESALE`

### Pricing Rules Engine

The core of the application is the configurable pricing rules engine.

Rules can be defined using conditions based on fields such as:

-   Product ID
-   Product name
-   Product SKU
-   Category ID
-   Base price
-   Customer ID
-   Customer name
-   Customer email
-   Customer type
-   Customer category
-   Location
-   Quantity
-   Subtotal

Supported condition operators include:

-   `EQUALS`
-   `NOT_EQUALS`
-   `GREATER_THAN`
-   `GREATER_THAN_OR_EQUAL`
-   `LESS_THAN`
-   `LESS_THAN_OR_EQUAL`
-   `CONTAINS`
-   `NOT_CONTAINS`
-   `IN`
-   `NOT_IN`

Supported rule combination behavior includes:

-   `COMBINE`
-   `OVERRIDE`
-   `STOP`

Supported pricing actions include:

-   Percentage discount
-   Fixed discount
-   Additional charge
-   Tax

Each rule also supports priority, validity dates, conditions, actions,
and an optional maximum discount.

### Promotions

Promotions can be configured independently from pricing rules.

Supported promotion capabilities include:

-   Promotion codes
-   Percentage discounts
-   Fixed discounts
-   Minimum purchase requirements
-   Maximum discount limits
-   Start and expiry dates
-   Usage limits
-   Usage tracking
-   Active/inactive status

### Dynamic Pricing Calculator

The calculator supports complete transactions containing multiple
products.

A calculation can include:

-   One or more products
-   Quantity for each product
-   Customer selection
-   Optional promotion code

The pricing engine evaluates active rules for each item and produces a
detailed result containing:

-   Product-level item breakdown
-   Subtotal
-   Pricing-rule discounts
-   Promotion discount
-   Total discount
-   Additional charges
-   Tax
-   Final price
-   Applied rule information

### Calculation History

Every successful calculation is stored for later review.

The history module supports:

-   Paginated calculation history
-   Customer filtering
-   Promotion filtering
-   Calculation detail view
-   Purchased item breakdown
-   Rule discount breakdown
-   Promotion discount breakdown
-   Final price information
-   Calculation timestamp

The system also retains detailed calculation input information so that
historical transactions can be inspected after the original calculation
has completed.

------------------------------------------------------------------------

## Pricing Calculation Flow

The pricing process follows this general flow:

``` text
Customer
   +
Products & Quantities
   +
Active Pricing Rules
   +
Optional Promotion
   |
   v
Pricing Rules Evaluation
   |
   v
Rule Discounts / Charges / Tax
   |
   v
Promotion Evaluation
   |
   v
Final Price
   |
   v
Calculation History
```

For a multi-item transaction, active rules are evaluated for the
individual transaction items and their results are aggregated into the
calculation response.

A promotion is then evaluated against the eligible transaction amount
according to the configured promotion rules.

------------------------------------------------------------------------

## System Architecture

``` text
                         +----------------------------+
                         |       React Frontend       |
                         |    TypeScript + Vite       |
                         |      Material UI (MUI)      |
                         +-------------+--------------+
                                       |
                                  HTTP / Axios
                                       |
                                       v
                         +----------------------------+
                         |      FastAPI Backend       |
                         |        REST API            |
                         |     JWT Authentication     |
                         +-------------+--------------+
                                       |
                       +---------------+---------------+
                       |                               |
                       v                               v
              +----------------+              +----------------+
              |     MySQL      |              |     Redis      |
              |   Persistent   |              |     Cache /    |
              |     Data       |              | Infrastructure |
              +----------------+              +----------------+
```

The application is containerized using Docker Compose.

------------------------------------------------------------------------

## Technology Stack

### Frontend

-   React 19
-   TypeScript
-   Vite
-   Material UI (MUI)
-   Axios
-   React Router
-   Chart.js

### Backend

-   Python 3.12
-   FastAPI
-   SQLAlchemy ORM
-   Pydantic
-   JWT authentication
-   PyMySQL

### Database & Infrastructure

-   MySQL 8.0
-   Redis 7 Alpine
-   Docker
-   Docker Compose
-   Nginx

### Development & API Tools

-   Visual Studio Code
-   MySQL Workbench
-   Swagger / OpenAPI
-   Git
-   GitHub

------------------------------------------------------------------------

## Project Structure

``` text
Dynamic_Pricing_Engine/
│
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── routers/
│   │   ├── core/
│   │   ├── db/
│   │   └── main.py
│   │
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── ...
│   │
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

> The exact file structure can evolve as the application is extended.
> The main architectural separation remains frontend, backend,
> persistence, and supporting infrastructure.

------------------------------------------------------------------------

## Backend API Modules

The FastAPI application exposes REST endpoints for the major application
modules.

  Module                 Base Endpoint
  ---------------------- -----------------------------
  Authentication         `/api/auth`
  Users                  `/api/users`
  Categories             `/api/categories`
  Products               `/api/products`
  Customers              `/api/customers`
  Pricing Rules          `/api/pricing-rules`
  Promotions             `/api/promotions`
  Pricing Calculations   `/api/pricing-calculations`

The API documentation is available through Swagger/OpenAPI.

------------------------------------------------------------------------

## Important Endpoints

### System

``` text
GET /
GET /health
```

The health endpoint verifies that the application is running and that
the database connection is available.

### Pricing Calculation

``` text
POST /api/pricing-calculations/calculate
```

Example request:

``` json
{
  "customer_id": 2,
  "items": [
    {
      "product_id": 13,
      "quantity": 2
    },
    {
      "product_id": 14,
      "quantity": 1
    }
  ],
  "promotion_code": "FESTIVE25"
}
```

> Product and customer IDs in examples are illustrative. Use IDs that
> exist in the current database.

------------------------------------------------------------------------

## Database Design

MySQL is used as the primary persistent data store.

The application separates major business entities into dedicated tables
and uses relationships between them.

Conceptually:

``` text
Categories
    |
    +---- Products


Customer Categories
    |
    +---- Customers


Pricing Rules
    |
    +---- Rule Conditions
    |
    +---- Rule Actions


Promotions


Pricing Calculations
    |
    +---- Calculation Rules
```

The calculation record also stores detailed input and breakdown
information required for historical inspection.

------------------------------------------------------------------------

## Docker Compose Environment

The project is designed to run as a multi-container application.

### Services

  Service      Purpose                                    Host Port
  ------------ ---------------------------------------- -----------
  `frontend`   React application served through Nginx        `8080`
  `backend`    FastAPI REST API                              `8002`
  `mysql`      Persistent relational database                `3309`
  `redis`      Redis service                                 `6379`

The internal container ports are different where appropriate. Docker
Compose handles service-to-service communication inside the Docker
network.

The backend depends on healthy MySQL and Redis services before startup.

------------------------------------------------------------------------

## Prerequisites

Install the following before running the project:

-   Docker Desktop
-   Git
-   Visual Studio Code

Node.js and Python do not need to be installed on the host machine for
the standard Docker-based workflow.

------------------------------------------------------------------------

## Environment Configuration

Backend configuration is provided through environment variables.

Typical configuration includes:

``` text
APP_NAME
APP_ENV
DEBUG

MYSQL_DATABASE
MYSQL_USER
MYSQL_PASSWORD
MYSQL_ROOT_PASSWORD
MYSQL_HOST
MYSQL_PORT
DATABASE_URL

REDIS_HOST
REDIS_PORT

JWT_SECRET_KEY
JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES

ADMIN_USERNAME
ADMIN_EMAIL
ADMIN_PASSWORD
```

### Security Note

Do not commit real passwords, JWT secrets, database credentials, or
other sensitive configuration to Git.

Use environment-specific configuration files or deployment secrets for
production environments.

------------------------------------------------------------------------

## Running the Project

Clone the repository and move into the project directory:

``` bash
git clone <repository-url>
cd Dynamic_Pricing_Engine
```

Start Docker Desktop, then run:

``` bash
docker compose up -d
```

To rebuild the application after source changes:

``` bash
docker compose up -d --build
```

Check the running services:

``` bash
docker compose ps
```

Stop the services without removing persistent volumes:

``` bash
docker compose down
```

> Avoid `docker compose down -v` unless you intentionally want to remove
> the Docker volumes and persistent database data.

------------------------------------------------------------------------

## Application URLs

When the containers are running:

  Resource              URL
  --------------------- ---------------------------------------------
  Frontend              `http://localhost:8080`
  Backend API           `http://localhost:8002`
  Swagger UI            `http://localhost:8002/docs`
  Health Check          `http://localhost:8002/health`
  Calculation History   `http://localhost:8080/calculation-history`

------------------------------------------------------------------------

## API Documentation

FastAPI automatically provides OpenAPI documentation.

Open:

``` text
http://localhost:8002/docs
```

Swagger UI can be used to:

-   Inspect available endpoints
-   Review request schemas
-   Review response schemas
-   Authenticate
-   Execute API requests
-   Validate backend behavior during development

------------------------------------------------------------------------

## Typical Usage Workflow

A typical administrator workflow is:

``` text
1. Login
   |
2. Create Categories
   |
3. Create Products
   |
4. Create Customers
   |
5. Create Pricing Rules
   |
6. Create Promotions
   |
7. Open Price Calculator
   |
8. Select Customer
   |
9. Add Products & Quantities
   |
10. Apply Promotion
   |
11. Calculate Price
   |
12. Review Rule & Promotion Breakdown
   |
13. Open Calculation History
```

------------------------------------------------------------------------

## Example Pricing Scenario

Consider a transaction containing:

``` text
Customer:
Premium customer

Items:
Beauty Product A × 2
Beauty Product B × 1

Promotion:
FESTIVE25
```

The engine can evaluate multiple business rules such as:

``` text
Premium Customer Discount
        +
Beauty Category Discount
        +
Quantity-based Discount
        +
FESTIVE25 Promotion
```

The resulting calculation provides a transparent breakdown rather than
returning only a final number.

For example:

``` text
Subtotal
   ↓
Pricing Rule Discount #1
   ↓
Pricing Rule Discount #2
   ↓
Pricing Rule Discount #3
   ↓
Promotion Discount
   ↓
Additional Charge
   ↓
Tax
   ↓
Final Price
```

The exact result depends on the active rules, their conditions,
priorities, and configured values.

------------------------------------------------------------------------

## Design Principles

The project follows several core design principles:

### Separation of Concerns

Frontend presentation, backend API logic, business rules, and
persistence are separated into dedicated layers.

### Configurable Business Logic

Pricing behavior is represented through configurable rules and
conditions rather than hard-coding every pricing scenario.

### Traceability

Pricing calculations are persisted so that historical transactions can
be reviewed.

### API-First Integration

The React frontend communicates with the backend through REST APIs.

### Containerized Development

The application and supporting services are run through Docker Compose
to provide a consistent development environment.

### Extensibility

The rule structure is designed so that additional conditions, actions,
pricing strategies, and business scenarios can be introduced without
redesigning the entire application.

------------------------------------------------------------------------

## Validation & Testing

Recommended validation flow:

### Backend

``` bash
docker compose ps
```

Verify the API:

``` text
http://localhost:8002/health
```

Expected response:

``` json
{
  "status": "healthy",
  "database": "connected"
}
```

Review the API through:

``` text
http://localhost:8002/docs
```

### Frontend

Open:

``` text
http://localhost:8080
```

Verify:

-   Login
-   Dashboard
-   Categories
-   Products
-   Customers
-   Pricing Rules
-   Promotions
-   Price Calculator
-   Calculation History

### Database

MySQL Workbench can be connected to the Docker MySQL service using the
configured host credentials and the published MySQL port.

The database can be inspected to verify:

-   Categories
-   Products
-   Customers
-   Pricing rules
-   Rule conditions
-   Rule actions
-   Promotions
-   Pricing calculations
-   Calculation rule records

------------------------------------------------------------------------

## Example MySQL Verification Queries

Select the project database:

``` sql
USE pricing_engine;
```

View available tables:

``` sql
SHOW TABLES;
```

Inspect products with their categories:

``` sql
SELECT
    p.id,
    p.name,
    p.sku,
    p.base_price,
    p.is_active,
    c.name AS category
FROM products p
LEFT JOIN categories c
    ON c.id = p.category_id
ORDER BY p.id;
```

Inspect promotions:

``` sql
SELECT
    id,
    code,
    discount_type,
    discount_value,
    minimum_purchase,
    maximum_discount,
    usage_limit,
    usage_count,
    is_active
FROM promotions
ORDER BY id;
```

Inspect recent calculations:

``` sql
SELECT
    id,
    customer_id,
    quantity,
    promotion_code,
    subtotal,
    discount_amount,
    final_price,
    calculated_at
FROM pricing_calculations
ORDER BY id DESC;
```

------------------------------------------------------------------------

## Error Handling

The backend validates incoming request data through Pydantic schemas and
FastAPI request validation.

Common API responses include:

-   `200` --- Successful request
-   `201` --- Resource successfully created
-   `400` --- Invalid business request
-   `401` --- Authentication required or invalid
-   `403` --- Insufficient permissions
-   `404` --- Resource not found
-   `422` --- Request validation error
-   `500` --- Unexpected server-side error

Frontend API errors are surfaced through user-facing error states rather
than silently failing.

------------------------------------------------------------------------

## Security Considerations

The project includes JWT-based authentication and role-aware access
control.

For production deployment:

-   Replace development JWT secrets with strong randomly generated
    secrets.
-   Store credentials outside source control.
-   Use HTTPS.
-   Restrict database access.
-   Use environment-specific configuration.
-   Avoid exposing internal service ports unnecessarily.
-   Apply appropriate CORS policies.
-   Use secure password hashing and credential management.
-   Review administrator permissions before deployment.

------------------------------------------------------------------------

## Future Enhancements

Potential future improvements include:

-   Advanced pricing rule visualization
-   Product/category targeting directly within promotions
-   More sophisticated rule conflict resolution
-   Pricing simulation and what-if analysis
-   Advanced analytics
-   Exportable calculation reports
-   Audit logging for pricing-rule changes
-   Caching of frequently evaluated pricing configurations
-   Automated unit and integration test coverage
-   Production deployment configuration
-   CI/CD pipeline integration

------------------------------------------------------------------------

## Project Status

**Status: Functional MVP**

The current implementation provides the core end-to-end pricing
workflow:

``` text
Authentication
     ↓
Master Data Management
     ↓
Business Rule Configuration
     ↓
Promotion Configuration
     ↓
Dynamic Multi-Item Calculation
     ↓
Calculation Breakdown
     ↓
Calculation History
```

The project is intended as a practical demonstration of full-stack
development, REST API design, relational data modeling, configurable
business rules, authentication, containerization, and dynamic pricing
logic.

------------------------------------------------------------------------

## Author

**Dynamic Pricing & Business Rules Engine**

A full-stack project demonstrating configurable pricing automation and
business-rule-driven transaction calculation.

------------------------------------------------------------------------

## License

This project is intended for educational, portfolio, and demonstration
purposes.

Add an appropriate open-source license if the project is distributed
publicly.
