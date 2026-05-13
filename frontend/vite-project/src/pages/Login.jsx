import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../store/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading, bootstrapAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminMode, setAdminMode] = useState(false);
  const [error, setError] = useState("");
  const [helper, setHelper] = useState("");
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [adminForm, setAdminForm] = useState({
    key: "make-admin-2026",
    name: "",
    email: "",
    password: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setHelper("");
    const result = await login({ email, password }, adminMode);
    if (!result.ok) {
      setError(result.message);
      if (adminMode) {
        setHelper("If admin login fails, click 'Create first admin account'.");
      }
      return;
    }
    navigate(adminMode ? "/dashboard" : "/products");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Helmet>
        <title>Login - Luwia</title>
        <meta name="description" content="Sign in for cart, wishlist, order tracking and dashboard" />
      </Helmet>

      <form onSubmit={submit} className="glass-card w-full max-w-md p-7">
        <h2 className="mb-5 text-4xl text-emerald-950">Welcome Back</h2>

        <div className="mb-4 grid grid-cols-2 rounded-full bg-emerald-50 p-1 text-sm">
          <button
            type="button"
            onClick={() => setAdminMode(false)}
            className={`rounded-full px-3 py-2 ${!adminMode ? "bg-emerald-900 text-white" : "text-emerald-900"}`}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => setAdminMode(true)}
            className={`rounded-full px-3 py-2 ${adminMode ? "bg-emerald-900 text-white" : "text-emerald-900"}`}
          >
            Admin Login
          </button>
        </div>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mb-3 w-full rounded border border-amber-100 p-2"
          placeholder="Email"
          required
          type="email"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-3 w-full rounded border border-amber-100 p-2"
          placeholder="Password"
          required
          type="password"
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        {helper && <p className="mb-3 text-sm text-amber-700">{helper}</p>}

        <button className="gold-button w-full" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
        <p className="mt-4 text-sm text-emerald-900">
          New user? <Link className="font-semibold text-amber-700" to="/signup">Create account</Link>
        </p>

        <button
          type="button"
          onClick={() => setShowBootstrap(!showBootstrap)}
          className="mt-4 text-sm font-semibold text-emerald-900 underline"
        >
          Create or promote admin account
        </button>

        {showBootstrap && (
          <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 p-3 text-sm">
            <p className="mb-2 font-semibold text-emerald-900">Admin bootstrap helper</p>
            <p className="mb-3 text-xs text-emerald-800">Already have an account? Enter that email below — it will be promoted to admin. Or enter a new email to create a fresh admin account.</p>
            <input
              className="mb-2 w-full rounded border border-amber-100 p-2"
              value={adminForm.key}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, key: e.target.value }))}
              placeholder="Bootstrap key"
            />
            <input
              className="mb-2 w-full rounded border border-amber-100 p-2"
              value={adminForm.name}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Admin name"
            />
            <input
              className="mb-2 w-full rounded border border-amber-100 p-2"
              value={adminForm.email}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Admin email"
            />
            <input
              className="mb-2 w-full rounded border border-amber-100 p-2"
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Admin password"
            />
            <button
              type="button"
              className="rounded-full bg-emerald-900 px-4 py-2 text-white"
              onClick={async () => {
                const res = await bootstrapAdmin(adminForm);
                if (!res.ok) {
                  setError(res.message);
                  return;
                }
                const promoted = res.data?.message?.includes("promoted");
                setHelper(
                  promoted
                    ? "Account promoted to admin. Switch to Admin Login and use your existing password."
                    : "Admin created. Switch to Admin Login mode and enter these credentials."
                );
                setError("");
                setEmail(adminForm.email);
                if (!promoted) setPassword(adminForm.password);
                setAdminMode(true);
              }}
            >
              Create / Promote Admin
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Login;