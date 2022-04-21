import Phaser from "phaser";
import EasyStar from "easystarjs"
import eventsCenter from "../EventsCenter"
import { PlayerCursors } from "../game/PlayerCursors";
import PlayerController from "../game/PlayerController";
import SpiderEnemyController from "../game/SpiderEnemyController";
import FoxEnemyController from "../game/FoxEnemyController";
import Direction from "~/const/Direction";
import PlayerEventType from "~/const/PlayerEventType"
import { TileSize } from "~/utils/gridHelpers";
import Projectile from "~/game/Projectile";
import EntityController from "~/game/EntityController";
import PlayerStates from "~/const/states";

export default class Game extends Phaser.Scene 
{
    private player!: PlayerController
    private groundLayer!: Phaser.Tilemaps.TilemapLayer
    private projectilesGroup!: Phaser.Physics.Arcade.Group 
    
    private enemyControllers!: EntityController[] 

    constructor()
    {
        super("game")

        this.enemyControllers = []
    }

    preload() {
        //load the tile images 
        this.load.image('base_tiles','assets/RPG Nature Tileset.png')

        //load the tile map 
        this.load.tilemapTiledJSON('tile_map','assets/level-1.json')

        //load player image 
        this.load.spritesheet('player-sprite','assets/Adventurer Sprite Sheet v1.1.png',{
            frameWidth: 32, 
            frameHeight: 32,
            //spacing: 8,
            //margin: 8
        })

        //load the fox sprite
        this.load.spritesheet('fox-sprite','assets/Fox Sprite Sheet.png',{
            frameWidth: 32,
            frameHeight: 32,
            //spacing: 12, 
            //margin: 12  
        })

        //load the spider sprite 
        this.load.spritesheet('spider-sprite','assets/Spider Sprite Sheet.png',{
            frameWidth: 32,
            frameHeight: 32 
        })
    }

    create() {
        const map = this.make.tilemap({key:'tile_map'})

        const tileset = map.addTilesetImage('Natural', 'base_tiles')

        this.groundLayer = map.createLayer('Ground', tileset)

        const obstaclesLayer = map.createLayer('Obstacles', tileset)
        obstaclesLayer.setCollisionByProperty({collides: true}) 

        this.projectilesGroup = this.physics.add.group() 
        this.physics.add.collider(this.projectilesGroup, obstaclesLayer,this.projectileObjectCollide, undefined, this)
        const easyStar = this.setupEasyStar(this.groundLayer, obstaclesLayer)

        const spawnPoint = map.findObject("Spawn",obj => obj.name == "Player1")

        let psx: number = 32
        let psy: number = 32 
        if(spawnPoint != null && spawnPoint.x != undefined && spawnPoint.y != undefined)
        {
            psx = spawnPoint.x 
            psy = spawnPoint.y 
        }

        //this.player = this.physics.add.sprite(psx,psy,'player-sprite')
        //this.player.setCollideWorldBounds()
        this.player = new PlayerController(
            this, 
            psx, 
            psy, 
            new PlayerCursors(this,"UP","DOWN","RIGHT","LEFT","SPACE")) 

        this.player.emitter.on(PlayerEventType.Attack, this.playerAttack, this)
        this.physics.add.collider(this.player, obstaclesLayer) 
        this.physics.add.overlap(this.projectilesGroup, this.player, this.projectilePlayerCollide, undefined, this) 

        this.cameras.main.startFollow(this.player,true)

        this.cameras.main.setBounds(0,0,map.width * map.tileWidth, map.height * map.tileHeight)
        this.cameras.main.useBounds = true 
        this.physics.world.setBounds(0,0, map.width * map.tileWidth, map.height * map.tileHeight)

        const enemyGroup = this.add.group() 
        const spawLayer = map.getObjectLayer("Spawn")
        
        if(spawLayer)
        {
            spawLayer.objects.forEach(spawn => {
                if(spawn == null || spawn.x == undefined || spawn.y == undefined)
                    return

                switch(spawn.type)
                {
                    case "fox": 
                    {
                        const { x: spx, y: spy } = spawn 
                        
                        const foxEnemyController = new FoxEnemyController(this, spx, spy, spawn.name, 'fox-sprite', this.player, this.groundLayer, obstaclesLayer, this.projectilesGroup, easyStar)

                        this.enemyControllers.push(foxEnemyController)
                        enemyGroup.add(foxEnemyController)
                        break;
                    }
                    case "spider": 
                    {
                        const { x: spx, y: spy } = spawn 
                            
                        const spiderEnemyController = new SpiderEnemyController(this, spx, spy, spawn.name, 'spider-sprite', this.player, this.groundLayer, obstaclesLayer, this.projectilesGroup, easyStar)

                        this.enemyControllers.push(spiderEnemyController)
                        enemyGroup.add(spiderEnemyController)
                        break; 
                    }
                }
            })

            spawLayer.objects.forEach(target => {
                switch(target.type)
                {
                    case "target":
                        this.enemyControllers.forEach(enemy => {
                            const { x: tx, y: ty } = target 

                            const propertySource = (target.properties as [[]]).find(p => { return p['name'] == 'sourceName'})
                            if(propertySource == null)
                                return 

                            if(enemy.getEntityName() == propertySource['value'])
                                enemy.addTarget(tx, ty)
                        })
                }
            })

            this.enemyControllers.forEach(enemy => {
                enemy.preRun() 
            }) 
        }
        
        //todo deal with collistions 
        this.physics.add.collider(this.player, enemyGroup, undefined, this.playerEntityCollide, this)
    } 

