import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.validatePreviousPokemon(error);
    }
  }

  async findAll() {
    return this.pokemonModel.find();
  }

  async findOne(searchEnd: string): Promise<Pokemon> {
    try {
      const pokemon = await this.pokemonModel.findOne({
        $or: [
          ...(!isNaN(+searchEnd) ? [{ no: searchEnd }] : []),
          ...(isValidObjectId(searchEnd) ? [{ _id: searchEnd }] : []),
          { name: searchEnd.toLowerCase().trim() },
        ],
      });

      if (!pokemon)
        throw new NotFoundException(
          `Pokemon with id, name or no ${searchEnd} not found`,
        );

      return pokemon;
    } catch (error) {
      throw new InternalServerErrorException('error fetching pokemon', error);
    }
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    try {
      if (updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();
      }

      return await this.pokemonModel.findOneAndUpdate(
        {
          $or: [
            { no: !isNaN(+term) ? +term : undefined },
            { _id: isValidObjectId(term) ? term : undefined },
            { name: term },
          ],
        },
        { $set: updatePokemonDto },
        { new: true },
      );
    } catch (error) {
      this.validatePreviousPokemon(error);
    }
  }

  async remove(id: string) {
    try {
      const pokemon = await this.findOne(id);
      await pokemon.deleteOne();
      return pokemon;
    } catch (error) {
      this.validatePreviousPokemon(error);
    }
  }

  private validatePreviousPokemon(error: any) {
    let errorMessage = '';
    if (error.code === 11000) {
      errorMessage = `Pokemon exists in DB ${JSON.stringify(error.keyValue)}`;
      throw new BadRequestException(errorMessage);
    }

    console.log(error);
    errorMessage = `Can't create Pokemon check server logs`;
    throw new InternalServerErrorException(errorMessage);
  }
}
