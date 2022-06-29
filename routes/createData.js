const fs = require("fs");
const csv = require("csvtojson");

const createData = async () => {
  let id = 1;
  let newData = await csv().fromFile("pokemon.csv");
  newData = newData.slice(0, 721).map((e) => {
    let type = { type1: e.Type1, type2: e.Type2 };
    let type1 = type.type1 ? type.type1.toLowerCase() : null;
    let type2 = type.type2 ? type.type2.toLowerCase() : null;
    const q = {
      name: e.Name,
      types: [type1, type2],
      url: `https://pokemon-data-json.herokuapp.com/pokemon/${id}.png`,
      id: id++,
    };
    return q;
  });
  let data = JSON.parse(fs.readFileSync("db.json"));
  let totalPokemon = newData.length;
  data.totalPokemon = totalPokemon;
  data.data = newData;
  fs.writeFileSync("db.json", JSON.stringify(data));
};
createData();
