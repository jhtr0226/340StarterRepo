const utilities = require(".")
const invModel = require("../models/inventory-model")
const { body, validationResult } = require("express-validator")
const validate = {}

validate.classificationRules = () => {
    return [
    body("classification_name")
        .trim()
        .notEmpty()
        .escape()
        .isAlpha()
        .withMessage("Classification name cannot contain any space or special characters.")
    ]
}

validate.checkClassification = async (req, res, next) => {
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inventory/add-classification", {
            errors,
            title: "Add New Classification",
            nav
        })
        return
    }
    next()
}

validate.inventoryRules = () => {
    return [
    body("classification_id")
        .trim()
        .notEmpty()
        .isNumeric()
        .custom(async (classification_id) => {
            let data = await invModel.getClassifications()
            const classificationIds = data.rows.map((row) => row.classification_id)
            
            if (!classificationIds.includes(parseInt(classification_id))) {
                throw new Error("Please, select a valid classification.")
            }
        }),
    body("inv_make")
        .trim()
        .notEmpty()
        .isLength({ min: 3 })
        .isAlphanumeric("en-US", {ignore: " "})
        .withMessage("Vehicle make must be alphanumeric and have at least 3 characters."),
    body("inv_model")
        .trim()
        .notEmpty()
        .isLength({ min: 3 })
        .isAlphanumeric("en-US", {ignore: " "})
        .withMessage("Vehicle model must be alphanumeric and have at least 3 characters."),
    body("inv_description")
        .trim()
        .notEmpty()
        .escape()
        .withMessage("The vehicle description is required."),
    body("inv_image")
        .trim()
        .notEmpty()
        .contains('/images/vehicles/')
        .withMessage("Vehicle image path not valid."),
    body("inv_thumbnail")
        .trim()
        .notEmpty()
        .contains('/images/vehicles/')
        .withMessage("Vehicle thumbnail image path not valid"),
    body("inv_price")
        .trim()
        .notEmpty()
        .isDecimal({
            decimal_digits: '0,2'
        })
        .withMessage("Vehicle price must be a number with no more than two decimal digits."),
    body("inv_year")
        .trim()
        .notEmpty()
        .isInt({ min: 1885, max: 2024})
        .withMessage("Vehicle year must be a valid 4 digit number between 1885 and 2024."),
    body("inv_miles")
        .trim()
        .notEmpty()
        .isFloat({ min: 0 })
        .withMessage("Vehicle mileage must be a valid positive number"),
    body("inv_color")
        .trim()
        .notEmpty()
        .isAlpha()
        .withMessage("Vehicle color is required and must be a valid name.")
    ]
}

validate.checkInventory = async (req, res, next) => {
    const {
        classification_id,
        inv_make, 
        inv_model,
        inv_description,
        inv_price,
        inv_year,
        inv_miles,
        inv_color
    } = req.body

    let errors = []
    errors = validationResult(req)

    const classificationList = await utilities.buildClassificationList(classification_id)

    if (!errors.isEmpty()) {
        let nav = await utilities.getNav()
        res.render("./inventory/add-inventory", {
            errors,
            title: "Add Inventory",
            nav,
            classificationList,
            inv_make, 
            inv_model,
            inv_description,
            inv_price,
            inv_year,
            inv_miles,
            inv_color
        })
        return
    }
    next()
}

validate.newInventoryRules = () => {
    return [
        body("classification_id").trim().notEmpty().isNumeric().withMessage("Select a valid classification."),
        body("inv_make").trim().notEmpty().isLength({ min: 3 }).withMessage("Vehicle make must be at least 3 characters."),
        body("inv_model").trim().notEmpty().isLength({ min: 3 }).withMessage("Vehicle model must be at least 3 characters."),
        body("inv_description").trim().notEmpty().withMessage("Description is required."),
        body("inv_image").trim().notEmpty().contains("/images/vehicles/").withMessage("Valid image path required."),
        body("inv_thumbnail").trim().notEmpty().contains("/images/vehicles/").withMessage("Valid thumbnail path required."),
        body("inv_price").trim().notEmpty().isFloat().withMessage("Price must be a valid number."),
        body("inv_year").trim().notEmpty().isInt({ min: 1885, max: 2024 }).withMessage("Year must be between 1885 and 2024."),
        body("inv_miles").trim().notEmpty().isFloat({ min: 0 }).withMessage("Miles must be a positive number."),
        body("inv_color").trim().notEmpty().isAlpha().withMessage("Color must be alphabetic.")
    ];
};

validate.checkUpdateData = async (req, res, next) => {
    const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id } = req.body;
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
        const nav = await utilities.getNav();
        const classificationList = await utilities.buildClassificationList(classification_id);

        return res.status(400).render("inventory/edit-inventory", {
            title: `Edit ${inv_make} ${inv_model}`,
            nav,
            classificationList,
            errors: errors.array(),
            inv_make,
            inv_model,
            inv_description,
            inv_image,
            inv_thumbnail,
            inv_price,
            inv_year,
            inv_miles,
            inv_color,
            inv_id
        });
    }
    next();
};


validate.checkDeleteData = async (req, res, next) => {
    const {
        inv_id,
        inv_make,
        inv_model,
        inv_price,
        inv_year,
        inv_miles,
    } = req.body

    const invId = req.params.invId

    if (invId != inv_id) {
        if (invId != inv_id) {
            req.flash("error", "Inventory id must not be changed!")
        }

        let nav = await utilities.getNav()
        res.render("./inventory/delete-confirm", {
            errors: null,
            title: `Delete ${inv_make} ${inv_model}`,
            nav,
            inv_make,
            inv_model,
            inv_price,
            inv_year,
            inv_miles,
            inv_id: invId
        })
        return
    }
    next()
}





module.exports = validate