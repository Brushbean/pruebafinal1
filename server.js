import express from "express";
import cors from "cors";
import pool from "./db.js";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

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

// Ruta frontend iniciar sesión
app.get("/iniciarsesion", (req, res) => {
  res.sendFile(path.resolve("public/iniciarsesion/iniciosesion.html"));
});

// Ruta frontend registro
app.get("/registrarse", (req, res) => {
  res.sendFile(path.resolve("public/registrarse/registro.html"));
});

// ============================
//  NODEMAILER (correo real)
// ============================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // TU CORREO
    pass: process.env.EMAIL_PASS  // TU APP PASSWORD
  }
});

// ============================
//  ENVIAR CÓDIGO POR CORREO
// ============================
app.post("/api/enviar-codigo", async (req, res) => {
  const { correo } = req.body;

  if (!correo)
    return res.json({ error: "Falta el correo electrónico" });

  // (Opcional) Validar correo institucional
  if (!correo.endsWith("@cetis68.edu.mx")) {
    return res.json({ error: "Usa tu correo institucional @cetis68.edu.mx" });
  }

  // Código 6 dígitos
  const codigo = Math.floor(100000 + Math.random() * 900000);

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Código de verificación - Atiende Tu Escuela",
      html: `
      <h2>Verificación de cuenta</h2>
      <p>Tu código de verificación es:</p>
      <h1 style="color:#bb2323;">${codigo}</h1>
      <p>Ingresa este código en la página para completar tu registro.</p>
      `
    });

    res.json({
      mensaje: "Código enviado correctamente.",
      codigo // lo mandamos al frontend porque solo ahí validarás
    });

  } catch (err) {
    console.error("ERROR enviando correo:", err);
    res.json({ error: "No se pudo enviar el correo." });
  }
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

// ============================
// SERVIDOR
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor ejecutándose en el puerto " + PORT);
});
