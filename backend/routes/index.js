import usersRouter from "./users.js";
const configRoutes = (app) => {
  app.use("/users", usersRouter);
  app.use("{0,1}", async (req, res) => {
    res.status(404).json({
      message: "Invalid Route!",
    });
  });
};

export default configRoutes;
