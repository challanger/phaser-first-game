import Phaser from 'phaser'

import Game from './scenes/Game'
import UI from './scenes/ui' 

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 700,
	height: 400, 
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	scene: [Game, UI]
}

export default new Phaser.Game(config)
