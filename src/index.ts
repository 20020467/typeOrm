import { dataSource } from "./data-source";
import express from "express";
import { route } from "./routers/index";
import bodyParser = require("body-parser");
const morgan = require("morgan");
import cookieParser = require("cookie-parser");

const app = express();
const PORT = 8080;

dataSource
  .initialize()
  .then(() => {
    app.use(morgan("combined"));
    app.use(bodyParser.json());
    app.use(cookieParser());

    route(app);

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error during Data Source initialization", err);
  });
