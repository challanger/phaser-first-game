import IState from "./IState";
import PlayerAnimations from "~/const/PlayerAnimations";

export default class AttackState implements IState
{
    private body: Phaser.Physics.Arcade.Body
    private player: Phaser.GameObjects.Sprite

    constructor(body: Phaser.Physics.Arcade.Body, player: Phaser.GameObjects.Sprite)
    {
        this.body = body 
        this.player = player 
    }

    enter() {
        this.body.setVelocity(0,0)

        const attackNumber = Phaser.Math.Between(1,3)
        this.player.play(`${PlayerAnimations.Attack}${attackNumber}`)
    }
}