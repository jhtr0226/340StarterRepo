/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities/")
const account = require("./routes/accountRoute")
const bodyParser = require("body-parser")

app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))


/***
 * Middleware
 */
app.use(require('connect-flash')())
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))



/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout")
app.use("/account", account)

/* ***********************
 * Routes
 *************************/
app.use(static)
//Index route
app.use("/inv", inventoryRoute)
app.get("/", utilities.handleErrors(baseController.buildHome))
//app.use(async (req, res, next) =>
//  next({ status: 404, message: 'Sorry, we appear to have lost that page.' })
//)

/**
 * Error Handler
 */

app.use((req, res, next) => {
  const error = new Error("Page Not Found");
  error.status = 404;
  next(error);
});


app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav();
  //console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  const status = err.status || 500;
  const message = status === 404 ? 'The page you are looking for cannot be found.' : 'Oh no! Something went wrong on our end.';
  res.status(status).render("errors/error", {
    title: status === 404 ? "404 - Page Not Found" : "500 - Server Error",
    message,
    nav,
  });
});



/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})


