import PlayerEventType from "~/const/PlayerEventType"

export default class HealthBar extends Phaser.GameObjects.Container
{
    emitter: Phaser.Events.EventEmitter 
    private OuterShell: Phaser.GameObjects.Rectangle 
    private InnerBar: Phaser.GameObjects.Rectangle
    private health: number 
    private maxHealth: number 
    private barWidth: number 
    constructor(scene: Phaser.Scene, x: number, y: number, maxHealth: number = 100) {
        super(scene, x, y) 

        this.emitter = new Phaser.Events.EventEmitter() 

        this.maxHealth = maxHealth 
        this.health = maxHealth 

        this.barWidth = 24
        
        this.InnerBar = this.scene.add.rectangle(0, 0, this.barWidth, 4, 0x00EE00, 1)
        
        this.OuterShell = this.scene.add.rectangle(0,0,this.barWidth, 4)
            .setFillStyle(0x000000, 0)
            .setStrokeStyle(1, 0x000000, 1) 
        
        this.add(this.InnerBar)
        this.add(this.OuterShell)
    }

    resetHeath() 
    {
        this.health = this.maxHealth
        
        this.updateBar()
    }

    updateHeath(ammount: number) 
    {
        //console.log("update health: " + this.health)
        this.health = this.health + ammount

        if(this.health < 0)
        {
            this.health = 0

            this.emitter.emit(PlayerEventType.Die)
        } 
        else if(this.health > this.maxHealth)
            this.health = this.maxHealth
        
        this.updateBar()
    }

    private updateBar()
    {
        this.InnerBar.width = Math.ceil((this.health / this.maxHealth) * this.barWidth)
    }
}