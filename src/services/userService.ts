import { User } from "../entity/User";
import { dataSource } from "../data-source";
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const userRepository = dataSource.getRepository(User);

const sendEmail = async (email: string, subject: string, text: string) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "thequyet1trieu@gmail.com",
        pass: "vyufvbkbeddimuhx",
      },
    });

    // send mail with defined transport object
    await transporter.sendMail({
      from: "thequyet1trieu@gmail.com",
      to: `${email}`,
      subject: `${subject}`,
      text: `${text}`,
    });
    return "Send email successfully!";
  } catch (error) {
    console.log(error);
  }
};

const validateEmail = (email: string) => {
  const pattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  return pattern.test(email);
};

// find user with username
const findUSer = async (username: string) => {
  try {
    const user = await userRepository.findOneBy({ username: username });
    return user;
  } catch (error) {
    console.log(error);
  }
};

export const userService = {
  // POST /auth/register
  register: async (req: Request) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errors;
      }

      if (!validateEmail(req.body.email)) {
        return "email invalid";
      }

      const userWithUsername = await findUSer(req.body.username);
      const userWithEmail = await findUSer(req.body.email);
      if (userWithUsername) {
        return "Username already exists";
      }
      if (userWithEmail) {
        return "Email already exists";
      }

      const salt = await bcryptjs.genSalt(10);
      const hashed = await bcryptjs.hash(req.body.password, salt);

      const newUser = {
        username: req.body.username,
        password: hashed,
        email: req.body.email,
        name: req.body.name,
      };

      const user = await userRepository.save(newUser);
      return {
        success: true,
        user,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errors;
      }

      const user = await findUSer(req.body.username);
      if (!user) {
        return "Wrong username";
      }

      const validatePassword = await bcryptjs.compare(
        req.body.password,
        user.password
      );

      if (!validatePassword) {
        return "Wrong password";
      }

      if (user && validatePassword) {
        const payload = {
          id: user.id,
          username: user.username,
        };
        const token = userService.generateAccessToken(payload, "1d");
        const refreshToken = userService.generateRefreshToken(payload);
        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        return {
          message: "Login success!",
          user,
          token,
          refreshToken,
        };
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  getprofileUser: async (userID: number) => {
    try {
      const userInfo = await userRepository.findOneBy({ id: userID });
      return userInfo;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  changePassword: async (req: Request, userID: number) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errors;
      }

      const userInfo = await userRepository.findOneBy({ id: userID });

      const validatePassword = await bcryptjs.compare(
        req.body.oldPassword,
        userInfo.password
      );

      if (!validatePassword) {
        return "Wrong password";
      }

      if (userInfo && validatePassword) {
        if (req.body.newPassword !== req.body.rePassword) {
          return "New password and rePassword are not the same";
        }

        try {
          const salt = await bcryptjs.genSalt(10);
          const hashed = await bcryptjs.hash(req.body.newPassword, salt);
          userInfo.password = hashed;
          await userRepository.save(userInfo);
          return "Update successfully!";
        } catch (error) {
          return error;
        }
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  forgotPassword: async (req: Request) => {
    try {
      const email = req.body.email;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errors;
      }

      if (!validateEmail(email)) {
        return "Email invalid";
      }
      const user = await userRepository.findOneBy({ email: email });

      if (!user) {
        return "Email not registered, please check again!";
      }

      // const token = jwt.sign(
      //   {
      //     id: user.id,
      //     name: user.name,
      //     email: user.email,
      //   },
      //   process.env.JWT_ACCESS_KEY,
      //   {
      //     expiresIn: "1d",
      //   }
      // );

      const payload = {
        id: user.id,
        name: user.name,
        email: user.email,
      };
      const token = userService.generateAccessToken(payload, "60s");

      const subject = "Verify Email";
      const text = `Hello ${user.name},
Your token is ${token}`;

      const sendMail = await sendEmail(email, subject, text);
      return sendMail;
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  verifyEmail: async (req: Request) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return errors;
      }
      const token = req.body.token;
      const decode = jwt.verify(
        token,
        process.env.JWT_ACCESS_KEY
      ) as JwtPayload;

      const email = decode.email;
      const name = decode.name;
      const password = Math.random().toString(36).substring(2, 8);

      const salt = await bcryptjs.genSalt(10);
      const hashed = await bcryptjs.hash(password, salt);

      try {
        const user = await userRepository.findOneBy({ email: email });
        user.password = hashed;
        await userRepository.save(user);
      } catch (error) {
        return error;
      }

      const subject = "New password";
      const text = `Hello ${name},
Your password is ${password}`;
      const sendMail = await sendEmail(decode.email, subject, text);
      return {
        message: "Email has been verified",
        sendMail,
      };
    } catch (error) {
      console.log(error);
      return error;
    }
  },

  generateAccessToken: (payload: object, expiresIn: string) => {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_KEY, {
      expiresIn: expiresIn,
    });
    return accessToken;
  },

  generateRefreshToken: (payload: object) => {
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_KEY, {
      expiresIn: "365d",
    });
    return refreshToken;
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return "You're not authenticate!";
      }

      // console.log(refreshToken);
      jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, (err, decode) => {
        if (err) {
          ("refresh Token invalid");
        }
        const user = decode as JwtPayload;
        const payload = {
          id: user.id,
          username: user.username,
        };
        const newAccessToken = userService.generateAccessToken(payload, "1d");
        const newRefreshToken = userService.generateRefreshToken(payload);
        res.cookie("refreshToken", newRefreshToken, {
          httpOnly: true,
          secure: false,
          path: "/",
          sameSite: "strict",
        });
        return res.json({ newAccessToken: newAccessToken });
      });
    } catch (error) {
      return error;
    }
  },
};
