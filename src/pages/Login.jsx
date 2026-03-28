import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate(); // 🔥 CLAVE

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // ✅ REDIRIGE AL ADMIN
      navigate("/admin");

    } catch (err) {
      alert("Error al iniciar sesión");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#020617",
      color: "white"
    }}>
      <div style={{ background: "#0f172a", padding: 30, borderRadius: 12 }}>
        <h2>🔐 Admin Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 20 }}
        />

        <button onClick={handleLogin}>
          Entrar
        </button>
      </div>
    </div>
  );
}