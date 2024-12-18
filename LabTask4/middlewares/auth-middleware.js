module.exports = async function (req, res, next) {
  if (!req.session.user) {
    console.log("Unauthorized access, redirecting to login");
    return res.redirect("/login");
  }
  next();
};