    update(time: number, delta: number): void {

        this.player.playerInput(); 

        //todo: reenable 
        this.enemyControllers.forEach(enemyController => {
            enemyController.onAction(time) 
        })
        
    }

    setupEasyStar(groundLayer: Phaser.Tilemaps.TilemapLayer, obstaclesLayer: Phaser.Tilemaps.TilemapLayer)
    {
        const easyStar = new EasyStar.js() 

        //build the grid for easyStar
        let grid: number[][] = [] 
        for(let x = 0; x<groundLayer.tilemap.width; x++)
        {
            let col:number[] = []
            for(let y = 0; y<groundLayer.tilemap.height; y++)
            {
                col.push(this.getTileID(x, y))
            }
            grid.push(col)
        }

        easyStar.setGrid(grid)

        //get the acceptableTiles (currently all)
        let acctableTiles: number[] = [] 
        for(let i = this.groundLayer.tileset[0].firstgid; i< this.groundLayer.tileset[0].total; i++)
        {
            acctableTiles.push(i + 1)   //todo check if we can walk on this kind of tile 
        }
        easyStar.setAcceptableTiles(acctableTiles) 

        //find the obstacles 
        for(let x=0; x<obstaclesLayer.tilemap.width; x++)
        {
            for(let y=0; y<obstaclesLayer.tilemap.height; y++)
            {
                if(obstaclesLayer.tilemap.getTileAt(x,y))
                    easyStar.avoidAdditionalPoint(x,y)
            }
        } 

        //test Path
        /*easyStar.findPath(2,22, 2,16,path => {
            console.log(path)
        })

        easyStar.calculate() */

        return easyStar 
    }

    getTileID(x: number, y:number ){
        const tile = this.groundLayer.getTileAt(x, y)
        return tile.index
    }

    projectileObjectCollide(obj: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        const projectile = obj as Projectile
        const body = projectile.body as Phaser.Physics.Arcade.Body
        body.enable = false 

        this.projectilesGroup.remove(projectile) 
        projectile.destroy(true) 
    }

    projectilePlayerCollide(obj: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject)
    {
        //if(!obj.active)
        //    return 

        //console.log("projectilePlayerCollide")
        const projectile = obj2 as Projectile

        this.player.takeDamage(projectile.damage * -1) 
    
        const body = projectile.body as Phaser.Physics.Arcade.Body
        body.setVelocity(0,0)
        body.enable = false 

        this.projectilesGroup.remove(projectile)
        projectile.destroy(true) 
    }

    playerAttack(x: number, y: number, playerDirection: Direction, attachRange: number, attackDamage: number)
    {
        let minX, maxX, minY, maxY 

        switch(playerDirection)
        {
            case Direction.North: 
                minY = y - (TileSize + attachRange) 
                maxY = y + (TileSize / 2)
                minX = x - Math.floor(TileSize / 2)
                maxX = x + Math.floor(TileSize / 2) 
                break
            case Direction.South: 
                minY = y - (TileSize / 2)
                maxY = y + TileSize + attachRange 
                minX = x - Math.floor(TileSize / 2)
                maxX = x + Math.floor(TileSize / 2) 
                break 
            case Direction.West: 
                minX = x - (TileSize + attachRange)
                maxX = x + (TileSize / 2)
                minY = y - Math.floor(TileSize / 2)
                maxY = y + Math.floor(TileSize / 2) 
                break
            case Direction.East: 
                minX = x - (TileSize / 2)
                maxX = x + (TileSize + attachRange)
                minY = y - Math.floor(TileSize / 2)
                maxY = y + Math.floor(TileSize / 2) 
                break
        }

        //console.log("player attack", x, y, minX, maxX, minY, maxY)

        this.enemyControllers.forEach(enemy => {
            if(!enemy)
                return 
                
            if(!enemy.body)
                return 

            const body = enemy.physicsBody
        //console.log(enemy.getEntityName(), physicsBody.x, physicsBody.y)
            if((body.x >= minX) && 
                (body.x <= maxX) && 
                (body.y >= minY) && 
                (body.y <= maxY)) 
            {
                enemy.registerDamage(attackDamage) 
            }
        })
    }

    playerEntityCollide(obj: Phaser.GameObjects.GameObject, obj2: Phaser.GameObjects.GameObject){
        const entity = obj2 as EntityController
        entity.setEntityState(PlayerStates.Idle) 
    }
}