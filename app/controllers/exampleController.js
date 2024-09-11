const { QueryTypes } = require('sequelize');
const db = require("../models");
const Attack = db.Attack;
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



// Function to save data to PostgreSQL
const saveDataToDatabase = async (data) => {
  try {
    // Bulk create records
    const flattenedData = data.flat();
    const records = flattenedData.map(item => ({
      sourceCountry: item.sourceCountry,
      destinationCountry: item.destinationCountry,
      millisecond: item.millisecond,
      type: item.type,
      weight: item.weight,
      attackTime: new Date(item.attackTime),
    }));

    await Attack.bulkCreate(records, { ignoreDuplicates: true });
  } catch (error) {
    console.error('Error saving data to database:', error);
  }
};

exports.callmeWebSocket = (ws, req) => {
  // Function to fetch data from the API
  const fetchData = async () => {
    try {
      const response = await fetch('https://livethreatmap.radware.com/api/map/attacks?limit=10');
      const data = await response.json();
      await saveDataToDatabase(data);

      ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Error fetching data:', error);
      ws.send(JSON.stringify({ error: 'Error fetching data' }));
    }
  };
  fetchData();

  // Set interval every 3 minutes
  const interval = setInterval(fetchData, 180000);

  // Clear the interval when the WebSocket closed
  ws.on('close', () => {
    clearInterval(interval);
  });
};

exports.getData = (req, res, next) => {
  const destinationQuery = `
    SELECT "destinationCountry", COUNT(*) as total
    FROM attacks
    GROUP BY "destinationCountry"
    ORDER BY total DESC
  `;

  const sourceQuery = `
    SELECT "sourceCountry", COUNT(*) as total
    FROM attacks
    GROUP BY "sourceCountry"
    ORDER BY total DESC
  `;

  Promise.all([
    db.sequelize.query(destinationQuery, { type: QueryTypes.SELECT }),
    db.sequelize.query(sourceQuery, { type: QueryTypes.SELECT }),
  ])
    .then(([destinationResults, sourceResults]) => {
      const responseData = {
        success: true,
        statusCode: 200,
        data: {
          label: [
            ...destinationResults.map(row => row.destinationCountry),
            ...sourceResults.map(row => row.sourceCountry)
          ],
          total: [
            ...destinationResults.map(row => row.total),
            ...sourceResults.map(row => row.total)
          ]
        }
      };

      res.locals.cacheData = responseData;

      // Send response
      res.status(200).json(responseData);
      next()
    })
    .catch(error => {
      console.error('Error fetching data:', error);
      res.status(500).json({ success: false, statusCode: 500, message: 'Internal Server Error' });
    });
};  
