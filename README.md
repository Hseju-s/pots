# Auto Potion

Automatically uses potions when in combat under certain percent of HP/MP.

You can select the pot of your choice by editing ```potion.json``` file. You can change ``active`` to ``true`` to enable the pot. Note, if the pots share cooldown, you have to change others to ```false```

By default, it will use `Health Potion` under 10% and `Prime Recovery` under 30%.
For MP, only `Prime Replenishment` is on by default at 25%. 

I have added couple of frequently used pots, however if you want to add more, just edit `potion.js` and follow the template.

# Commands
Following commands are supported.
*Note, everything is in proxy chat.*
> pots on -> Enables module
> pots off -> Disables 
> pots help -> Prints list of options.
> pots status -> Prints status|percentUse of all pots.

*commands below are supported for hp and mp pots*
> pots hp|mp on -> enables hp/mp pot
> pots hp|mp off -> disables
> pots hp|mp help -> list of options
> pots hp|mp status -> Prints status|percentUse of specific type.
> pots hp|mp number (changes potion option ingame, type help command for list of number tied to each pot).
> pots hp|mp number percent (changes the pot in specified number to be used at stated %).