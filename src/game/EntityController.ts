import EasyStar from "easystarjs"
import Follow from "~/actions/Follow";
import WalkBetween from "~/actions/WalkBetween";
import ActionType from "~/const/ActionType";
import PlayerEventType from "~/const/PlayerEventType";
import PlayerStates from "~/const/states";
import IState from "~/states/IState";
import { getItemSquare, getItemSquareVector, TileSize } from "~/utils/gridHelpers";
import HealthBar from "./HealthBar";
import PlayerController from "./PlayerController";

export default class EntityController extends Phaser.GameObjects.Container
{
    //display elements 
    protected healthBar!: HealthBar
    protected entity!: Phaser.GameObjects.Sprite

    //entity details 
    protected speed: number
    
    //game area 
    protected player: PlayerController
    protected groundLayer: Phaser.Tilemaps.TilemapLayer
    protected objectsLayer: Phaser.Tilemaps.TilemapLayer

    //projectiles 
    protected projectiles: Phaser.Physics.Arcade.Group 
    
    //movement 
    protected movementTargets: Array<Phaser.Math.Vector2>
    private tracker!: Phaser.GameObjects.Rectangle 
    private target!: {x: number, y: number} | undefined | null 
    private easyStar: EasyStar.js 

    //actions 
    private currentAction: ActionType
    private WalkBetween: WalkBetween | null
    private Follow: Follow | null 

    //state 
    protected states: {}
    private currentState!: IState 
    protected isDead: Boolean = false 
    
    constructor(scene: Phaser.Scene, x: number, y: number, entiryName: string, spriteKey: string, player: PlayerController, groundLayer: Phaser.Tilemaps.TilemapLayer, objectsLayer: Phaser.Tilemaps.TilemapLayer, projectiles: Phaser.Physics.Arcade.Group, easyStar: EasyStar.js, speed: number, boxWidth: number = TileSize, boxHeight: number = TileSize) {
        super(scene, x, y)
        
        this.projectiles = projectiles 

        this.name = entiryName
        
        this.setupEntity(scene, x, y, spriteKey, boxWidth, boxHeight)

        this.movementTargets = [] 
        this.movementTargets.push(new Phaser.Math.Vector2().set(x , y))

        this.player = player 

        this.groundLayer = groundLayer 
        this.objectsLayer = objectsLayer 

        this.easyStar = easyStar

        this.speed = speed 

        this.states = {} 

        this.currentAction = ActionType.Stand
        this.WalkBetween = null 
        this.Follow = null 

        /*this.tracker = this.entity.scene.add.rectangle(0,0,TileSize, TileSize)
            .setFillStyle(0x000000, 0)
            .setStrokeStyle(2,0xff0000)
            .setDepth(1000)*/
    }

    public get physicsBody() {
        return this.body as Phaser.Physics.Arcade.Body
    }

    private setupEntity(scene: Phaser.Scene, x: number, y: number, spriteKey: string, boxWidth: number = TileSize, boxHeight: number = TileSize)
    {
        this.setSize(boxWidth,boxHeight)
    

        this.entity = scene.add.sprite(0,0,spriteKey)
        this.entity.setSize(boxWidth,boxHeight)
        this.add(this.entity) 

        this.healthBar = new HealthBar(scene, 0, ((boxHeight / 2) - 3) * -1) 
        this.healthBar.emitter.once(PlayerEventType.Die, this.die, this)

        this.add(this.healthBar) 

        scene.physics.add.existing(this)

        scene.add.existing(this)

        this.physicsBody.setCollideWorldBounds(true)
        //body.setBounce(0.2,0.2)
        this.physicsBody.pushable = false

    }

    private die() 
    {
        this.isDead = true 
        this.setEntityState(PlayerStates.Dead)
        this.physicsBody.enable = false 

        this.scene.time.addEvent({
             delay: 500, 
             callback: () => {
                 this.healthBar.setVisible(false)
                 this.scene.time.addEvent({
                     delay: 3000,
                     callback: () => {
                        this.destroy(true)
                        /*this.container.setVisible(false)
                        this.container.setActive(false)*/  
                     }, 
                     callbackScope: this, 
                     loop: false 
                 })
             }, 
             callbackScope: this, 
             loop: false 
        })
    }

    getEntityName()
    {
        return this.name 
    }

    setActionType(action: ActionType)
    {
        this.currentAction = action 
    }

    setEntityState(name: string)
    {
        if(this.currentState == this.states[name])
        {
            return 
        }

        this.currentState = this.states[name]
        this.currentState.enter() 
    }

    addTarget(x: number | undefined, y:number | undefined)
    {
        if(x == undefined || y == undefined)
            return 

        this.movementTargets.push(new Phaser.Math.Vector2(x, y)) //this.getItemSquare({x, y})) 
    }

    preRun():void 
    {
        switch(this.currentAction)
        {
            case ActionType.WalkBetween: 
            {
                if(this.movementTargets.length > 1)
                {
                    const start = getItemSquareVector(this.movementTargets[0])
                    const target = getItemSquareVector(this.movementTargets[1])
                    
                    this.WalkBetween = new WalkBetween(start,target,this.easyStar)
                    this.WalkBetween.init() 
                    
                }
                break 
            }
            case ActionType.Follow: 
            {
                this.Follow = new Follow(this.entity.scene, this.physicsBody, this.player.physicsBody, this.objectsLayer, this.easyStar)
                this.Follow.init() 
                break 
            }
        }
    }

    getItemSquare(body: Phaser.Physics.Arcade.Body | {x: number, y: number}): {x: number, y:number}
    {
        return getItemSquare(body) 
    }

    private setMoveTarget()
    {
        switch(this.currentAction)
        {
            case ActionType.WalkBetween: 
                this.target = this.WalkBetween?.getNextTarget()
                break
            case ActionType.Follow:  
                this.target = this.Follow?.getNextTarget() 
                break 
        }
    }

    onAction(time: number)
    {
        if(this.isDead)
            return 

        if(this.entity == null)
            return 

        this.setMoveTarget() 

        if(!this.target)
            return 

        const {x: ex, y: ey} = this.physicsBody
        const {x: tx, y: ty} = this.target //the target is in tiles not pixels 

        const trackerX = (this.target.x * TileSize) + 16
        const trackerY = (this.target.y * TileSize) + 16

        if(this.tracker != null)
        {    
            this.tracker.setX(trackerX)
            this.tracker.setY(trackerY)
        }

        //convert the tracker to pixels and add half of tile to target the middle 
        const depx = Math.floor(ex) - trackerX + (TileSize / 2)
        const depy = Math.floor(ey) - trackerY + (TileSize / 2)

        if(depx > 2)
        {
            this.setEntityState(PlayerStates.MoveLeft)
        }
        else if(depx < -2)
        {
            this.setEntityState(PlayerStates.MoveRight)
        }
        else if(depy > 2)
        {
            this.setEntityState(PlayerStates.MoveUp)
        }
        else if(depy < -2)
        {
            this.setEntityState(PlayerStates.MoveDown)
        }
        else 
        {
            this.setEntityState(PlayerStates.Idle)

            switch(this.currentAction)
            {
                case ActionType.WalkBetween: 
                    this.WalkBetween?.incrementIndex()
                    break 
                case ActionType.Follow: 
                    this.Follow?.incrementIndex()  
                    break 
            }
        }
    }

    registerDamage(damage: number)
    {
        //console.log(this.entityName, damage)
        this.healthBar.updateHeath(damage * -1)
    }
}