const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const { encode, decode } = require("../services/crypt");
const otpGenerator = require("otp-generator");
const AddMinutesToDate = require("../helpers/add_minutes");
const dates = require("../helpers/dates");

const addOtp = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 3);

    const newOtp = await pool.query(
      `
    INSERT INTO otp (
      id,  
      otp,
      expiration_time)
    VALUES ($1,$2,$3) RETURNING id;`,
      [uuidv4(), otp, expiration_time]
    );
    const details = {
      timestamp: now,
      check: phone_number,
      success: true,
      message: "OTP sent to user",
      otp_id: newOtp.rows[0].id,
    };

    const encoded = await encode(JSON.stringify(details));

    return res.send({ Status: "Success", Details: encoded });
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};
const verifyOtp = async (req, res) => {
  const { verification_key, check, otp } = req.body;
  var currentDate = new Date();
  let decoded;
  try {
    decoded = await decode(verification_key);
  } catch (error) {
    const response = { Status: "Failure", Details: "Bad Request" };
    return res.status(400).send(response);
  }
  var obj = JSON.parse(decoded);
  const check_obj = obj.check;
  console.log(obj);
  if (check_obj != check) {
    const response = {
      Status: "Failure",
      Details: "OTP was not sent to this particular phone number",
    };
    return res.status(400).send(response);
  }
  const otpResult = await pool.query(`select * from otp where id=$1;`, [
    obj.otp_id,
  ]);
  const result = otpResult.rows[0];
  if (result != null) {
    if (result.verified != true) {
      if (dates.compare(result.expiration_time, currentDate) == 1) {
        if (otp === result.otp) {
          await pool.query(`update otp set verified=$2 where id=$1;`, [
            result.id,
            true,
          ]);
          const clientResult = await pool.query(
            `select * from client where client_phone_number=$1;`,
            [check]
          );
          if (clientResult.rows.length == 0) {
            const response = {
              Status: "Success",
              Details: "new",
              Check: check,
            };
            return res.status(200).send(response);
          } else {
            const response = {
              Status: "Success",
              Details: "old",
              Check: check,
              ClientName: clientResult.rows[0]?.client_first_name,
            };
            return res.status(200).send(response);
          }
        } else {
          const response = { Status: "Failure", Details: "OTP not matched" };
          return res.status(400).send(response);
        }
      } else {
        const response = { Status: "Failure", Details: "OTP expired" };
        return res.status(400).send(response);
      }
    } else {
      const response = { Status: "Failure", Details: "OTP already used" };
      return res.status(400).send(response);
    }
  } else {
    const response = { Status: "Failure", Details: "Baf Request" };
    return res.status(400).send(response);
  }
};

const getOtp = async (req, res) => {
  try {
    let otps = [];
    if (!req.params || !Object.keys(req.params)[0]) {
      otps = await pool.query("SELECT * FROM otp;");
    } else {
      otps = await pool.query("SELECT * from otp where id=$1", [req.params.id]);
    }
    return res.status(200).send({ data: otps.rows });
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};

const updateOtp = async (req, res) => {
  try {
    const { otp, expiration_time, verified } = req.body;
    const updatedOtp = await pool.query(
      `UPDATE otp SET 
        otp=$1,
        expiration_time=$2,
        verified=$3
      WHERE id=$4 RETURNING * `,
      [otp, expiration_time, verified, req.params.id]
    );
    if (!updatedOtp || !updatedOtp.rowCount > 0)
      return res.status(400).json({ message: "No data found" });
    return res
      .status(200)
      .send({ message: "success", updated_data: updatedOtp.rows[0] });
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};

const deleteOtp = async (req, res) => {
  try {
    const deletedOtp = await pool.query(
      `DELETE FROM otp where id=${req.params.id} returning*`
    );
    if (!deletedOtp || !deletedOtp.rowCount > 0)
      return res.status(400).json({ message: "No data found" });
    else {
      res
        .status(200)
        .send({ message: "Success", deleted_id: deletedOtp.rows[0].id });
    }
  } catch (error) {
    res.status(500).json(`Serverda xatolik ${error}`);
  }
};

module.exports = {
  addOtp,
  getOtp,
  updateOtp,
  deleteOtp,
  verifyOtp,
};
