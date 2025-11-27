import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TTSButtonProps {
  text: string;
  label?: string;
}

export function TTSButton({ text, label = '🔊 Read Report' }: TTSButtonProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const speak = () => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
          title: 'TTS Error',
          description: 'Could not read text',
          variant: 'destructive',
        });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast({
        title: 'Not Supported',
        description: 'Text-to-speech is not supported in this browser',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button onClick={speak} variant="outline" className="gradient-button">
      {isSpeaking ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
      {label}
    </Button>
  );
}
