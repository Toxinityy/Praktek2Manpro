const express = require("express");
const db = require("./db");

const app = express();

app.use(express.static("public"));

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

app.listen(3000);
