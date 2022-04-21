import Phaser from 'phaser'
import eventsCenter from '~/EventsCenter'

export default class UI extends Phaser.Scene 
{
    private player1Score!: number 
    private player2Score!: number
    private player1ScoreLabel!: Phaser.GameObjects.Text
    private player2ScoreLabel!: Phaser.GameObjects.Text
    private winnerLabel!: Phaser.GameObjects.Text 
    private width!: number 
    private height!: number 
    constructor()
    {
        super('ui')

        this.player1Score = 0
        this.player2Score = 0
    }

    create(){
        this.width = this.scale.width
        this.height = this.scale.height

        this.player1ScoreLabel = this.add.text((this.width * 0.25), 20, `${this.player1Score}`, {
            fontSize: '40px',
            color: '#ffffff'  
        })

        this.player2ScoreLabel = this.add.text((this.width * 0.75), 20, `${this.player2Score}`, {
            fontSize: '40px',
            color: '#ffffff'  
        })

        this.winnerLabel = this.add.text((this.width * 0.6), this.height * 0.5, "Winner", {
            fontSize: '60px', 
            color: "#ffffff"
        })
        this.winnerLabel.setVisible(false)

        eventsCenter.on("player1Point", this.player1Point, this)
        eventsCenter.on("player2Point", this.player2Point, this)
    }

    player1Point()
    {
        this.player1Score++ 
        this.player1ScoreLabel.text = `${this.player1Score}`
        
        this.checkGameOver()
    }

    player2Point()
    {
        this.player2Score++ 
        this.player2ScoreLabel.text = `${this.player2Score}`

        this.checkGameOver() 
    }

    checkGameOver()
    {
        if(this.player1Score === 10)
        {
            this.winnerLabel.setX(this.width * 0.1)
            this.winnerLabel.setVisible(true) 
            eventsCenter.emit("gameOver")
        }
        else if(this.player2Score === 10)
        {
            this.winnerLabel.setX(this.width * 0.6)
            this.winnerLabel.setVisible(true) 
            eventsCenter.emit("gameOver")
        }
    }
}