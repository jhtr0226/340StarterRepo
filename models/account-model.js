const pool = require('../database/')

async function registerAccount(account_firstname, account_lastname, account_email, account_password) {
  try {
    const sql = "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *"
    return await pool.query(sql, [account_firstname, account_lastname, account_email, account_password])
  } catch (error) {
    return error.message
  }
}

async function checkExistingEmail(account_email){
  try {
    const sql = "SELECT * FROM account WHERE account_email = $1"
    const email = await pool.query(sql, [account_email])
    return email.rowCount
  } catch (error) {
    return error.message
  }
}

/* *****************************
* Return account data using email address
* ***************************** */
async function getAccountByEmail (account_email) {
  try {
    const result = await pool.query(
      'SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1',
      [account_email])
    return result.rows[0]
  } catch (error) {
    return new Error("No matching email found")
  }
}

// Update account information
async function updateAccount(account_id, account_firstname, account_lastname, account_email) {
  const sql = `UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *`;
  const result = await pool.query(sql, [account_firstname, account_lastname, account_email, account_id]);
  return result.rowCount;
}

// Change password
async function changePassword(account_id, hashedPassword) {
  const sql = `UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *`;
  const result = await pool.query(sql, [hashedPassword, account_id]);
  return result.rowCount;
}

async function getAccountById(account_id) {
  try {
    const sql = `SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1`;
    const result = await pool.query(sql, [account_id]);
    return result.rows[0]; 
  } catch (error) {
    console.error('Error fetching account by ID:', error);
    throw new Error('Unable to fetch account by ID');
  }
}


async function addToWishlist(account_id, inv_id) {
  try {
    const query = 'INSERT INTO wishlist (user_id, item_id) VALUES ($1, $2)';
    await pool.query(query, [account_id, inv_id]);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw new Error('Unable to add item to wishlist');
  }
}

async function removeFromWishlist(account_id, inv_id) {
  try {
    const query = 'DELETE FROM wishlist WHERE user_id = $1 AND item_id = $2';
    await pool.query(query, [account_id, inv_id]);
  } catch (error) {
    console.error("Error removing from wishlist:", error);
    throw new Error('Unable to remove item from wishlist');
  }
}


async function isInWishlist(account_id, inv_id) {
  try {
    const query = 'SELECT * FROM wishlist WHERE user_id = $1 AND item_id = $2';
    const result = await pool.query(query, [account_id, inv_id]);
    return result.rowCount > 0;
  } catch (error) {
    console.error("Error checking wishlist:", error);
    throw new Error('Unable to check wishlist');
  }
}

async function getWishlist(account_id) {
  try {
    const query = `
      SELECT inventory.* FROM inventory
      JOIN wishlist ON inventory.inv_id = wishlist.item_id
      WHERE wishlist.user_id = $1
    `;
    const result = await pool.query(query, [account_id]);
    return result.rows;
  } catch (error) {
    console.error("Error retrieving wishlist:", error);
    throw new Error('Unable to retrieve wishlist');
  }
}





module.exports = {
  registerAccount, checkExistingEmail,
  getAccountByEmail, changePassword,
  updateAccount, getAccountById, addToWishlist,
  removeFromWishlist, isInWishlist, getWishlist
}