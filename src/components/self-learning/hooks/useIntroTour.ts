"use client";

import { useCallback } from "react";
import introJs from "intro.js";
import "intro.js/minified/introjs.min.css";

export function useIntroTour() {
  const startTour = useCallback(() => {
    const intro = introJs();
    
    intro.setOptions({
      showProgress: true,
      showBullets: false,
      exitOnOverlayClick: false,
      exitOnEsc: true,
      nextLabel: 'Next →',
      prevLabel: '← Back',
      doneLabel: 'Got it! 🎉',
      skipLabel: 'Skip tour',
      scrollToElement: true,
      overlayOpacity: 0.7,
      steps: [
        {
          title: '🎯 Welcome to Self-Learning Mode!',
          intro: 'This is where you build your personal vocabulary list by highlighting words and phrases from the reading passage.',
        },
        {
          element: '.reading-content',
          title: '📖 Reading Content',
          intro: 'This is your reading passage. You can highlight any word or phrase here to add to your vocabulary list.',
          position: 'left'
        },
        {
          title: '🖱️ How to Highlight - Method 1',
          intro: 'Simply <strong>click and drag</strong> to select any text. The selected text will be automatically highlighted and added to your vocabulary.',
        },
        {
          title: '🔤 How to Highlight - Method 2', 
          intro: 'Click on individual words while holding <strong>Ctrl (or Cmd)</strong> to select multiple words for phrases. Then click the highlight button.',
        },
        {
          element: '[data-tour="vocabulary-sidebar"]',
          title: '📚 Vocabulary Panel',
          intro: 'Your highlighted words and phrases appear here. You can copy, export, or clear your vocabulary list.',
          position: 'left'
        },
        {
          title: '🗑️ Remove Highlights',
          intro: 'To remove a highlight, simply <strong>click on any highlighted text</strong> in the reading passage and confirm.',
        },
        {
          title: '📤 Export Options',
          intro: 'You can export your vocabulary as text, CSV, or JSON files, or copy to clipboard for use in other apps.',
        },
        {
          title: '🎓 Ready to Learn!',
          intro: 'You\'re all set! Start highlighting words you want to learn. Happy vocabulary building! 🚀',
        }
      ]
    });

    // Custom CSS for better styling
    intro.onbeforechange(() => {
      // Add custom styling dynamically
      setTimeout(() => {
        const tooltips = document.querySelectorAll('.introjs-tooltip');
        tooltips.forEach(tooltip => {
          tooltip.setAttribute('style', `
            background: hsl(var(--card));
            border: 1px solid hsl(var(--border));
            border-radius: 12px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            color: hsl(var(--foreground));
            font-family: inherit;
            max-width: 350px;
          `);
        });

        const tooltipHeaders = document.querySelectorAll('.introjs-tooltip-header');
        tooltipHeaders.forEach(header => {
          header.setAttribute('style', `
            color: hsl(var(--foreground));
            font-weight: 600;
            font-size: 16px;
            margin-bottom: 8px;
          `);
        });

        const tooltipContents = document.querySelectorAll('.introjs-tooltiptext');
        tooltipContents.forEach(content => {
          content.setAttribute('style', `
            color: hsl(var(--muted-foreground));
            line-height: 1.5;
            font-size: 14px;
          `);
        });

        const buttons = document.querySelectorAll('.introjs-button');
        buttons.forEach(button => {
          button.setAttribute('style', `
            background: hsl(var(--primary));
            border: none;
            border-radius: 6px;
            color: hsl(var(--primary-foreground));
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
          `);
        });

        const skipButton = document.querySelector('.introjs-skipbutton');
        if (skipButton) {
          skipButton.setAttribute('style', `
            background: transparent;
            border: 1px solid hsl(var(--border));
            border-radius: 6px;
            color: hsl(var(--muted-foreground));
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
          `);
        }
      }, 100);
      
      return true; // Allow the step to proceed
    });

    intro.start();
  }, []);

  return { startTour };
}