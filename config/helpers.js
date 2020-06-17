const Mysqli = require("mysqli");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

let conn = new Mysqli({
  host: "localhost", //  IP / domain name
  post: 3000, // Port, default 3306
  user: "backend_user", // user name
  passwd: `Vignesh06`, // password
  db: "angularsite_backend", // The  database can be specified or not [optional]
});

let db = conn.emit(false, "");

const secret = "Y8fdqp2QLiRU1O0VCrNMdNUI";

module.exports = {
  database: db,
  secret: secret,
  validJWTNeeded: (req, res, next) => {
    if (req.headers["authorization"]) {
      try {
        let authorization = req.headers["authorization"].split(" ");
        if (authorization[0] !== "Bearer") {
          return res.status(401).send();
        } else {
          req.jwt = jwt.verify(authorization[1], secret);
          return next();
        }
      } catch (err) {
        return res.status(403).send("Authentication faileds");
      }
    } else {
      return res.status(401).send("No authorization header found.");
    }
  },
  hasAuthFields: (req, res, next) => {
    let errors = [];

    if (req.body) {
      if (!req.body.email) {
        errors.push("Missing email field");
      }
      if (!req.body.password) {
        errors.push("Missing password field");
      }

      if (errors.length) {
        return res.status(400).send({ errors: errors.join(",") });
      } else {
        return next();
      }
    } else {
      return res
        .status(400)
        .send({ errors: "Missing email and password fields" });
    }
  },
  isPasswordAndUserMatch: async (req, res, next) => {
    const myPlaintextPassword = req.body.password;
    const myEmail = req.body.email;

    const user = await db
      .table("users")
      .filter({ $or: [{ email: myEmail }, { username: myEmail }] })
      .get();
    if (user) {
      // const match = await bcrypt.compare(myPlaintextPassword, user.password);
      if (myPlaintextPassword == user.password) {
        req.username = user.username;
        req.email = user.email;
        next();
      } else {
        res.status(401).send("Username or password incorrect test-");
      }
    } else {
      res.status(401).send("Username or password incorrect");
    }
  },
};
