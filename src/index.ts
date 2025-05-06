import express from "express";
import morgan from "morgan";
import cors from "cors";
import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import { todoCreateDto } from "./types/schema";
import { todosTable } from "./db/schema";
import { eq } from "drizzle-orm";
import { Readable } from "stream";
import {} from "@libsql/client/web";

const db = drizzle({ client: createClient({ url: process.env.DB_FILE_NAME! }) });
const app = express();

app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.get("/todos", async (req, res) => {
  try {
    const entities = await db.select().from(todosTable);
    const stream = Readable.from(entities);
    let first = true;
    res.write('{ "status": "success", "data": [');
    stream.on("data", (row) => {
      const json = JSON.stringify(row);
      res.write(first ? json : "," + json);
      first = false;
    });
    stream.on("end", () => {
      res.write("]}");
      res.end();
    });
  } catch {
    res.status(500).json({ status: "error", message: "Failed to get todos" });
  }
});

app.get("/todos/:id", async (req, res) => {
  try {
    const result = await db
      .select()
      .from(todosTable)
      .where(eq(todosTable.id, parseInt(req.params.id)));
    const entity = result.at(0);
    if (!entity) {
      res.status(404).json({ status: "error", message: "Not Found!" });
      return;
    }
    res.status(200).json({ status: "success", data: entity });
  } catch {
    res.status(500).json({ status: "error", message: "Failed to get todo" });
  }
});

app.post("/todos", async (req, res) => {
  try {
    const result = todoCreateDto.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({ status: "error", data: result.error.flatten().fieldErrors });
      return;
    }
    const entity = (
      await db
        .insert(todosTable)
        .values({ ...result.data, done: false })
        .returning()
    ).at(0);
    res.status(201).json({ status: "success", data: entity });
  } catch {
    res.status(500).json({ status: "error", message: "Failed to create todo" });
  }
});

app.patch("/todos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      res.status(404).json({ status: "error", message: "Todo not found!" });
      return;
    }
    const entity = (await db.update(todosTable).set(req.body).where(eq(todosTable.id, id)).returning()).at(0);
    res.status(200).json({ status: "success", data: entity });
  } catch {
    res.status(500).json({ status: "error", message: "Failed to update todo" });
  }
});

app.delete("/todos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      res.status(404).json({ status: "error", message: "Todo not found!" });
      return;
    }
    const entity = (await db.delete(todosTable).where(eq(todosTable.id, id)).returning()).at(0);
    res.status(200).json({ status: "success", data: entity });
  } catch {
    res.status(500).json({ status: "error", message: "Failed to delete todo" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
