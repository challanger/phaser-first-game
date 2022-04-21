import IState from "~/states/IState"
import IdleState from "~/states/IdleState";
import MoveUpState from "~/states/MoveUpState";
import MoveDownState from "~/states/MoveDownState";
import PlayerStates from "~/const/states";
import { PlayerCursors } from "./PlayerCursors";
import MoveLeftState from "~/states/MoveLeftState";
import MoveRightState from "~/states/MoveRightState";
import AttackState from "~/states/AttackState";
import PlayerAnimations from "~/const/PlayerAnimations";
import BodyConfig from "~/utils/BodyConfig";
import HealthBar from "./HealthBar";
import { TileSize } from "~/utils/gridHelpers";
import Direction from "~/const/Direction";
import PlayerEventType from "~/const/PlayerEventType";

export default class PlayerController extends Phaser.GameObjects.Container
{
    scene: Phaser.Scene 
    protected player!: Phaser.GameObjects.Sprite
    private healthBar: HealthBar
    private states: {}
    private currentState!: IState 
    private cursors?: PlayerCursors
    private pauseStateChange: Boolean
    private currentDirection: Direction
    public emitter: Phaser.Events.EventEmitter
    private attackRange: number = 10 
    private attackDamage: number = 52
    private isDead: Boolean = false 

