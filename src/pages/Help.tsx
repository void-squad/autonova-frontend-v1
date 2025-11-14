import { Link } from "react-router-dom";
import { LifeBuoy, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const resourceLinks = [
  {
    title: "Getting started",
    description: "Step-by-step walkthroughs for onboarding, booking, and tracking projects.",
    href: "/customer/dashboard",
  },
  {
    title: "Team handbook",
    description: "Best practices for technicians, estimators, and project managers.",
    href: "/employee/dashboard",
  },
  {
    title: "Billing guide",
    description: "Understand invoices, approvals, disputes, and payment methods.",
    href: "/customer/billing",
  },
  {
    title: "Status page",
    description: "Live uptime metrics and scheduled maintenance updates.",
    href: "https://status.autonova.app",
    external: true,
  },
];

const linkButtonClass =
  "inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary/10 hover:text-primary";

const faqs = [
  {
    question: "Where can I see ongoing work on my vehicle?",
    answer:
      "Head to Service Progress from the sidebar to review milestones, media uploads, and technician notes in real time.",
  },
  {
    question: "How do technicians log time for a task?",
    answer:
      "Technicians can open the Time Logging workspace, pick an active project, and submit hours with a short context note.",
  },
  {
    question: "What if a payment fails?",
    answer:
      "Unsuccessful payments trigger an email with retry steps. You can also open the Billing page to update payment methods and re-run the charge.",
  },
  {
    question: "How do I invite another teammate?",
    answer:
      "Admins can invite new teammates from the Employees panel. If you do not see that option, contact your account owner to request access.",
  },
];

export default function Help() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Badge className="w-fit bg-primary/15 text-primary">Help Center</Badge>
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">We’ve got your back</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground lg:text-4xl">
                Everything you need to keep projects rolling smoothly
              </h1>
            </div>
            <p className="max-w-2xl text-base text-muted-foreground">
              Explore tips, playbooks, and quick contacts for Autonova’s customer, employee, and admin workspaces. No
              support ticket required.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/customer/dashboard">View service tutorials</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <a href="mailto:support@autonova.app">Talk to support</a>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border bg-card/70 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3 text-muted-foreground">
              <LifeBuoy className="h-10 w-10 text-primary" />
              <div>
                <p className="text-sm font-medium text-primary">Average response</p>
                <p className="text-2xl font-semibold text-foreground">37 minutes</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Our specialists solve 92% of cases in the first reply. Share logs or screenshots to help us respond even
              faster.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Shortcuts & resources</h2>
          <p className="text-sm text-muted-foreground">
            Bookmark the workflows your team uses most often and jump right in.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {resourceLinks.map((resource) => (
            <Card key={resource.title} className="h-full border-dashed">
              <CardHeader>
                <CardTitle className="text-base">{resource.title}</CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {resource.external ? (
                  <a href={resource.href} target="_blank" rel="noreferrer" className={linkButtonClass}>
                    Open link <ExternalLink className="h-4 w-4" />
                  </a>
                ) : (
                  <Link to={resource.href} className={linkButtonClass}>
                    Go now <ExternalLink className="h-4 w-4" />
                  </Link>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">FAQs</h2>
          <p className="text-sm text-muted-foreground">Typical questions from teams just like yours.</p>
        </div>
        <Card>
          <CardContent className="p-0">
            <Accordion type="single" collapsible className="divide-y">
              {faqs.map((faq, index) => (
                <AccordionItem key={faq.question} value={`faq-${index}`}>
                  <AccordionTrigger className="px-6 text-left text-base">{faq.question}</AccordionTrigger>
                  <AccordionContent className="px-6 text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
