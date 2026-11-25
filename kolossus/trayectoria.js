// La apertura y el foco dependen del control HTML nativo.
document.querySelectorAll(".history-line details").forEach(detail => {
  detail.addEventListener("toggle", () => {
    if (!detail.open || !window.gsap) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.from(detail.querySelector("p"), { y: 4, opacity: .85, duration: .22, clearProps: "transform,opacity" });
    });
    detail.addEventListener("toggle", () => media.revert(), { once: true });
  });
});
