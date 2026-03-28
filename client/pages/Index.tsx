import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";
import {
  MapPin,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground py-20 md:py-32">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Smart Bus Scheduling
                <br />
                <span className="bg-gradient-to-r from-primary-foreground to-secondary bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>

              <p className="text-lg text-primary-foreground/90 mb-8">
                Optimize your public transport network with real-time scheduling,
                intelligent route management, and data-driven insights.
              </p>

              {/* 🔥 BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/book"
                  className="bg-secondary hover:bg-secondary/90 text-secondary-foreground px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
                >
                  Find Buses
                </Link>

                <Link
                  to="/auth"
                  className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-3 rounded-lg font-semibold transition-all"
                >
                  Login / Sign Up
                </Link>

                <Link
                  to="/admin"
                  className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all border border-primary-foreground/40"
                >
                  Admin Dashboard
                </Link>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="hidden md:block">
              <div className="bg-primary-foreground/10 rounded-2xl p-8 border border-primary-foreground/20 backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary-foreground/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-2">47</div>
                    <div className="text-sm">Active Buses</div>
                  </div>
                  <div className="bg-primary-foreground/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-2">12.4K</div>
                    <div className="text-sm">Daily Passengers</div>
                  </div>
                  <div className="bg-primary-foreground/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-2">94%</div>
                    <div className="text-sm">On-Time Rate</div>
                  </div>
                  <div className="bg-primary-foreground/20 rounded-lg p-4 text-center">
                    <div className="text-3xl font-bold mb-2">28</div>
                    <div className="text-sm">Active Routes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-accent text-primary-foreground py-20">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Bus Network?
          </h2>

          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Start managing your buses smarter today.
          </p>

          {/* 🔥 CTA BUTTONS */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 px-8 py-3 rounded-lg font-semibold transition-all"
            >
              Get Started (Login)
            </Link>

            <Link
              to="/book"
              className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-8 py-3 rounded-lg font-semibold transition-all border border-primary-foreground/40"
            >
              Explore Buses
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}