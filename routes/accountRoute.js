const express = require("express");
const router = new express.Router();
const utilities = require("../utilities/")
const accountController = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')



router.get("/login", utilities.handleErrors(accountController.buildLogin))
router.get("/register", utilities.handleErrors(accountController.buildRegister))
router.post('/register', utilities.handleErrors(accountController.registerAccount))

router.post("/register", regValidate.registationRules(),
    regValidate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
)

// Process login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  utilities.handleErrors(accountController.accountLogin)
);

router.get("/", utilities.checkLogin, utilities.handleErrors(accountController.buildManagement))

router.get("/logout", accountController.logoutAccount);

router.get("/update", utilities.checkLogin, accountController.buildUpdateAccount);
router.post("/update", utilities.checkLogin, utilities.handleErrors(accountController.updateAccountInfo));

router.post("/change-password", utilities.checkLogin, utilities.handleErrors(accountController.changePassword));

module.exports = router;