    constructor(scene: Phaser.Scene, x: number, y: number, cursors?: PlayerCursors, speed: number = 200)
    {
        super(scene, x, y)
        this.scene = scene 
        this.emitter = new Phaser.Events.EventEmitter() 

        const playerWidth = 18 
        const playerHeight = 22
        const offsetX = 0
        const offsetY = 3

        //this.container = new Phaser.GameObjects.Container(this.scene, x, y)
        this.setSize(playerWidth,playerHeight)

        this.player = this.scene.add.sprite(0,0,'player-sprite')
        this.player.setSize(playerWidth, playerHeight)
        this.add(this.player) 

        this.healthBar = new HealthBar(this.scene, 0, ((TileSize / 2) - 3) * -1) 
        this.healthBar.emitter.once(PlayerEventType.Die, this.die, this)

        this.add(this.healthBar) 

        this.scene.physics.add.existing(this) 
        
        this.scene.add.existing(this)
        this.physicsBody.setCollideWorldBounds(true)
        //body.setBounce(0.2,0.2)
        this.physicsBody.pushable = false 

        this.states = {
            "idle": new IdleState(
                this.physicsBody,
                this.player,
                PlayerAnimations.Idle,
                new BodyConfig(this.physicsBody, false, offsetX, offsetY)), 
            "moveUp": new MoveUpState(
                this.physicsBody,
                this.player, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, offsetX, offsetY), 
                speed),
            "moveDown": new MoveDownState(
                this.physicsBody,
                this.player, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, offsetX, offsetY),
                speed),
            "moveLeft": new MoveLeftState(
                this.physicsBody,
                this.player,
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, offsetX, offsetY), 
                speed),
            "moveRight": new MoveRightState(
                this.physicsBody,
                this.player, 
                PlayerAnimations.Walk, 
                new BodyConfig(this.physicsBody, false, offsetX, offsetY),
                speed),
            "attack": new AttackState(
                this.physicsBody,
                this.player),
            "dead": new IdleState(
                this.physicsBody,
                this.player,
                PlayerAnimations.Die,
                new BodyConfig(this.physicsBody, false, offsetX, offsetY)),
        }

        this.pauseStateChange = false 

        this.cursors = cursors 

        this.createAnimations() 

        this.setCurrentState(PlayerStates.Idle)
        this.currentDirection = Direction.East 

        //this.healthBar.updateHeath(-30)
    }

    public get physicsBody() {
        return this.body as Phaser.Physics.Arcade.Body 
    }

    setCurrentState(name: string)
    {
        if(this.currentState == this.states[name])
        {
            return 
        }

        this.currentState = this.states[name]
        this.currentState.enter() 
    }

    playerInput()
    {
        if(this.cursors == null || this.cursors == undefined)
        {
            return 
        }

        if(this.isDead)
            return 

        if(this.pauseStateChange)
            return 

        if(this.cursors.attack.isDown)
        {
            this.pauseStateChange = true 

            this.setCurrentState(PlayerStates.Attack)

            this.attack()
        }
        else if(this.cursors.left.isDown)
        {
            this.setCurrentState(PlayerStates.MoveLeft)
            this.currentDirection = Direction.West
        }
        else if(this.cursors.right.isDown)
        {
            this.setCurrentState(PlayerStates.MoveRight)
            this.currentDirection = Direction.East
        }
        else if(this.cursors.up.isDown)
        {
            this.setCurrentState(PlayerStates.MoveUp)
            this.currentDirection = Direction.North
        }
        else if(this.cursors.down.isDown)
        {
            this.setCurrentState(PlayerStates.MoveDown)
            this.currentDirection = Direction.South
        }
        else 
        {
            this.setCurrentState(PlayerStates.Idle)
        }
    }

    attack()
    {
        this.emitter.emit(
            PlayerEventType.Attack, 
            this.physicsBody.x, 
            this.physicsBody.y, 
            this.currentDirection, 
            this.attackRange, 
            this.attackDamage)
    }

    attachAnimationComplete()
    {
        this.setCurrentState(PlayerStates.Idle)
        this.pauseStateChange = false 
        
    }

    takeDamage(damage)
    {
        //console.log("player takes damage: " + damage)
        this.healthBar.updateHeath(damage) 
    }

    private die() 
    {
        this.isDead = true 
        this.setCurrentState(PlayerStates.Dead)

        this.scene.time.addEvent({
             delay: 500, 
             callback: () => {
                 this.healthBar.setVisible(false)
                 this.scene.time.addEvent({
                     delay: 3000,
                     callback: () => {
                        this.destroy(true)
                        /*this.container.setVisible(false)
                        this.container.setActive(false)
                        this.container.removedFromScene()*/   
                     }, 
                     callbackScope: this, 
                     loop: false 
                 })
             }, 
             callbackScope: this, 
             loop: false 
        })
    }

    createAnimations()
    {
        this.player.anims.create({
            key: PlayerAnimations.Idle,
            frames: this.player.anims.generateFrameNames('player-sprite',{
                start: 0,
                end: 12
            }),
            repeat: -1,
            frameRate: 10,
            repeatDelay:2000
        })

        this.player.anims.create({
            key:"walk",
            frames:this.player.anims.generateFrameNames('player-sprite',{
                start: 13,
                end: 20
            }),
            repeat: -1, 
            frameRate: 10 
        })

        this.player.anims.create({
            key: "attack-1",
            frames:this.player.anims.generateFrameNames('player-sprite',{
                start: 26, 
                end: 35
            }),
            repeat: 0,
            frameRate: 20 
        })

        this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack-1",() => {
            this.attachAnimationComplete()
        }, this)

        this.player.anims.create({
            key: "attack-2",
            frames:this.player.anims.generateFrameNames('player-sprite',{
                start: 39, 
                end: 48
            }),
            repeat: 0,
            frameRate: 20
        })

        this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack-2",() => {
            this.attachAnimationComplete()
        }, this)

        this.player.anims.create({
            key: "attack-3",
            frames:this.player.anims.generateFrameNames('player-sprite',{
                start: 52, 
                end: 61
            }),
            repeat: 0,
            frameRate: 20
        })

        this.player.on(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + "attack-3",() => {
            this.attachAnimationComplete()
        }, this)

        this.player.anims.create({
            key: "jump",
            frames:this.player.anims.generateFrameNames('player-sprite',{
                start: 65, 
                end: 70
            }),
            repeat: 0,
            frameRate: 10
        })

        this.player.anims.create({
            key: "hurt",
            frames:this.player.anims.generateFrameNames('player-sprite',{
                start: 78, 
                end: 81
            }),
            repeat: 0,
            frameRate: 10
        })

        this.player.anims.create({
            key: "die",
            frames:this.player.anims.generateFrameNames('player-sprite',{
                start: 91, 
                end: 97
            }),
            repeat: 0,
            frameRate: 10
        })
    }
}