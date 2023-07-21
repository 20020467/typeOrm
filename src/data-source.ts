import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Student } from "./entity/Student";
import { Courses } from "./entity/Courses";
import { Test1685689843910 } from "./migration/1685689843910-test";

export const dataSource = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "test",
  synchronize: true,
  logging: false,
  entities: [User, Student, Courses],
  migrations: [Test1685689843910],
  subscribers: [],
});
