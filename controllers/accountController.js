const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
require("dotenv").config();

async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
  })
}

async function buildRegister(req, res, next) {
  let nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
      nav,
      errors:null,
  })
}

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

    let hashedPassword
  try {
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
    
    
    
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you're registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
    })
  }
}


async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 });
      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      return res.redirect("/account/");
    }
    else {
      req.flash("notice", "Please check your credentials and try again.");
      return res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      });
    }
  } catch (error) {
    console.error('Error during login process:', error);
    req.flash("notice", "An error occurred during the login process. Please try again.");
    return res.redirect("/account/login");
  }
}



const buildManagement = async (req, res, next) => {
  try {
    let nav = await utilities.getNav(); 
    res.render("account/account", {
      title: "Account Management",
      nav,
      message: req.flash("success"),     
      errors: req.flash("error")        
    });
  } catch (error) {
    next(error);
  }
};

const logoutAccount = (req, res) => {
  res.clearCookie('jwt');  
  res.redirect('/');
};


const buildUpdateAccount = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    accountData: res.locals.accountData,
    errors: null
  });
};

// Handle account info update
const updateAccountInfo = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } = req.body;

  try {
    const result = await accountModel.updateAccount(account_id, account_firstname, account_lastname, account_email);

    if (result) {
      // Update the session data with the new account information
      res.locals.accountData.account_firstname = account_firstname;
      res.locals.accountData.account_lastname = account_lastname;
      res.locals.accountData.account_email = account_email;

      req.flash('success', 'Account information updated successfully.');
      return res.redirect('/account');
    } else {
      req.flash('error', 'Failed to update account.');
      return res.redirect('/account/update');
    }
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash('error', 'An error occurred while updating the account.');
    return res.redirect('/account/update');
  }
};

// Handle password change
const changePassword = async (req, res, next) => {
  const { account_id, account_password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const result = await accountModel.changePassword(account_id, hashedPassword);

    if (result) {
      req.flash('success', 'Password updated successfully.');
      return res.redirect('/account');
    } else {
      req.flash('error', 'Failed to update password.');
      return res.redirect('/account/change-password');
    }
  } catch (error) {
    next(error);
  }
};





module.exports = {
  buildLogin, buildRegister, registerAccount,
  accountLogin, buildManagement, logoutAccount, changePassword,
  updateAccountInfo, buildUpdateAccount
 }