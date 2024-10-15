const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")
const utilities = require("../utilities")

router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.buildByInventoryId)
router.get("/cause-error", (req, res, next) => {
  next(new Error("Intentional Server Error!"));
});


router.get("/", async (req, res) => {
  try {
    //console.log("Entering /inv route");
    let nav = await utilities.getNav(); 

    res.render("inventory/inventory-management", {
      title: "Inventory Management",
      nav,
      messages: req.flash(),
    });
  } catch (error) {
    res.status(500).send("Something went wrong: " + error.message);
  }
});


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
  console.log("POST /add-car route hit"); // Log to confirm route is reached
  invController.addCar(req, res, next);
});

module.exports = router;


