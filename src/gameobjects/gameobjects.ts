enum GameObjectType {
  Tree = 0,
  StoneMine,
  GoldMine,
  Spike,
  GreaterSpike,
  PoisonSpike,
  SpinningSpike,
  WoodWall,
  StoneWall,
  CastleWall,
  Sapling,
  Mine,
  Bush,
  Cactus
}

let gameObjectSizes: Partial<Record<GameObjectType, number>> = { };
gameObjectSizes[GameObjectType.Tree] = 140;

gameObjectSizes = Object.freeze(gameObjectSizes);

export { gameObjectSizes, GameObjectType };