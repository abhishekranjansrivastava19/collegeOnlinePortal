var express = require("express");
const router = express.Router();
var crypto = require("crypto");
var unirest = require("unirest");
const Student = require("../models/student")
const Transaction = require("../models/paymentdb");
// MongoDB model for Payment Config (assuming mongoose is used)
const PaymentConfig = require("../models/paymentconfig"); // Import the PaymentConfig schema

const resHashKey = "KEYRESP123657234";
const algorithm = "aes-256-cbc";
const iv = Buffer.from(
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  "utf8"
);

// Encryption and Decryption functions
const encrypt = (text, password, salt) => {
  var derivedKey = crypto.pbkdf2Sync(password, salt, 65536, 32, "sha512");
  const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${encrypted.toString("hex")}`;
};

const decrypt = (text, password, salt) => {
  const encryptedText = Buffer.from(text, "hex");
  var derivedKey = crypto.pbkdf2Sync(password, salt, 65536, 32, "sha512");
  const decipher = crypto.createDecipheriv(algorithm, derivedKey, iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Payment route

router.post("/payment", async (req, resp) => {
  try {
    const { collegeId, userId, email, phone, amount } = req.body;

    // Fetch merchant credentials from the database based on college ID
    const paymentConfig = await PaymentConfig.findOne({ collegeId });
    if (!paymentConfig) {
      return resp.status(404).json({ error: "Merchant credentials not found" });
    }

    const {
      merchId,
      merchPass,
      prodId,
      hashRequestKey,
      aesRequestKey,
      Authurl,
      hashResponseKey,
      aesResponseKey,
    } = paymentConfig;

    // Generate unique transaction ID
    const txnId = "Invoice" + new Date().getTime().toString(36);
    const txnDate = new Date().toISOString().slice(0, 19).replace("T", " ");

    // Create payment details JSON
    const jsondata = `{
      "payInstrument": {
        "headDetails": {
          "version": "OTSv1.1",
          "api": "AUTH",
          "platform": "FLASH"
        },
        "merchDetails": {
          "merchId": "${merchId}",
          "userId": "",
          "password": "${merchPass}",
          "merchTxnId": "${txnId}",
          "merchTxnDate": "${txnDate}"
        },
        "payDetails": {
          "amount": "${amount}",
          "product": "${prodId}",
          "custAccNo": "213232323",
          "txnCurrency": "INR"
        },
        "custDetails": {
          "custId": "${userId}",
          "custEmail": "${email}",
          "custMobile": "${phone}"
        },
        "extras": {
          "udf1": "udf1",
          "udf2": "udf2",
          "udf3": "udf3",
          "udf4": "udf4",
          "udf5": "udf5"
        }
      }
    }`;

    // Encrypt the payment data
    const encDataR = encrypt(
      jsondata,
      Buffer.from(hashRequestKey, "utf8"),
      Buffer.from(aesRequestKey, "utf8")
    );

    // Make a POST request to the payment gateway
    const paymentReq = unirest("POST", Authurl);
    paymentReq.headers({
      "cache-control": "no-cache",
      "content-type": "application/x-www-form-urlencoded",
    });

    paymentReq.form({
      encData: encDataR,
      merchId: merchId,
    });

    // Handle the response from the payment gateway
    paymentReq.end(async (res) => {
      if (res.error) throw new Error(res.error);
      if (!res.body) {
        throw new Error("Response body is undefined");
      }

      let responseBody = res.body;
      // Extract and split the response
      const arr = responseBody.split("&").map((val) => val.split("="));
      const encResponseData = arr.find((pair) => pair[0] === "encData")?.[1];
      // Decrypt the response data
      const decrypted_data = decrypt(
        encResponseData,
        Buffer.from(hashResponseKey, "utf8"),
        Buffer.from(aesResponseKey, "utf8")
      );

      let jsonData = JSON.parse(decrypted_data);
      // Check the transaction status
      if (jsonData.responseDetails.txnStatusCode === "OTS0000") {
        const atomTokenId = jsonData.atomTokenId;

        const options = {
          atomTokenId: atomTokenId,
          merchId: merchId,
          custEmail: email,
          custMobile: phone,
          returnUrl: `http://localhost:3000/api/v1/transaction/Response/${collegeId}/${userId}`, // Adjust return URL based on your environment
        };

        return resp.status(200).json({ success: true, options });
      } else {
        // Handle error case (failed transaction)
        return resp
          .status(400)
          .json({ error: "Transaction failed", details: jsonData });
      }
    });
  } catch (error) {
    console.error(error);
    resp
      .status(500)
      .json({ error: "An error occurred during the payment process" });
  }
});

