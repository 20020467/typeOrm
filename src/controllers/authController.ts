import { Request, Response } from "express";
import { userService } from "../services/userService";

export const authController = {
  // POST /auth/register
  // khong tra ve mk
  register: async (req: Request, res: Response) => {
    try {
      const registerResult = await userService.register(req);
      return res.json(registerResult);
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  // POST /auth/login
  // chi tra ve token
  login: async (req: Request, res: Response) => {
    try {
      const loginResult = await userService.login(req, res);
      return res.json(loginResult);
    } catch (error) {
      console.log(error);
    }
  },

  // POST /auth/getProfile
  getprofileUser: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      const userInfo = await userService.getprofileUser(user.id);
      return res.json(userInfo);
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  // PATCH /auth/changePassword
  changePassword: async (req: Request, res: Response) => {
    try {
      const user = res.locals.user;
      const userID = Number(user.id);
      const changeResult = await userService.changePassword(req, userID);
      return res.json(changeResult);
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  // POST /auth/forgotPassword
  forgotPassword: async (req: Request, res: Response) => {
    try {
      const forgot = await userService.forgotPassword(req);
      return res.json(forgot);
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  // POST /auth/verifyEmail
  verifyEmail: async (req: Request, res: Response) => {
    try {
      const verifyEmailResult = await userService.verifyEmail(req);
      res.status(200).json(verifyEmailResult);
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  // POST /auth/refreshToken
  refreshToken: async (req: Request, res: Response) => {
    try {
      const refresh = await userService.refreshToken(req, res);
      return res.send(refresh);
    } catch (error) {
      console.log(error);
      return error;
    }
  },
};
