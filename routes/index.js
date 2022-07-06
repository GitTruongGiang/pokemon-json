var express = require("express");
var router = express.Router();
const fs = require("fs");
const crypto = require("crypto");

router.get("/pokemons", (req, res, next) => {
  const allowfilter = ["search", "type", "page", "limit", "id"];
  try {
    let { page, limit, ...filterquery } = req.query; //filterquery = {types:"fire"}
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 20;
    let filterkey = Object.keys(filterquery);
    filterkey.forEach((key) => {
      if (!allowfilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterquery[key]) delete filterquery[key];
    });
    let pokemonData = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data, totalPokemon } = pokemonData;
    let offset = (page - 1) * limit;
    let totalPage = Math.ceil(totalPokemon / limit);
    let newData = data.slice(offset, offset + limit);
    let count = data.length;
    let result = [];
    result = data;

    if (filterkey.length) {
      if (filterquery.type) {
        result = result
          .filter((pokemon) => pokemon.type.find((e) => e === filterquery.type))
          .slice(offset, offset + limit);
      }
      if (filterquery.search) {
        result = result
          .filter((pokemon) => {
            if (pokemon.type.find((e) => e === filterquery.search)) {
              return pokemon;
            } else {
              return pokemon.name
                .toLocaleLowerCase()
                .includes(filterquery.search);
            }
          })
          .slice(offset, offset + limit);
      }
    }
    res
      .status(200)
      .send({ data: newData, listResult: result, totalPage: totalPage, count });
  } catch (error) {
    next(error);
  }
});

router.get("/pokemons/:id", (req, res, next) => {
  try {
    const id = req.params.id;
    let pokemonData = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data, totalPokemon } = pokemonData;
    let newData = {};
    let nextPokemon = {};
    let prevPokemon = {};
    let index = data.findIndex((pokemon) => pokemon.id === parseInt(id));
    newData = data[index];
    if ((index !== 0) < totalPokemon - 1) {
      nextPokemon = data[index + 1];
      prevPokemon = data[index - 1];
    }
    if (index === totalPokemon - 1) {
      nextPokemon = data[0];
      prevPokemon = data[index - 1];
    }
    if (index === 0) {
      index = totalPokemon - 1;
      prevPokemon = data[index];
    }
    res.status(200).send({ pokemon: newData, nextPokemon, prevPokemon });
  } catch (error) {
    next(error);
  }
});

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flyingText",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];

router.post("/pokemons", (req, res, next) => {
  try {
    const { name, types, url, id } = req.body; //types = [] => array, object:truthy
    if (!name || !types.length || !url || !id) {
      const exception = new Error(`Missing required data`);
      exception.statusCode = 401;
      throw exception;
    }
    if (types.length > 2) {
      const exception = new Error(`Pokémon can only have one or two types`);
      exception.statusCode = 401;
      throw exception;
    }
    const type = {};
    types.forEach((e) => {
      type[e] = e;
    });
    console.log(type);

    let pokemonData = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data, totalPokemon } = pokemonData;
    const newPokemon = {
      name,
      types,
      url,
      id,
    };

    const existPokemon = data.find((e) => e.id === newPokemon.id);
    //existPokemon = undefined =>khoong trùng id
    //existPokemon = {} => trùng id
    if (existPokemon) {
      throw exception;
    }
    data.push(newPokemon);
    pokemonData.totalPokemon = data.length;
    pokemonData.data = data;
    fs.writeFileSync("db.json", JSON.stringify(pokemonData));
    res.status(200).send({ message: "Successfully create a Pokemon!" });
  } catch (error) {
    next(error);
  }
});

router.delete("/pokemons/:id", (req, res, next) => {
  try {
    const { id } = req.params;
    let db = fs.readFileSync("db.json", "utf-8");
    db = JSON.parse(db);
    const { data, totalPokemon } = db;
    const targetIndex = data.findIndex(
      (pokemon) => pokemon.id === parseInt(id)
    );
    if (targetIndex < 0) {
      const exception = new Error(`Book not found`);
      exception.statusCode = 404;
      throw exception;
    }
    db.data = data.filter((pokemon) => pokemon.id !== parseInt(id));
    db.totalPokemon = data.length - 1;
    db = JSON.stringify(db);
    fs.writeFileSync("db.json", db);
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
