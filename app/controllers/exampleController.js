const { QueryTypes } = require('sequelize');
const db = require("../models");
// const Model = db.Model;
// const { Op } = require("sequelize");

exports.refactoreMe1 = (req, res) => {
  // function ini sebenarnya adalah hasil survey dri beberapa pertnayaan, yang mana nilai dri jawaban tsb akan di store pada array seperti yang ada di dataset
  db.sequelize.query(`select * from "surveys"`).then((data) => {
    let indices = Array.from({ length: 10 }, () => []);

    data[0].forEach((e) => {
      e.values.forEach((value, index) => {
        indices[index].push(value);
      });
    });

    console.log(indices)

    const totalIndex = indices.map(subArray => {
      const sum = subArray.reduce((acc, curr) => acc + curr, 0);
      return sum / 10;
    });


    res.status(200).send({
      statusCode: 200,
      success: true,
      data: totalIndex,
    });
  });
};

exports.refactoreMe2 = (req, res) => {
  // function ini untuk menjalakan query sql insert dan mengupdate field "dosurvey" yang ada di table user menjadi true, jika melihat data yang di berikan, salah satu usernnya memiliki dosurvey dengan data false
  db.sequelize.transaction(async (transaction) => {
    try {
      // Insert survey data
      await db.sequelize.query(
        'INSERT INTO surveys ("userId", "values", "createdAt", "updatedAt") VALUES (:userId, :values, now(), now())',
        {
          replacements: {
            userId: req.body.id,
            values: `{${req.body.values.join(',')}}`,
          },
          type: QueryTypes.INSERT,
          transaction,
        }
      );

      // Update user data
      await db.sequelize.query(
        'UPDATE users SET dosurvey = true, "updatedAt" = now() WHERE id = :id',
        {
          replacements: { id: req.body.userId },
          type: QueryTypes.UPDATE,
          transaction,
        }
      );
      console.log("success");
      res.status(201).send({
        statusCode: 201,
        message: "Survey sent successfully!",
        success: true,
        data: req.body,
      });
    } catch (err) {
      await transaction.rollback();
      console.log(err);
      res.status(500).send({
        statusCode: 500,
        message: "Cannot post survey.",
        success: false,
      });
    }
  });
};

exports.callmeWebSocket = (req, res) => {
  // do something
};

exports.getData = (req, res) => {
  // do something
};  
