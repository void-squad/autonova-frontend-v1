import { Link } from 'react-router-dom';
import {
  Calendar,
  Wrench,
  TrendingUp,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';
import logo from '@/assets/logo.png';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Landing() {
  const features = [
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Book appointments online 24/7 with real-time availability',
    },
    {
      icon: Wrench,
      title: 'Custom Modifications',
      description:
        'Track your vehicle modification projects from start to finish',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Updates',
      description:
        'Get instant notifications on service progress and completion',
    },
    {
      icon: CheckCircle,
      title: 'Quality Service',
      description: 'Professional mechanics with verified certifications',
    },
  ];

  const benefits = [
    'Transparent pricing with detailed invoices',
    'Complete service history tracking',
    'Secure online payments',
    'Mobile-friendly interface',
    'Expert technicians',
    '24/7 customer support',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center space-x-2">
            <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full shadow-glow">
              <img
                src={logo}
                alt="Autonova logo"
                className="h-full w-full object-cover scale-[1.2]"
              />
            </span>
            <span className="text-2xl font-bold">Autonova</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h1 className="text-5xl font-bold leading-tight lg:text-6xl">
            Your Complete Auto Service
            <span className="block gradient-primary bg-clip-text text-white">
              Management Solution
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Schedule appointments, track modifications, and manage your vehicle
            services all in one place
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" variant="hero" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose Autonova?</h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to manage your auto services efficiently
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="hover:shadow-lg transition-smooth"
            >
              <CardHeader>
                <div className="p-3 rounded-lg bg-primary/10 w-fit mb-2">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">
                Built for Modern Auto Services
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Autonova streamlines your entire auto service experience with
                powerful features designed for customers, employees, and
                administrators.
              </p>
              <div className="grid gap-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="p-1 rounded-full bg-primary/10">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="shadow-glow">
                <CardHeader>
                  <CardTitle>Ready to get started?</CardTitle>
                  <CardDescription>
                    Join hundreds of satisfied customers today
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg" variant="hero" asChild>
                    <Link to="/register">Create Your Account</Link>
                  </Button>
                  <p className="text-sm text-center text-muted-foreground">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in here
                    </Link>
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Autonova. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
