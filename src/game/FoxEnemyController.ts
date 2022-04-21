import EasyStar from "easystarjs"

import PlayerAnimations from "~/const/PlayerAnimations";
import PlayerStates from "~/const/states";
import IdleState from "~/states/IdleState";
import MoveDownState from "~/states/MoveDownState";
import MoveLeftState from "~/states/MoveLeftState";
import MoveRightState from "~/states/MoveRightState";
import MoveUpState from "~/states/MoveUpState";
import EntityController from "./EntityController";
import BodyConfig from "~/utils/BodyConfig";
import ActionType from "~/const/ActionType";
import PlayerController from "./PlayerController";

export default class FoxEnemyController extends EntityController
{
    

    constructor(scene: Phaser.Scene, x: number, y: number, entiryName: string, spriteKey: string, player: PlayerController, groundLayer: Phaser.Tilemaps.TilemapLayer, objectsLayer: Phaser.Tilemaps.TilemapLayer, projectiles: Phaser.Physics.Arcade.Group, easyStar: EasyStar.js, speed: number = 75)
    {
        super(scene, x, y, entiryName ,spriteKey, player, groundLayer, objectsLayer, projectiles, easyStar, speed, 25, 20)

        const bodyOffsetX = 0
        const bodyOffsetY = 8
        this.states = {
            "idle": new IdleState(
                this.physicsBody,
                this.entity,
                PlayerAnimations.Idle,
                new BodyConfig(this.physicsBody, false, bodyOffsetX, bodyOffsetY)),
            "dead": new IdleState(
                this.physicsBody,
                this.entity,
                PlayerAnimations.Die,
                new BodyConfig(this.physicsBody, false, bodyOffsetX, bodyOffsetY)),
            "moveUp": new MoveUpState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffsetX, bodyOffsetY), 
                speed),
            "moveDown": new MoveDownState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffsetX, bodyOffsetY), 
                speed),
            "moveLeft": new MoveLeftState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffsetX, bodyOffsetY), 
                speed),
            "moveRight": new MoveRightState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffsetX, bodyOffsetY), 
                speed)
        }

        this.createAnimations() 

        this.setEntityState(PlayerStates.Idle)

        this.setActionType(ActionType.WalkBetween)
    }

    private createAnimations()
    {
        let i: number = 0; 
        let maxFrames: number = 14 

        this.entity.anims.create({
            key: "fox-wags-tail",
            frames: this.entity.anims.generateFrameNames('fox-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 5 - 1
            }),
            repeat: -1,
            frameRate: 10
            //repeatDelay:2000
        })
        i++ 

        this.entity.anims.create({
            key: PlayerAnimations.Idle,
            frames: this.entity.anims.generateFrameNames('fox-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + maxFrames - 1
            }),
            repeat: -1,
            frameRate: 5,
            repeatDelay:2000
        })
        i++

        this.entity.anims.create({
            key: PlayerAnimations.Walk,
            frames: this.entity.anims.generateFrameNames('fox-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 8 - 1
            }),
            repeat:-1,
            frameRate: 10
        })
        i++ 

        this.entity.anims.create({
            key: PlayerAnimations.Jump,
            frames: this.entity.anims.generateFrameNames('fox-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 11 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: "fox-pounce",
            frames: this.entity.anims.generateFrameNames('fox-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 5 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: "fox-sleep",
            frames: this.entity.anims.generateFrameNames('fox-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 6 - 1
            }),
            repeat: -1,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: PlayerAnimations.Die,
            frames: this.entity.anims.generateFrameNames('fox-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 7 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++
    }

    preRun()
    {
        super.preRun()  
    }

    onAction(time: number)
    {
        super.onAction(time) 
    }
}