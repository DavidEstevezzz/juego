'use client';

import { useRef } from 'react';
import { Accessibility, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { finalSignalContent } from '@/content/chapters';
import { useExperienceStore } from '@/lib/experience/store';

const content = finalSignalContent.accessibility;

/** Explains the actual shared preference; does not create a competing override. */
export function SignalAccessibility() {
  const heading = useRef<HTMLHeadingElement>(null);
  const reduced = useExperienceStore((state) => state.reducedMotion);
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" className="signal-accessibility-trigger" />
        }
      >
        <Accessibility size={17} aria-hidden="true" />
        {content.trigger}
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        initialFocus={heading}
        className="signal-accessibility-dialog"
      >
        <DialogTitle
          ref={heading}
          tabIndex={-1}
          className="signal-accessibility-title"
        >
          {content.title}
        </DialogTitle>
        <DialogDescription className="signal-accessibility-description">
          {content.description}
        </DialogDescription>
        <p
          className="signal-accessibility-status signal-label"
          aria-live="polite"
        >
          {reduced ? content.reduced : content.standard}
        </p>
        <div className="signal-accessibility-copy">
          <p>{content.motion}</p>
          <p>{content.keyboard}</p>
          <p>{content.sound}</p>
        </div>
        <DialogClose
          render={
            <Button variant="outline" className="signal-accessibility-close" />
          }
        >
          <X size={17} aria-hidden="true" />
          {content.close}
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
