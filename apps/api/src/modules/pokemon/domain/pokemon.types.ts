export interface Pokemon {
  name: string;
  types: string[];
  image: string;
}

export interface PokemonListItem {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonListItem[];
}

export interface PokemonTypeSlot {
  slot: number;
  type: { name: string };
}

export interface PokemonSpriteOther {
  'official-artwork'?: {
    front_default: string | null;
  };
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  types: PokemonTypeSlot[];
  sprites: {
    front_default: string | null;
    other?: PokemonSpriteOther;
  };
}
