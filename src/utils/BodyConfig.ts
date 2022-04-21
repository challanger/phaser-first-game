export default class BodyConfig {
    BoxWidth: number = 0
    BoxHeight: number = 0
    OffSetX: number = 0
    OffSetY: number = 0

    constructor(body: Phaser.Physics.Arcade.Body, inverseBox: Boolean = false, offSetX:number = 0, offSetY:number = 0){
        if(!body) 
            return 

        if(!inverseBox) {
            this.BoxHeight = body.height 
            this.BoxWidth = body.width
        }
        else {
            this.BoxHeight = body.width 
            this.BoxWidth = body.height
        }

        this.OffSetX = offSetX > 0 ? offSetX : body.offset.x 
        this.OffSetY = offSetY > 0 ? offSetY : body.offset.y 

    }
}