import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Upload, Loader2, Copy, Check } from "lucide-react";
import { Streamdown } from "streamdown";
import { AIUnlockBanner } from "@/components/AIUnlockBanner";

export default function QuestionSolverPage() {
  const [imageUrl, setImageUrl] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [solution, setSolution] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const solveQuestionMutation = trpc.ai.solveQuestion.useMutation({
    onSuccess: (data: any) => {
      if (data.success && typeof data.solution === "string") {
        setSolution(data.solution);
        toast.success("Solution generated successfully!");
      }
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to solve question");
      setIsLoading(false);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        setImageUrl(result);
        setPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSolve = () => {
    if (!imageUrl) {
      toast.error("Please upload an image of the question");
      return;
    }

    setIsLoading(true);
    solveQuestionMutation.mutate({
      imageUrl,
      questionText: questionText || undefined,
    });
  };

  const handleCopySolution = () => {
    navigator.clipboard.writeText(solution);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Solution copied to clipboard!");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Upload className="w-8 h-8 text-indigo-600" />
          Question Solver
        </h1>
        <p className="text-muted-foreground">Upload a photo of your question and get instant AI solutions</p>
      </div>

      <AIUnlockBanner featureName="Question Solver" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Question</CardTitle>
            <CardDescription>Take a photo or upload an image of the question</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image Preview */}
            {preview ? (
              <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                <img src={preview} alt="Question preview" className="w-full h-auto max-h-96 object-contain" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreview(null);
                    setImageUrl("");
                    setSolution("");
                  }}
                  className="absolute top-2 right-2"
                >
                  Change
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            )}

            {/* Additional Question Text */}
            <div className="space-y-2">
              <Label htmlFor="question">Additional Details (Optional)</Label>
              <Textarea
                id="question"
                placeholder="Add any additional context or instructions for solving this question..."
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
              />
            </div>

            {/* Solve Button */}
            <Button
              onClick={handleSolve}
              disabled={isLoading || !imageUrl}
              className="w-full gap-2"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Solving...
                </>
              ) : (
                "Solve Question"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Solution Section */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Solution</CardTitle>
                <CardDescription>AI-generated step-by-step solution</CardDescription>
              </div>
              {solution && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopySolution}
                  className="gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : solution ? (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <Streamdown>{solution}</Streamdown>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Upload a question to see the solution</p>
                  <p className="text-xs text-muted-foreground">The AI will provide a detailed step-by-step solution</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border-indigo-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">📸 Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-indigo-900 space-y-1">
          <p>• Take clear, well-lit photos of the question</p>
          <p>• Ensure the entire question is visible in the image</p>
          <p>• Use a straight angle (not tilted) for better recognition</p>
          <p>• Add context in the "Additional Details" field if needed</p>
        </CardContent>
      </Card>
    </div>
  );
}
