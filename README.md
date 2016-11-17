# necrodancer-randomizer
Crypt of the Necrodancer Randomizer. Generates a mod randomizing things in the game.

## What is randomized?
* Weapon appearance chances and cost (chestChance, shopChance, urnChance, coinCost, lockedChestChance and lockedShopChance attributes)
* Enemy behavior (stats, optionalStats and bouncer elements, keeping miniboss status)

The randomizer runs a "fair mode" that sets enemies moving every beat to either one health or two health with one damage.

If you are only interested in getting a random mod, please use [this website](http://necrommunity.ovh/randomizer/).

## Run the randomizer locally

Prerequisite: [Node.js installed](https://docs.npmjs.com/getting-started/installing-node).

1. Clone or download this repository in the `mods/` folder in necrodancer.
2. Run `npm install` in the `necrodancer-randomizer/` folder to install dependencies.
3. Run `node createMod.js` to generate the `necrodancer.xml`, as it's already a mod, you can choose "Necrodancer Randomizer" in game to play it.

## Programmatic usage example

```javascript
var randomizer = require('./randomizer');

var xml = randomizer({
	seed: 13375330
});
```
## Available options

### `seed` (string)

Seeds randomness using the parameter, if it isn't set, everything is a different random each time.

### `unfair` (boolean)

If set to `true`, deactivates fair mode which sets enemies moving every beat to either one health or two health with one damage. Defaults to `false`.

### `writeFile` (boolean)

If set to `true`, writes the necrodancer.xml file to the current folder. Defaults to `false`.

### `dest` (string)

If set with `writeFile` to `true`, uses the file path passed in `dest` to write the file.

## TODO

* Add how to use necrodancer.xml as a mod to this doc and on the website
* Make a true random mode instead of switching things around (togglable in settings)
* Add more settings
  * Activate miniboss randomization (with different random pools?)
  * List enemies/weapons to exclude / include from randomization
* Add settings changing in the website and API
* Test with DLC when it comes out
