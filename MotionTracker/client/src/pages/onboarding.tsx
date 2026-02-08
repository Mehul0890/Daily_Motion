import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, Target, BarChart3, Bell, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const slides = [
  {
    icon: Target,
    title: "Track Your Daily Activities",
    description: "Log all your daily activities from work and study to exercise and leisure. Build better habits one day at a time.",
    gradient: "from-blue-500 to-purple-500",
  },
  {
    icon: BarChart3,
    title: "Visualize Your Progress",
    description: "See beautiful charts showing your weekly and monthly patterns. Understand where your time goes.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Bell,
    title: "Stay on Track",
    description: "Get daily reminders and weekly summaries. Never miss a day of tracking your progress.",
    gradient: "from-pink-500 to-orange-500",
  },
  {
    icon: Sparkles,
    title: "Get Smart Insights",
    description: "Receive personalized suggestions to improve your productivity and maintain a healthy balance.",
    gradient: "from-orange-500 to-teal-500",
  },
];

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [, setLocation] = useLocation();
  const { updateUser } = useAuth();

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      completeOnboarding();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const completeOnboarding = () => {
    updateUser({ hasCompletedOnboarding: true });
    setLocation("/");
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center max-w-md"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`h-32 w-32 rounded-3xl bg-gradient-to-br ${slide.gradient} flex items-center justify-center mb-8 shadow-xl`}
            >
              <Icon className="h-16 w-16 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold mb-4"
              data-testid={`text-onboarding-title-${currentSlide}`}
            >
              {slide.title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              {slide.description}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6 pb-8">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <motion.div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-primary"
                  : index < currentSlide
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted"
              }`}
              data-testid={`indicator-slide-${index}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-4">
          {currentSlide > 0 ? (
            <Button
              variant="ghost"
              onClick={prevSlide}
              className="gap-2"
              data-testid="button-prev-slide"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={completeOnboarding}
              data-testid="button-skip"
            >
              Skip
            </Button>
          )}

          <Button
            onClick={nextSlide}
            className="gap-2 gradient-primary text-white border-0 min-w-[140px]"
            data-testid="button-next-slide"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
