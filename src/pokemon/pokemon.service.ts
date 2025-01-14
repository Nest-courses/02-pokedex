import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { PaginatioDto } from 'src/common/dto/paginatio.dto';

@Injectable()
export class PokemonService {
  private readonly defaultLimit: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('defaultLimit');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    try {
      createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return pokemon;
    } catch (error) {
      this.validatePreviousPokemon(error);
    }
  }

  async createMany(pokemons: CreatePokemonDto[]) {
    try {
      const pokemonList = await this.pokemonModel.insertMany(pokemons);
      return pokemonList;
    } catch (error) {
      this.validatePreviousPokemon(error);
    }
  }

  async findAll(paginatioDto: PaginatioDto) {
    const { limit = this.defaultLimit, offset = 0 } = paginatioDto;
    return this.pokemonModel
      .find()
      .limit(limit)
      .skip(offset)
      .sort({ no: 1 })
      .select('-__v');
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
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // return pokemon;
    const { deletedCount } = await this.pokemonModel.deleteOne({ _id: id });

    if (deletedCount === 0)
      throw new NotFoundException(`Pokemon with id ${id} not found`);

    return `Pokemon with id "${id}" deleted`;
  }

  async removeAll() {
    await this.pokemonModel.deleteMany();
    return 'All Pokemons deleted';
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
