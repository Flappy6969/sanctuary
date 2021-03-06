import Entity from "./Entity";
import { SkinColor, eucDistance } from "./util";
import Vec2 from "vec2";
import GameState from "./GameState";
import Game from "./Game";
import { WeaponVariant } from "./Weapons";
import Client from "./Client";
import { PacketFactory } from "../packets/PacketFactory";
import { Packet } from "../packets/Packet";
import { PacketType } from "../packets/PacketType";
import {
  PrimaryWeapons,
  SecondaryWeapons,
  Weapons,
  getHitTime,
} from "../items/items";

export default class Player extends Entity {
  public name: string;
  public skinColor: SkinColor;
  private _health: number = 100;
  public game: Game;

  public lastPing: number = 0;

  public hatID: number;
  public accID: number;

  public ownerID: string;

  public weapon: PrimaryWeapons = 0;
  public secondaryWeapon: SecondaryWeapons = 0;
  public selectedWeapon: Weapons = 0;
  public weaponVariant: WeaponVariant = WeaponVariant.Normal;
  public buildItem: number = -1;

  public clanName: string | null = null;
  public isClanLeader: boolean = false;

  public kills: number = 0;
  public dead: boolean = false;

  public autoAttackOn: boolean = false;
  public disableRotation: boolean = false;

  public moveDirection: number | null = null;

  public client: Client | undefined;

  private _attack: boolean = false;

  public lastHitTime: number = 0;
  public gatherAnim: (() => any) | undefined;

  public get isAttacking(): boolean {
    return this._attack || this.autoAttackOn;
  }

  public set isAttacking(val: boolean) {
    this._attack = val;
  }

  private _food: number = 0;

  public get food(): number {
    return this._food;
  }

  public set food(newFood: number) {
    let packetFactory = PacketFactory.getInstance();
    this.client?.socket.send(
      packetFactory.serializePacket(
        new Packet(PacketType.UPDATE_STATS, ["food", newFood, 1])
      )
    );
    this._food = newFood;
  }

  private _stone: number = 0;

  public get stone(): number {
    return this._stone;
  }

  public set stone(newStone: number) {
    let packetFactory = PacketFactory.getInstance();
    this.client?.socket.send(
      packetFactory.serializePacket(
        new Packet(PacketType.UPDATE_STATS, ["stone", newStone, 1])
      )
    );
    this._stone = newStone;
  }

  private _points: number = 0;

  public get points(): number {
    return this._points;
  }

  public set points(newPoints: number) {
    let packetFactory = PacketFactory.getInstance();
    console.log("send");
    this.client?.socket.send(
      packetFactory.serializePacket(
        new Packet(PacketType.UPDATE_STATS, ["points", newPoints, 1])
      )
    );
    this._points = newPoints;
  }

  private _wood: number = 0;

  public get wood(): number {
    return this._wood;
  }

  public set wood(newWood: number) {
    let packetFactory = PacketFactory.getInstance();
    this.client?.socket.send(
      packetFactory.serializePacket(
        new Packet(PacketType.UPDATE_STATS, ["wood", newWood, 1])
      )
    );
    this._wood = newWood;
  }

  public get health(): number {
    return this._health;
  }

  public set health(newHealth: number) {
    let packetFactory = PacketFactory.getInstance();

    for (let client of this.game.clients) {
      client?.socket.send(
        packetFactory.serializePacket(
          new Packet(PacketType.HEALTH_UPDATE, [this.id, newHealth])
        )
      );
    }

    this._health = newHealth;
  }

  constructor(
    sid: number,
    ownerID: string,
    location: Vec2,
    game: Game,
    client: Client | undefined = undefined,
    angle: number = 0,
    name: string = "unknown",
    skinColor: SkinColor = SkinColor.Light2,
    hatID: number = -1,
    accID: number = -1
  ) {
    super(sid, location, angle, new Vec2(0, 0));

    this.name = name;
    this.skinColor = skinColor;

    this.client = client;

    this.ownerID = ownerID;

    this.hatID = hatID;
    this.accID = accID;
    this.game = game;
  }

  public getWeaponHitTime() {
    return getHitTime(this.selectedWeapon);
  }

  public getNearbyGameObjects(state: GameState) {
    const RADIUS = process.env.GAMEOBJECT_NEARBY_RADIUS || 1250;

    let gameObjects = [];

    for (let gameObject of state.gameObjects) {
      if (
        eucDistance(
          [this.location.x, this.location.y],
          [gameObject.location.x, gameObject.location.y]
        ) < RADIUS
      ) {
        gameObjects.push(gameObject);
      }
    }

    return gameObjects;
  }

  die() {
    let packetFactory = PacketFactory.getInstance();

    this.dead = true;
    this.kills = 0;
    this.weapon = 0;
    this.weaponVariant = WeaponVariant.Normal;
    this.buildItem = -1;
    this.autoAttackOn = false;
    this.disableRotation = false;
    this.moveDirection = null;

    this.client?.socket.send(
      packetFactory.serializePacket(
        new Packet(PacketType.DEATH, [])
      )
    );
  }

  move(direction: number) {
    this.moveDirection = direction;
  }

  stopMove() {
    this.moveDirection = null;
  }

  getUpdateData(gameState: GameState) {
    let leadKills = 0;

    for (let player of gameState.players) {
      if (player.kills > leadKills) {
        leadKills = player.kills;
      }
    }

    return [
      this.id,
      this.location.x,
      this.location.y,
      this.angle,
      this.buildItem,
      this.selectedWeapon,
      this.weaponVariant,
      this.clanName,
      this.isClanLeader ? 1 : 0,
      this.hatID,
      this.accID,
      this.kills === leadKills && this.kills > 0 ? 1 : 0,
      0,
    ];
  }

  getNearbyPlayers(state: GameState) {
    const RADIUS = process.env.PLAYER_NEARBY_RADIUS || 1250;

    let players = [];

    for (let player of state.players) {
      if (player !== this && !player.dead) {
        if (
          eucDistance(
            [this.location.x, this.location.y],
            [player.location.x, player.location.y]
          ) < RADIUS
        ) {
          players.push(player);
        }
      }
    }

    return players;
  }
}
