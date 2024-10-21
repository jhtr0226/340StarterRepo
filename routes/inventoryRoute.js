const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");
const utilities = require("../utilities");
//const inValidate = require("../utilities/inventory-validation");

router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId));
router.get("/detail/:invId", utilities.handleErrors(invController.buildByInventoryId));

router.get("/cause-error", (req, res, next) => {
  next(new Error("Intentional Server Error!"));
});

router.get("/", utilities.checkAuthorization, utilities.handleErrors(invController.buildInventoryManagement));

router.get("/add-classification", async (req, res) => {
  try {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      title: "Add New Classification",
      nav,
      formError: req.flash('formError'),
      formSuccess: req.flash('formSuccess')
    });
  } catch (error) {
    console.error("Error in /add-classification route:", error);
    res.status(500).send("Something went wrong: " + error.message);
  }
});
router.post("/add-classification", invController.addClassification);

router.get("/add-car", async (req, res, next) => {
  try {
    console.log("GET /add-car route hit");
    await invController.showAddCarForm(req, res, next);
  } catch (error) {
    console.error("Error in GET /add-car route:", error);
    next(error);
  }
});
router.post("/add-car", (req, res, next) => {
  //console.log("POST /add-car route hit");
  invController.addCar(req, res, next);
});

router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));
router.get("/edit/:invId", utilities.checkAuthorization, utilities.handleErrors(invController.buildEditInventory));

router.post(
  "/edit/:invId",
  utilities.checkAuthorization, 
  utilities.handleErrors(invController.updateInventory)
);

router.get("/delete/:invId", utilities.checkAuthorization, utilities.handleErrors(invController.buildDeleteConfirmation));
router.post("/delete/:invId", utilities.checkAuthorization, utilities.handleErrors(invController.deleteInventory));

module.exports = router;


