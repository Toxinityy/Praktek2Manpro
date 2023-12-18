const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csvParser = require("csv-parser");
const pool = require("./db");
const bodyParser = require("body-parser");
const upload = multer({ dest: "uploads/" });
const app = express();
const port = 3000;
const util = require ('util')

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  res.render("index");
});
app.get("/view-data", async (req, res) => {
  try {
    // Fetch data from the database
    const data = await fetchDataFromDatabase();

    // Render the view-data template and pass the data
    res.render("view-data", { data });
  } catch (error) {
    console.error("Error rendering view-data:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/add-data", async (req, res) => {
  // res.render('addData');
  const success = req.query.success === "true";

  res.render("add-data", { success });
});

const query = util.promisify(pool.query).bind(pool);

async function fetchDataFromDatabase() {
  try {
    // Execute the SQL query to select all rows from the marketing_campaign table
    const [rows, fields] = await pool.query("SELECT * FROM marketing_campaign");

    // rows will be an array of objects, each representing a row in the table
    return rows;
  } catch (error) {
    console.error("Error fetching data from database:", error);
    throw error; // Rethrow the error to be caught by the calling function
  }
}

app.get("/graph", async (req, res) => {
  res.render("graph");
});
app.post("/upload", upload.single("file_upload"), async (req, res) => {
  try {
    const csvFile = req.file;

    if (!csvFile) {
      console.error("No file uploaded");
      res.status(400).send("No file uploaded");
      return;
    }

    const conn = await pool.getConnection();

    const parserConfig = {
      separator: ";",
    };

    fs.createReadStream(csvFile.path)
      .pipe(csvParser(parserConfig))
      .on("data", async (row) => {
        try {
          // console.log('Printing row:', row);
          let actualID;
          for (const key in row) {
            if (
              Object.prototype.hasOwnProperty.call(row, key) &&
              key.trim() === "ID"
            ) {
              actualID = row[key];
              break;
            }
          }
          // console.log(actualID);

          const marketing_campaign = {
            ID: actualID,
            Year_Birth: row["Year_Birth"],
            Education: row.Education,
            Marital_Status: row.Marital_Status,
            Income: row.Income,
            Kidhome: row.Kidhome,
            Teenhome: row.Teenhome,
            Dt_Customer: row.Dt_Customer,
            Recency: row.Recency,
            MntWines: row.MntWines,
            MntFruits: row.MntFruits,
            MntMeatProducts: row.MntMeatProducts,
            MntFishProducts: row.MntFishProducts,
            MntSweetProducts: row.MntSweetProducts,
            MntGoldProds: row.MntGoldProds,
            NumDealsPurchases: row.NumDealsPurchases,
            NumWebPurchases: row.NumWebPurchases,
            NumCatalogPurchases: row.NumCatalogPurchases,
            NumStorePurchases: row.NumStorePurchases,
            NumWebVisitsMonth: row.NumWebVisitsMonth,
            AcceptedCmp3: row.AcceptedCmp3,
            AcceptedCmp4: row.AcceptedCmp4,
            AcceptedCmp5: row.AcceptedCmp5,
            AcceptedCmp1: row.AcceptedCmp1,
            AcceptedCmp2: row.AcceptedCmp2,
            Complain: row.Complain,
            Z_CostContact: row.Z_CostContact,
            Z_Revenue: row.Z_Revenue,
            Response: row.Response,
          };

          // console.log('Inserting data to database (ID):', marketing_campaign);

          const query = "INSERT INTO marketing_campaign SET ?";
          await conn.query(query, marketing_campaign);
        } catch (error) {
          console.error(
            "Error importing data to Retail Marketing table:",
            error
          );
        }
      })
      .on("end", () => {
        conn.release();
        // Delete the temporary file after processing
        fs.unlinkSync(csvFile.path);
        res.redirect("/add-data?success=true");
      })
      .on("error", (error) => {
        console.error("Error processing CSV data:", error);
        res.status(500).send("Internal Server Error");
      });
  } catch (error) {
    console.error("Error processing file upload:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// app.post("/postPeopleTable", async (req, res) => {
//   try {
//     // Extract data from the form
//     const {
//       IDPeople,
//       YearBirthPeople,
//       peopleEducation,
//       peopleMaritalStatus,
//       incomePeople,
//       kidHomePeople,
//       teenHomePeople,
//       dateCustPeople,
//       recencyPeople,
//       complainPeople,
//     } = req.body;

//     // Insert data into the database
//     await pool.execute(
//       "INSERT INTO people (ID, Year_Birth, Education, Marital_Status, Income, Kidhome, Teenhome, Dt_Customer, Recency, Complain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
//       [
//         IDPeople,
//         YearBirthPeople,
//         peopleEducation,
//         peopleMaritalStatus,
//         incomePeople,
//         kidHomePeople,
//         teenHomePeople,
//         dateCustPeople,
//         recencyPeople,
//         complainPeople,
//       ]
//     );

//     // Redirect to the home page after successful submission
//     res.redirect("/");
//   } catch (error) {
//     console.log("Error executing query: ", error);
//     res.status(500).send("Internal server error");
//   }
// });
