export default interface IEntityController extends Phaser.GameObjects.Container 
{
    container: Phaser.GameObjects.Container 

    setEntityState(state: string): void
    getEntityName(): string 
    addTarget(x: number | undefined, y:number | undefined): void 
    getItemSquare(body: Phaser.Physics.Arcade.Body): {x: number, y: number}
    onAction(time: number): void 
    preRun():void 
    registerDamage(damage: number): void 
}