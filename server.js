require('@google-cloud/debug-agent').start()

const express = require("express");
const bodyParser = require("body-parser");

// var morgan = require("morgan");
const app = express();
// var cors = require("cors");
const recordRouter = require('./routes/record')
//parse application/json
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(morgan("dev"));
// app.use(cors());
app.use(bodyParser.urlencoded({extended: true}))
app.use(recordRouter)
//panggil routes
// var routes = require("./routes");
// routes(app);

//daftarkan menu routes dari index
// app.use("/auth", require("./middleware"));

app.get("/", (req, res) => {
  console.log("Response success")
  res.send("Response Success!")
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log("Server is up and listening on " + PORT)
})


// app.listen(3001, () => {
//   console.log("Server started on port 3001");
// });
