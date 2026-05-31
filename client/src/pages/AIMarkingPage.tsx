import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { FileCheck, Loader2, Copy, Check, Upload, AlertCircle } from "lucide-react";
import { Streamdown } from "streamdown";
import { AIUnlockBanner } from "@/components/AIUnlockBanner";

export default function AIMarkingPage() {
  const [schemeImageUrl, setSchemeImageUrl] = useState("");
  const [schemePreview, setSchemePreview] = useState<string | null>(null);
  const [answerImageUrl, setAnswerImageUrl] = useState("");
  const [answerPreview, setAnswerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [evaluation, setEvaluation] = useState("");
  const [marksObtained, setMarksObtained] = useState<number | null>(null);
  const [totalMarks, setTotalMarks] = useState<number | null>(null);

  const evaluationMutation = trpc.ai.evaluateAnswerWithScheme.useMutation({
    onSuccess: (data: any) => {
      if (data.success && typeof data.evaluation === "string") {
        setEvaluation(data.evaluation);
        setMarksObtained(data.marksObtained || null);
        setTotalMarks(data.totalMarks || null);
        toast.success("Answer evaluated successfully!");
      }
      setIsLoading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to evaluate answer");
      setIsLoading(false);
    },
  });

  const handleSchemeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setSchemePreview(result);
      setSchemeImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleAnswerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAnswerPreview(result);
      setAnswerImageUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleEvaluate = () => {
    if (!schemeImageUrl.trim()) {
      toast.error("Please upload the marking scheme");
      return;
    }
    if (!answerImageUrl.trim()) {
      toast.error("Please upload the student's answer");
      return;
    }

    setIsLoading(true);
    evaluationMutation.mutate({
      schemeImageUrl,
      answerImageUrl,
    });
  };

  const handleCopyEvaluation = () => {
    navigator.clipboard.writeText(evaluation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Evaluation copied to clipboard!");
  };

  const handleRemoveScheme = () => {
    setSchemePreview(null);
    setSchemeImageUrl("");
  };

  const handleRemoveAnswer = () => {
    setAnswerPreview(null);
    setAnswerImageUrl("");
  };

  return (
    <div className="space-y-6">
      <AIUnlockBanner featureName="AI Marking" />
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FileCheck className="w-8 h-8 text-indigo-600" />
          AI Answer Evaluator
        </h1>
        <p className="text-muted-foreground">Upload marking scheme and student answers for AI evaluation with marks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Marking Scheme Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Marking Scheme</CardTitle>
            <CardDescription>Upload the official answer key</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {schemePreview ? (
              <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                <img src={schemePreview} alt="Scheme preview" className="w-full h-auto max-h-48 object-contain" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveScheme}
                  className="absolute top-2 right-2"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload scheme</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSchemeUpload}
                />
              </label>
            )}
            <p className="text-xs text-muted-foreground text-center">
              📋 Upload a clear photo of the marking scheme or answer key
            </p>
          </CardContent>
        </Card>

        {/* Student Answer Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Student Answer</CardTitle>
            <CardDescription>Upload the written answer</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {answerPreview ? (
              <div className="relative w-full bg-muted rounded-lg overflow-hidden">
                <img src={answerPreview} alt="Answer preview" className="w-full h-auto max-h-48 object-contain" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAnswer}
                  className="absolute top-2 right-2"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <p className="text-sm font-medium">Click to upload answer</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAnswerUpload}
                />
              </label>
            )}
            <p className="text-xs text-muted-foreground text-center">
              ✍️ Upload a photo of the student's written answer
            </p>
          </CardContent>
        </Card>

        {/* Evaluation Output */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Evaluation</CardTitle>
                <CardDescription>AI marks & feedback</CardDescription>
              </div>
              {evaluation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEvaluation}
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
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : evaluation ? (
              <div className="space-y-4">
                {marksObtained !== null && totalMarks !== null && (
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 border border-indigo-200 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-indigo-700 font-medium mb-2">Marks Obtained</p>
                      <p className="text-3xl font-bold text-indigo-600">
                        {marksObtained} / {totalMarks}
                      </p>
                      <p className="text-sm text-indigo-600 mt-1">
                        {totalMarks > 0 ? ((marksObtained / totalMarks) * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <Streamdown>{evaluation}</Streamdown>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <p className="text-muted-foreground">Upload both images to get evaluation</p>
                  <p className="text-xs text-muted-foreground">AI will compare and assign marks</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evaluate Button */}
      <Button
        onClick={handleEvaluate}
        disabled={isLoading || !schemeImageUrl || !answerImageUrl}
        className="w-full gap-2"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <FileCheck className="w-4 h-4" />
            Evaluate Answer
          </>
        )}
      </Button>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              How It Works
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-1">
            <p>1. Upload the official marking scheme/answer key</p>
            <p>2. Upload the student's written answer photo</p>
            <p>3. AI compares and evaluates the answer</p>
            <p>4. Get marks and detailed feedback</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">📝 Evaluation Includes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-green-900 space-y-1">
            <p>• Marks obtained vs total marks</p>
            <p>• Point-by-point evaluation</p>
            <p>• Strengths and areas for improvement</p>
            <p>• Percentage score</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
