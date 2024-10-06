const express = require("express")
const router = new express.Router() 
const invController = require("../controllers/invController")


router.get("/type/:classificationId", invController.buildByClassificationId);

router.get("/detail/:invId", invController.buildByInventoryId)


router.get("/cause-error", (req, res, next) => {
  next(new Error("Intentional Server Error!"));
});

module.exports = router;