import { TileSize } from "~/utils/gridHelpers"

export default class Projectile extends Phaser.GameObjects.Container
{
    public damage: number 
    public sprite: Phaser.GameObjects.Sprite 
    constructor(scene: Phaser.Scene, projectilesGroup: Phaser.Physics.Arcade.Group, spriteKey: string, x: number, y: number, damage:number, speed: number, angle: number, boxWidth: number = TileSize, boxHeight: number = TileSize)
    {
        super(scene, x, y)

        this.damage = damage

        //initalize the item 
        this.setSize(boxWidth, boxHeight)

        this.sprite = this.scene.add.sprite(0, 0, spriteKey)
        this.sprite.setSize(boxWidth, boxHeight)
        this.add(this.sprite) 

        //this.scene.physics.add.existing(this)
        projectilesGroup.add(this) 
        
        this.scene.add.existing(this) 

        //fire it off 
        this.fireProjectile(angle, speed) 
    }

    public get bodyPhysics()
    {
        return this.body as Phaser.Physics.Arcade.Body 
    }

    private fireProjectile(angle: number, speed: number)
    {
        //convert that angle to velocity x and y components 
        const radians = angle * (Math.PI / 180)
        const vx = Math.cos(radians) * speed
        const vy = Math.sin(radians) * speed

        const body = this.body as Phaser.Physics.Arcade.Body
        body.setVelocity(vx, vy)
    }
}