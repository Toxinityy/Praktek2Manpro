const express = require("express");
const multer = require("multer");
const fs = require("fs");
const csvParser = require("csv-parser");
const pool = require("./db");
const bodyParser = require("body-parser");
const upload = multer({ dest: "uploads/" });
const util = require('util');
const app = express();
const port = 3000;
const query = util.promisify(pool.query).bind(pool);



app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));


app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  res.render("index");
});

app.get("/add-data", async (req, res) => {
  // res.render('addData');
  const success = req.query.success === "true";

  res.render("add-data", { success });
});

app.get("/bar-chart", async (req, res) => {
  res.render("bar-chart");
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

//saat "See Report" di klik
app.get("/see_report", (req, res) => {
  res.render("see_report");
});
app.get("/scatter-plot", (req, res) => {
  res.render("scatter-plot");
});


const getReport = (conn, agregat, kelompok, kolom) => {
  return new Promise((resolve, reject) => {
    conn.query(`SELECT ${kelompok} AS Kelompok, ${agregat}(${kolom}) AS Hasil FROM marketing_campaign GROUP BY ${kelompok}`, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};
const dbConnect = () => {
  return new Promise((resolve, reject) => {
      pool.getConnection((err, conn) => {
          if(err){
              reject (err);
          }
          else{
              resolve(conn);
          }
      }
      )
  })
};

app.post("/searched_report", async (req, res) => {
  const conn = await dbConnect();
  const { kelompok, agregat, kolom } = req.body;
  const hasil = await getReport(conn, agregat, kelompok, kolom);
  res.render("searched_report", {
    kelompok: kelompok,
    agregat: agregat,
    kolom: kolom,
    rows: hasil,
  });
});
app.post("/get-bar-chart", async (req, res) => {
  const conn = await dbConnect();
  const { kelompok, agregat, kolom } = req.body;
  const hasil = await getReport(conn, agregat, kelompok, kolom);
  res.render("get-bar-chart", {
    kelompok: kelompok,
    agregat: agregat,
    kolom: kolom,
    rows: hasil,
  });
});
app.post("/get-scatter-plot", async (req, res) => {
  const conn = await dbConnect();
  const { kelompok, agregat, kolom } = req.body;
  const hasil = await getReport(conn, agregat, kelompok, kolom);
  res.render("get-scatter-plot", {
    kelompok: kelompok,
    agregat: agregat,
    kolom: kolom,
    rows: hasil,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

