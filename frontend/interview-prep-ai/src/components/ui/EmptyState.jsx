import { ClipboardList, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";

const EmptyState = ({ onCreate }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Illustration */}
      <div className="relative mb-8">
        <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-amber-muted shadow-inner">
          <ClipboardList className="h-14 w-14 text-amber" strokeWidth={1.5} />
        </div>

        <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber shadow-sm">
          <Sparkles className="h-4 w-4 text-amber-foreground" />
        </div>
      </div>

      {/* Text */}
      <h2 className="mb-3 text-2xl font-bold tracking-tight text-foreground">
        No Blueprint Yet
      </h2>

      <p className="mb-2 max-w-sm text-muted-foreground leading-relaxed">
        Your interview blueprint is where you define exactly what you're aiming for.
      </p>

      <p className="mb-8 max-w-sm text-sm text-muted-foreground">
        Set your target role, skills, and companies — and get hyper-personalized questions forever.
      </p>

      {/* CTA */}
      <Button
        onClick={onCreate}
        size="lg"
        className="h-12 gap-2 rounded-xl bg-gradient-to-r from-amber to-amber-light px-8 text-amber-foreground font-semibold shadow-md hover:opacity-90 hover:shadow-lg transition-all duration-200"
      >
        <Sparkles className="h-4 w-4" />
        Create My Blueprint
      </Button>
    </div>
  );
};

export default EmptyState;