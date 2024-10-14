const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    console.log("Fetching classifications from the database..."); // Debugging log
    const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
    console.log("Classifications fetched:", result.rows); // Log the results
    return result;
  } catch (error) {
    console.error("Error fetching classifications:", error); // Log database errors
    throw error;
  }
}


async function getInventoryById(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows[0];
  }
  catch (error) {
    console.error(`getInventoryById error ` + error)
  }
}


async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getInventoryByClassificationId error " + error)
  }
}


    
async function addClassification(classification_name) {
  try {
    const sql = `INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *`;
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error", error);
    return null;
  }
}


async function addVehicle(vehicleData) {
  try {
    const sql = `
      INSERT INTO public.inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`;

    const result = await pool.query(sql, [
      vehicleData.classification_id,
      vehicleData.make,
      vehicleData.model,
      vehicleData.description,
      vehicleData.image,
      vehicleData.thumbnail,
      vehicleData.price,
      vehicleData.year,
      vehicleData.miles,
      vehicleData.color,
    ]);

    return result.rows[0];
  } catch (error) {
    console.error("Error adding vehicle to the database:", error);
    return null;
  }
}



/* ***************************
 *  Module Exports
 * ************************** */
module.exports = {
  getClassifications, getInventoryByClassificationId,
  getInventoryById, addClassification, addVehicle
}