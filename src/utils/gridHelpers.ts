import { Vector } from "matter"

const TileSize = 32 
function getItemSquare(body: Phaser.Physics.Arcade.Body | {x: number, y: number}): {x: number, y:number}
{
    if(body === null || body === undefined)
    {
        return {x: 0, y: 0}
    }
    return {
        x: Math.floor(body.x / TileSize), 
        y: Math.floor(body.y / TileSize)
    }
}

function getItemSquareVector(body: Phaser.Physics.Arcade.Body | {x: number, y: number}): Phaser.Math.Vector2
{
    const itemSquare = getItemSquare(body)
    return new Phaser.Math.Vector2(itemSquare.x, itemSquare.y)
}

export { 
    TileSize, 
    getItemSquare, 
    getItemSquareVector
}
