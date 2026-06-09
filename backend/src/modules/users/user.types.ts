export interface Skill {
  name: string;
  level: string;
}

export interface IUser {
  name: string;
  email: string;
  password: string;

  role: "student" | "admin";

  college?: string;
  department?: string;
  year?: number;

  bio?: string;

  githubUrl?: string;
  linkedinUrl?: string;

  profileImage?: string;

  skills: Skill[];

  interests: string[];
}