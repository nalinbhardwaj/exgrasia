# εxgrasia

<img width="1536" alt="Screenshot 2022-04-17 at 1 33 02 AM" src="https://user-images.githubusercontent.com/6984346/163969365-8130ed50-a6e5-4d9e-8b49-fbd7747b82b2.png">


εxgrasia is a procedurally generated on-chain backdrop where every tile is a player-made contract. Imagine an infinitely extensible minecraft or DayZ, where modding is **the** way to play the game. εxgrasia is an exploration in this sandbox direction.

<img width="1536" alt="image" src="https://user-images.githubusercontent.com/6984346/160905991-cb23280a-6610-4661-aefa-bb46814b4dd7.png">

**If you prefer video, you can watch a walkthrough [here](https://youtu.be/wZPrtmzWYdM) and another video from DEFCON is coming soon!**

## Getting Started

Get started by setting up [Optimism Kovan](https://www.optimism.io) for your wallet.

1. You can add Optimism Kovan to your wallet by visiting [this link](https://chainid.link/?network=optimism-kovan).
2. Next, fund your wallet with some test ETH using a [Faucet](https://faucet.paradigm.xyz). Fund the wallet that's whitelisted to play εxgrasia, we'll fund your proxy address during the new user flow later.
3. Next, follow through the new user flow on https://0xpark.exgrasia.xyz.

## How to play

εxgrasia itself is rather minimal. It defines the backdrop of the sandbox, in the form of different tiles such as grass, sand, water etc., and additionally, a concept of "ownership" of each tile.

Let's talk more about **ownership**.

<img width="516" alt="image" src="https://user-images.githubusercontent.com/6984346/160892798-5557ab02-c91b-4fa8-a38e-dbcae985a98f.png">

Anyone can claim an unowned tile. An ownership claim allows you to put a contract address in this tile. This contract is virtually unrestricted! It only needs to conform to a minimal standard that defines a pretty representation of the contract in a tile:

![image](https://user-images.githubusercontent.com/6984346/160893594-7cb0e5f3-eb9c-415b-bb12-17752d719eac.png)

The first 3 functions define what the tile should look like in εxgrasia, while the last is a pointer to the ABI of your contract. You can choose to customise the ABI, or to simplify development, you can use the [εxgrasia remix IDE](https://remix.exgrasia.xyz/) which will automatically figure out the ABI hosting/pointing for your contracts on compilation.

The ABI is used to autogenerate a simple UI for your contract. In the case of the fishing stand, for instance, this UI looks like this (

<img width="402" alt="image" src="https://user-images.githubusercontent.com/6984346/160894901-f996bb62-d790-41cd-82f6-90605bdaca3f.png">

εxgrasia serves to function as a minimal backdrop to inspire smart contract development, and this minimal interface allows for you to do virtually anything you can imagine on-chain inside the spatial world of εxgrasia.

As inspiration for things you could build, the game implements a few mechanics and puts a "Tiny Quest Master" to only allow you to put arbitrary contracts after you complete some quests, and only allow you to cross water and snow tiles after you've completed a level 2 quest.

Here are the mechanics already in tile contracts:

### Tiny Fishing Stand

Fishes are randomised ERC721 with a twist -- you can only transfer fish to others/another contract if you're adjcacent to them on the map. There's another small twist to the minting process - much like real-world fishing, there's always a pool of fishes in the water bodies, and when you fish you pull from this pool. You can imagine the kinds of optimisations you can do to make sure you get your favourite Iridscent Mahi-Mahi!

- Contract address: `0x4d9CB454F98a503a0AC8a1d7Fa4370BE2c6BD8D9`

<img width="1399" alt="image" src="https://user-images.githubusercontent.com/6984346/163083457-fe901aa7-3f17-47e0-9f55-237b98400004.png">

### Tiny OpenSea Fish Market

When you're ready to part from all the smelly fish you have, or when you're looking for that one elusive fish, the Fish Market will come in handy. You can put up your fish for sale here, or buy fishes others have listed. Remember, you can only send/receive fish from the market if you're standing right next to it. Also, the fish shopkeeper of the Fish Market closes the shop between 8PM UTC - 8AM UTC every day, so make sure you do all your trades while he's around!

- Contract address: `0x2fcBC3805cb83cA5C9EFC482970F85eaa8378CFB`

<img width="772" alt="image" src="https://user-images.githubusercontent.com/6984346/163083640-cd9ff004-30de-47d1-a807-8b8f115b4e79.png">

### Tiny Mine

A tiny mine is a mineshaft where you can mine for iron, gold or diamond in stone tiles. The tiny mine itself spawns a mine shaft where you the player (represented by P in the map) can move up/down/left/right using functions of the tiny mine contract, collecting metals as you walk. Be careful though, there's also walls (represented by #s) that you might need to drill through, taking more attempts.

- Contract address: `0xbf4Eee8Ac3D8043d6c9265f712f401294679e2aE`

<img width="774" alt="image" src="https://user-images.githubusercontent.com/6984346/163085367-aac445a6-0c22-4384-ba08-cae3ffc96309.png">

I want to see someone write a boss that uses the iron, gold or diamond ores to fight. 👀

### Tiny Campfire

A tiny campfire can be used to chat with other players! You can send messages to a common board if you're standing right next to a campfire, and anyone can read the board (regardless of their proximity to campfires).

- Contract address: `0x7a0A41d987d4a09E86665Ebf990A6F876d3c1eC6`

<img width="778" alt="image" src="https://user-images.githubusercontent.com/6984346/163969651-235dba49-42da-4737-8590-a02fb8018809.png">

### Tiny Farm

The tiny farm allows you to grow corn or wheat on grass tiles or cactus on sand tiles. You can harvest the plant to obtain some wheat, corn or cactus. These are ERC-20 tokens that are only transferrable to adjacent tiles (like the aforementioned Fish NFTs).

- Contract address: `0x4e73612996AEB2901c3Bca2F17e7c3Ae05673b9c`

<img width="1196" alt="image" src="https://user-images.githubusercontent.com/6984346/163093581-23bf9959-fed6-4e8a-9ee0-50b5f445f7f3.png">

### Tiny Ranch

A tiny ranch allows you to keep cattle: cows and chickens! You can milk cows to obtain a milk token or get eggs from chicken. To grow your cattle farm, you'll need to feed cows wheat and chickens corn! Cows and Chickens may also die if you do not feed them for too long, so remember to check on your cattle every now and then.

- Contract address: `0x9dCFae1be36E626263E5849F8a9Cbb7f5cfAac83`

<img width="600" alt="image" src="https://user-images.githubusercontent.com/6984346/163094247-30504653-1ce7-447e-ac19-cf7185b524af.png">

Note that you'll need to grant usage access to your crops (corn or wheat ERC20 token) to the Ranch contract. You can do this by putting down a contract of a bag of wheat or corn:

- Contract address: `0xe454394D204e0F1fd43055eE5148CE5DB787528B` for wheat and `0x66E2Ff0147F8548529f6D347C7cCEcBEd84f8278` for corn

Note the addresses for the other ERC20 in case you would like to control access to these:

- Tiny Iron Token contract address: `0x18d13d255733FbDef2C6476ff26d649eA8Efb9d5`
- Tiny Gold Token contract address: `0xFCbe4a15bcF11895912b4Db7430157b249Dd2c1d`
- Tiny Diamond Token contract address: `0x8679B849D8eB1BFe1D7221BC136e81AE21065a69`
- Tiny Milk Token contract address: `0xC5acB3A46431c4D40C08b40B5e515C53694A9129`
- Tiny Egg Token contract address: `0xA646DBA2f6547dbbB1F6eb9710Ef32B5F9885172`

I can't wait to hear your ideas and see what you code up with this scaffolding! Hit me up if you want to chat about more ideas 👀

## Plugins

Another facet of εxgrasia is frontend plugins! εxgrasia allows you to inject arbitrary JS/HTML code into your frontend that can render onto panes.

<img width="398" alt="image" src="https://user-images.githubusercontent.com/6984346/160904225-2702ae74-2c6b-4c50-b50f-dd7aa836a11f.png">

This essentially allows you to completely own the frontend experience as a developer. You can add in player attributes (perhaps a health bar?) or just code a complete UI for your contract right into εxgrasia.

As a demo, here's 2 plugins I've written you can add in using the Settings pane:

- **Inventory**: The inventory plugin allows you to peek into what's inside the bags of other players. See what the largest Tiny Fish they've caught is, or how much cactus they've been farming 👀
  - Name: Inventory
  - Code URL: https://gist.githubusercontent.com/nalinbhardwaj/f4db24e2bdd22f3ad6ce345bdc9a2388/raw/fa652316ea804b23d2402689d5273b10c548e919/plugin.js

<img width="437" alt="image" src="https://user-images.githubusercontent.com/6984346/160904009-d6a1638e-1d89-439d-a059-90cf7b14d635.png">

- **Farcaster**: [Farcaster](https://twitter.com/farcaster_xyz) is a new minimally decentralised social network that's a bit hush hush online right now. Adding this plugin can let you see Farcaster activity of players that do have accounts though! This is an example of how εxgrasia can be "A minecraft that stretches outside".
  - Name: Farcaster
  - Code URL: https://gist.githubusercontent.com/nalinbhardwaj/3cb8541b0e08fb1f1023b8ab63e0224c/raw/0b5463b56abe6761cf03fc6e095c3bf1a70b8002/plugin.js

<img width="770" alt="image" src="https://user-images.githubusercontent.com/6984346/160904155-a6fd5b86-786a-4cf3-9f42-3097fca636c9.png">

Happy hacking! Hit me up if you'd like to chat more about these ideas or have any trouble with setup: I'm @nibnalin everywhere (twitter, telegram, discord etc.).
