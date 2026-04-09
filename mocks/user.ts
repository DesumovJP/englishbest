// Mock data + types for all user roles
// Used for frontend demo/preview only — no backend required

// ─── Shared ─────────────────────────────────────────────────────────────────

export type Role = "kids" | "adult" | "teacher" | "parent" | "admin";
export type Level = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type CompanionAnimal = "fox" | "cat" | "dragon" | "rabbit" | "raccoon" | "frog";
export type CompanionMood = "idle" | "happy" | "sad" | "celebrate" | "excited" | "sleepy" | "surprised" | "love" | "angry" | "cool";

// ─── Kids ────────────────────────────────────────────────────────────────────

export interface KidsUser {
  documentId: string;
  role: "kids";
  name: string;
  age: number;
  level: Level;
  coins: number;
  streak: number;
  xp: number;
  companion: {
    animal: CompanionAnimal;
    name: string;
    mood: CompanionMood;
    level: number;
  };
  parentDocumentId: string;
  teacherDocumentId: string;
}

export const mockKidsUser: KidsUser = {
  documentId: "user-kids-sofia-001",
  role: "kids",
  name: "Софія",
  age: 8,
  level: "A1",
  coins: 340,
  streak: 7,
  xp: 1240,
  companion: {
    animal: "fox",
    name: "Фокс",
    mood: "happy",
    level: 3,
  },
  parentDocumentId: "user-parent-oksana-001",
  teacherDocumentId: "user-teacher-maria-001",
};

// ─── Adult ───────────────────────────────────────────────────────────────────

export interface AdultUser {
  documentId: string;
  role: "adult";
  name: string;
  email: string;
  level: Level;
  coins: number;
  streak: number;
  xp: number;
  teacherDocumentId: string;
}

export const mockAdultUser: AdultUser = {
  documentId: "user-adult-dmytro-001",
  role: "adult",
  name: "Дмитро",
  email: "dmytro@example.com",
  level: "B1",
  coins: 780,
  streak: 14,
  xp: 5600,
  teacherDocumentId: "user-teacher-maria-001",
};

// ─── Teacher ─────────────────────────────────────────────────────────────────

export interface TeacherUser {
  documentId: string;
  role: "teacher";
  name: string;
  email: string;
  avatar: string;
  bio: string;
  studentCount: number;
  rating: number;
  salaryPerLesson: number;
}

export const mockTeacherUser: TeacherUser = {
  documentId: "user-teacher-maria-001",
  role: "teacher",
  name: "Марія Коваленко",
  email: "maria@englishbest.ua",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  bio: "7 років досвіду, спеціалізація — діти та підлітки",
  studentCount: 18,
  rating: 4.9,
  salaryPerLesson: 180,
};

// ─── Parent ──────────────────────────────────────────────────────────────────

export interface ParentUser {
  documentId: string;
  role: "parent";
  name: string;
  email: string;
  childDocumentIds: string[];
}

export const mockParentUser: ParentUser = {
  documentId: "user-parent-oksana-001",
  role: "parent",
  name: "Оксана",
  email: "oksana@example.com",
  childDocumentIds: ["user-kids-sofia-001"],
};

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminUser {
  documentId: string;
  role: "admin";
  name: string;
  email: string;
}

export const mockAdminUser: AdminUser = {
  documentId: "user-admin-001",
  role: "admin",
  name: "Адміністратор",
  email: "admin@englishbest.ua",
};

// ─── Union ───────────────────────────────────────────────────────────────────

export type AnyUser = KidsUser | AdultUser | TeacherUser | ParentUser | AdminUser;

export const mockUsers: AnyUser[] = [
  mockKidsUser,
  mockAdultUser,
  mockTeacherUser,
  mockParentUser,
  mockAdminUser,
];
