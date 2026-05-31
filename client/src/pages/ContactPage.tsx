import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLocation } from "wouter";
import { ArrowLeft, Mail, MessageSquare, Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-6 gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Contact Us</h1>
          <p className="text-muted-foreground text-lg">
            Have questions or feedback? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Contact Info Cards */}
          <Card className="p-6 border-primary/10 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <p className="text-sm text-muted-foreground">
                  rndevi9782@gmail.com
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/10 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Response Time</h3>
                <p className="text-sm text-muted-foreground">
                  Within 24-48 hours
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-primary/10 hover:border-primary/30 transition-colors">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Support</h3>
                <p className="text-sm text-muted-foreground">
                  Always available
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Contact Form */}
        <Card className="p-8 shadow-lg border-primary/10">
          <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name</label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="border-primary/20 focus:border-primary/50"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="border-primary/20 focus:border-primary/50"
                />
              </div>
            </div>

            {/* Subject Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="How can we help?"
                className="border-primary/20 focus:border-primary/50"
              />
            </div>

            {/* Message Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about your inquiry..."
                rows={6}
                className="border-primary/20 focus:border-primary/50 resize-none"
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 h-11 font-semibold"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-primary/10">
            <h3 className="font-semibold mb-4">What to Include in Your Message</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>Bug reports: Include app version and steps to reproduce</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>Feature requests: Describe the feature and why it would help</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>General inquiries: Be as detailed as possible</span>
              </li>
            </ul>
          </div>
        </Card>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 border-primary/10">
              <h3 className="font-semibold mb-2">Is the app free?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, AI Study Planner is completely free to use with all features available.
              </p>
            </Card>

            <Card className="p-6 border-primary/10">
              <h3 className="font-semibold mb-2">How do I report a bug?</h3>
              <p className="text-sm text-muted-foreground">
                Use the contact form above and include detailed steps to reproduce the issue.
              </p>
            </Card>

            <Card className="p-6 border-primary/10">
              <h3 className="font-semibold mb-2">Can I suggest a feature?</h3>
              <p className="text-sm text-muted-foreground">
                Absolutely! We love hearing ideas from our users. Send us your suggestions.
              </p>
            </Card>

            <Card className="p-6 border-primary/10">
              <h3 className="font-semibold mb-2">Is my data private?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, all your data is stored locally. Check our Privacy Policy for details.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
