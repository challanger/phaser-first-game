import BodyConfig from "~/utils/BodyConfig"
import MoveBaseState from "./MoveBaseState"

export default class MoveLeftState extends MoveBaseState
{
    constructor(body: Phaser.Physics.Arcade.Body,
        sprite: Phaser.GameObjects.Sprite,  
        animationName: string, 
        bodyConfig: BodyConfig, 
        speed: number  = 200)
    {
        super(body, sprite, animationName, bodyConfig, speed)
    }

    enter() 
    {
        super.enter() 

        this.body
            .setVelocityY(0)
            .setVelocityX(this.speed * -1)

        this.sprite
            .setFlipX(true)
            //.setRotation(0)

        //console.log("Left", this.body.center)
    }
}