import uploadMiddleware from "./uploadMiddleware.js";
import loggingMiddleware from "./loggingMiddleware.js";
const configMiddlewares = (app) => {
  app.use(loggingMiddleware);
};

export default configMiddlewares;
