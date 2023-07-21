import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const middleware = {
  //verify token
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    // const token = req.header("Authorization")?.replace("Bearer ", "");
    const token = req.header("token");
    if (token) {
      const accessToken = token.split(" ")[1];
      jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, decoded) => {
        if (err) {
          res.status(403).json("Token is not valid");
        }
        res.locals.user = decoded;
        next();
      });
    } else {
      res.status(403).json("You are not authenticated");
    }
  },
};
