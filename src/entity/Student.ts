import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { User } from "./User";
import { Courses } from "./Courses";

@Entity()
export class Student extends User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  Code: string;

  @ManyToOne(() => Courses, (course) => course.student)
  courses: Courses[];
}
