const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  try {
    //console.log("Fetching classifications from the database...");
    const result = await pool.query("SELECT * FROM public.classification ORDER BY classification_name");
    //console.log("Classifications fetched:", result.rows); // Log the results
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
    throw error;
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



async function updateInventory(classification_id, inv_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) {
  try {
      const sql = `
        UPDATE public.inventory
        SET classification_id = $1, inv_make = $2, inv_model = $3, inv_description = $4,
          inv_image = $5, inv_thumbnail = $6, inv_price = $7, inv_year = $8, 
          inv_miles = $9, inv_color = $10
        WHERE inv_id = $11
        RETURNING *`;
      const updateResult = await pool.query(sql, [
        classification_id, inv_make, inv_model, inv_description, inv_image, 
        inv_thumbnail, inv_price, inv_year, inv_miles, inv_color, inv_id
    ]);

    return updateResult.rows[0];
  }
  catch (error) {
    console.error("Error updating inventory:", error);
    throw error;
    }
}


async function deleteInventory(inv_id) {
    try {
        const sql = `DELETE FROM public.inventory WHERE inv_id = $1`
        const deleteResult = await pool.query(sql, [inv_id])

        return deleteResult
    } catch (error) {
        console.error("deleteinventory error " + error)
    }
}




/* ***************************
 *  Module Exports
 * ************************** */
module.exports = {
  getClassifications, getInventoryByClassificationId,
  getInventoryById, addClassification, addVehicle,
  updateInventory, deleteInventory
}