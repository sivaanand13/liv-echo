import usersRouter from "./users.js";
import chatsRouter from "./chats.js";
import messagesRouter from "./messages.js";
const configRoutes = (app) => {
  app.use("/users", usersRouter);
  app.use("/chats", chatsRouter);
  app.use("/chats", messagesRouter);
  app.use("{0,1}", async (req, res) => {
    res.status(404).json({
      message: "Invalid Route!",
    });
  });
};

export default configRoutes;
