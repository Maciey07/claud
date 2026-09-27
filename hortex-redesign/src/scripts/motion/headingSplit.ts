/** Nagłówki H1/H2 sekcji: SplitText linie z maską, yPercent 100 → 0, stagger 0.08 */
import { gsap, SplitText, D } from './gsap';

export function headingSplit() {
  gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines',
      mask: 'lines',
      linesClass: 'split-line',
      autoSplit: true,
      onSplit(self) {
        gsap.set(el, { visibility: 'visible' });
        return gsap.from(self.lines, {
          yPercent: 100,
          duration: D.reveal,
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}
