import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    bio: '',
    interests: [] as string[],
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const availableInterests = [
    'Technology',
    'Design',
    'Business',
    'Marketing',
    'Finance',
    'Health',
    'Education',
    'Entertainment',
  ];

  const toggleInterest = (interest: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = () => {
    // TODO: Save onboarding data to backend
    console.log('Onboarding completed:', formData);
    navigate({ to: '/' });
  };

  const handleSkip = () => {
    navigate({ to: '/' });
  };

  return (
    <div className="from-background to-muted flex min-h-screen items-center justify-center bg-linear-to-br p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="mb-4 flex items-center justify-between">
            <CardTitle className="text-2xl">
              Welcome! Let's get you set up
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>
          <Progress value={progress} className="h-2" />
          <CardDescription className="mt-2">
            Step {step} of {totalSteps}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="animate-in fade-in space-y-4 duration-300">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold">
                  Tell us about yourself
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                />
                <p className="text-muted-foreground text-xs">
                  This will be your unique identifier
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Bio */}
          {step === 2 && (
            <div className="animate-in fade-in space-y-4 duration-300">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold">Introduce yourself</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio (Optional)</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us a bit about yourself..."
                  rows={5}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                />
                <p className="text-muted-foreground text-xs">
                  {formData.bio.length}/200 characters
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Interests */}
          {step === 3 && (
            <div className="animate-in fade-in space-y-4 duration-300">
              <div className="mb-4 flex items-center gap-3">
                <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold">What interests you?</h3>
              </div>

              <p className="text-muted-foreground text-sm">
                Select topics you'd like to explore (optional)
              </p>

              <div className="grid grid-cols-2 gap-3">
                {availableInterests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-lg border-2 p-3 transition-all ${
                      formData.interests.includes(interest)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{interest}</span>
                      {formData.interests.includes(interest) && (
                        <CheckCircle
                          className="h-5 w-5"
                          data-icon="inline-end"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-4">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                <ArrowLeft className="h-4 w-4" data-icon="inline-start" />
                Back
              </Button>
            )}
            <Button onClick={handleNext} className="flex-1">
              {step === totalSteps ? (
                <>
                  Complete
                  <CheckCircle className="h-4 w-4" data-icon="inline-end" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="h-4 w-4" data-icon="inline-end" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
