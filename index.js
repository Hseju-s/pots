const Command = require('command'),
	  GameState = require('tera-game-state'),
	  potions = require("./potions");

module.exports = function HPpotter(dispatch) {
	const game = GameState(dispatch),
		  command = Command(dispatch);
	game.initialize('contract');
	
	let enabled = true,
		hp_enabled = true,
		mp_enabled = true,
		Loc,
		Angle;

	const Potions_MP = potions.Potions_MP,
		  Potions_HP = potions.Potions_HP;

	command.add('pots', (type, option, percent) => {
		console.log(Potions_HP, Potions_MP)
		if(type){
			type = type.toLowerCase();
			if(option){
				let Potions = type === 'hp' ? Potions_HP : type === 'mp' ? Potions_MP : undefined,
				opt = type === 'hp' ? 'HP' : type === 'mp' ? 'MP' : undefined;

				if(Potions){
					option = option.toLowerCase();
					let index = Number(option);
					if(!isNaN(index) && index < Potions.length){
						if(percent){
							percent = Number(percent);
							let oldPercent = Potions[index].percentToUse;
							Potions[index].percentToUse = percent;
							command.message(`[Pots] Changed ${Potions[index].name} use from ${oldPercent}% to ${Potions[index].percentToUse}%. Active : ${Potions[index].active}`);
							return;
						};
						Potions[index].active = !Potions[index].active;
						command.message(`[Pots] ${Potions[index].name} : ${Potions[index].active}.`);
						if(!Potions[index].standalone){
							Potions.forEach(potion => {
								if(potion.standalone || potion.name === Potions[index].name) return;
								else if(potion.active) {
									command.message('[Pots] Turning off following potion due to shared cooldown.');
	              					potion.active = false;
									command.message(`[Pots] ${potion.name} : ${potion.active}.`);
								}
							});
	            		}
					}
					else if(option === 'off') {
						type === 'hp' ? hp_enabled = false : mp_enabled = false;
						command.message(opt + ' Pot Disabled.');
					}
					else if(option === 'on') {
						type === 'hp' ? hp_enabled = true : mp_enabled = true;
						command.message(opt + ' Pot Enabled.');
					}
					else if(option === 'help'){
						command.message(' pots ' + type + ' number|on|off|help|status.');
						Potions.forEach((potion, index) => command.message('[Pots] ' + index + ' : ' + potion.name));
					}
					else if(option === 'status'){
						command.message('Status for ' + opt + ' Pots.');
						Potions.forEach(potion => command.message(`[Pot] ${potion.name} : ${potion.percentToUse}% : ${potion.active}.`));
					}
					else command.message('Pots Command : pot ' + type + ' number|on|off|help|status.');
				}
			}
			else if (type === 'on'){
				enabled = true;
				command.message('[Pots] Module Enabled.');
			}
			else if (type === 'off'){
				enabled = false;
				command.message('[Pots] Module Disabled.');
			}
			else if(type === 'help'){
				command.message('[Pots] Commands are : pot hp|mp number|on|off|help|status.');
			}
			else if(type === "status"){
				Potions_HP.forEach(potion => command.message(`[Pot] ${potion.name} : ${potion.percentToUse}% : ${potion.active}.`));
				Potions_MP.forEach(potion => command.message(`[Pot] ${potion.name} : ${potion.percentToUse}% : ${potion.active}.`));
			}
			else command.message(' pots hp|mp number|on|off|help|status.');
		}
		else command.message('[Pots] Invalid Command. Please type help.');
	});

	const matchCondition = (potion, event, type) => {
		if(type === 'hp') return potion.active && Date.now() > potion.cooldown && hp_enabled && (event.hp <= event.maxHp*(potion.percentToUse/100));
		else if(type === 'mp') return potion.active && Date.now() > potion.cooldown && mp_enabled && (event.mp <= event.maxMp*(potion.percentToUse/100));
	};

	const useItem = (ItemToUse) => {
		if (!enabled) return;
		if(game.me.alive && game.me.inCombat && !game.me.mounted && !game.contract.active && !game.me.inBattleground) {
			//command.message('using pot.')
			dispatch.toServer('C_USE_ITEM', 3, {
				gameId: game.me.gameId,
				id: ItemToUse, // 6562: Prime Replenishment Potable, 184659: Everful Nostrum
				dbid: 0,
				target: 0,
				amount: 1,
				dest: 0,
				loc: Loc,
				w: Angle,
				unk1: 0,
				unk2: 0,
				unk3: 0,
				unk4: true
			});
		};
	};
			
	dispatch.hook('S_START_COOLTIME_ITEM', 1, event => {
		for(let potion of Potions_HP) if(event.item === potion.id) potion.cooldown = Date.now() + event.cooldown*1000;
		for(let potion of Potions_MP) if(event.item === potion.id) potion.cooldown = Date.now() + event.cooldown*1000;	
	});
	
	dispatch.hook('S_PLAYER_STAT_UPDATE', 9, event => {
		for(let potion of Potions_HP) if(matchCondition(potion, event, 'hp')) useItem(potion.id);
		for(let potion of Potions_MP) if(matchCondition(potion, event, 'mp')) useItem(potion.id);	
	});
	
	dispatch.hook('C_PLAYER_LOCATION', 5, event => {
		Loc = event.loc;
		Angle = event.w;
	});
};