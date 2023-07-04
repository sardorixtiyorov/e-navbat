const pool = require("../config/db");

const addClient = async (req, res) => {
  try {
    const {
      client_last_name,
      client_first_name,
      client_phone_number,
      client_info,
      client_photo,
    } = req.body;
    const newClient = await pool.query(
      `
    INSERT INTO client (
        client_last_name,
        client_first_name,
        client_phone_number,
        client_info,
        client_photo)
    VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        client_last_name,
        client_first_name,
        client_phone_number,
        client_info,
        client_photo,
      ]
    );
    console.log(newClient);
    res.status(200).json(newClient.rows[0]);
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};

const getClient = async (req, res) => {
  try {
    let clients = [];
    if (!req.params || !Object.keys(req.params)[0]) {
      clients = await pool.query("SELECT * FROM client;");
    } else {
      clients = await pool.query("SELECT * from client where id=$1", [
        req.params.id,
      ]);
    }
    return res.status(200).send({ data: clients.rows });
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};

const updateClient = async (req, res) => {
  try {
    const {
      client_last_name,
      client_first_name,
      client_phone_number,
      client_info,
      client_photo,
    } = req.body;
    const updatedClient = await pool.query(
      `UPDATE client SET 
        client_last_name=$1,
        client_first_name=$2,
        client_phone_number=$3,
         client_info=$4,
        client_photo=$5 
      WHERE id=$6 RETURNING * `,
      [
        client_last_name,
        client_first_name,
        client_phone_number,
        client_info,
        client_photo,
        req.params.id,
      ]
    );
    if (!updatedClient || !updatedClient.rowCount > 0)
      return res.status(400).json({ message: "No data found" });
    return res
      .status(200)
      .send({ message: "success", updated_data: updatedClient.rows[0] });
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};

const deleteClient = async (req, res) => {
  try {
    const deletedClient = await pool.query(
      `DELETE FROM client where id=${req.params.id} returning*`
    );
    if (!deletedClient || !deletedClient.rowCount > 0)
      return res.status(400).json({ message: "No data found" });
    else {
      res
        .status(200)
        .send({ message: "Success", deleted_id: deletedClient.rows[0].id });
    }
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};

module.exports = {
  addClient,
  getClient,
  updateClient,
  deleteClient,
};
