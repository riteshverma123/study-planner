import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  const [, setLocation] = useLocation();

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
          <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">
            Effective Date: April 26, 2026
          </p>
        </div>

        {/* Content */}
        <Card className="p-8 space-y-8 shadow-lg border-primary/10">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              1. No Personal Data Collection by Us
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              AI Study Planner ("we", "our", or "us") respects your privacy. We do not collect, store, or manage any personal information on our own servers.
            </p>
            <ul className="space-y-2 ml-6 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>The app does not require account creation.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>We do not maintain any database of user data.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>We do not directly collect personal details such as name, email, or phone number.</span>
              </li>
            </ul>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              2. Local Data Storage
            </h2>
            <ul className="space-y-2 ml-6 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>All data you enter in the app (such as study plans, schedules, or notes) is stored only on your device.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>This data never leaves your device unless required for specific features (like AI processing).</span>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              3. AI Features
            </h2>
            <ul className="space-y-2 ml-6 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>AI Study Planner provides AI-based suggestions and study planning.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>To generate responses, your input may be temporarily sent to third-party AI services.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>We do not store, save, or reuse your data after the AI response is generated.</span>
              </li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              4. Third-Party Services
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              The app uses trusted third-party services that may process limited data:
            </p>
            
            <div className="space-y-4 ml-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary">a) AI Service Providers</h3>
                <ul className="space-y-1 ml-4 text-foreground/80">
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Used to process your input and generate study plans.</span>
                  </li>
                  <li className="flex gap-2">
                    <span>•</span>
                    <span>Only necessary data is processed temporarily.</span>
                  </li>
                </ul>
              </div>
            </div>

            <p className="text-foreground/80 leading-relaxed">
              We do not control how these third parties use data. Please review their privacy policies for more details.
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              5. Data Sharing
            </h2>
            <ul className="space-y-2 ml-6 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>We do not sell, rent, or share your personal data.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>Since we do not collect personal data, no personal data is stored or shared by us.</span>
              </li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              6. Children's Privacy
            </h2>
            <ul className="space-y-2 ml-6 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>This app is not directed toward children under the age of 13.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>We do not knowingly collect personal data from children.</span>
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              7. Security
            </h2>
            <ul className="space-y-2 ml-6 text-foreground/80">
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>Your data is stored locally on your device.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-primary font-semibold">•</span>
                <span>You are responsible for maintaining the security of your device.</span>
              </li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              8. Your Consent
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              By using AI Study Planner, you agree to this Privacy Policy.
            </p>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              9. Changes to This Policy
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              We may update this Privacy Policy from time to time. Any updates will be posted here with a revised effective date.
            </p>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-semibold text-primary">
              10. Contact Us
            </h2>
            <p className="text-foreground/80 leading-relaxed">
              If you have any questions or concerns, please contact:
            </p>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 ml-6">
              <p className="text-foreground font-semibold">📧 Email: rndevi9782@gmail.com</p>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-8 border-t border-primary/10">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">Developer:</span> Independent Developer
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold">App Name:</span> AI Study Planner
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
