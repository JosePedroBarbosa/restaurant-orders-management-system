# ✨ FlavorFlow – Online Ordering Platform for Restaurants ✨

## Description

FlavorFlow is a web-based application that provides an integrated order management system for restaurants, customers, and administrators. It features user registration, authentication, real-time order tracking, menu management, and customer reviews.

## Technologies

* **Frontend**

  * Angular
  * Bootstrap
* **Backend**

  * Node.js
  * Express.js
  * Socket.IO (WebSockets)
  * JSON Web Tokens (JWT) for authentication
  * Swagger (OpenAPI) for API documentation
* **Database**

  * MongoDB
* **Development Tools**

  * Git & GitHub
  * Nodemon (automatic reload)

## Key Features

* **Administrator**

  * Validate and manage restaurant accounts
  * Manage categories and menu items for any restaurant
  * Dashboard with charts (registered restaurants, monthly orders)

* **Restaurant Owner**

  * Create and edit restaurant page (details, image, address, delivery radius)
  * Manage categories, dishes, and portions
  * Update order status (preparing, shipped, delivered)

* **Customer**

  * Search and filter by restaurant, category, location, and price
  * Shopping cart with item summary and countdown timer
  * Checkout with selectable payment methods
  * Real-time order status tracking
  * Rate and review orders (stars, comments, photos)

* **General**

  * Secure registration and login pages (route guards)
  * User profile with order history
  * Fully documented RESTful API via Swagger

## Prerequisites

* Node.js >= 18.x
* npm >= 9.x or Yarn >= 1.x
* MongoDB (local or Atlas instance)

## Installation & Startup

1. **Clone the repository**

   ```bash
   git clone https://github.com/JosePedroBarbosa/restaurant-management-system.git
   ```

2. **Create environment variables file** In the project backoffice root, create a `.env` file with the following content:

   ```dotenv
   NODE_ENV=development
   MONGODB_URI=YOUR_MONGO_DB_URI
   JWT_SECRET=yourSecretKey
   ```

3. **Backend setup**

   ```bash
   cd backend
   npm install
   npm start   
   ```

   The backend server will start at `http://localhost:3000`.

4. **Frontend setup**

   ```bash
   cd frontend/paw-restaurant
   npm install
   npm start
   ```

   Access the Angular application at `http://localhost:4200`.

5. **API Documentation** Open the Swagger UI in your browser:

   ```
   http://localhost:3000/swagger/
   ```

## Project Structure

```
/
├─ backend/         # Node.js + Express server code
├─ frontend/        # Angular application
├─ .gitignore       # Ignored files and folders
└─ README.md        # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m "Add your feature"`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request