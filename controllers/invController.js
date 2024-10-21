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


invCont.buildInventoryManagement = async function (req, res, next) {
  try {
    let nav = await utilities.getNav(); 
    const classificationSelect = await utilities.buildClassificationList(); 
    res.render("inventory/inventory-management", {
      title: "Inventory Management",
      nav,
      classificationSelect,  
      messages: req.flash(),
    });
  } catch (error) {
    console.error("Error in buildInventoryManagement:", error);
    next(error);
  }
};

invCont.addClassification = async function (req, res, next) {
  let { classification_name } = req.body;
  classification_name = classification_name.charAt(0).toUpperCase() + classification_name.slice(1).toLowerCase();

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
  } catch (error) {
    console.error("Error adding Classification", error);
    next(error);
  }
};


invCont.showAddCarForm = async function (req, res, next) {
  try {
    const nav = await utilities.getNav();
    const classificationsData = await invModel.getClassifications();
    const classificationOptions = classificationsData.rows.map(classification => {
      return `<option value="${classification.classification_id}">${classification.classification_name}</option>`;
    }).join("");

    const formError = req.flash('formError');
    const formSuccess = req.flash('formSuccess');

    res.render("inventory/add-car", {
      title: "Add New Vehicle",
      classificationOptions,
      nav,
      formError,
      formSuccess
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
    //console.log("Missing required fields");
    req.flash('formError', "Whoops! Check the fields! Something must be wrong, failed adding new car!");
    return res.redirect("/inv/add-car");
  }

  try {
    const result = await invModel.addVehicle({
      classification_id, make, model, description, image, thumbnail, price, year, miles, color
    });

    if (result) {
      //console.log("Vehicle added:", result); 
      req.flash('formSuccess', `Vehicle ${make} ${model} added successfully.`);
      return res.redirect("/inv");
    } else {
      //console.log("Failed to add vehicle");
      req.flash('formError', "Whoops! Check the fields! Something must be wrong, failed adding new car!");
      return res.redirect("/inv/add-car");
    }
  } catch (error) {
    console.error("Error adding vehicle:", error);
    next(error);
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.buildEditInventory = async function (req, res, next) {
  const inv_id = parseInt(req.params.invId);
  if (isNaN(inv_id)) {
    return res.status(400).send("Invalid inventory ID.");
  }

  try {
    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData) {
      throw new Error('Vehicle not found');
    }

    const classificationList = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    const nav = await utilities.getNav();

    res.render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color
    });
  } catch (error) {
    next(error);
  }
};


invCont.updateInventory = async function (req, res, next) {
  const {
    classification_id, inv_id, inv_make, inv_model, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
  } = req.body;

  try {
    const updateResult = await invModel.updateInventory(
      classification_id, inv_id, inv_make, inv_model, inv_description, 
      inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
    );

    if (updateResult) {
      req.flash("formSuccess", `${inv_make} ${inv_model} successfully updated.`);
      return res.redirect("/inv");
    } else {
      throw new Error("Update failed.");
    }
  }
  catch (error) {
    const nav = await utilities.getNav();
    const classificationList = await utilities.buildClassificationList(classification_id);

    req.flash("formError", "Update failed. Please try again.");
    return res.status(500).render("inventory/edit-inventory", {
      title: `Edit ${inv_make} ${inv_model}`,
      nav,
      classificationList,
      inv_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color
    });
  }
};


invCont.buildDeleteConfirmation = async function (req, res, next) {
  const inv_id = req.params.invId;
  try {
    const itemData = await invModel.getInventoryById(inv_id);
    if (!itemData) {
      throw new Error('Vehicle not found');
    }
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    const nav = await utilities.getNav();
    res.render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_price: itemData.inv_price
    });
  } catch (error) {
    next(error);
  }
};

invCont.deleteInventory = async function (req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  try {
    const deleteResult = await invModel.deleteInventory(inv_id);
    if (deleteResult.rowCount) {
      req.flash("formSuccess", "Vehicle deleted successfully.");
      return res.redirect("/inv");
    } else {
      req.flash("formError", "Failed to delete vehicle.");
      return res.redirect(`/inv/delete/${inv_id}`);
    }
  } catch (error) {
    next(error);
  }
};




module.exports = invCont