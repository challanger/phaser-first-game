import BodyConfig from "~/utils/BodyConfig"
import IState from "./IState"

export default class MoveBaseState implements IState {
    protected sprite: Phaser.GameObjects.Sprite
    protected body: Phaser.Physics.Arcade.Body
    protected speed: number
    protected offsetX: number 
    protected offsetY: number
    protected boxWidth: number 
    protected boxHeight: number 
    protected animationName: string  

    constructor(
        body: Phaser.Physics.Arcade.Body,
        sprite: Phaser.GameObjects.Sprite,  
        animationName: string, 
        bodyConfig: BodyConfig, 
        speed: number  = 200)
    {
        this.body = body
        this.sprite = sprite 
        this.offsetX = bodyConfig.OffSetX 
        this.offsetY = bodyConfig.OffSetY
        this.boxWidth = bodyConfig.BoxWidth
        this.boxHeight = bodyConfig.BoxHeight 
        this.speed = speed 
        this.animationName = animationName
    }

    enter() 
    {
        this.body.setSize(this.boxWidth, this.boxHeight)
            .setOffset(this.offsetX,this.offsetY)

        this.sprite.play(this.animationName)
    }
}