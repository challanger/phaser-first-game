export class PlayerCursors 
{
    public up:  Phaser.Input.Keyboard.Key 
    public down:  Phaser.Input.Keyboard.Key
    public right: Phaser.Input.Keyboard.Key
    public left: Phaser.Input.Keyboard.Key 
    public attack: Phaser.Input.Keyboard.Key

    constructor(scene:Phaser.Scene, upKey:string, downKey:string, rightKey: string, leftKey: string, attackKey: string)
    {
        this.up = scene.input.keyboard.addKey(upKey)
        this.down = scene.input.keyboard.addKey(downKey)
        this.right = scene.input.keyboard.addKey(rightKey)
        this.left = scene.input.keyboard.addKey(leftKey)
        this.attack = scene.input.keyboard.addKey(attackKey)
    }
}