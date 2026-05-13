import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../store/AuthContext";

const Signup = () => {
	const { signup, loading } = useAuth();
	const navigate = useNavigate();
	const [form, setForm] = useState({ name: "", email: "", password: "" });
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");

	const onSubmit = async (e) => {
		e.preventDefault();
		const result = await signup(form);
		if (!result.ok) {
			setError(result.message);
			setSuccess("");
			return;
		}
		setError("");
		setSuccess("Account created. You can now login.");
		setTimeout(() => navigate("/login"), 700);
	};

	return (
		<div className="flex min-h-screen items-center justify-center px-4">
			<Helmet>
				<title>Signup - Luwia</title>
				<meta name="description" content="Create an account for wishlist, cart and order tracking" />
			</Helmet>

			<form onSubmit={onSubmit} className="glass-card w-full max-w-md p-7">
				<h2 className="mb-5 text-4xl text-emerald-950">Create Account</h2>

				<input
					value={form.name}
					onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
					className="mb-3 w-full rounded border border-amber-100 p-2"
					placeholder="Name"
					required
				/>
				<input
					value={form.email}
					onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
					className="mb-3 w-full rounded border border-amber-100 p-2"
					placeholder="Email"
					required
					type="email"
				/>
				<input
					value={form.password}
					onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
					className="mb-3 w-full rounded border border-amber-100 p-2"
					placeholder="Password"
					required
					type="password"
					minLength={6}
				/>

				{error && <p className="mb-3 text-sm text-red-600">{error}</p>}
				{success && <p className="mb-3 text-sm text-emerald-700">{success}</p>}

				<button className="gold-button w-full" disabled={loading}>
					{loading ? "Creating..." : "Sign Up"}
				</button>
				<p className="mt-4 text-sm text-emerald-900">
					Already registered? <Link className="font-semibold text-amber-700" to="/login">Sign in</Link>
				</p>
			</form>
		</div>
	);
};

export default Signup;
