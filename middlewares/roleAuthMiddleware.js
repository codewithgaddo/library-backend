function roleAuth(allowedRoles) {
  return (req, res, next) => {
    try {

      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ message: "Invalid Role" });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Unauthorised access: You cannot do this operation." });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: "Role verification error", error: error.message });
    }
  };
}

module.exports = roleAuth;