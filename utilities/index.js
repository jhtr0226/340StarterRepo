const invModel = require("../models/inventory-model")
const Util = {}
const jwt = require("jsonwebtoken")
require("dotenv").config()


Util.buildClassificationGrid = async function (data) {
  let grid
  if(data.length > 0){
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid +=  '<a href="../../inv/detail/'+ vehicle.inv_id 
      + '" title="View ' + vehicle.inv_make + ' '+ vehicle.inv_model 
      + 'details"><img src="' + vehicle.inv_thumbnail 
      +'" alt="Image of '+ vehicle.inv_make + ' ' + vehicle.inv_model 
      +' on CSE Motors" /></a>'
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += '<h2>'
      grid += '<a href="../../inv/detail/' + vehicle.inv_id +'" title="View ' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + ' details">' 
      + vehicle.inv_make + ' ' + vehicle.inv_model + '</a>'
      grid += '</h2>'
      grid += '<span>$' 
      + new Intl.NumberFormat('en-US').format(vehicle.inv_price) + '</span>'
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid += '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}

Util.buildVehicleDetail = async function (vehicle) {
  let detail = '<div class="vehicle-detail">';
  detail += `<div class="leftPart"><h1>${vehicle.inv_year}: ${vehicle.inv_make} ${vehicle.inv_model}</h1>`;
  detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}"/></div>`;
  detail += `<div class="rightPart"><h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>`;
  detail += `<p>Price: $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>`;
  detail += `<p>Description: ${vehicle.inv_description}</p>`;
  detail += `<p>Color: ${vehicle.inv_color}</p>`
  detail += `<p>Miles: ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)}</p></div>`;
  detail += '</div>';
  return detail;
  
}


Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}



Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications()
  let classificationList =
    '<select name="classification_id" id="classification_id" required>'
  classificationList += "<option value=''>Choose a Classification</option>"
  
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"'
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected "
    }
    classificationList += ">" + row.classification_name + "</option>"
  })
  classificationList += "</select>"
  return classificationList
}

Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
 if (req.cookies.jwt) {
  jwt.verify(
   req.cookies.jwt,
   process.env.ACCESS_TOKEN_SECRET,
   function (err, accountData) {
    if (err) {
     req.flash("Please log in")
     res.clearCookie("jwt")
     return res.redirect("/account/login")
    }
    res.locals.accountData = accountData
    res.locals.loggedin = true
    next()
   })
 } else {
  next()
 }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
 if (res.locals.loggedin) {
   next()
 } else {
   req.flash("notice", "Please log in.")
   return res.redirect("/account/login")
 }
}

Util.checkAuthorization = (req, res, next) => {
  if (res.locals.accountData) {
    const validTypes = ['Employee', 'Admin'];
    
    if (validTypes.includes(res.locals.accountData.account_type)) {
      next();
    } else {
      req.flash("error", "Please log in with a valid administrator/employee account");
      return res.redirect("/account/login");
    }
  } else {
    req.flash("notice", "Please log in");
    return res.redirect("/account/login");
  }
};

Util.checkAccountId = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id)
  try {
    if (account_id === res.locals.accountData.account_id) {
      next()
    }
    else {
      req.flash("error", "Not authorised.")
      return res.redirect("/account/")
    }
  }
  catch (error) {
    req.flash("notice", "Please log in")
    return res.redirect("/account/login")
  }
}


Util.checkAccountReviewId = async (req, res, next) => {
  const review_id = parseInt(req.params.review_id)
  const data = await invModel.getReviewById(review_id)
  try {
    if (data.account_id === res.locals.accountData.account_id) {
      next()
    }
    else {
      req.flash("error", "Not authorised.")
      return res.redirect("/account/")
    }
  }
  catch (error) {
    req.flash("error", "Not a valid review.")
    return res.redirect("/account/")
  }
}

module.exports = Util



