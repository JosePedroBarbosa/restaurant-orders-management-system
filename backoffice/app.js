const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./lib/swagger');
const jwt = require('jsonwebtoken');
const User = require('./models/user');

const indexRouter = require('./routes/index.route');
const authRouter = require('./routes/auth.route');
const restaurantRouter = require('./routes/restaurant.route');
const menuRouter = require('./routes/menu.route');
const menuItemRouter = require('./routes/menuItem.route');
const adminRouter = require('./routes/admin.route.js');
const cartRouter = require('./routes/cart.route');
const orderRouter = require('./routes/order.route');

//suporte para ficheiro .env
require("dotenv").config();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//permitir CORS para o front-end
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Middleware global para verificar autenticação
app.use(async (req, res, next) => {
  try {
    if (req.cookies && req.cookies.token) {
      const token = req.cookies.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      res.locals.user = user;
    } else {
      res.locals.user = null;
    }
    next();
  } catch (error) {
    res.locals.user = null;
    next();
  }
});

// Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/uploads', express.static('uploads'));

app.use('/', indexRouter);

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/menus', menuRouter);
app.use('/api/v1/restaurants', restaurantRouter);
app.use('/api/v1/admin', adminRouter);

app.use('/api/v1/menuItems', menuItemRouter);

app.use('/api/v1/cart', cartRouter);
app.use('/api/v1/orders', orderRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;