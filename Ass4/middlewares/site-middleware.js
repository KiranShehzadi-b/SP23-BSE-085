let User = require("../models/user.model");

module.exports = async function (req, res, next) {
  try {
    if (!req.session.user) {
      console.log("Default user session setup");
      let defaultUser = await User.findOne({ email: "usman.akram@gmail.com" });
      req.session.user = defaultUser;
    }

    res.locals.user = req.session.user; // Make user accessible in templates
    req.user = req.session.user;        // Attach user to request
    next();
  } catch (error) {
    console.error("Error in site middleware:", error);
    next(error);
  }
};
