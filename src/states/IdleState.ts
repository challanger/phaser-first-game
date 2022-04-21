import Phaser from 'phaser'
import IState from './IState'
import PlayerAnimations from '../const/PlayerAnimations'
import BodyConfig from '~/utils/BodyConfig'

export default class IdleState implements IState
{
    private body!: Phaser.Physics.Arcade.Body
    private sprite!: Phaser.GameObjects.Sprite 
    private animationKey: string 
    protected offsetX: number 
    protected offsetY: number
    protected boxWidth: number 
    protected boxHeight: number 

    constructor(
        body: Phaser.Physics.Arcade.Body, 
        sprite: Phaser.GameObjects.Sprite, 
        animationKey: string,
        bodyConfig?: BodyConfig)
    {
        this.body = body
        this.sprite = sprite  
        this.animationKey = animationKey



        if(bodyConfig)
        {
            this.offsetX = bodyConfig.OffSetX 
            this.offsetY = bodyConfig.OffSetY
            this.boxWidth = bodyConfig.BoxWidth
            this.boxHeight = bodyConfig.BoxHeight
        }
        else 
        {
            this.offsetX = 0
            this.offsetY = 0
            this.boxWidth = body.width
            this.boxHeight = body.height
        }
    } 

    enter() 
    {
        this.body.setSize(this.boxWidth, this.boxHeight)
            .setOffset(this.offsetX, this.offsetY)
            
        this.body.setVelocity(0,0)

        this.sprite.play(this.animationKey)
    }
}