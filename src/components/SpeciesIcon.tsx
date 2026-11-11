import Image from "next/image";

// Mesmas ilustrações 3D usadas no app mobile (Fluent Emoji, Microsoft, licença MIT) —
// ver public/images/species/LICENSE-fluentui-emoji.txt e components/PetAvatar.tsx no app zupet.
const SPECIES_IMAGE: Record<string, string> = {
  cachorro: "cachorro_3d.png",
  dog: "cachorro_3d.png",
  cão: "cachorro_3d.png",
  gato: "gato_3d.png",
  cat: "gato_3d.png",
  pássaro: "passaro_3d.png",
  passaro: "passaro_3d.png",
  bird: "passaro_3d.png",
  coelho: "coelho_3d.png",
  rabbit: "coelho_3d.png",
  cobaia: "cobaia_3d.png",
  porquinho: "cobaia_3d.png",
  guinea: "cobaia_3d.png",
  chinchila: "chinchila_3d.png",
  chinchilla: "chinchila_3d.png",
  hamster: "hamster_3d.png",
  peixe: "peixe_3d.png",
  fish: "peixe_3d.png",
  furão: "furao_3d.png",
  furao: "furao_3d.png",
  ferret: "furao_3d.png",
  tartaruga: "reptil_3d.png",
  turtle: "reptil_3d.png",
  réptil: "reptil_3d.png",
  reptil: "reptil_3d.png",
  lagarto: "reptil_3d.png",
  cobra: "reptil_3d.png",
  iguana: "reptil_3d.png",
};

function fileForSpecies(species: string): string {
  const s = species.toLowerCase();
  for (const [key, file] of Object.entries(SPECIES_IMAGE)) {
    if (s.includes(key)) return file;
  }
  return "outro_3d.png";
}

/** Ilustração 3D da espécie do pet, no lugar do emoji de texto. Usar em tabelas/listas no lugar de speciesEmoji(). */
export default function SpeciesIcon({ species, size = 22 }: { species: string; size?: number }) {
  return (
    <Image
      src={`/images/species/${fileForSpecies(species ?? "")}`}
      alt={species || "Espécie"}
      width={size}
      height={size}
      style={{ display: "inline-block", flexShrink: 0 }}
    />
  );
}
