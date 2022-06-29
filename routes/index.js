var express = require("express");
var router = express.Router();
const fs = require("fs");
const crypto = require("crypto");

/* GET home page. */
const createData = require("./createData");
router.get("/", (req, res, next) => {
  createData();
  const allowfilter = ["name", "types"];
  try {
    let { ...filterquery } = req.query;
    let filterkey = Object.keys(filterquery);
    console.log();
    filterkey.forEach((key) => {
      if (!allowfilter.includes(key)) {
        const exception = new Error(`Query ${key} is not allowed`);
        exception.statusCode = 401;
        throw exception;
      }
      if (!filterquery[key]) delete filterquery[key];
    });
    let data = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { pokemons } = data;
    let result = [];
    result = pokemons;

    if (filterkey.length) {
      result = result.length
        ? result.filter((e) => {
            if (e.name === filterquery.name) {
              return e;
            }
            if (e.types.find((e) => e === filterquery.types)) {
              return e;
            }
            if (e.id === parseInt(filterquery.id)) {
              return e;
            }
          })
        : pokemons.filter((e) => {
            if (e.name === filterquery.name) {
              return e;
            }
            if (e.types.find((e) => e === filterquery.types)) {
              return e;
            }
            if (e.id === parseInt(filterquery.id)) {
              return e;
            }
          });
    }
    res.status(200).send(result);
  } catch (error) {
    next(error);
  }
});

router.post("/", (req, res, next) => {
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
  try {
    const { name, types, url } = req.body;
    if (!name || !types || !url) {
      const exception = new Error(`missing body info`);
      exception.statusCode = 401;
      throw exception;
    }
    if (types.length > 2) {
      const exception = new Error(`Invalid pokemon type`);
      exception.statusCode = 401;
      throw exception;
    }

    let data = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { pokemons } = data;

    const newPokemon = {
      name,
      types,
      url,
      id: pokemons.length + 1,
    };
    pokemons.push(newPokemon);
    data.pokemons = pokemons;
    fs.writeFileSync("db.json", JSON.stringify(data));
    res.status(200).send(pokemons);
  } catch (error) {
    next(error);
  }
});

router.delete("/:pokemonId", (req, res, next) => {
  try {
    const { pokemonId } = req.params;
    let data = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { pokemons } = data;

    const targetIndex = pokemons.findIndex(
      (pokemon) => pokemon.id === Number(pokemonId)
    );
    if (targetIndex < 0) {
      const exception = new Error(`Book not found`);
      exception.statusCode = 404;
      throw exception;
    }
    data.pokemons = pokemons.filter(
      (pokemon) => pokemon.id !== Number(pokemonId)
    );

    fs.writeFileSync("db.json", JSON.stringify(data));
    res.status(200).send({});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
