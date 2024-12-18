module.exports = async function (req, res, next) {
  // Check if the user is logged in and has admin privileges
  if (!req.session.user?.role || !req.session.user.role.includes("admin")) {
    console.log("Unauthorized access attempt to admin route");
    return res.redirect("/");
  }
  next();
};
