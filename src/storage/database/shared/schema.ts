import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, integer, text, timestamp, index } from "drizzle-orm/pg-core";

// 系统表 - 禁止删除
export const healthCheck = pgTable("health_check", {
  id: serial().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

// 院校表
export const universities = pgTable(
  "universities",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    province: varchar("province", { length: 50 }).notNull(),
    city: varchar("city", { length: 50 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(), // 985/211/双一流/普通
    level: varchar("level", { length: 50 }).notNull(), // 综合/理工/师范/农林/医药/政法/财经/艺术/体育/军事/民族
    logo_url: varchar("logo_url", { length: 500 }),
    website: varchar("website", { length: 200 }),
    description: text("description"),
    is_self_marking: varchar("is_self_marking", { length: 10 }).default("否"), // 自划线院校
    ranking: integer("ranking"), // 软科排名
    region: varchar("region", { length: 2 }).default("A"), // 考研分区：A/B
  },
  (table) => [
    index("universities_province_idx").on(table.province),
    index("universities_type_idx").on(table.type),
    index("universities_level_idx").on(table.level),
    index("universities_name_idx").on(table.name),
  ]
);

// 专业门类/一级学科/二级学科表
export const majors = pgTable(
  "majors",
  {
    id: serial().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    code: varchar("code", { length: 20 }).notNull(),
    category: varchar("category", { length: 50 }).notNull(), // 学科门类：工学/理学/文学/管理学等
    first_level_discipline: varchar("first_level_discipline", { length: 100 }).notNull(), // 一级学科
    degree_type: varchar("degree_type", { length: 20 }).notNull(), // 学硕/专硕
    parent_id: integer("parent_id"), // 父级专业ID（二级学科指向一级学科）
  },
  (table) => [
    index("majors_category_idx").on(table.category),
    index("majors_degree_type_idx").on(table.degree_type),
    index("majors_first_level_idx").on(table.first_level_discipline),
    index("majors_parent_id_idx").on(table.parent_id),
  ]
);

// 院校开设专业关联表
export const universityMajors = pgTable(
  "university_majors",
  {
    id: serial().primaryKey(),
    university_id: integer("university_id").notNull().references(() => universities.id, { onDelete: "cascade" }),
    major_id: integer("major_id").notNull().references(() => majors.id, { onDelete: "cascade" }),
    college_name: varchar("college_name", { length: 100 }), // 所属学院
    direction: varchar("direction", { length: 200 }), // 研究方向
    english_type: varchar("english_type", { length: 20 }), // 英语科目：英语一/英语二
    math_type: varchar("math_type", { length: 20 }), // 数学科目：数学一/数学二/数学三/不考数学
    study_mode: varchar("study_mode", { length: 20 }).default("全日制"), // 学习方式：全日制/非全日制
    exam_subjects: text("exam_subjects"), // 考试科目（JSON格式）
  },
  (table) => [
    index("um_university_id_idx").on(table.university_id),
    index("um_major_id_idx").on(table.major_id),
  ]
);

// 历年录取数据表
export const admissionData = pgTable(
  "admission_data",
  {
    id: serial().primaryKey(),
    university_id: integer("university_id").notNull().references(() => universities.id, { onDelete: "cascade" }),
    major_id: integer("major_id").notNull().references(() => majors.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    score_line_total: integer("score_line_total"), // 总分分数线
    score_line_politics: integer("score_line_politics"), // 政治单科线
    score_line_english: integer("score_line_english"), // 英语单科线
    score_line_profession1: integer("score_line_profession1"), // 业务课一单科线
    score_line_profession2: integer("score_line_profession2"), // 业务课二单科线
    enrolled_count: integer("enrolled_count"), // 录取人数
    applied_count: integer("applied_count"), // 报名人数
  },
  (table) => [
    index("ad_university_id_idx").on(table.university_id),
    index("ad_major_id_idx").on(table.major_id),
    index("ad_year_idx").on(table.year),
    index("ad_university_major_year_idx").on(table.university_id, table.major_id, table.year),
  ]
);
