import express from "express";
import cors from "cors";
import pool from "./db.js";
import path from "path";

// ==== EXPRESS ====
const app = express();
app.use(cors());
app.use(express.json());

// Servir frontend desde /public
app.use(express.static("public"));

// Ruta base frontend
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Ruta para iniciar sesión (frontend)
app.get("/iniciarsesion", (req, res) => {
  res.sendFile(path.resolve("public/iniciarsesion/index.html"));
});

// ============================
//   RUTA: REGISTRO
// ============================
app.post("/api/registro", async (req, res) => {
  const { nombre, correo, contraseña } = req.body;

  if (!nombre || !correo || !contraseña)
    return res.json({ error: "Faltan datos" });

  try {
    await pool.query(
      "INSERT INTO usuarios (nombre, correo, contraseña) VALUES ($1, $2, $3)",
      [nombre, correo, contraseña]
    );

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (err) {
    res.json({ error: "El correo ya está registrado" });
  }
});

// ============================
//   RUTA: LOGIN
// ============================
app.post("/api/login", async (req, res) => {
  const { correo, contraseña } = req.body;

  if (!correo || !contraseña)
    return res.json({ error: "Faltan datos" });

  try {
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE correo = $1 AND contraseña = $2",
      [correo, contraseña]
    );

    if (result.rowCount === 0)
      return res.json({ error: "Correo o contraseña incorrectos" });

    res.json({ mensaje: "Inicio de sesión exitoso" });
  } catch (err) {
    res.json({ error: "Error al iniciar sesión" });
  }
});

// ============================
// Test DB
// ============================
app.get("/test", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW()");
    res.json(r.rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor ejecutándose en el puerto " + PORT);
});
