import confetti from "canvas-confetti";

export function fireConfetti() {
  // انفجار لطيف وقوي بدون ما نخرب الأداء
  confetti({
    particleCount: 120,
    spread: 80,
    startVelocity: 35,
    origin: { y: 0.7 },
  });

  // دفعة ثانية بسيطة بعد لحظة
  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 100,
      startVelocity: 25,
      origin: { y: 0.75 },
    });
  }, 250);
}
