const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId;
  const vehicleData = await invModel.getInventoryById(inv_id);
  if (!vehicleData) {
    return next(new Error('Vehicle not found'));
  }
  const vehicleDetailHtml = await utilities.buildVehicleDetail(vehicleData);
  const nav = await utilities.getNav();
  res.render("inventory/detail", {
    title: vehicleData.inv_make + " " + vehicleData.inv_model,
    nav,
    detail: vehicleDetailHtml,
  });
};

module.exports = invCont