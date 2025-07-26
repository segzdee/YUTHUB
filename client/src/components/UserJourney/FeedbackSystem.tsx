import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { HelpCircle, Lightbulb, MessageSquare, Send, Star } from 'lucide-react';
import { useState } from 'react';
import { useUserJourney } from './UserJourneyProvider';

interface FeedbackSystemProps {
  context?: string;
  trigger?: 'button' | 'automatic' | 'modal';
}

export default function FeedbackSystem({ context = 'general', trigger = 'button' }: FeedbackSystemProps) {
  const { actions } = useUserJourney();
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'satisfaction' | 'feature_request' | 'bug_report' | 'help'>('satisfaction');
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { id: 'satisfaction', label: 'Rate Experience', icon: Star, color: 'bg-yellow-100 text-yellow-800' },
    { id: 'feature_request', label: 'Suggest Feature', icon: Lightbulb, color: 'bg-blue-100 text-blue-800' },
    { id: 'bug_report', label: 'Report Issue', icon: MessageSquare, color: 'bg-red-100 text-red-800' },
    { id: 'help', label: 'Get Help', icon: HelpCircle, color: 'bg-green-100 text-green-800' }
  ];

  const handleSubmit = async () => {
    if (!message.trim() && feedbackType !== 'satisfaction') return;
    if (feedbackType === 'satisfaction' && rating === 0) return;

    setIsSubmitting(true);
    
    try {
      await actions.submitFeedback({
        type: feedbackType,
        context,
        rating: feedbackType === 'satisfaction' ? rating : undefined,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });

      setIsOpen(false);
      setMessage('');
      setRating(0);
      
      // Show success message
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (trigger === 'button') {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Feedback
        </Button>

        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Share Your Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  {feedbackTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={feedbackType === type.id ? "default" : "outline"}
                        onClick={() => setFeedbackType(type.id as any)}
                        className="h-auto p-3 flex flex-col items-center gap-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{type.label}</span>
                      </Button>
                    );
                  })}
                </div>

                {feedbackType === 'satisfaction' && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium">How satisfied are you?</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Button
                          key={star}
                          variant="ghost"
                          size="sm"
                          onClick={() => setRating(star)}
                          className="p-1"
                        >
                          <Star 
                            className={`h-6 w-6 ${
                              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                            }`} 
                          />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {feedbackType === 'satisfaction' ? 'Additional comments (optional)' : 'Describe your feedback'}
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={
                      feedbackType === 'feature_request' ? 'What feature would you like to see?' :
                      feedbackType === 'bug_report' ? 'What issue did you encounter?' :
                      feedbackType === 'help' ? 'What do you need help with?' :
                      'Tell us more about your experience...'
                    }
                    rows={3}
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting || (feedbackType === 'satisfaction' && rating === 0)}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Sending...' : 'Send Feedback'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </>
    );
  }

  return null;
}
