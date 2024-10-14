const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId;
  try {
    const data = await invModel.getInventoryByClassificationId(classification_id);
    if (data.length === 0) {
      let nav = await utilities.getNav();
      return res.render("./inventory/classification", {
        title: "No vehicles found",
        nav,
        grid: '<p class="notice">Sorry, no vehicles were found for this classification.</p>',
      });
    }

    const grid = await utilities.buildClassificationGrid(data);
    let nav = await utilities.getNav();
    const className = data[0].classification_name;
    res.render("./inventory/classification", {
      title: className + " vehicles",
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error fetching vehicles by classification:", error);
    next(error);
  }
};


invCont.buildByInventoryId = async function (req, res, next) {
  const inv_id = req.params.invId
  try {
    const vehicleData = await invModel.getInventoryById(inv_id)
    if (!vehicleData || vehicleData.length === 0) {
      const error = new Error('Vehicle not found')
      error.status = 404
      throw error
    }
    const vehicleDetailHtml = await utilities.buildVehicleDetail(vehicleData)
    const nav = await utilities.getNav()
    res.render("inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav,
      detail: vehicleDetailHtml,
    })
  } catch (error) {
    next(error)
  }
}




invCont.addClassification = async function (req, res, next) {
  let { classification_name } = req.body;
  // Log the incoming request
  console.log("Received POST request to add classification:", classification_name);
  classification_name = classification_name.charAt(0).toUpperCase() + classification_name.slice(1).toLowerCase();

  // Check for invalid classification name
  if (!classification_name || !/^[a-zA-Z]+$/.test(classification_name)) {
    req.flash("formError", "Invalid classification name. Only letters are allowed.");
    return res.redirect("/inv/add-classification");
  }

  try {
    const result = await invModel.addClassification(classification_name);

    if (result) {
      req.flash("formSuccess", `${classification_name} classification successfully added.`);
      return res.redirect("/inv");
    } else {
      req.flash("formError", "Failed to add classification.");
      return res.redirect("/inv/add-classification");
    }
  }
  catch (err) {
    console.error("Error in addClassification controller:", err);
    req.flash("formError", "An error occurred while adding the classification. Try again!");
    return res.redirect("/inv/add-classification");
  }
};

invCont.showAddCarForm = async function (req, res, next) {
  try {
    console.log("Rendering EJS form for adding a car");
    const nav = await utilities.getNav(); 
    const classificationsData = await invModel.getClassifications();
    console.log("Classifications Data:", classificationsData.rows);
    if (!classificationsData.rows || classificationsData.rows.length === 0) {
      console.log("No classifications found");
    }

    // Dynamically build classification options for the dropdown
    const classificationOptions = classificationsData.rows.map(classification => {
      return `<option value="${classification.classification_id}">${classification.classification_name}</option>`;
    }).join("");

    //console.log("Classification Options:", classificationOptions);
    res.render("inventory/add-car", {
      title: "Add New Vehicle",
      classificationOptions,
      nav, 
    });
  } catch (error) {
    console.error("Error in showAddCarForm:", error);
    next(error);
  }
};

invCont.addCar = async function (req, res, next) {
  console.log("Form data received:", req.body);
  const { classification_id, make, model, description, image, thumbnail, price, year, miles, color } = req.body;

  if (!classification_id || !make || !model || !description || !image || !thumbnail || !price || !year || !miles || !color) {
    console.log("Missing required fields");
    req.flash('formError', "Whoops! Check the fields! Something must be wrong, failed adding new car!");
    return res.redirect("/inv/add-car");
  }

  try {
    const result = await invModel.addVehicle({
      classification_id, make, model, description, image, thumbnail, price, year, miles, color
    });

    if (result) {
      console.log("Vehicle added:", result); 
      req.flash('formSuccess', `Vehicle ${make} ${model} added successfully.`);
      return res.redirect("/inv");
    } else {
      console.log("Failed to add vehicle");
      req.flash('formError', "Failed to add the vehicle.");
      return res.redirect("/inv/add-car");
    }
  } catch (error) {
    console.error("Error adding vehicle:", error);
    req.flash('formError', "An error occurred while adding the vehicle.");
    return res.redirect("/inv/add-car");
  }
};

module.exports = invCont