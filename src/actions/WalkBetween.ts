import EasyStar from "easystarjs"

export default class WalkBetween {
    private start: Phaser.Math.Vector2 
    private end: Phaser.Math.Vector2 
    private easyStar: EasyStar.js 
    private path: Phaser.Math.Vector2[] 
    private moveReverse: boolean
    private index: number 

    constructor(start: Phaser.Math.Vector2, end: Phaser.Math.Vector2, easyStar: EasyStar.js) {
        this.start = start 
        this.end = end 
        this.easyStar = easyStar 
        this.path  = [] 
        this.moveReverse = false
        this.index = 0  
    }

    init(){
        this.easyStar.findPath(this.start.x, this.start.y, this.end.x, this.end.y,path => {

            if(path === null)
                return 

            this.path = path.map(item => {return new Phaser.Math.Vector2(item.x, item.y)})
            
        })
        this.easyStar.calculate()
    }

    getNextTarget() {
        if(this.path.length < 1)
            return 

        if(!this.moveReverse)
        {
            if(this.index >= this.path.length)
            {
                this.index = this.index - 2
                this.moveReverse = true 
            }
        }
        else 
        {
            if(this.index === 0) {
                this.index = this.index
                this.moveReverse = false 
            }
        }

        return this.path[this.index]
    }

    incrementIndex(){
        if(!this.moveReverse)
            this.index++ 
        else 
            this.index--
    }
    
}