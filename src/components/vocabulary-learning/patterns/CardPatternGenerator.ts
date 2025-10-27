// Card pattern generation module for vocabulary learning
export type PatternType = 'random' | 'topToBottom' | 'leftToRight' | 'diagonal' | 'corners' | 'circle' | 'wave' | 'spiral';
export type CardSize = 'normal' | 'large' | 'mega';
export type IntensityPhase = 'low' | 'medium' | 'high';

export interface CardPosition {
  x: number;
  y: number;
  size: CardSize;
}

export interface DrillingInstance {
  id: number;
  x: number;
  y: number;
  opacity: number;
  pattern: string;
  size: CardSize;
}

// Pattern generation module for card appearances
export const generateCardPattern = (patternType: PatternType, count: number, intensityPhase: IntensityPhase): CardPosition[] => {
  const patterns = {
    random: () => ({
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      size: intensityPhase === 'low' ? 'normal' : intensityPhase === 'medium' ? 'large' : 'mega'
    }),
    
    topToBottom: (index: number) => ({
      x: Math.random() * 60 + 20,
      y: (index * 25) + Math.random() * 10,
      size: intensityPhase === 'low' ? 'large' : intensityPhase === 'medium' ? 'mega' : 'mega'
    }),
    
    leftToRight: (index: number) => ({
      x: (index * 25) + Math.random() * 10,
      y: Math.random() * 60 + 20,
      size: intensityPhase === 'low' ? 'large' : intensityPhase === 'medium' ? 'mega' : 'mega'
    }),
    
    diagonal: (index: number) => ({
      x: (index * 20) + Math.random() * 15,
      y: (index * 20) + Math.random() * 15,
      size: intensityPhase === 'low' ? 'large' : intensityPhase === 'medium' ? 'mega' : 'mega'
    }),
    
    corners: (index: number) => {
      const corners = [
        { x: 10, y: 10 }, // top-left
        { x: 80, y: 10 }, // top-right
        { x: 10, y: 80 }, // bottom-left
        { x: 80, y: 80 }  // bottom-right
      ];
      const corner = corners[index % 4];
      return {
        x: corner.x + Math.random() * 15,
        y: corner.y + Math.random() * 15,
        size: 'mega' as const
      };
    },
    
    circle: (index: number) => {
      const angle = (index * 60) + Math.random() * 30; // degrees
      const radius = 25 + Math.random() * 15;
      const centerX = 50;
      const centerY = 50;
      return {
        x: centerX + radius * Math.cos(angle * Math.PI / 180),
        y: centerY + radius * Math.sin(angle * Math.PI / 180),
        size: intensityPhase === 'low' ? 'large' : 'mega'
      };
    },
    
    wave: (index: number) => ({
      x: (index * 15) + Math.random() * 10,
      y: 50 + 20 * Math.sin(index * 0.5) + Math.random() * 10,
      size: intensityPhase === 'low' ? 'large' : intensityPhase === 'medium' ? 'mega' : 'mega'
    }),
    
    spiral: (index: number) => {
      const angle = index * 45;
      const radius = 5 + index * 3;
      const centerX = 50;
      const centerY = 50;
      return {
        x: centerX + radius * Math.cos(angle * Math.PI / 180),
        y: centerY + radius * Math.sin(angle * Math.PI / 180),
        size: 'mega' as const
      };
    }
  };

  const results: CardPosition[] = [];
  const patternFunc = patterns[patternType] || patterns.random;
  
  for (let i = 0; i < count; i++) {
    const position = patternFunc(i);
    results.push({
      ...position,
      size: position.size as CardSize
    });
  }
  
  return results;
};

// Pattern selector based on time and intensity
export const selectPattern = (time: number, intensity: IntensityPhase): PatternType => {
  const timeSlot = Math.floor(time / 2.5); // Change pattern every 2.5 seconds
  const patterns: PatternType[] = ['random', 'topToBottom', 'leftToRight', 'diagonal', 'corners', 'circle', 'wave', 'spiral'];
  
  if (intensity === 'low') {
    return patterns[timeSlot % 3]; // Use first 3 patterns (simpler)
  } else if (intensity === 'medium') {
    return patterns[timeSlot % 6]; // Use first 6 patterns
  } else {
    return patterns[timeSlot % patterns.length]; // Use all patterns
  }
};