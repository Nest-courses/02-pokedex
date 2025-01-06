import { Injectable } from '@nestjs/common';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { PokeResponse } from './interfaces/poke-response.interface';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';
import { HttpAdapter } from 'src/common/interfaces/http.adapter';

@Injectable()
export class SeedService {
  constructor(
    private readonly pokemonService: PokemonService,
    private readonly http: HttpAdapter,
  ) {}

  async executeSeed() {
    await this.pokemonService.removeAll();
    const url = 'https://pokeapi.co/api/v2/pokemon?limit=650';
    const { results } = await this.http.get<PokeResponse>(url);
    const listOfPokemons: CreatePokemonDto[] = [];

    results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = parseInt(segments[segments.length - 2], 10);
      listOfPokemons.push({ name, no });
    });

    await this.pokemonService.createMany(listOfPokemons);
    return 'seed executed';
  }
}
