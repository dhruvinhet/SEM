import confetti from 'canvas-confetti';

/**
 * Confetti celebration effects for key user actions.
 */
export function useConfetti() {
  const fire = (options?: confetti.Options) => {
    // Default burst
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#ff4433', '#00d4ff', '#a855f7', '#00ff87', '#fbbf24'],
      ...options,
    });
  };

  const fireworks = () => {
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ff4433', '#00d4ff', '#a855f7'],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00ff87', '#fbbf24', '#ff4433'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const stars = () => {
    confetti({
      particleCount: 50,
      spread: 360,
      ticks: 100,
      gravity: 0,
      decay: 0.94,
      startVelocity: 20,
      shapes: ['star'],
      colors: ['#ff4433', '#fbbf24', '#00d4ff'],
      origin: { x: 0.5, y: 0.35 },
    });
  };

  return { fire, fireworks, stars };
}
