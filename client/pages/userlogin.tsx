import { useState } from "react";
import { Layout } from "@/components/Layout";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (isLogin) {
      console.log("Login Data:", form);
    } else {
      console.log("Signup Data:", form);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-xl p-8">
          
          {/* Heading */}
          <h2 className="text-3xl font-bold text-center mb-2">
            {isLogin ? "Welcome Back 👋" : "Create Account 🚀"}
          </h2>
          <p className="text-center text-foreground/60 mb-6">
            {isLogin
              ? "Login to continue your journey"
              : "Sign up to start booking buses"}
          </p>

          {/* FORM */}
          <div className="space-y-4">
            
            {/* Name (Signup only) */}
            {!isLogin && (
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}

            {/* Email */}
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Password */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-semibold transition"
            >
              {isLogin ? "Login" : "Sign Up"}
            </button>
          </div>

          {/* Switch */}
          <div className="text-center mt-6 text-sm">
            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-primary font-semibold hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-primary font-semibold hover:underline"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}