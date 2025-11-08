import { Link } from 'react-router-dom';
import {
  Car,
  Clock,
  Wrench,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export default function Landing() {
  const services = [
    {
      icon: Clock,
      title: 'Smart Scheduling',
      description:
        'Book appointments with real-time availability and instant confirmations',
    },
    {
      icon: Wrench,
      title: 'Service Tracking',
      description:
        'Monitor vehicle maintenance and modifications from start to finish',
    },
    {
      icon: TrendingUp,
      title: 'Real-time Updates',
      description:
        'Get instant notifications on service progress and completion',
    },
    {
      icon: Shield,
      title: 'Quality Assured',
      description:
        'Certified technicians with transparent pricing and detailed invoices',
    },
  ];

  const benefits = [
    'Browse certified service centers',
    'Transparent service pricing',
    'Complete service history by vehicle',
    'Expert technical support',
    'Secure online payments',
    'Digital invoice storage',
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Car className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
              Autonova
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild className="hidden sm:flex">
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Visual Hero Section - Gallery at Top */}
      <section className="relative py-24 overflow-hidden bg-white">
        <div className="relative z-10 container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-20">
            <Badge variant="secondary" className="mb-4 gap-2 inline-flex">
              <Car className="h-3.5 w-3.5" />
              Professional Excellence
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Premium Auto Service Centers
            </h2>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Experience the finest automotive service centers with
              state-of-the-art facilities, certified technicians, and
              comprehensive solutions for all your vehicle needs
            </p>
          </div>

          {/* Gallery Grid - Masonry Style */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 auto-rows-max">
            {/* Large featured image - spans 2 cols and 2 rows */}
            <div className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer">
              <img
                src="https://www.sterling.lk/wp-content/uploads/2024/01/tile.jpg"
                alt="Premium Auto Service Center"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-6 text-white w-full">
                  <h3 className="text-2xl font-bold mb-1">
                    Premium Service Center
                  </h3>
                  <p className="text-sm text-gray-200">
                    State-of-the-art facilities with modern equipment
                  </p>
                </div>
              </div>
            </div>

            {/* Image 2 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <img
                src="https://www.mrpaintauto.lk/news/wp-content/uploads/2024/08/tips-to-select-best-car-service-company-sri-lanka-1024x585.jpg"
                alt="Professional Service Team"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="font-bold text-lg mb-0.5">
                    Expert Technicians
                  </h3>
                  <p className="text-xs text-gray-200">
                    Certified professionals with years of experience
                  </p>
                </div>
              </div>
            </div>

            {/* Image 3 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <img
                src="https://www.unitedmotors.lk/images/xonline-service1.jpg.pagespeed.ic.WxBVyMWu7v.jpg"
                alt="Online Service Booking"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="font-bold text-lg mb-0.5">Easy Booking</h3>
                  <p className="text-xs text-gray-200">
                    Quick & convenient online appointments
                  </p>
                </div>
              </div>
            </div>

            {/* Image 4 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <img
                src="https://www.senoksl.com/images/site-specific/after-sales/auto_services/auto_service_2.jpg"
                alt="Quality Service"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="font-bold text-lg mb-0.5">Quality Work</h3>
                  <p className="text-xs text-gray-200">
                    Premium standards guaranteed
                  </p>
                </div>
              </div>
            </div>

            {/* Image 5 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <img
                src="https://www.senoksl.com/images/site-specific/after-sales/auto_services/auto_service_1.jpg"
                alt="Complete Service Solutions"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="font-bold text-lg mb-0.5">Full Solutions</h3>
                  <p className="text-xs text-gray-200">
                    All your vehicle care needs
                  </p>
                </div>
              </div>
            </div>

            {/* Image 6 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <img
                src="https://www.unitedmotors.lk/images/online-service2.jpg.pagespeed.ce.ZOsbq5K2qJ.jpg"
                alt="Online Service Platform"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="font-bold text-lg mb-0.5">Online Services</h3>
                  <p className="text-xs text-gray-200">
                    Digital convenience at your fingertips
                  </p>
                </div>
              </div>
            </div>

            {/* Image 7 */}
            <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
              <img
                src="https://www.unitedmotors.lk/images/xonline-service3.jpg.pagespeed.ic.RqyHq795_p.jpg"
                alt="Advanced Service Solutions"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <div className="p-4 text-white w-full">
                  <h3 className="font-bold text-lg mb-0.5">Advanced Tech</h3>
                  <p className="text-xs text-gray-200">
                    Cutting-edge diagnostic tools
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section with Text */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-4xl space-y-8">
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="gap-2 px-4 py-2">
              <Zap className="h-3.5 w-3.5" />
              Professional Vehicle Care Platform
            </Badge>
          </div>

          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block">Keep Your Vehicles</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                Running Perfectly
              </span>
            </h1>
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Autonova connects vehicle owners with certified service providers.
            Schedule, track, and manage all your vehicle maintenance in one
            elegant platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              size="lg"
              variant="hero"
              asChild
              className="gap-2 w-full sm:w-auto"
            >
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto"
            >
              <Link to="/login">Already a Member? Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 gap-2 inline-flex">
            <Car className="h-3.5 w-3.5" />
            Core Features
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Comprehensive Vehicle Management
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Everything you need to maintain, repair, and track your vehicles
            with precision
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Card
                key={service.title}
                className="hover:shadow-lg transition-all hover:border-primary/50 group"
              >
                <CardHeader className="space-y-4">
                  <div className="p-3 rounded-lg bg-primary/10 w-fit group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{service.title}</CardTitle>
                    <CardDescription className="text-sm mt-2">
                      {service.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <div>
                <Badge variant="outline" className="mb-4 gap-2">
                  <Car className="h-3 w-3" />
                  Why Autonova
                </Badge>
                <h2 className="text-4xl font-bold mb-4">
                  Vehicle Care Made Simple
                </h2>
                <p className="text-muted-foreground text-lg">
                  From scheduling to tracking, manage all your vehicle services
                  in one unified platform. Designed for seamless integration
                  with your lifestyle.
                </p>
              </div>

              <Separator className="my-8" />

              <div className="space-y-3">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="p-1.5 rounded-full bg-primary/10 flex-shrink-0">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium text-base">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-2xl opacity-75" />
              <Card className="relative shadow-2xl border-primary/30">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Car className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl">Join Today</CardTitle>
                      <CardDescription>
                        Start managing your vehicles the smart way
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="space-y-5 pt-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">What You Get:</h4>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Instant service booking
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Real-time service updates
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                        Complete vehicle records
                      </li>
                    </ul>
                  </div>
                  <Separator />
                  <Button className="w-full" size="lg" variant="hero" asChild>
                    <Link to="/register">Create Your Account</Link>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Already registered?{' '}
                    <Link
                      to="/login"
                      className="text-primary hover:underline font-semibold"
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
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                  <Car className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-bold text-lg">Autonova</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Professional vehicle service management made simple.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Services</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Book Appointment
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Track Status
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  My Vehicles
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link
                    to="/login"
                    className="hover:text-primary transition-colors"
                  >
                    Sign In
                  </Link>
                </li>
                <li>
                  <Link
                    to="/register"
                    className="hover:text-primary transition-colors"
                  >
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Privacy Policy
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Terms of Service
                </li>
                <li className="hover:text-primary transition-colors cursor-pointer">
                  Contact
                </li>
              </ul>
            </div>
          </div>
          <Separator className="mb-6" />
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Autonova. All rights reserved.
            </p>
            <p className="mt-4 md:mt-0">
              Trusted by vehicle owners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
