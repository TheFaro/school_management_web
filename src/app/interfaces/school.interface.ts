import { IAddress } from "./address.interface";
import { IClass } from "./class.interface";
import { IStudent } from "./student.interface";
import { ISubject } from "./subject.interface";
import { IUser } from "./user.interface";

export interface ISchool {
  id: string;
  name: string;
  email: string;

  address: IAddress;

  classes?: IClass[];
  subjects?: ISubject[];

  users: IUser[];
  students?: IStudent[];

  created_at: Date;
  updated_at: Date;
}
