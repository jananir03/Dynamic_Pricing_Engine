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

### Development & API Tools

-   Visual Studio Code
-   MySQL Workbench
-   Swagger / OpenAPI

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
