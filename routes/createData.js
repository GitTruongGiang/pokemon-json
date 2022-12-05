const fs = require("fs");
const csv = require("csvtojson");
const { faker } = require("@faker-js/faker");

const createData = async () => {
  let id = 1;
  let newData = await csv().fromFile("pokemon.csv");
  newData = newData.slice(0, 721).map((e) => {
    let type1 = e.Type1 ? e.Type1.toLowerCase() : null;
    let type2 = e.Type2 ? e.Type2.toLowerCase() : null;
    let q = {
      height: `${faker.datatype.number({ min: 2, max: 50, precision: 0.1 })}`,
      weight: `${faker.datatype.number({
        min: 10,
        max: 100,
        precision: 0.01,
      })} lbs`,
      name: e.Name,
      types: [type1, type2],
      url: `https://pokemon-data.up.railway.app/pokemon/${id}.png`,
      id: id++,
    };
    q.types = q.types.filter((e) => e);
    return q;
  });
  let data = JSON.parse(fs.readFileSync("db.json"));
  let totalPokemon = newData.length;
  data.totalPokemon = totalPokemon;
  data.data = newData;
  fs.writeFileSync("db.json", JSON.stringify(data));
};
createData();
