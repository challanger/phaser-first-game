import EasyStar from "easystarjs"
import ActionType from "~/const/ActionType";

import PlayerAnimations from "~/const/PlayerAnimations";
import PlayerStates from "~/const/states";
import IdleState from "~/states/IdleState";
import MoveDownState from "~/states/MoveDownState";
import MoveLeftState from "~/states/MoveLeftState";
import MoveRightState from "~/states/MoveRightState";
import MoveUpState from "~/states/MoveUpState";
import BodyConfig from "~/utils/BodyConfig";
import { TileSize } from "~/utils/gridHelpers";
import EntityController from "./EntityController";
import PlayerController from "./PlayerController";
import SpiderWebProjectile from "./SpiderWebProjectile";

export default class SpiderEnemyController extends EntityController
{
    private lastShot: number = 0; 
    private shotRate: number = 2000; 

    constructor(scene: Phaser.Scene, x: number, y: number, entiryName: string, spriteKey: string, player: PlayerController, groundLayer: Phaser.Tilemaps.TilemapLayer, objectsLayer: Phaser.Tilemaps.TilemapLayer, projectiles: Phaser.Physics.Arcade.Group, easyStar: EasyStar.js, speed: number = 75)
    {
        super(scene, x, y, entiryName ,spriteKey, player, groundLayer, objectsLayer, projectiles, easyStar, speed, 18, 13) 

        const bodyOffSetX = 0 
        const bodyOffSetY = 11 

        this.states = {
            "idle": new IdleState(
                this.physicsBody,
                this.entity,
                PlayerAnimations.Idle,
                new BodyConfig(this.physicsBody, false, bodyOffSetX, bodyOffSetY)),
            "dead": new IdleState(
                this.physicsBody,
                this.entity,
                PlayerAnimations.Die,
                new BodyConfig(this.physicsBody, false, bodyOffSetX, bodyOffSetY)),
            "moveUp": new MoveUpState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffSetX, bodyOffSetY), 
                speed),
            "moveDown": new MoveDownState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffSetX, bodyOffSetY), 
                speed),
            "moveLeft": new MoveLeftState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffSetX, bodyOffSetY), 
                speed),
            "moveRight": new MoveRightState(
                this.physicsBody,
                this.entity, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, bodyOffSetX, bodyOffSetY),
                speed)
        }

        this.createAnimations() 

        //this.setActionType(ActionType.Follow)

        this.setEntityState(PlayerStates.Idle)

    }

    private createAnimations()
    {
        let i: number = 8; 
        let maxFrames: number = 9 

        this.entity.anims.create({
            key: PlayerAnimations.Idle,
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 5 - 1
            }),
            repeat: -1,
            frameRate: 10,
            repeatDelay:2000
        })
        i++ 

        this.entity.anims.create({
            key: PlayerAnimations.Walk,
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 6 - 1
            }),
            repeat: -1,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: PlayerAnimations.Jump,
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 9 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++ 

        this.entity.anims.create({
            key: PlayerAnimations.WalkDown,
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 1 - 1
            }),
            repeat: -1,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: "spider-get-up",
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 4 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: PlayerAnimations.Die,
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 3 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: "spider-on-back",
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 9 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++

        this.entity.anims.create({
            key: "spider-web",
            frames: this.entity.anims.generateFrameNames('spider-sprite',{
                start: i * maxFrames,
                end: (i * maxFrames) + 6 - 1
            }),
            repeat: 0,
            frameRate: 10
        })
        i++
    }

    onAction(time: number): void {
        this.checkAttack(time)

        super.onAction(time) 
    }

    checkAttack(time: number){
        if(this.isDead)
            return 

        const body = this.physicsBody
        const physicsBody = this.player.physicsBody
        
        if(!body)
            return 

        if(!physicsBody)
            return 
        
        if(this.scene.cameras.main.worldView.contains(body.x, body.y))
        {
            const between = Phaser.Math.Distance.Between(body.x, body.y, physicsBody.x, physicsBody.y)

            if(between < 250)
            {
                if(time > (this.lastShot + this.shotRate))
                {
                    const angle = Math.atan2(physicsBody.y - this.y, physicsBody.x - this.x)  * 180 / Math.PI; 

                    new SpiderWebProjectile(this.scene, this.projectiles, this.x, this.y, angle)
                    this.lastShot = time; 
                }
            }
        }
    }
}