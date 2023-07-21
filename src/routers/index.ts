import { router } from "./authRoute";

export const route = (app) => {
  app.use("/auth", router);
};
