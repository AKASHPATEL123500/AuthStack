class Chai {
  constructor(config) {
    this.config = config;
}

banao() {
    console.log("Cheeni:", this.config.cheeni);
    console.log("Doodh:", this.config.doodh);
    console.log("name:", this.config.name);
}
}

const meriChai = new Chai({
  cheeni: "2 chamach",
  doodh: "Amul",
  name: "Tea",
});

meriChai.banao();
