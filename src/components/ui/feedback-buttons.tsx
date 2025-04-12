import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

interface FeedbackButtonsProps {
  itemId: string | number;
  itemType: 'answer' | 'result';
  onFeedback: (itemId: string | number, isHelpful: boolean) => Promise<void>;
}

export function FeedbackButtons({ itemId, itemType, onFeedback }: FeedbackButtonsProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleFeedback = async (isHelpful: boolean) => {
    try {
      setIsSubmitting(true);
      await onFeedback(itemId, isHelpful);
      setFeedback(isHelpful ? 'helpful' : 'not-helpful');
      toast.success(`Marked as ${isHelpful ? 'helpful' : 'not helpful'}`);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error("Couldn't save your feedback");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-muted-foreground mr-1">
        {feedback === null ? "Was this helpful?" : "Thanks for your feedback"}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded-full ${feedback === 'helpful' ? 'bg-green-100 text-green-600' : ''}`}
        disabled={isSubmitting || feedback !== null}
        onClick={() => handleFeedback(true)}
      >
        <ThumbsUp className="h-4 w-4" />
        <span className="sr-only">Helpful</span>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 rounded-full ${feedback === 'not-helpful' ? 'bg-red-100 text-red-600' : ''}`}
        disabled={isSubmitting || feedback !== null}
        onClick={() => handleFeedback(false)}
      >
        <ThumbsDown className="h-4 w-4" />
        <span className="sr-only">Not Helpful</span>
      </Button>
    </div>
  );
} 