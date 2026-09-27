/** Mikrointerakcje: "Dodaj do zapytania", licznik w headerze, checklista składników */
import { gsap, D } from './gsap';

export function micro() {
  const onToggle = (e: Event) => {
    const btn = e.target as HTMLElement;
    gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: D.ui, ease: 'back.out(3)' });
    const icon = btn.querySelector('svg');
    if (icon) gsap.fromTo(icon, { rotation: -90 }, { rotation: 0, duration: D.ui });
    gsap.utils.toArray<HTMLElement>('[data-inquiry-count]').forEach((c) =>
      gsap.fromTo(c, { scale: 1.6 }, { scale: 1, duration: D.ui, ease: 'back.out(3)' }),
    );
  };
  const onCheck = (e: Event) => {
    const input = e.target as HTMLInputElement;
    if (input.matches('[data-check-item]') && input.checked) gsap.fromTo(input, { scale: 0.6, rotation: -20 }, { scale: 1, rotation: 0, duration: D.ui, ease: 'back.out(3)' });
  };
  document.addEventListener('inquiry:toggled', onToggle);
  document.addEventListener('change', onCheck);
  return () => {
    document.removeEventListener('inquiry:toggled', onToggle);
    document.removeEventListener('change', onCheck);
  };
}