router.use(
  express.urlencoded({
    // to support URL-encoded bodies after redirecting user with final response
    extended: true,
  })
);

// Response handler
router.post("/Response/:collegeId/:userId", async function (req, resp) {
  
  const { collegeId, userId } = req.params;
  const paymentConfig = await PaymentConfig.findOne({ collegeId });
  if (!paymentConfig) {
    return resp.status(404).json({ error: "Merchant credentials not found" });
  }

  const {
    hashResponseKey,
    aesResponseKey,
  } = paymentConfig;

  var decrypted_data = decrypt(
    req.body.encData,
    Buffer.from(hashResponseKey, "utf8"),
    Buffer.from(aesResponseKey, "utf8")
  );

  console.log(decrypted_data);
  let jsonData = JSON.parse(decrypted_data);
  let respArray = Object.keys(jsonData).map((key) => jsonData[key]);
  let signature = generateSignature(respArray);
  if (signature === respArray[0]["payDetails"]["signature"]) {
    if (respArray[0]["responseDetails"]["statusCode"] == "OTS0000") {
      // resp.json("");
      const transaction = new Transaction({
        transactionId: respArray[0]["payDetails"]["atomTxnId"],
        collegeId: collegeId,
        userId: userId,
        txnId: respArray[0]["merchDetails"]["merchTxnId"],
        amount: respArray[0]["payDetails"]["amount"],
        surchargeAmount: respArray[0]["payDetails"]["surchargeAmount"],
        totalAmount: respArray[0]["payDetails"]["totalAmount"],
        txnStatusCode: respArray[0]["responseDetails"]["statusCode"],
        txnDate: respArray[0]["merchDetails"]["merchTxnDate"],
        custEmail: respArray[0]["custDetails"]["custEmail"],
        custMobile: respArray[0]["custDetails"]["custMobile"],
      });
      // to read whole JSON data
      await transaction.save();

      await Student.findByIdAndUpdate(
        userId,
        { paymentStatus: true },
        { new: true }
      );

      // resp.status(200).json({success: "Transaction successful", respArray});
      // return resp.redirect(`http://localhost:3000/college/${collegeId}/${userId}/StudentPanel/registration`);
      return resp.redirect(
        `http://localhost:3001/college/${collegeId}/${userId}/StudentPanel/reciept`
      );
    } else {
      return resp.redirect(
        `http://localhost:3001/college/${collegeId}/${userId}/StudentPanel/register`
      );
    }
  } else {
    console.log("signature mismatched!!");
    resp.json("Transaction failed");
  }
});

const generateSignature = (respArray) => {
  var signatureString =
    respArray[0]["merchDetails"]["merchId"].toString() +
    respArray[0]["payDetails"]["atomTxnId"] +
    respArray[0]["merchDetails"]["merchTxnId"].toString() +
    respArray[0]["payDetails"]["totalAmount"].toFixed(2).toString() +
    respArray[0]["responseDetails"]["statusCode"].toString() +
    respArray[0]["payModeSpecificData"]["subChannel"][0].toString() +
    respArray[0]["payModeSpecificData"]["bankDetails"]["bankTxnId"].toString();
  var hmac = crypto.createHmac("sha512", resHashKey);
  data = hmac.update(signatureString);
  gen_hmac = data.digest("hex");
  return gen_hmac;
};

router.get(`/favicon.ico`, (req, res) => res.status(204));


module.exports = router;
