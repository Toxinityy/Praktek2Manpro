const express = require("express");
const db = require("./db");
const bodyParser = require("body-parser");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get("/", async (req, res) => {
  try {
    const [row] = await db.query("SELECT * FROM people");
    res.render("index", { data: row });
  } catch (error) {
    console.log("error execute query: ", error);
    res.status(500).send("internal server eror");
  }
});

app.post("/postPeopleTable", async (req, res) => {
  try {
    // Extract data from the form
    const {
      IDPeople,
      YearBirthPeople,
      peopleEducation,
      peopleMaritalStatus,
      incomePeople,
      kidHomePeople,
      teenHomePeople,
      dateCustPeople,
      recencyPeople,
      complainPeople,
    } = req.body;

    // Insert data into the database
    await db.query(
      "INSERT INTO people (ID, Year_Birth, Education, Marital_Status, Income, Kidhome, Teenhome, Dt_Customer, Recency, Complain) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        IDPeople,
        YearBirthPeople,
        peopleEducation,
        peopleMaritalStatus,
        incomePeople,
        kidHomePeople,
        teenHomePeople,
        dateCustPeople,
        recencyPeople,
        complainPeople,
      ]
    );

    // Redirect to the home page after successful submission
    res.redirect("/");
  } catch (error) {
    console.log("Error executing query: ", error);
    res.status(500).send("Internal server error");
  }
});

app.listen(3000);
