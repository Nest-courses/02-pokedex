import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { PokemonService } from 'src/pokemon/pokemon.service';
import { PokeResponse } from './interfaces/poke-response.interface';
import { CreatePokemonDto } from 'src/pokemon/dto/create-pokemon.dto';

@Injectable()
export class SeedService {
  private readonly axios: AxiosInstance;

  constructor(private readonly pokemonService: PokemonService) {
    this.axios = axios.create();
  }

  async executeSeed() {
    await this.pokemonService.removeAll();
    const url = 'https://pokeapi.co/api/v2/pokemon?limit=650';
    const { data } = await this.axios.get<PokeResponse>(url);
    const listOfPokemons: CreatePokemonDto[] = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = parseInt(segments[segments.length - 2], 10);
      listOfPokemons.push({ name, no });
    });

    await this.pokemonService.createMany(listOfPokemons);
    return 'seed executed';
  }
}
