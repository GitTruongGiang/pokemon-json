var express = require("express");
var router = express.Router();
const fs = require("fs");
const crypto = require("crypto");

router.get("/pokemons", (req, res, next) => {
  const allowfilter = ["search", "types", "page", "limit", "id"];
  try {
    let { page, limit, ...filterquery } = req.query;
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
    let result = [];
    result = data;

    if (filterkey.length) {
      result = result.length
        ? result.filter((e) => {
            if (e.name === filterquery.search) {
              return e;
            }
            if (e.types.find((e) => e === filterquery.types)) {
              return e;
            }
            if (e.id === parseInt(filterquery.id)) {
              return e;
            }
          })
        : data.filter((e) => {
            if (e.name === filterquery.search) {
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
    res
      .status(200)
      .send({ data: newData, listResult: result, totalPage: totalPage });
  } catch (error) {
    next(error);
  }
});

router.post("/pokemons", (req, res, next) => {
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
    let pokemonData = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const { data, totalPokemon } = pokemonData;
    const newPokemon = {
      name,
      types,
      url,
      id: data.length + 1,
    };
    data.push(newPokemon);
    pokemonData.totalPokemon = data.length;
    pokemonData.data = data;
    fs.writeFileSync("db.json", JSON.stringify(pokemonData));
    res.status(200).send(newPokemon);
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
