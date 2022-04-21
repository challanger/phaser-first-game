import BodyConfig from '~/utils/BodyConfig'
import MoveBaseState from './MoveBaseState'

export default class MoveUpState extends MoveBaseState
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

        this.body.setVelocityY(this.speed * -1)
            .setVelocityX(0)

        this.sprite
            //.setRotation(-Math.PI / 2)
            .setFlipX(false)

        //console.log("Up",this.body.center)
    }
}