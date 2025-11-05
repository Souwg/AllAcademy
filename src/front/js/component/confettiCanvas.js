import React, { useEffect, useRef } from "react";

export const ConfettiCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const confettiCount = 150;
    const confettis = [];

    // Ajustar tamaño del canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Crear confettis iniciales
    for (let i = 0; i < confettiCount; i++) {
      confettis.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * confettiCount + 10,
        color: `hsl(${Math.random() * 360}, 100%, 50%)`,
        tilt: Math.random() * 10 - 10,
        tiltAngleIncremental: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
      });
    }

    // Dibujar confettis
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      confettis.forEach((confetti) => {
        ctx.beginPath();
        ctx.lineWidth = confetti.r / 2;
        ctx.strokeStyle = confetti.color;
        ctx.moveTo(confetti.x + confetti.tilt + confetti.r / 3, confetti.y);
        ctx.lineTo(
          confetti.x + confetti.tilt,
          confetti.y + confetti.tilt + confetti.r / 3
        );
        ctx.stroke();
      });
      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    // Actualizar posiciones
    const update = () => {
      confettis.forEach((confetti, index) => {
        confetti.tiltAngle += confetti.tiltAngleIncremental;
        confetti.y += (Math.cos(confetti.d) + 3 + confetti.r / 2) / 2;
        confetti.tilt = Math.sin(confetti.tiltAngle - index / 3) * 15;

        // Reiniciar si sale de pantalla
        if (confetti.y > canvas.height) {
          confetti.y = -10;
          confetti.x = Math.random() * canvas.width;
        }
      });
    };

    let animationFrameId = requestAnimationFrame(draw);

    // 🧹 Limpieza al desmontar (evita memory leak)
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
};
