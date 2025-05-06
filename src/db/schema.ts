import { int, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const todosTable = sqliteTable("todos_table", {
  id: int().primaryKey({ autoIncrement: true }),
  message: text().notNull(),
  name: text().notNull(),
  done: int({ mode: "boolean" }),
});
