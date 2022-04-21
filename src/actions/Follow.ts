import EasyStar from "easystarjs"
import { Vector } from "matter"
import { getItemSquareVector, TileSize } from "~/utils/gridHelpers"

import Direction from "~/const/Direction"

export default class Follow {
    private easyStar: EasyStar.js
    private scene: Phaser.Scene
    private targetEntity: Phaser.Physics.Arcade.Body
    private entity: Phaser.Physics.Arcade.Body 
    private recalculateSeperation: number 

    private path: Phaser.Math.Vector2[] 
    private index: number 

    private objectsLayer: Phaser.Tilemaps.TilemapLayer

    private pathDebugGroup: Phaser.GameObjects.Group

    constructor(scene: Phaser.Scene, entity: Phaser.Physics.Arcade.Body, target: Phaser.Physics.Arcade.Body, objectsLayer: Phaser.Tilemaps.TilemapLayer, easyStar: EasyStar.js, recalculateSeperation: number = 2)
    {
        this.scene = scene 
        this.entity = entity 
        this.targetEntity = target 
        this.objectsLayer = objectsLayer
        this.easyStar = easyStar 
        this.recalculateSeperation = recalculateSeperation 

        this.path = [] 
        this.index = 0

        this.pathDebugGroup = this.scene.add.group() 
    }

    init(){
        const start = getItemSquareVector(this.entity.center)
        let target = this.getTargertSquare() 

        if(!target)
            return 

        this.calculatePath(start, target) 
    }

    private calculatePath(start: Phaser.Math.Vector2, target: Phaser.Math.Vector2)
    { 
        this.easyStar.findPath(start.x, start.y, target.x, target.y,path => {
            if(path === null)
                return 

            //clear the debug group 
            if(this.pathDebugGroup.getLength() > 0)
            {
                this.pathDebugGroup.clear(true, true) 
            }

            this.index = 0

            this.path = path.map(item => {return new Phaser.Math.Vector2(item.x, item.y)})

            //get the entity current location and set the index to it's location
            const entityLocation = getItemSquareVector(this.entity.center)
            const entityIndex = this.path.findIndex(path => {return (path.x === entityLocation.x && path.y === entityLocation.y)})

            if(entityIndex > -1 && entityIndex < (this.path.length - 1))
                this.index = entityIndex + 1
            
            //create the debug path 
            /*this.path.forEach(item => {
                const rect = this.scene.add.rectangle((item.x * TileSize) + 16, 
                    (item.y * TileSize) + (TileSize / 2), 
                    TileSize, 
                    TileSize)
                    .setFillStyle(0x00000, 0)
                    .setStrokeStyle(2, 0xFF0000, 1) 

                this.pathDebugGroup.add(rect)
            })*/
        })
        this.easyStar.calculate()
    }

    private getTargertSquare()
    {
        const currentLocation = getItemSquareVector(this.entity.center)
        let newTarget = getItemSquareVector(this.targetEntity.center)

        const difX = currentLocation.x - newTarget.x
        const difY = currentLocation.y - newTarget.y
        
        let possibleTargets: Direction[] = [] 

        if(Math.abs(difY) > Math.abs(difX))
        {
            if(difY < 0)
                possibleTargets = [Direction.North, Direction.East, Direction.West]
            else if(difY > 0)
                possibleTargets = [Direction.South, Direction.East, Direction.West]
        }
        else if(Math.abs(difY) < Math.abs(difX))
        {
            if(difX < 0)
                possibleTargets = [Direction.East, Direction.North, Direction.South] 
            else if(difX > 0)
                possibleTargets = [Direction.West, Direction.North, Direction.South]
        }
        else if(difX != 0 )
        {
            if(difX < 0)
                possibleTargets = [Direction.East, Direction.North, Direction.South] 
            else if(difX > 0)
                possibleTargets = [Direction.West, Direction.North, Direction.South]
        }

        for(let i:number = 0; i< possibleTargets.length; i++)
        {
            switch(possibleTargets[i])
            {
                case Direction.North: 
                    if(!this.objectsLayer.hasTileAt(newTarget.x, newTarget.y - 1))
                    {
                        newTarget.y = newTarget.y - 1
                        return newTarget
                    }
                    break 
                case Direction.South: 
                    if(!this.objectsLayer.hasTileAt(newTarget.x, newTarget.y + 1))
                    {
                        newTarget.y = newTarget.y + 1
                        return newTarget
                    }
                    break 
                case Direction.East: 
                    if(!this.objectsLayer.hasTileAt(newTarget.x - 1, newTarget.y))
                    {
                        newTarget.x = newTarget.x - 1
                        return newTarget
                    }
                    break 
                case Direction.West: 
                    if(!this.objectsLayer.hasTileAt(newTarget.x + 1, newTarget.y))
                    {
                        newTarget.x = newTarget.x + 1 
                        return newTarget
                    }
                    break 
            }
        }
        
        return
        /*if(!this.objectsLayer.hasTileAt(newTarget.x - 1, newTarget.y))
            newTarget.x-- //to the left 
        else if(!this.objectsLayer.hasTileAt(newTarget.x, newTarget.y - 1))
            newTarget.y-- //to the top 
        else if(!this.objectsLayer.hasTileAt(newTarget.x + 1, newTarget.y))
            newTarget.x++ //to the right 
        else if(!this.objectsLayer.hasTileAt(newTarget.x, newTarget.y + 1))
            newTarget.y++ //to the right 

        return newTarget */
    }

    getNextTarget() {
        let oldTarget
        
        if(this.path.length < 1)
            oldTarget = getItemSquareVector(this.entity.center)
        else 
            oldTarget = this.path[this.path.length - 1]

        let newTarget = this.getTargertSquare() 

        if(!newTarget)
            return 

        const difX = Math.abs(oldTarget.x - newTarget.x)
        const difY = Math.abs(oldTarget.y - newTarget.y)
        
        //if the delta between the old target entity location is greater than the max seperation re-calculate the path 
        if(difX > this.recalculateSeperation || difY > this.recalculateSeperation)
            this.calculatePath(getItemSquareVector(this.entity.center), newTarget)
        else if(this.path.length < 1 && ((difX > 0) || (difY > 0))) //already beside target check if we have moved
            this.calculatePath(getItemSquareVector(this.entity.center), newTarget)
        else if(this.index > (this.path.length -1) && ((difX > 0) || (difY > 0))) //if were at the last index of the path and the target entity has moved recalculate the path 
            this.calculatePath(getItemSquareVector(this.entity.center), newTarget)


        if(this.index >= this.path.length)
        {
            return null
        }

        return this.path[this.index]
    }

    incrementIndex(){
        if(this.index < this.path.length)
            this.index++ 
    }

}