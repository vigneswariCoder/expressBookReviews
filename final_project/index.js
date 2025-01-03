const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;

const app = express();

app.use(express.json());

app.use(
  "/customer",
  session({
    secret: "fingerprint_customer",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use("/customer/auth/*", function auth(req, res, next) {
  const token = req.session?.authorization?.accessToken;
  console.log(req.session);
  if (!token) {
    return res
      .status(403)
      .json({ message: "Access token is missing. Please login." });
  }

  jwt.verify(
    token,
    "4bb6d1dfbafb64a681139d1586b6f1160d18159afd57c8c79136d7490630407c",
    (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json({ message: "Invalid or expired access token." });
      }

      req.user = decoded; 
      next();
    }
  );
  console.log(req.user);
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes); 

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
