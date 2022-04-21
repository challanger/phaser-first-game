import Projectile from "./Projectile";

export default class SpiderWebProjectile extends Projectile
{
    constructor(scene: Phaser.Scene, projectilesGroup: Phaser.Physics.Arcade.Group, x: number, y: number, angle: number)
    {
        const speed: number = 100
        const damage: number = 10
        super(scene, projectilesGroup, 'spider-sprite', x, y, damage, speed, angle, 22, 20)
        
        this.bodyPhysics.setOffset(0, 5)

        let maxFrames: number = 9 
        this.sprite.anims.create({
            key: "spider-web",
            frames: this.sprite.anims.generateFrameNames('spider-sprite',{
                start: 7 * maxFrames,
                end: (7 * maxFrames) + 6 - 1
            }),
            repeat: 0,
            frameRate: 10
        })

        this.sprite.play("spider-web") 
    }
}