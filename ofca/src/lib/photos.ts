import type { ImageMetadata } from 'astro';

const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.{jpg,png}', { eager: true });

/** Zdjęcie z src/assets/photos po nazwie pliku bez rozszerzenia. */
export function photo(name: string): ImageMetadata {
  const entry = Object.entries(files).find(([path]) => path.split('/').pop()!.replace(/\.(jpg|png)$/, '') === name);
  if (!entry) throw new Error(`Brak zdjęcia: ${name}`);
  return entry[1].default;
}

/** Teksty alternatywne: akcja i miejsce, bez ocen (strategia 6.7). */
export const alts = {
  zongler: {
    pl: 'Żongler w fioletowej koszulce i czerwonej chuście podrzuca trzy białe piłki przed publicznością na Rynku.',
    en: 'A juggler in a purple T-shirt and red bandana tosses three white balls in front of a crowd on Rynek.',
  },
  diabolo: {
    pl: 'Artysta z festiwalowym identyfikatorem na smyczy kręci fioletowo-zielonym diabolo na ciemnej scenie w świetle reflektorów.',
    en: 'A performer wearing a festival lanyard spins a purple and green diabolo on a dark stage under spotlights.',
  },
  infopunkt: {
    pl: 'Pomarańczowo-biały namiot Infopunktu z zygzakowatą falbaną na Rynku. W środku koszulki i torby OFCA, przed namiotem romby i szachownica.',
    en: 'The orange and white Infopunkt tent with a zigzag valance on Rynek. OFCA T-shirts and totes hang inside, with diamonds and a checkerboard in front.',
  },
  parasol: {
    pl: 'Archiwalne zdjęcie kobiety z rozłożonym parasolem, w fioletowym duotonie.',
    en: 'Archive photo of a woman holding an open umbrella, in purple duotone.',
  },
};
