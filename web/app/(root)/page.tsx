import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Calendar, BarChart3, Users } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

const page = async () => {
  const session = await auth();
  if (session?.user) {
    redirect("/dashboard");
  }
  return (
    <div className="container">
      <section className="py-20 px-4 text-center">
        <div className="container max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 text-balance">
            Schedule Your Social Media Posts{" "}
            <span className="text-primary">Effortlessly</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Save time and grow your audience with TimelyPost. Schedule posts
            across all major platforms, track performance, and engage with your
            community—all from one powerful dashboard.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Smart Scheduling
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                AI-powered optimal posting times for maximum engagement
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Track performance and grow your audience with detailed insights
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">
                Team Collaboration
              </h3>
              <p className="text-sm text-muted-foreground text-center">
                Work together seamlessly with approval workflows and role
                management
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default page;
